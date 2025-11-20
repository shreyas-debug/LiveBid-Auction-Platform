# LiveBid: A Full-Stack Real-Time Auction Platform

This is a full-stack web application that allows users to create, browse, and bid on auctions in real-time. When a user places a bid, the new price and bid history are instantly broadcast to all other connected clients without requiring a page refresh.

This project was built to demonstrate a modern, secure, and event-driven architecture using a .NET 8 backend with SignalR and a responsive React frontend.

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)

## 🚀 Key Features

- **Real-time Bidding**: Utilizes SignalR and WebSockets to push new bids to all clients instantly.
- **Secure Authentication**: Full user registration and login system built with ASP.NET Core Identity.
- **Protected API**: Uses JWT (JSON Web Tokens) for stateless, secure API endpoints.
- **Auction & Bid Management**: Full CRUD (Create, Read, Update) functionality for auctions and bids, plus automatic “sold out” detection that announces the winning bidder once an auction ends.
- **Bid Validation**: Backend logic ensures bids are valid (e.g., must be higher than the current price).
- **Post-Auction Lockdown**: Finished auctions are locked server-side; late bids are rejected with a friendly error.
- **Automatic Database Seeding**: On first boot the API seeds sample auctions as well as an admin account (configurable via `SeedAdmin` settings) so the app is usable instantly in new environments.
- **Global State Management**: Uses React Context to manage user authentication and the SignalR connection across the frontend application.
- **Automatic Token Handling**: A secure axios interceptor automatically attaches the JWT to all protected API requests.

## 🛠️ Tech Stack

### Backend

- .NET 8 (ASP.NET Core Web API)
- SignalR (for real-time WebSocket communication)
- ASP.NET Core Identity (for user management)
- JWT (JSON Web Tokens) (for authentication)
- Entity Framework Core (ORM for database communication)
- PostgreSQL (Relational database)

### Frontend

- React 18 (with Vite)
- React Router (for client-side routing)
- React Context (for global state management)
- Axios (for REST API requests)
- @microsoft/signalr (Client library for SignalR)

## 🏗️ Architecture

This project uses a decoupled, full-stack architecture. The React frontend and .NET backend operate as two separate applications.

They communicate over two distinct channels:

- **A RESTful API**: Used for all standard actions like logging in, registering, fetching data, and placing a bid.
- **A SignalR WebSocket Connection**: A persistent, two-way channel used only for the backend to instantly push real-time updates (like new bids) to the frontend.

## 🏁 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download)
- **Node.js (LTS)** - [Download here](https://nodejs.org/) (includes npm)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/) (a running local instance)

### 1. Backend Setup

#### Clone the Repository

```bash
git clone https://github.com/YourUsername/LiveBid.git
cd LiveBid
```

#### Configure Your Secrets

1. Navigate to the backend project: `cd src/LiveBid.Api`
2. Create a file named `appsettings.Development.json`.
3. Copy and paste the following, filling in your PostgreSQL password and a new random JWT key:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=livebid_db;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_OWN_SUPER_LONG_RANDOM_SECRET_KEY_HERE",
    "Issuer": "http://localhost:5134",
    "Audience": "http://localhost:5134"
  }
}
```

#### Create the Database

Run the Entity Framework migrations to create your database and tables:

```bash
dotnet ef database update
```

#### Run the Backend

```bash
dotnet run
```

Your backend API will now be running at **http://localhost:5134**. You can view the API documentation at **http://localhost:5134/swagger**.

### 2. Frontend Setup

#### Install Dependencies

1. Open a new terminal.
2. Navigate to the frontend folder:

```bash
cd frontend
```

3. Install dependencies:

```bash
npm install
```

#### Run the Frontend

```bash
npm run dev
```

Your React application will now be running at **http://localhost:5173** (or a similar port).

### 3. You're Ready!

Open **http://localhost:5173** in your browser. You can now register a new user, log in, and test the real-time bidding!

---

## 📝 Additional Notes

- **Sold-Out View:** When an auction’s `EndTime` passes, the detail page automatically switches to a “Sold Out” state, showing the winning username and bid amount. Further bids are blocked server-side.
- **Health & Migrations:** The API runs a quick health check at `/api/health` and applies EF migrations during startup by default. For resource-constrained environments you can move migrations to CI/CD and drop the runtime migrate block.
- Make sure both the backend and frontend are running simultaneously for the application to work properly.
- Check the browser console and terminal for any error messages if you encounter issues.

LiveBid: A Full-Stack Real-Time Auction Platform
This is a full-stack web application that allows users to create, browse, and bid on auctions in real-time. When a user places a bid, the new price and bid history are instantly broadcast to all other connected clients without requiring a page refresh.

This project was built to demonstrate a modern, secure, and event-driven architecture using a .NET 8 backend with SignalR and a responsive React frontend.

🚀 Key Features
Real-time Bidding: Utilizes SignalR and WebSockets to push new bids to all clients instantly.

Secure Authentication: Full user registration and login system built with ASP.NET Core Identity.

Protected API: Uses JWT (JSON Web Tokens) for stateless, secure API endpoints.

Auction & Bid Management: Full CRUD (Create, Read, Update) functionality for auctions and bids.

Bid Validation: Backend logic ensures bids are valid (e.g., must be higher than the current price).

Global State Management: Uses React Context to manage user authentication and the SignalR connection across the frontend application.

Automatic Token Handling: A secure axios interceptor automatically attaches the JWT to all protected API requests.

🛠️ Tech Stack
Backend
.NET 8 (ASP.NET Core Web API)

SignalR (for real-time WebSocket communication)

ASP.NET Core Identity (for user management)

JWT (JSON Web Tokens) (for authentication)

Entity Framework Core (ORM for database communication)

PostgreSQL (Relational database)

Frontend
React 18 (with Vite)

React Router (for client-side routing)

React Context (for global state management)

Axios (for REST API requests)

@microsoft/signalr (Client library for SignalR)

🏗️ Architecture
This project uses a decoupled, full-stack architecture. The React frontend and .NET backend operate as two separate applications.

They communicate over two distinct channels:

A RESTful API: Used for all standard actions like logging in, registering, fetching data, and placing a bid.

A SignalR WebSocket Connection: A persistent, two-way channel used only for the backend to instantly push real-time updates (like new bids) to the frontend.

🏁 Getting Started
To get a local copy up and running, follow these steps.

Prerequisites
You will need the following tools installed on your machine:

.NET 8 SDK

Node.js (LTS) (which includes npm)

PostgreSQL (A running local instance)

1. Backend Setup
Clone the repository:

Bash

git clone https://github.com/YourUsername/LiveBid.git
cd LiveBid
Configure your secrets:

Navigate to the backend project: cd src/LiveBid.Api

Create a file named appsettings.Development.json.

Copy and paste the following, filling in your PostgreSQL password and a new random JWT key:

JSON

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
Create the database:

Run the Entity Framework migrations to create your database and tables:

Bash

dotnet ef database update
Run the backend:

Bash

dotnet run
Your backend API will now be running at http://localhost:5134. You can view the API documentation at http://localhost:5134/swagger.

2. Frontend Setup
Open a new terminal.

Navigate to the frontend folder:

Bash

cd frontend
Install dependencies:

Bash

npm install
Run the frontend:

Bash

npm run dev
Your React application will now be running at http://localhost:5173 (or a similar port).

3. You're Ready!
Open http://localhost:5173 in your browser. You can now register a new user, log in, and test the real-time bidding!
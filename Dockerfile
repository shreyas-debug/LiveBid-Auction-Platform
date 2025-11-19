# --- Build Stage ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# 1. Install Node.js
RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

WORKDIR /src

# 2. Copy the project files
COPY ["src/LiveBid.Api/LiveBid.Api.csproj", "src/LiveBid.Api/"]
RUN dotnet restore "src/LiveBid.Api/LiveBid.Api.csproj"

# 3. Copy everything
COPY . .

# 4. Build Frontend Explicitly (Ensures it exists)
WORKDIR /src/frontend
RUN npm install
RUN npm run build

# 5. Publish Backend
WORKDIR "/src/src/LiveBid.Api"
RUN dotnet publish "LiveBid.Api.csproj" -c Release -o /app/publish

# 6. Move Frontend Build to Publish Directory
# We manually copy the dist folder to wwwroot to guarantee it's there
RUN mkdir -p /app/publish/wwwroot
RUN cp -r /src/frontend/dist/* /app/publish/wwwroot/

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# 7. Configure for Railway
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "LiveBid.Api.dll"]
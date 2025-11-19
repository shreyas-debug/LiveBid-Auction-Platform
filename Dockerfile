# --- Build Stage ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# 1. Install Node.js (Critical for building the React frontend)
RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

WORKDIR /src

# 2. Copy the project files
COPY ["src/LiveBid.Api/LiveBid.Api.csproj", "src/LiveBid.Api/"]

# 3. Restore .NET dependencies
RUN dotnet restore "src/LiveBid.Api/LiveBid.Api.csproj"

# 4. Copy the rest of the source code (Backend AND Frontend)
COPY . .

# 5. Publish the app
# This runs 'dotnet publish', which triggers your .csproj target
# to run 'npm install' and 'npm run build' automatically.
WORKDIR "/src/src/LiveBid.Api"
RUN dotnet publish "LiveBid.Api.csproj" -c Release -o /app/publish

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# 6. Configure for Railway
# Railway sets the PORT environment variable. We tell .NET to use it.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "LiveBid.Api.dll"]
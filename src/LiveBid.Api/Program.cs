using LiveBid.Api.Data;
using LiveBid.Api.Models;
using LiveBid.Api.Hubs;
using LiveBid.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "https://livebid-auction-platform-production.up.railway.app")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // This is for SignalR
        });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AuctionDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentityCore<AppUser>(options =>
{
    // Simple password rules
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AuctionDbContext>()
.AddSignInManager<SignInManager<AppUser>>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new ArgumentNullException("Jwt:Key", "JWT Key is not set in appsettings.Development.json!");
}

// This configures the JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!))
        };

        // This tells SignalR how to find the token
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                // If the request is for our hub...
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/auctionHub")))
                {
                    // Read the token from the query string
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Add services to the container.
builder.Services.AddScoped<TokenService>(); // Our custom TokenService
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // This tells the serializer to handle object cycles
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
    });
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        // It tells SignalR's serializer how to handle circular references.
        options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
    }); // This adds SignalR services
builder.Services.AddEndpointsApiExplorer(); // This is needed by Swagger
builder.Services.AddSwaggerGen(options =>
{
    // Define the security scheme (how to use the token)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        Description = "Please enter a valid token in the field 'Bearer {token}'"
    });

    // Make Swagger use this scheme for all endpoints
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

var app = builder.Build();

// --- AUTOMATIC MIGRATION ---
// This ensures the database exists and has the latest schema
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AuctionDbContext>();
        // Log connection string attempt (masked)
        var connStr = context.Database.GetConnectionString();
        Console.WriteLine($"Attempting to connect to DB with: {connStr?.Split(';').FirstOrDefault()}..."); 
        
        context.Database.Migrate(); // Applies any pending migrations
        Console.WriteLine("Database migration successful.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
        throw; // Crash the app if DB migration fails so we know
    }
}
// ---------------------------

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

// Serve static files (React App)
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<AuctionHub>("/auctionHub");

// --- HEALTH CHECK ENDPOINT ---
app.MapGet("/api/health", async (AuctionDbContext db) =>
{
    try
    {
        // Try to connect to the database
        if (await db.Database.CanConnectAsync())
        {
            return Results.Ok(new { status = "Healthy", database = "Connected" });
        }
        else
        {
            return Results.Problem("Database connection failed", statusCode: 500);
        }
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database error: {ex.Message}", statusCode: 500);
    }
});
// -----------------------------

// Handle client-side routing
app.MapFallbackToFile("index.html");

app.Run();
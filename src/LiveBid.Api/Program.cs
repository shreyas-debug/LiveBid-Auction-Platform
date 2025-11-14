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
            policy.WithOrigins("http://localhost:5173") // React app's URL
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
    // Simple password rules for our project
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
})
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
    // 1. Define the security scheme (how to use the token)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        Description = "Please enter a valid token in the field 'Bearer {token}'"
    });

    // 2. Make Swagger use this scheme for all endpoints
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
}); // This adds the full Swagger service

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Creates the swagger.json file
    app.UseSwaggerUI(); // <-- This creates the interactive '/swagger' webpage
}

//app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication(); // 1. This checks if the user has a valid token
app.UseAuthorization(); // 2. This checks if the user is allowed to access the resource

// This is the default WeatherForecast endpoint. We'll delete it later.
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapControllers();
// This tells the server to route all /auctionHub connections
// to our new AuctionHub class.
app.MapHub<AuctionHub>("/auctionHub");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
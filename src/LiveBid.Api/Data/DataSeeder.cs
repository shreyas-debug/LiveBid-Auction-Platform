using LiveBid.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace LiveBid.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        await SeedAdminUser(scopedProvider, configuration);
        await SeedSampleAuctions(scopedProvider);
    }

    private static async Task SeedAdminUser(IServiceProvider services, IConfiguration configuration)
    {
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        const string roleName = "Admin";
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }

        var seedAdminEmail = configuration["SeedAdmin:Email"] ?? "admin@livebid.com";
        var seedAdminPassword = configuration["SeedAdmin:Password"] ?? "Admin123!";

        var existingAdmin = await userManager.FindByEmailAsync(seedAdminEmail);
        if (existingAdmin != null)
        {
            return;
        }

        var adminUser = new AppUser
        {
            UserName = seedAdminEmail,
            Email = seedAdminEmail,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(adminUser, seedAdminPassword);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException("Failed to create seed admin user: " +
                                                string.Join(", ", createResult.Errors.Select(e => e.Description)));
        }

        await userManager.AddToRoleAsync(adminUser, roleName);
    }

    private static async Task SeedSampleAuctions(IServiceProvider services)
    {
        var context = services.GetRequiredService<AuctionDbContext>();

        if (await context.Auctions.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;
        var auctions = new List<Auction>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ItemName = "Vintage Camera",
                Description = "Classic 35mm film camera in mint condition.",
                ImageUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
                StartingPrice = 150m,
                CurrentPrice = 150m,
                StartTime = now,
                EndTime = now.AddDays(7),
                Status = AuctionStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                ItemName = "Gaming Laptop",
                Description = "RTX 4070, 16GB RAM, 1TB SSD. Perfect for AAA titles.",
                ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
                StartingPrice = 1200m,
                CurrentPrice = 1200m,
                StartTime = now,
                EndTime = now.AddDays(5),
                Status = AuctionStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                ItemName = "Artisan Coffee Kit",
                Description = "Hand grinder, pour-over set, and premium beans.",
                ImageUrl = "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
                StartingPrice = 80m,
                CurrentPrice = 80m,
                StartTime = now,
                EndTime = now.AddDays(3),
                Status = AuctionStatus.Active
            }
        };

        await context.Auctions.AddRangeAsync(auctions);
        await context.SaveChangesAsync();
    }
}


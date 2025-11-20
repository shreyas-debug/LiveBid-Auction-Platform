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

        var now = DateTime.UtcNow;
        var templates = new List<Auction>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ItemName = "Vintage Camera",
                Description = "Classic 35mm film camera in mint condition.",
                ImageUrl = "https://images.unsplash.com/photo-1495121553079-4c61bcce1894",
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
                ImageUrl = "https://images.unsplash.com/photo-1630794180018-433d915c34ac",
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
                Description = "Coffee machine with grinder and small-batch beans.",
                ImageUrl = "https://images.unsplash.com/photo-1637029436347-e33bf98a5412",
                StartingPrice = 80m,
                CurrentPrice = 80m,
                StartTime = now,
                EndTime = now.AddDays(3),
                Status = AuctionStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                ItemName = "Handcrafted Electric Guitar",
                Description = "Teal and brown electric guitar",
                ImageUrl = "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f",
                StartingPrice = 900m,
                CurrentPrice = 900m,
                StartTime = now,
                EndTime = now.AddDays(6),
                Status = AuctionStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                ItemName = "Designer Lounge Chair",
                Description = "Modern lounge chair with a unique design",
                ImageUrl = "https://images.unsplash.com/photo-1606744824163-985d376605aa",
                StartingPrice = 600m,
                CurrentPrice = 600m,
                StartTime = now,
                EndTime = now.AddDays(8),
                Status = AuctionStatus.Active
            }
        };

        foreach (var template in templates)
        {
            var existing = await context.Auctions.FirstOrDefaultAsync(a => a.ItemName == template.ItemName);
            if (existing == null)
            {
                await context.Auctions.AddAsync(template);
            }
            else
            {
                // Refresh descriptive fields only; preserve pricing/timing so live data stays intact.
                existing.Description = template.Description;
                existing.ImageUrl = template.ImageUrl;
                existing.Status = template.Status;
            }
        }

        await context.SaveChangesAsync();
    }
}


using Microsoft.AspNetCore.SignalR;
using System.Security.Claims; // We need this to get the user's name

namespace LiveBid.Api.Hubs
{
    public class AuctionHub : Hub
    {
        // This method is called by the frontend when a user opens an auction page.
        public async Task JoinAuctionGroup(string auctionId)
        {
            var groupName = $"auction-{auctionId}";

            // This adds the user's connection to the group
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            // Get the username (we get it from the token)
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "A user";

            await Clients.Group(groupName).SendAsync("UserJoined", $"{username} has joined the auction.");
        }

        // This method will be called by the frontend when the user leaves the auction page.
        public async Task LeaveAuctionGroup(string auctionId)
        {
            var groupName = $"auction-{auctionId}";

            // This removes the user's connection from the group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "A user";

            await Clients.Group(groupName).SendAsync("UserLeft", $"{username} has left the auction.");
        }
    }
}
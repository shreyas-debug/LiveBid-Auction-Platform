using LiveBid.Api.Data;
using LiveBid.Api.Models;
using Microsoft.AspNetCore.Authorization; // We need this to lock the endpoint
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; // We need this to get the logged-in user's ID
using LiveBid.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LiveBid.Api.Controllers
{
    [ApiController]
    [Route("api")] // We'll use a route of 'api/auctions/{id}/bids'
    public class BidsController : ControllerBase
    {
        private readonly AuctionDbContext _context;
        private readonly IHubContext<AuctionHub> _hubContext;

        public BidsController(AuctionDbContext context, IHubContext<AuctionHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // --- Our Bidding Endpoint ---
        // POST /api/auctions/{auctionId}/bids
        [Authorize] // 1. A user MUST be logged in to bid.
        [HttpPost("auctions/{auctionId}/bids")]
        public async Task<ActionResult<Bid>> PlaceBid(Guid auctionId, BidDto bidDto)
        {
            // 2. Find the auction the user is bidding on.
            // We use 'Include(a => a.Bids)' to also load its bid history.
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null)
            {
                return NotFound("Auction not found.");
            }

            // 3. --- Validation Logic ---
            // You can add more rules here (e.g., check if auction is active)
            if (bidDto.Amount <= auction.CurrentPrice)
            {
                // 400 Bad Request is the standard for a failed validation
                return BadRequest("Your bid must be higher than the current price.");
            }

            // 4. Get the ID of the user who is placing the bid.
            // The 'User' object is available because we used [Authorize]
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 5. Create the new Bid object
            var bid = new Bid
            {
                Id = Guid.NewGuid(),
                Amount = bidDto.Amount,
                Timestamp = DateTime.UtcNow,
                AuctionId = auction.Id,
                // UserId = userId  // We'll add this once AppUser is linked
            };

            // 6. Update the auction's price
            auction.CurrentPrice = bid.Amount;

            // 7. Add the new bid to the context
            _context.Bids.Add(bid);

            // 8. Save both changes to the database in one transaction
            await _context.SaveChangesAsync();

            // We are now broadcasting the new bid to every client
            // connected to the "auction-{auctionId}" group.
            await _hubContext.Clients
                .Group($"auction-{auctionId}")
                .SendAsync("ReceiveNewBid", bid); // "ReceiveNewBid" is the message name

            // 9. Return the newly created bid
            return CreatedAtAction(nameof(PlaceBid), new { id = bid.Id }, bid);
        }
    }

    // A DTO for the bid request
    public class BidDto
    {
        public decimal Amount { get; set; }
    }
}
using LiveBid.Api.Data; //DbContext
using LiveBid.Api.Models; //Auction model
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace LiveBid.Api.Controllers
{
    [ApiController]
    [Route("api/auctions")]
    public class AuctionsController : ControllerBase
    {
        private readonly AuctionDbContext _context;

        public AuctionsController(AuctionDbContext context)
        {
            _context = context;
        }

        // GET: /api/auctions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Auction>>> GetAuctions()
        {
            // This finds all auctions that are not finished
            var activeAuctions = await _context.Auctions
                .Where(a => a.Status != AuctionStatus.Finished)
                .OrderBy(a => a.EndTime)
                .ToListAsync();
                
            return Ok(activeAuctions);
        }

        // This method will find and return a single auction.
        [HttpGet("{id}")]
        public async Task<ActionResult<Auction>> GetAuction(Guid id)
        {
            // We use 'Include' to grab the 'Bids'
            // and 'OrderByDescending' to show the newest bids first.
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (auction == null)
            {
                return NotFound();
            }

            // We'll also sort the bids here for the client
            auction.Bids = auction.Bids.OrderByDescending(b => b.Timestamp).ToList();

            return auction;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Auction>> CreateAuction(Auction auction)
        {
            // Set initial values for the new auction
            auction.Id = Guid.NewGuid();
            auction.Status = AuctionStatus.Pending; // All new auctions start as 'Pending'
            auction.CurrentPrice = auction.StartingPrice;

            // Add the new auction object to EF Core's "in-memory" tracking.
            _context.Auctions.Add(auction);

            // 'await' the save. This is the moment EF Core generates the SQL 'INSERT' command and sends it to the database.
            await _context.SaveChangesAsync();

            // 'CreatedAtAction' is a helper that returns a 201 AND a 'Location' header pointing to the new item's URL
            return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, auction);
        }
    }
}
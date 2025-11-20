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
                // Sort by: Active first (Status 1), then by EndTime (soonest first)
                .OrderByDescending(a => a.Status == AuctionStatus.Active) 
                .ThenBy(a => a.EndTime)
                .ToListAsync();
                
            return Ok(activeAuctions);
        }

        // This method will find and return a single auction.
        [HttpGet("{id}")]
        public async Task<ActionResult<AuctionDetailDto>> GetAuction(Guid id)
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
            var orderedBids = auction.Bids
                .OrderByDescending(b => b.Timestamp)
                .ToList();

            var hasEnded = auction.EndTime <= DateTime.UtcNow || auction.Status == AuctionStatus.Finished;
            var winningBid = orderedBids.FirstOrDefault();

            if (hasEnded && auction.Status == AuctionStatus.Active)
            {
                auction.Status = AuctionStatus.Finished;
                await _context.SaveChangesAsync();
            }

            var dto = new AuctionDetailDto
            {
                Id = auction.Id,
                ItemName = auction.ItemName,
                Description = auction.Description,
                ImageUrl = auction.ImageUrl,
                StartingPrice = auction.StartingPrice,
                CurrentPrice = auction.CurrentPrice,
                StartTime = auction.StartTime,
                EndTime = auction.EndTime,
                Status = auction.Status,
                Bids = orderedBids.Select(b => new BidSummaryDto
                {
                    Id = b.Id,
                    Amount = b.Amount,
                    Timestamp = b.Timestamp,
                    BidderUsername = b.BidderUsername ?? "Anonymous"
                }).ToList(),
                IsSoldOut = hasEnded,
                WinningBidder = hasEnded ? winningBid?.BidderUsername : null,
                WinningBidAmount = hasEnded ? winningBid?.Amount : null
            };

            return dto;
        }

        // POST: /api/auctions (Admin only)
        [Authorize(Roles = "Admin")] 
        [HttpPost]
        public async Task<ActionResult<Auction>> CreateAuction(AuctionDto auctionDto)
        {
            var auction = new Auction
            {
                Id = Guid.NewGuid(),
                ItemName = auctionDto.ItemName,
                Description = auctionDto.Description,
                ImageUrl = auctionDto.ImageUrl, // <--- Save ImageUrl
                StartingPrice = auctionDto.StartingPrice,
                CurrentPrice = auctionDto.StartingPrice,
                StartTime = auctionDto.StartTime,
                EndTime = auctionDto.EndTime,
                Status = AuctionStatus.Active
            };

            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, auction);
        }

        // DELETE: /api/auctions/{id} (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuction(Guid id)
        {
            var auction = await _context.Auctions.FindAsync(id);
            if (auction == null) return NotFound();

            _context.Auctions.Remove(auction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }

    public class AuctionDto
    {
        public string ItemName { get; set; }
        public string Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal StartingPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class AuctionDetailDto
    {
        public Guid Id { get; set; }
        public string ItemName { get; set; }
        public string Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public AuctionStatus Status { get; set; }
        public List<BidSummaryDto> Bids { get; set; } = new();
        public bool IsSoldOut { get; set; }
        public string? WinningBidder { get; set; }
        public decimal? WinningBidAmount { get; set; }
    }

    public class BidSummaryDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }
        public string? BidderUsername { get; set; }
    }
}
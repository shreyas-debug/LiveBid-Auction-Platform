using LiveBid.Api.Data; //DbContext
using LiveBid.Api.Models; //Auction model
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiveBid.Api.Controllers
{
    [ApiController]
    [Route("api/auctions")]
    public class AuctionsController : ControllerBase // Our class inherits from ControllerBase
    {
        private readonly AuctionDbContext _context;

        // This is the CONSTRUCTOR. This is where Dependency Injection happens!
        // ASP.NET will see this and automatically "inject" the 
        // AuctionDbContext service we registered in Program.cs.
        public AuctionsController(AuctionDbContext context)
        {
            _context = context;
        }

        // --- Our First Endpoint: GET /api/auctions/{id} ---
        // This method will find and return a single auction.
        [HttpGet("{id}")]
        public async Task<ActionResult<Auction>> GetAuction(Guid id)
        {
            // 'async Task' is the modern way to write asynchronous code.
            // We 'await' the database call, which frees up the server
            // to handle other requests while it waits.

            // 'FindAsync' is a special EF Core method to find an item by its Primary Key (the 'Id').
            var auction = await _context.Auctions.FindAsync(id);

            if (auction == null)
            {
                // If we didn't find the auction, return a standard 404 Not Found response.
                return NotFound();
            }

            // If we found it, return a 200 OK response with the auction object.
            return auction;
        }

        // --- Our Second Endpoint: POST /api/auctions ---
        // This method will create a new auction.
        [HttpPost]
        public async Task<ActionResult<Auction>> CreateAuction(Auction auction)
        {
            // ASP.NET automatically takes the JSON from the request body
            // and converts it into an 'Auction' C# object for us.

            // --- We set the server-side values ---
            // (We don't trust the client to send a correct Id or Status)
            auction.Id = Guid.NewGuid();
            auction.Status = AuctionStatus.Pending; // All new auctions start as 'Pending'
            auction.CurrentPrice = auction.StartingPrice; // The first price is the starting price

            // 1. Add the new auction object to EF Core's "in-memory" tracking.
            _context.Auctions.Add(auction);

            // 2. 'await' the save. This is the moment EF Core generates
            //    the SQL 'INSERT' command and sends it to the database.
            await _context.SaveChangesAsync();

            // 3. Return a '201 Created' response. This is the HTTP standard.
            // 'CreatedAtAction' is a helper that returns a 201 AND
            // a 'Location' header pointing to the new item's URL
            // (using the 'GetAuction' endpoint we just made).
            return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, auction);
        }
    }
}
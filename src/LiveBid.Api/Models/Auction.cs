using System.Security.Cryptography;

namespace LiveBid.Api.Models
{
    public enum AuctionStatus
    {
        Pending,
        Active,
        Finished
    }

    public class Auction
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
        public List<Bid> Bids { get; set; } = new List<Bid>();
    }
}
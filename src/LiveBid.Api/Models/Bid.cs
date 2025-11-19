namespace LiveBid.Api.Models
{
    public class Bid
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }
        public Guid AuctionId { get; set; }
        public Auction Auction { get; set; }
        public string? BidderUsername { get; set; }
    }
}
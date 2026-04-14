import { top10Bids } from './bids.js';

class AuctionManager {
  constructor() {
    this.top10bids = [];
    this.maxSize = 10;
  }
  /**
   * Update top 10 bids based on bid amount
   * */
  updateBids(bid) {
    let low = 0;
    let high = this.top10bids.length;

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (parseInt(this.top10bids[mid].bid_amount) > parseInt(bid.bid_amount)) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    this.top10bids.splice(low, 0, bid);
    if (this.top10bids.length > this.maxSize) {
      this.top10bids.pop();
    }
  }
  /**
   * Get top 10 bids
   * */
  getTop10Bids() {
    return this.top10bids;
  }
  /**
   * Initialize the top 10 bids from a database
   * */
  async initializeBids() {
    if (this.top10bids.length === 0) {
      this.top10bids = await top10Bids();
    }
  }
}

export const auctionManager = new AuctionManager();

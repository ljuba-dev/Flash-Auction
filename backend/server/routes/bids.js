import express from 'express';
import { bid } from '../services/bids.js';
import { handleResponse } from '../services/helpers.js';
import { broadcast } from '../services/ws.js';

const router = express.Router();
// define the home page route
router.post('/', async (req, res) => {
  const user_id = req.user.sub;
  const { item_id, bid_amount } = req.body;
  const createBid = await bid(user_id, item_id, bid_amount);
  const response = handleResponse(createBid);
  if (response.success) {
    console.log('NEW BID CREATED');
    // Send WS request

    const message = JSON.stringify({
      type: 'bid',
      data: {
        user_id,
        item_id,
        bid_amount,
      },
    });
    broadcast(message);
  }
  res.status(response.statusCode).json(response);
});

export default router;

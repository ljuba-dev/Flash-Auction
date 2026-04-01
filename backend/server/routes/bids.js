import express from "express";
import { bid } from "../services/bids.js";
import { handleResponse } from "../services/helpers.js";
const router = express.Router();
// define the home page route
router.post("/", async (req, res) => {
  const { item_id, user_id, bid_amount } = req.body;
  const createBid = await bid(user_id, item_id, bid_amount);
  const response = handleResponse(createBid);
  res.status(response.statusCode).json(response);
});

export default router;

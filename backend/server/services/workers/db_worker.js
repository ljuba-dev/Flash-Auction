import { DB as db } from '../db.js';
import { addBid, updateTop10Bids } from '../bids.js';
import { getChannel } from '../mq.connect.js';

/**
 * RabbitMQ queue name
 * */
export const dbWorkerQueue = 'db_worker';

/**
 * DB worker used to update the database with the new bid and update item current bid
 * */
async function db_worker() {
  const channel = getChannel();
  await channel.consume(dbWorkerQueue, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    const { item, user_id, bid_amount } = data;
    const item_id = item.id;
    const getItem = await db.query(`SELECT * FROM auction.items WHERE id = '${item_id}';`);
    const _item = getItem.rows[0];
    const currentTime = new Date();
    if (_item) {
      const endTime = new Date(_item.end_time);
      if (currentTime < endTime) {
        if (bid_amount > _item.current_bid) {
          await db.query(`UPDATE auction.items SET current_bid = '${bid_amount}' WHERE id = '${_item.id}';`);
          const updateBid = await db.query(
            `INSERT INTO auction.bids (user_id, item_id, bid_amount) VALUES ('${user_id}', '${item_id}', '${bid_amount}') RETURNING id, timestamp;`,
          );
          const bidData = {
            id: updateBid.rows[0].id,
            date: updateBid.rows[0].timestamp,
            bid_amount: parseInt(bid_amount),
          };
          const getUser = await db.query(`SELECT * FROM auction.users WHERE id = '${user_id}';`);

          const newBidData = {
            user_id: user_id,
            item_id: item_id,
            bid_amount: bid_amount,
          };
          addBid(newBidData);
          updateTop10Bids(bidData, getUser.rows[0]);
          channel.ack(msg);
        } else {
          channel.ack(msg);
        }
      } else {
        channel.ack(msg);
      }
    } else {
      channel.nack(msg);
    }
  });
}

export { db_worker };

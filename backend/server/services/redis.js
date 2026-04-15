import { getRedisClient } from './redis.connect.js';

/**
 * Close the Redis client
 * @param {object} client
 * */
async function closeRedisClient(client) {
  await client.destroy();
}
/**
 * Set a key in Redis
 * @param {string} key
 * @param {string} value
 * @param {number} ttl @default 3600
 * @returns boolean
 * */
async function setKey(key, value, ttl = 3600) {
  try {
    const client = getRedisClient();
    client.set(key, value, { EX: ttl });
    return true;
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return false;
  }
}
/**
 * Set a hash key in Redis
 * @param {string} key
 * @param {object} value
 * @returns boolean
 * */
async function setHKey(key, value) {
  try {
    const client = getRedisClient();
    await client.hSet(key, value);
    return true;
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return false;
  }
}
/**
 * Get a key from Redis
 * @param {string} key
 * @returns string || null || error
 * */
async function getKey(key) {
  try {
    const client = getRedisClient();
    return client.get(key);
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return e;
  }
}
/**
 * Get a hash key from Redis
 * @param {string} key
 * @returns object || null || error
 * */
async function getHKey(key) {
  try {
    const client = getRedisClient();
    return await client.hGetAll(key);
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return e;
  }
}
/**
 * Lua script to check bids based on key and bid amount
 * @param {string} key
 * @param {number} bidAmount
 * @param {object} item
 * @returns Promise<string>
 *
 * 'OK' - Should insert new a bid
 *
 * 'BID_LOW' - bid amount too low
 *
 * 'BID_EXPIRED' - item time to bid expired
 * */
async function luaScriptCheckBids(key, bidAmount, item) {
  // Check for date difference before we start lua script
  const itemEndTime = new Date(item.end_time).getTime();
  const currentTime = new Date().getTime();
  if (currentTime > itemEndTime) {
    return 'BID_EXPIRED';
  } else {
    const script = `
  local bidObject = redis.call('HGETALL', KEYS[1]);
  local currentAmount = tonumber(ARGV[2]); 
  local bid = bidObject.bid or currentAmount;
  local bidAmount = tonumber(bid) or 0; 
  local newBid = tonumber(ARGV[1]);
  local totalBidAmount = bidAmount;
  if newBid > bidAmount then
    redis.call('HSET', KEYS[1], 'bid', ARGV[1], 'id', ARGV[3], 'name', ARGV[4], 'endtime', ARGV[5]);
    return 'OK';
  else 
    return 'BID_LOW';
  end
  `;
    /** @type {import('redis').RedisClientType} */
    const client = getRedisClient();
    return await client.eval(script, {
      keys: [key],
      arguments: [
        bidAmount.toString(),
        item.current_bid.toString(),
        item.id.toString(),
        item.name.toString(),
        (new Date(item.end_time).getTime() / 1000).toString(),
      ],
    });
  }
}

export { closeRedisClient, setKey, getKey, setHKey, getHKey, luaScriptCheckBids };

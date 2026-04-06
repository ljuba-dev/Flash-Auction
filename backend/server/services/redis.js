import { createClient } from 'redis';

async function getRedisClient() {
  try {
    return await createClient({
      url: process.env.REDIS_URL,
    })
      .on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          throw err.code;
        } else {
          throw err.message;
        }
      })
      .connect();
  } catch (e) {
    return e;
  }
}
async function closeRedisClient(client) {
  await client.destroy();
}
async function setKey(key, value, ttl = 3600) {
  try {
    const client = await getRedisClient();
    if (!client) {
      throw new Error('Redis client not connected');
    }
    await client.set(key, value, { EX: ttl });
    return true;
  } catch (e) {
    console.log('\x1b[31m' + e.message + '\x1b[0m');
    return e;
  }
}
async function getKey(key) {
  try {
    const client = await getRedisClient();
    if (!client) {
      throw new Error('Redis client not connected');
    }
    return await client.get(key);
  } catch (e) {
    console.log('\x1b[31m' + e.message + '\x1b[0m');
    return e;
  }
}
async function luaScriptCheckBids(key, bidAmount, item) {
  const client = await getRedisClient();
  if (!client) {
    throw new Error('Redis client not connected');
  }
  const script1 = `
  local bidObject = redis.call('HGET', KEYS[1], 'bid') or 0;
  local bidAmount = tonumber(bidObject) or 0; 
  local newBid = tonumber(ARGV[1]);
  local totalBidAmount = bidAmount;
  if bidAmount < newBid then
    redis.call('HSET', KEYS[1], 'bid', ARGV[1], 'id', ARGV[2], 'name', ARGV[3]);
    return 1;
  end
  return 0;
  `;
  const result = await client.eval(script1, {
    keys: [key],
    arguments: [bidAmount.toString(), item.id.toString(), item.name],
  });
  return result;
}

export { getRedisClient, closeRedisClient, setKey, getKey, luaScriptCheckBids };

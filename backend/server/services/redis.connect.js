import { createClient } from 'redis';

/** @type {import('redis').RedisClientType} */
let client = null;
/**
 * Create a connection to Redis and return the client that has initialized the connection
 * @returns {import('redis').RedisClientType}
 * */
export async function connectRedis() {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL,
    // Best practice for high-load: automatic reconnection
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
      keepAlive: 5000,
    },
  });

  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[32mRedis initialized successfully.\x1b[0m');
    }
  });

  await client.connect();
  return client;
}
/**
 * Get the client or throw an error if it doesn't exist
 *
 * * *Note, this is used mostly so we don't re-initialize the client*
 * @returns {import('redis').RedisClientType}
 * */
export const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return client;
};

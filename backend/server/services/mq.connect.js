import amqp from 'amqplib';
import { dbWorkerQueue } from './workers/db_worker.js';

let connection;
let channel;

/**
 * Create a connection to RabbitMQ and return the channel
 * @returns channel
 * */
async function connectToRabbitMQ() {
  if (channel) return channel;
  try {
    console.log('Connecting to RabbitMQ...');
    console.log('process.env.RABBITMQ_URL');
    console.log(process.env.RABBITMQ_URL);
    console.log('process.env.AMQP_URL');
    console.log(process.env.AMQP_URL);
    console.log('USING: ');
    console.log(process.env.RABBITMQ_URL ? process.env.RABBITMQ_URL : process.env.AMQP_URL || 'amqp://localhost');
    connection = process.env.RABBITMQ_URL
      ? await amqp.connect(process.env.RABBITMQ_URL)
      : amqp.connect(process.env.AMQP_URL || 'amqp://localhost');
    channel = await connection.createChannel();

    await channel.assertQueue(dbWorkerQueue, {
      durable: true,
      arguments: {
        'x-queue-type': 'quorum',
      },
    });
    return channel;
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log(`\x1b[31mRabbitMQ is NOT running or connection failed: ${error.message}\x1b[0m`);
    }
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log(`\x1b[31m!Please start RabbitMQ server!\x1b[0m`);
    }
    process.exit(1);
  }
}
/**
 * Get the channel or create a new one if it doesn't exist
 * @returns channel
 * */
const getChannel = () => {
  if (!channel) {
    return connectToRabbitMQ();
  }
  return channel;
};

export { connectToRabbitMQ, getChannel };

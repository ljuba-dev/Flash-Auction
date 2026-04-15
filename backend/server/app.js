import 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import * as http from 'node:http';
import cors from 'cors';
import { Server } from 'socket.io';
import { itemRoutes, userRoutes, bidRoutes, docsRoutes, authRoutes } from './routes/routes.js';
import { createTables } from '../database/create_tables.js';
import { createDatabaseAndSchema } from '../database/create_db.js';
import { authMiddleware, verifyToken } from './services/jwt.js';
import { seedItemsTable, seedUsersTable } from '../database/seed_tables.js';
import { connectRedis } from './services/redis.connect.js';
import { db_worker } from './services/workers/db_worker.js';
import ora from 'ora';
import { auctionManager } from './services/auctionState.js';
import { wsTypes } from './variables/ws.types.js';
import { connectToRabbitMQ } from './services/mq.connect.js';

const prefix = '/api/v1';
const corsOptions = {
  origin: ['http://localhost:4200', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma'],
};

const app = express();
app.use(cors(corsOptions));
const server = http.createServer(express().use(prefix, app));

const io = new Server(server, {
  path: `${prefix}/ws`,
  cors: corsOptions,
});
if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
  console.log('\x1b[32mWebsocket server started successfully.\x1b[0m');
}

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
export let wsClients = {};
export let wsClientsCount = 0;
export let wsGroups = 0;
// Set authentication middleware
app.use(authMiddleware);
// Set routes
app.use('/auth', authRoutes);
app.use('/docs', docsRoutes);
app.use('/user', userRoutes);
app.use('/item', itemRoutes);
app.use('/bid', bidRoutes);
// Set healtchecks
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
const auction = auctionManager;

io.on('connection', (socket) => {
  try {
    const userFromSocket = verifyToken(socket.handshake.auth.token);
    if (userFromSocket) {
      wsClients[userFromSocket.id] = socket;
    }
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
  }

  socket.on('message', (data) => {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('received: %s', data);
    }
  });
  socket.on('disconnect', async () => {
    try {
      const userFromSocket = await verifyToken(socket.handshake.auth.token);
      if (userFromSocket) {
        if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
          console.log('Client disconnected');
        }
        delete wsClients[userFromSocket.id];
        wsClientsCount--;
      } else {
        socket.disconnect();
      }
    } catch (e) {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[31m' + e.message + '\x1b[0m');
      }
    }
  });
  socket.on('error', () => {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('Client error');
    }
  });
  wsClientsCount++;
  const greetings = {
    payload: {
      message: 'You are connected to the web socket.',
    },
    timestamp: Date.now(),
  };

  socket.emit(wsTypes.CONNECTION, greetings);
  socket.emit(wsTypes.TOP_BIDS, {
    payload: auction.top10bids,
    timestamp: Date.now(),
  });
});

express().use('/api/v1', app);

// Added a timeout to allow the database to start, so a "quick-hack" to avoid errors
const timeout = process.env.NODE_ENV === 'docker' ? 1000 : 0;
setTimeout(() => {
  server.listen(port, async () => {
    try {
      /**
       * Create database and schema initialization
       * */
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[34mDatabase and schema...\x1b[0m');
      }
      const { db, schema } = await createDatabaseAndSchema();
      if (db === 1 && schema === 1) {
        if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
          console.log('\x1b[32mDatabase and schema created successfully.\x1b[0m');
        }
      } else {
        if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
          console.log('\x1b[32mDatabase and schema already exist.\x1b[0m');
        }
      }

      /**
       * Create tables initialization
       * */
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[34mChecking tables...\x1b[0m');
      }
      const { items, table, users } = await createTables();
      if (items === 1 && table === 1 && users === 1) {
        if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
          console.log('Tables created successfully.');
        }
      } else {
        if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
          console.log('\x1b[32mTables already exist.\x1b[0m');
        }
      }

      /**
       * Redis initialization
       * */
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[34mInitializing Redis...\x1b[0m');
      }
      await connectRedis(); // Initialize Redis

      /**
       * Checking MQ server
       * */
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[34mInitializing Rabbit MQ...\x1b[0m');
      }
      await connectToRabbitMQ();
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[32mRabbit MQ initialized successfully.\x1b[0m');
      }
      await db_worker();
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[32mDB worker initialized successfully.\x1b[0m');
      }
      /**
       *  Initialize inMemory variables
       * */
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[34mInitializing inMemory vars...\x1b[0m');
      }
      await auction.initializeBids();
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[32mInMemory vars initialized successfully.\x1b[0m');
      }

      /**
       * Seeding tables initialization
       * */
      if (process.env.SEED === 'true') {
        let spinner1 = ora('\x1b[34mSeeding data...\x1b[0m').start();
        const seedingUsers = await seedUsersTable();
        if (seedingUsers.error) {
          if (seedingUsers.continue) {
            spinner1.fail('\x1b[31mSeeding users failed.\x1b[0m');
            if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
              console.log(`\x1b[33m\t-  Seeding users failed. Reason: ${seedingUsers.message}\x1b[0m`);
            }
          } else {
            spinner1.fail('\x1b[31mSeeding data failed.\x1b[0m');
            throw new Error('Seeding users failed. Reason: ' + seedingUsers.message);
          }
        } else {
          spinner1.succeed('\x1b[32mUsers seeded successfully.\x1b[0m');
        }
        const seedingItems = await seedItemsTable();
        if (seedingItems.error) {
          if (seedingItems.continue) {
            spinner1.fail('\x1b[31mSeeding items failed.\x1b[0m');
            if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
              console.log(`\x1b[33m\t-  Seeding items failed. Reason: ${seedingItems.message}\x1b[0m`);
            }
          } else {
            spinner1.fail('\x1b[31mSeeding data failed.\x1b[0m');
            throw new Error('Seeding items failed. Reason: ' + seedingItems.message);
          }
        } else {
          spinner1.succeed('\x1b[32mItems seeded successfully.\x1b[0m');
        }
      }
    } catch (e) {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[31m' + e + '\x1b[0m');
      }
    }

    console.log(
      `\n\x1b[32mFlash auction app is listening on port ${port}, path to it is http://localhost:${port}${prefix}.\nWebsocket path is http://localhost:${port}${prefix}/ws\x1b[0m`,
    );
    if (process.env.TESTING && process.env.TESTING === 'true') {
      console.log(
        `\n\x1b[34m \t|||||||||||||||||||||||||||||||||||||||||
        |\t     TESTING ENABLED    \t|
        |---------------------------------------| 
        |   to disable it, change .env \t| 
        |   file by removing or commenting \t| 
        |   out the 'TESTING' variable\t|
        |||||||||||||||||||||||||||||||||||||||||\x1b[0m`,
      );
    }
    console.log(
      `\n\x1b[33m \t|***************************************|
        |\tYOU ARE USING "${process.env.BUILD}" BUILD\t|
        |---------------------------------------|
        |     change .env file by changing \t| 
        |     'BUILD' variable to: \t\t|
        |     'normal' or 'redis' or 'mq' \t|\n\t|***************************************|\x1b[0m\n`,
    );
  });
}, timeout);

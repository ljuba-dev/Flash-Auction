import 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import * as http from 'node:http';
import uuid4 from 'uuid4';
import cors from 'cors';

import { itemRoutes, userRoutes, bidRoutes, docsRoutes, authRoutes } from './routes/routes.js';
import { createTables } from '../database/create_tables.js';
import { createDatabaseAndSchema } from '../database/create_db.js';
import { authMiddleware } from './services/jwt.js';
import { getRedisClient } from './services/redis.js';
import { seedItemsTable, seedUsersTable } from '../database/seed_tables.js';

const prefix = '/api/v1';
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma'],
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
const server = http.createServer(express().use(prefix, app));

const wss = new WebSocketServer({ server, path: `${prefix}/ws` });
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

express().use('/api/v1', app);

wss.on('connection', (ws) => {
  const socketId = uuid4();
  wsClients = { [socketId]: ws };
  ws.on('message', (data) => {
    console.log('received: %s', data);
  });
  wsClientsCount++;
  ws.send('connected');
});

// Added a timeout to allow the database to start, so a "quick-hack" to avoid errors
const timeout = process.env.NODE_ENV === 'docker' ? 1000 : 0;
setTimeout(() => {
  server.listen(port, async () => {
    try {
      console.log('\x1b[34mDatabase and schema...\x1b[0m');
      const { db, schema } = await createDatabaseAndSchema();
      if (db === 1 && schema === 1) {
        console.log('\x1b[32mDatabase and schema created successfully.\x1b[0m');
      } else {
        console.log('\x1b[32mDatabase and schema already exist.\x1b[0m');
      }
      console.log('\x1b[34mChecking tables...\x1b[0m');
      const { items, table, users } = await createTables();
      if (items === 1 && table === 1 && users === 1) {
        console.log('Tables created successfully.');
      } else {
        console.log('\x1b[32mTables already exist.\x1b[0m');
      }
      console.log('\x1b[34mSeeding data...\x1b[0m');
      const seedingUsers = await seedUsersTable();
      if (seedingUsers.error) {
        throw new Error('Seeding users failed. Reason: ' + seedingUsers.message);
      } else {
        console.log('\x1b[32mUsers seeded successfully.\x1b[0m');
      }
      const seedingItems = await seedItemsTable();
      if (seedingItems.error) {
        throw new Error('Seeding items failed. Reason: ' + seedingItems.message);
      } else {
        console.log('\x1b[32mItems seeded successfully.\x1b[0m');
      }

      console.log(
        `\x1b[32mFlash auction app is listening on port ${port}, path to it is http://localhost:${port}${prefix}.\nWebsocket path is http://localhost:${port}${prefix}/ws\x1b[0m`,
      );
      console.log('\x1b[34mInitializing Redis...\x1b[0m');
      const redis = await getRedisClient();
      if (typeof redis === 'string') throw new Error('Redis initialization failed. Reason: ' + redis);
      else console.log('\x1b[32mRedis initialized successfully.\x1b[0m');
    } catch (e) {
      console.log('\x1b[31m' + e + '\x1b[0m');
    }
  });
}, timeout);

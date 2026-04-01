import "dotenv";
import express from "express";
import bodyParser from "body-parser";

import {
  itemRoutes,
  userRoutes,
  bidRoutes,
  docsRoutes,
} from "./routes/routes.js";
import { createTables } from "../database/create_tables.js";
import { createDatabaseAndSchema } from "../database/create_db.js";

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
// Set routes
app.use("/docs", docsRoutes);
app.use("/user", userRoutes);
app.use("/item", itemRoutes);
app.use("/bid", bidRoutes);

// Added a timeout to allow the database to start, so a "quick-hack" to avoid errors
const timeout = process.env.NODE_ENV === "docker" ? 1000 : 0;
setTimeout(() => {
  express()
    .use("/api/v1", app)
    .listen(port, async () => {
      console.log("Creating database and schema...");
      await createDatabaseAndSchema();
      console.log("Database and schema created successfully.");
      console.log("Creating tables...");
      await createTables();
      console.log("Tables created successfully.");
      console.log(`Example app listening on port ${port}`);
    });
}, timeout);

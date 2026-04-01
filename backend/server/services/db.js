import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.join(__dirname, "./../../.env"),
});
import { Pool } from "pg";

const getConnection = async function () {
  const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PG_USER || "postgres",
        host: process.env.PG_HOST || "localhost",
        database: process.env.PG_DB || "auction",
        password: process.env.PG_PASSWORD || "mysecretpassword",
        port: process.env.PG_PORT || 5432,
      };
  return new Pool(config);
};

export default getConnection;

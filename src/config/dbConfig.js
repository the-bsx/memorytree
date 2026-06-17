import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then(() => console.log("Postgres Connected..."))
  .catch((err) => console.log("Error occured:", err));

export default pool;

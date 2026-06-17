import "dotenv/config";
import app from "./src/app.js";
import pool from "./src/config/dbConfig.js";

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is working in port ${process.env.PORT}`);
});

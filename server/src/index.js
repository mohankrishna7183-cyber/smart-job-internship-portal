import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { config } from "./config/env.js";

try {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
} catch (error) {
  console.error("Failed to start API:", error);
  process.exitCode = 1;
}

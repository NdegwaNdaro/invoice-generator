import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./models/index.js";

const backendEnvPath = fileURLToPath(new URL("../.env", import.meta.url));
dotenv.config({ path: backendEnvPath });

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured.");
}

const port = Number(process.env.PORT || 4000);

try {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(port, () => {
    console.log(`Invoice API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Unable to start the server:", error);
  process.exit(1);
}

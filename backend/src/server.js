import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./models/index.js";

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

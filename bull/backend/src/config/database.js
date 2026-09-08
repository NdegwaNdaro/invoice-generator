import { fileURLToPath } from "node:url";
import { Sequelize } from "sequelize";

const useSQLite = !process.env.DB_HOST && process.env.DB_DIALECT !== "mysql";
const dbConfig = useSQLite
  ? {
      dialect: "sqlite",
      storage: fileURLToPath(new URL("../../database/invoice.db", import.meta.url)),
      logging: false,
      define: { underscored: true }
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      dialect: process.env.DB_DIALECT || "mysql",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      define: {
        underscored: true
      }
    };

const sequelize = new Sequelize(
  process.env.DB_NAME || (useSQLite ? "invoice_system" : "invoice_system"),
  process.env.DB_USER || (useSQLite ? "" : "invoice_user"),
  process.env.DB_PASSWORD || (useSQLite ? "" : "invoice_password"),
  dbConfig
);

export default sequelize;

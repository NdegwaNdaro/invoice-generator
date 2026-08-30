import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "invoice_system",
  process.env.DB_USER || "invoice_user",
  process.env.DB_PASSWORD || "invoice_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      underscored: true
    }
  }
);

export default sequelize;

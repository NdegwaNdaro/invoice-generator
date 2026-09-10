import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("admin", "manager", "staff"),
    allowNull: false,
    defaultValue: "manager"
  }
});

export const Customer = sequelize.define("Customer", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150) },
  phone: { type: DataTypes.STRING(30) },
  address: { type: DataTypes.TEXT }
});

export const Setting = sequelize.define("Setting", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  businessName: { type: DataTypes.STRING(180), allowNull: false, defaultValue: "" },
  email: { type: DataTypes.STRING(150), defaultValue: "" },
  phone: { type: DataTypes.STRING(30), defaultValue: "" },
  address: { type: DataTypes.TEXT, defaultValue: "" },
  logo: { type: DataTypes.STRING, defaultValue: "" },
  currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "KES" },
  taxRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 16 },
  paymentTerms: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "Payment due within 30 days."
  }
});

export const Invoice = sequelize.define(
  "Invoice",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    invoiceNumber: { type: DataTypes.STRING(50), allowNull: false },
    invoiceDate: { type: DataTypes.DATEONLY, allowNull: false },
    dueDate: { type: DataTypes.DATEONLY },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    taxRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    tax: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("draft", "sent", "paid", "overdue"),
      allowNull: false,
      defaultValue: "draft"
    },
    notes: { type: DataTypes.TEXT, defaultValue: "" }
  },
  {
    indexes: [{ unique: true, fields: ["user_id", "invoice_number"] }]
  }
);

export const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  invoiceId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  paymentDate: { type: DataTypes.DATEONLY, allowNull: false },
  method: { type: DataTypes.STRING(30), defaultValue: "bank_transfer" },
  notes: { type: DataTypes.TEXT, defaultValue: "" }
});

export const RecurringInvoice = sequelize.define("RecurringInvoice", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(160), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: "" },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  frequency: {
    type: DataTypes.ENUM("weekly", "monthly", "quarterly"),
    allowNull: false,
    defaultValue: "monthly"
  },
  nextRunDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: {
    type: DataTypes.ENUM("active", "paused"),
    allowNull: false,
    defaultValue: "active"
  },
  notes: { type: DataTypes.TEXT, defaultValue: "" }
});

export const InvoiceItem = sequelize.define("InvoiceItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoiceId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  rate: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
});

export const PaymentAuditLog = sequelize.define("PaymentAuditLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  paymentId: { type: DataTypes.INTEGER, allowNull: false },
  invoiceId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  action: {
    type: DataTypes.ENUM("created", "updated", "deleted"),
    allowNull: false
  },
  oldValues: { type: DataTypes.JSON, defaultValue: null },
  newValues: { type: DataTypes.JSON, defaultValue: null },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});

User.hasMany(Customer, { foreignKey: "userId", onDelete: "CASCADE" });
Customer.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Invoice, { foreignKey: "userId", onDelete: "CASCADE" });
Invoice.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Setting, { foreignKey: "userId", onDelete: "CASCADE" });
Setting.belongsTo(User, { foreignKey: "userId" });
Customer.hasMany(Invoice, { foreignKey: "customerId", onDelete: "RESTRICT" });
Invoice.belongsTo(Customer, { foreignKey: "customerId" });
Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoiceId",
  as: "items",
  onDelete: "CASCADE"
});
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

User.hasMany(Payment, { foreignKey: "userId", onDelete: "CASCADE" });
Payment.belongsTo(User, { foreignKey: "userId" });
Invoice.hasMany(Payment, { foreignKey: "invoiceId", as: "payments", onDelete: "CASCADE" });
Payment.belongsTo(Invoice, { foreignKey: "invoiceId" });
Customer.hasMany(Payment, { foreignKey: "customerId", onDelete: "CASCADE" });
Payment.belongsTo(Customer, { foreignKey: "customerId" });

User.hasMany(RecurringInvoice, { foreignKey: "userId", onDelete: "CASCADE" });
RecurringInvoice.belongsTo(User, { foreignKey: "userId" });
Customer.hasMany(RecurringInvoice, { foreignKey: "customerId", onDelete: "RESTRICT" });
RecurringInvoice.belongsTo(Customer, { foreignKey: "customerId" });

User.hasMany(PaymentAuditLog, { foreignKey: "userId", onDelete: "CASCADE" });
PaymentAuditLog.belongsTo(User, { foreignKey: "userId" });
Invoice.hasMany(PaymentAuditLog, { foreignKey: "invoiceId", onDelete: "CASCADE" });
PaymentAuditLog.belongsTo(Invoice, { foreignKey: "invoiceId" });
Customer.hasMany(PaymentAuditLog, { foreignKey: "customerId", onDelete: "CASCADE" });
PaymentAuditLog.belongsTo(Customer, { foreignKey: "customerId" });

export { sequelize };

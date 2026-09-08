import { Setting } from "../models/index.js";

const currencies = ["KES", "USD", "UGX", "TZS", "NGN", "GHS", "ZAR", "EUR", "GBP"];

export async function getSettings(req, res) {
  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  res.json({ settings, currencies });
}

export async function updateSettings(req, res) {
  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  const currency = currencies.includes(req.body.currency) ? req.body.currency : settings.currency;
  await settings.update({
    businessName: req.body.businessName?.trim() || "",
    email: req.body.email?.trim() || "",
    phone: req.body.phone?.trim() || "",
    address: req.body.address?.trim() || "",
    currency,
    taxRate: Number(req.body.taxRate || 0),
    paymentTerms: req.body.paymentTerms?.trim() || ""
  });
  res.json({ settings, currencies });
}

export async function uploadBusinessLogo(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Upload a PNG, JPEG, or WebP image under 2 MB." });
  }
  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  await settings.update({ logo: `/uploads/${req.file.filename}` });
  return res.json({ settings });
}

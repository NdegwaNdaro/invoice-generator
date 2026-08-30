import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub, {
      attributes: ["id", "name", "email"]
    });

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

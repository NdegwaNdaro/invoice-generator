import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Setting, User } from "../models/index.js";

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleDescription: user.roleDescription
  };
}

export async function register(req, res) {
  const { name, email, password, role, roleDescription } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({
      message: "Name, email, and a password of at least 8 characters are required."
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ where: { email: normalizedEmail } })) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const safeRole = ["admin", "manager", "staff", "ceo"].includes(role) ? role : "manager";
  const safeRoleDescription = roleDescription?.trim() || "Business owner";

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: safeRole,
    roleDescription: safeRoleDescription
  });
  await Setting.create({
    userId: user.id,
    businessName: `${user.name}'s Business`,
    email: user.email
  });

  return res.status(201).json({ token: createToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const user = email ? await User.findOne({ where: { email } }) : null;

  if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

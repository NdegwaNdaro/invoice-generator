import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import routes from "./routes/index.js";
import { handleError, notFound } from "./middleware/errors.js";

const app = express();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    !req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    !["localhost", "127.0.0.1"].includes(req.hostname)
  ) {
    return res.redirect(`https://${req.get("host")}${req.originalUrl}`);
  }
  return next();
});
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const { hostname, protocol, port } = new URL(origin);
        const isLocalDevOrigin =
          (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") &&
          ["http:", "https:"].includes(protocol) &&
          (port === "" || Number(port) >= 1);

        if (isLocalDevOrigin) {
          callback(null, true);
          return;
        }
      } catch {
        // ignore malformed origins and reject below
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(root, "uploads")));
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-7" })
);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", routes);
if (process.env.NODE_ENV === "production") {
  const frontendDirectory = path.resolve(root, "../frontend/dist");
  app.use(express.static(frontendDirectory));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    return res.sendFile(path.join(frontendDirectory, "index.html"));
  });
}
app.use(notFound);
app.use(handleError);

export default app;

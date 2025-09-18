// File: backend/server/server.js
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { loadCfg } from "./loadCfg.js";

const cfg = loadCfg();
const PORT = Number(process.env.PORT || cfg.dev_server_port || 3200);
const OUTPUTS_DIR = path.resolve(cfg.paths?.outputs_dir ?? "./outputs");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "static-server", port: PORT }));
app.use("/outputs", express.static(OUTPUTS_DIR, { fallthrough: true }));

const frontBuild = path.resolve("./frontend/dist");
if (fs.existsSync(frontBuild)) app.use("/", express.static(frontBuild));

app.listen(PORT, () => {
  console.log(`🛰  SUC Static Server http://localhost:${PORT}`);
  console.log(`📦 Serving outputs from: ${OUTPUTS_DIR}`);
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(cors());

// dossiers mp3
const MP3_DIR = "C:\\Users\\adrie\\Bureau\\fichier\\mp3 musix";

// GET /files — liste tous les MP3
app.get("/files", (req, res) => {
  try {
    if (!fs.existsSync(MP3_DIR)) {
      return res
        .status(404)
        .json({ error: "MP3 folder not found", path: MP3_DIR });
    }

    const files = fs
      .readdirSync(MP3_DIR)
      .filter((f) => f.toLowerCase().endsWith(".mp3"))
      .map((f) => {
        const filePath = path.join(MP3_DIR, f);
        const stats = fs.statSync(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
        return {
          id: Buffer.from(f).toString("base64"),
          name: f,
          size: `${sizeInMB} MB`,
          sizeBytes: stats.size,
        };
      });

    res.json({ files, count: files.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /file/:id — télécharge un MP3 par son id (base64 du nom)
app.get("/file/:id", (req, res) => {
  try {
    const fileName = Buffer.from(req.params.id, "base64").toString("utf8");
    const filePath = path.join(MP3_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.setHeader("Content-Length", fs.statSync(filePath).size);

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /ping — test de connexion
app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Musix server running 🎵" });
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  const nets = os.networkInterfaces();
  let ip = "localhost";
  
  for (const name of Object.keys(nets)) {
    // Cherche spécifiquement les interfaces Wi-Fi/Ethernet
    for (const net of nets[name]) {
      if (
        net.family === "4" &&
        !net.internal &&
        !net.address.startsWith("169.254") // exclut les APIPA
      ) {
        ip = net.address;
      }
    }
  }

  console.log(`\n🎵 Musix PC Server running !`);
  console.log(`📁 MP3s : ${MP3_DIR}`);
  console.log(`\n👉 Entre cette IP dans l'app : \x1b[36m${ip}\x1b[0m`);
  console.log(`\n   http://${ip}:${PORT}/ping`);
  console.log(`   http://${ip}:${PORT}/files`);
  console.log(`   http://${ip}:${PORT}/file/:id\n`);
});
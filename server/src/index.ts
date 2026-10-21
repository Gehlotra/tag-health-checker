import express from "express";
import cors from "cors";
import { detectGA4, detectGTM, detectConsentBanner } from "./detect";

interface SiteReport {
  url: string;
  hasGA4: boolean;
  hasGTM: boolean;
  hasConsentBanner: boolean;
  loadTimeMs: number;
}

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/check", async (req, res) => {
  const url = req.query.url;

  if (typeof url !== "string" || url.length === 0) {
    res.status(400).json({ error: "Please provide a url, like ?url=nike.com" });
    return;
  }

  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  try {
    const start = Date.now();
    const response = await fetch(fullUrl, { signal: AbortSignal.timeout(10000) });
    const html = await response.text();
    const loadTimeMs = Date.now() - start;

    console.log(`Downloaded ${fullUrl}: ${html.length} characters`);

    const report: SiteReport = {
      url: fullUrl,
      hasGA4: detectGA4(html),
      hasGTM: detectGTM(html),
      hasConsentBanner: detectConsentBanner(html),
      loadTimeMs: loadTimeMs,
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Could not reach that website" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit_logs.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_ACCOUNTS = [
  { id: 'ACC-001', fullName: "Ngary Sow", email: "ngaryservicepro@gmail.com", role: "Super Administrateur", password: "admin", status: "Actif" },
  { id: 'ACC-002', fullName: "Racine Sy", email: "racinesy1990@gmail.com", role: "Membre", password: "123456789@", status: "Actif" },
  { id: 'ACC-003', fullName: "Souleymane Faye", email: "president@karalumiere.sn", role: "Président", password: "pres", status: "Actif" },
  { id: 'ACC-004', fullName: "Babacar Ndiaye", email: "sg@karalumiere.sn", role: "Secrétaire Général", password: "sg", status: "Actif" },
  { id: 'ACC-005', fullName: "Fatou Diome", email: "musique@karalumiere.sn", role: "Responsable Musicale", password: "musique", status: "Actif" },
  { id: 'ACC-006', fullName: "Seynabou Ndiaye", email: "seynabou@karalumiere.sn", role: "Membre", password: "membre", status: "Actif" }
];

function readAccounts() {
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(DEFAULT_ACCOUNTS, null, 2));
      return DEFAULT_ACCOUNTS;
    }
    const data = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
    const accounts = JSON.parse(data);
    // Ensure default admin & Racine Sy always exist if missing
    let modified = false;
    DEFAULT_ACCOUNTS.forEach(defAcc => {
      if (!accounts.some((a: any) => (a.email || "").trim().toLowerCase() === defAcc.email.trim().toLowerCase())) {
        accounts.push(defAcc);
        modified = true;
      }
    });
    if (modified) {
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
    }
    return accounts;
  } catch (err) {
    console.error("Error reading accounts file:", err);
    return DEFAULT_ACCOUNTS;
  }
}

function writeAccounts(accounts: any[]) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
  } catch (err) {
    console.error("Error writing accounts file:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // GET Accounts
  app.get("/api/accounts", (req, res) => {
    const accounts = readAccounts();
    res.json({ success: true, accounts });
  });

  // POST Sync All Accounts
  app.post("/api/accounts/sync", (req, res) => {
    const { accounts } = req.body;
    if (Array.isArray(accounts)) {
      writeAccounts(accounts);
      res.json({ success: true, count: accounts.length });
    } else {
      res.status(400).json({ success: false, error: "Invalid accounts array" });
    }
  });

  // POST Create or Update Single Account
  app.post("/api/accounts", (req, res) => {
    const { fullName, email, role, password, status } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const accounts = readAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const existingIndex = accounts.findIndex((a: any) => (a.email || "").trim().toLowerCase() === cleanEmail);

    if (existingIndex >= 0) {
      accounts[existingIndex] = {
        ...accounts[existingIndex],
        fullName: fullName.trim(),
        email: cleanEmail,
        role: role || accounts[existingIndex].role,
        password: password !== undefined ? password : accounts[existingIndex].password,
        status: status || accounts[existingIndex].status
      };
    } else {
      const newAcc = {
        id: 'ACC-' + Math.floor(1000 + Math.random() * 9000),
        fullName: fullName.trim(),
        email: cleanEmail,
        role: role || 'Membre',
        password: password || '123456789@',
        status: status || 'Actif'
      };
      accounts.push(newAcc);
    }

    writeAccounts(accounts);
    res.json({ success: true, accounts });
  });

  // DELETE Account
  app.delete("/api/accounts/:id", (req, res) => {
    const { id } = req.params;
    const accounts = readAccounts();
    const filtered = accounts.filter((a: any) => a.id !== id && (a.email || "").trim().toLowerCase() !== id.trim().toLowerCase());
    writeAccounts(filtered);
    res.json({ success: true, accounts: filtered });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static client files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

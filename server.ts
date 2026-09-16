import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit_logs.json");
const APP_DATA_FILE = path.join(DATA_DIR, "app_data.json");

// Ensure data and backup directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function readAppData() {
  try {
    if (fs.existsSync(APP_DATA_FILE)) {
      const raw = fs.readFileSync(APP_DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading app_data.json:", err);
  }
  return null;
}

function createBackupSnapshot(currentData: any) {
  try {
    if (!currentData) return;
    const hasData = (
      (Array.isArray(currentData.employees) && currentData.employees.length > 0) ||
      (Array.isArray(currentData.members) && currentData.members.length > 0) ||
      (Array.isArray(currentData.clubs) && currentData.clubs.length > 0) ||
      (Array.isArray(currentData.contributions) && currentData.contributions.length > 0)
    );
    if (!hasData) return;

    const timestamp = Date.now();
    const backupPath = path.join(BACKUPS_DIR, `app_data_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));

    // Keep up to 50 most recent backups
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('app_data_') && f.endsWith('.json'));
    if (files.length > 50) {
      files.sort().slice(0, files.length - 50).forEach(oldFile => {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, oldFile)); } catch {}
      });
    }
  } catch (err) {
    console.error("Error creating backup snapshot:", err);
  }
}

function writeAppData(incomingData: any, forceEmpty = false) {
  try {
    const existing = readAppData();

    if (existing) {
      // Create backup snapshot of existing data before modifying
      createBackupSnapshot(existing);
    }

    let mergedData = { ...incomingData };

    if (!forceEmpty && existing) {
      // CRITICAL SAFEGUARD: Never wipe existing data with empty arrays from a new/uninitialized client
      const arrayKeys = [
        'employees', 'members', 'clubs', 'leagues', 'positions',
        'meetings', 'activities', 'contributions', 'journalEntries',
        'documents', 'alerts', 'accessAccounts', 'auditLogs'
      ];

      for (const key of arrayKeys) {
        const incomingArr = incomingData[key];
        const existingArr = existing[key];
        if (
          (!Array.isArray(incomingArr) || incomingArr.length === 0) &&
          Array.isArray(existingArr) && existingArr.length > 0
        ) {
          // Preserve existing non-empty array
          mergedData[key] = existingArr;
        }
      }
    }

    fs.writeFileSync(APP_DATA_FILE, JSON.stringify(mergedData, null, 2));
    createBackupSnapshot(mergedData);
    return mergedData;
  } catch (err) {
    console.error("Error writing app_data.json:", err);
    return incomingData;
  }
}

const DEFAULT_ACCOUNTS = [
  { id: 'ACC-001', fullName: "Aliou Cissé", email: "ngaryservicepro@gmail.com", role: "Super Administrateur", password: "admin", status: "Actif" },
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
    // Ensure default admin & Racine Sy always exist if missing, and update admin name to Aliou Cissé
    let modified = false;
    accounts.forEach((a: any) => {
      if ((a.email || "").trim().toLowerCase() === "ngaryservicepro@gmail.com" && a.fullName !== "Aliou Cissé") {
        a.fullName = "Aliou Cissé";
        modified = true;
      }
    });
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

  // GET Full Application Data
  app.get("/api/app-data", (req, res) => {
    const data = readAppData();
    res.json({ success: true, data });
  });

  // POST Sync Full Application Data
  app.post("/api/app-data/sync", (req, res) => {
    const { data, forceEmpty } = req.body;
    if (data) {
      const saved = writeAppData(data, !!forceEmpty);
      res.json({ success: true, data: saved });
    } else {
      res.status(400).json({ success: false, error: "Invalid data payload" });
    }
  });

  // GET List of All Backups
  app.get("/api/app-data/backups", (req, res) => {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        return res.json({ success: true, backups: [] });
      }
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('app_data_') && f.endsWith('.json'));
      const backups = files.map(file => {
        try {
          const filePath = path.join(BACKUPS_DIR, file);
          const stat = fs.statSync(filePath);
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          return {
            filename: file,
            size: stat.size,
            date: stat.mtime.toISOString(),
            employeeCount: Array.isArray(content.employees) ? content.employees.length : 0,
            memberCount: Array.isArray(content.members) ? content.members.length : 0,
            clubCount: Array.isArray(content.clubs) ? content.clubs.length : 0,
            contributionCount: Array.isArray(content.contributions) ? content.contributions.length : 0,
          };
        } catch {
          return null;
        }
      }).filter(Boolean).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({ success: true, backups });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST Restore a Backup from filename
  app.post("/api/app-data/restore-backup", (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename || typeof filename !== "string") {
        return res.status(400).json({ success: false, error: "Filename is required" });
      }
      const safeFilename = path.basename(filename);
      const backupPath = path.join(BACKUPS_DIR, safeFilename);

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ success: false, error: "Backup file not found" });
      }

      const backupContent = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
      writeAppData(backupContent, true); // force restore exactly this backup
      res.json({ success: true, data: backupContent, message: "Sauvegarde restaurée avec succès" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST Restore Default Staff (Seynabou Ndiaye & Fallou Fall + Reference team)
  app.post("/api/app-data/restore-demo-employees", (req, res) => {
    try {
      const current = readAppData() || {};
      const referenceEmployees = [
        { id: 'EMP-001', fullName: "Seynabou Ndiaye", position: "Assistant Secrétaire Générale", contractType: "Prestataire", startDate: "2025-01-05", salary: 180000, email: "seynabou@karalumier.sn", phone: "+221 77 452 10 10" },
        { id: 'EMP-002', fullName: "Fallou Fall", position: "Régisseur principal d'instruments", contractType: "Bénévole", startDate: "2025-03-20", salary: 120500, email: "fallou.fall@karalumier.sn", phone: "+221 77 821 00 22" },
        { id: 'EMP-003', fullName: "Moussa Diouf", position: "Coordinateur des Répétitions & Logistique", contractType: "Prestataire", startDate: "2025-02-10", salary: 150000, email: "moussa.diouf@karalumiere.sn", phone: "+221 78 312 44 55" },
        { id: 'EMP-004', fullName: "Aminata Sall", position: "Chargée de la Communication Digitale", contractType: "Bénévole", startDate: "2025-04-01", salary: 75000, email: "aminata.sall@karalumiere.sn", phone: "+221 76 541 23 89" }
      ];

      current.employees = referenceEmployees;
      writeAppData(current, true);
      res.json({ success: true, employees: referenceEmployees, message: "Collaborateurs de référence restaurés avec succès" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
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

  // POST Update Single Account (e.g. Password or Details)
  app.post("/api/accounts/update", (req, res) => {
    const { email, password, fullName, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const accounts = readAccounts();
    const index = accounts.findIndex((a: any) => (a.email || "").trim().toLowerCase() === cleanEmail);

    if (index !== -1) {
      if (password !== undefined) accounts[index].password = password;
      if (fullName !== undefined) accounts[index].fullName = fullName;
      if (role !== undefined) accounts[index].role = role;
      writeAccounts(accounts);
      return res.json({ success: true, account: accounts[index], accounts });
    } else {
      return res.status(404).json({ success: false, error: "Account not found" });
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

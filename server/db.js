const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "../database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, "race.sqlite");
console.log("Using DB file at:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
    return;
  }
  console.log("Database opened successfully.");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      runner_number INTEGER NOT NULL,
      finish_time INTEGER NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("Failed to create table:", err.message);
    } else {
      console.log("Table 'results' is ready.");
    }
  });
});

db.close();
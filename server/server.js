const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 8080;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const dbPath = path.join(__dirname, "../database/race.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

app.get("/results", (req, res) => {
  db.all("SELECT * FROM results ORDER BY finish_time ASC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post("/results", (req, res) => {
  const { runner_number, finish_time } = req.body;
  if (!runner_number || !finish_time) {
    return res.status(400).json({ error: "Missing data" });
  }

  const stmt = db.prepare("INSERT INTO results (runner_number, finish_time) VALUES (?, ?)");
  stmt.run(runner_number, finish_time, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
  stmt.finalize();
});

app.delete("/results", (req, res) => {
  db.run("DELETE FROM results", function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: `Cleared ${this.changes} records` });
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
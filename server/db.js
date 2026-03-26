const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'buyer',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favourites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      property_id TEXT NOT NULL,
      address TEXT NOT NULL,
      price TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, property_id)
    )
  `);
});

// Helper functions using Promises
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const createUser = (name, email, passwordHash, role = 'buyer') => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, email, role });
      }
    );
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getFavouritesByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, property_id, address, price, image_url, created_at FROM favourites WHERE user_id = ?',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

const addFavourite = (userId, propertyId, address, price, imageUrl) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO favourites (user_id, property_id, address, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [userId, propertyId, address, price, imageUrl],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, property_id: propertyId, address, price, image_url: imageUrl });
      }
    );
  });
};

const removeFavourite = (userId, propertyId) => {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM favourites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  getUserById,
  getFavouritesByUserId,
  addFavourite,
  removeFavourite
};

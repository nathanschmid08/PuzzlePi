const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

// POST /signup – Nutzer registrieren
app.post('/signup', (req, res) => {
  const newUser = req.body;

  // Bestehende Nutzer laden (oder leeres Array bei Fehler)
  fs.readFile(USERS_FILE, 'utf8', (err, data) => {
    let users = [];
    if (!err && data) {
      try {
        users = JSON.parse(data);
      } catch (e) {
        console.error('Fehler beim Parsen der users.json:', e);
      }
    }

    // Nutzer anhängen
    users.push(newUser);

    // Zurückschreiben
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error('Fehler beim Schreiben in users.json:', err);
        return res.status(500).json({ message: 'Speichern fehlgeschlagen' });
      }

      console.log('Neuer Nutzer gespeichert:', newUser);
      res.json({ message: 'Signup erfolgreich!', data: newUser });
    });
  });
});

// POST /login – Nutzer authentifizieren
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(USERS_FILE, 'utf8', (err, data) => {
    if (err || !data) {
      return res.status(500).json({ message: 'Keine Nutzerdaten gefunden' });
    }

    let users;
    try {
      users = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ message: 'Ungültiges Nutzerformat' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.json({ message: 'Login erfolgreich!', user });
    } else {
      res.status(401).json({ message: 'Benutzername oder Passwort falsch' });
    }
  });
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

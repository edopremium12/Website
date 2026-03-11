const express = require('express');
const path = require('path');
const app = express();

// Mengambil modul tampilan
const view = require('./views/index.cjs');

// Route utama untuk menyajikan HTML
app.get('/', (req, res) => {
    res.send(view.render());
});

// Menyajikan file app.js secara langsung
app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.js'));
});

// Port berjalan (Vercel akan mengaturnya secara otomatis, 3000 untuk lokal)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app; // Sangat penting agar Vercel bisa membaca Express

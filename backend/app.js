// Force restart - DB Link update
const express = require('express');
const cors = require('cors');
// Force restart - DB Link update
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/factures', require('./routes/factures'));
app.use('/api/paiements', require('./routes/paiements'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/produits', require('./routes/produits'));
app.use('/api/retours', require('./routes/retours'));
app.use('/api/avoirs', require('./routes/avoirs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/report', require('./routes/report'));

app.get('/api', (req, res) => {
  res.json({
    name: 'ERP Ventes API',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      produits: '/api/produits',
      factures: '/api/factures',
      paiements: '/api/paiements',
      retours: '/api/retours',
      avoirs: '/api/avoirs',
      dashboard: '/api/dashboard/stats'
    },
    documentation: 'Voir README.md'
  });
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ERP Ventes API is running' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
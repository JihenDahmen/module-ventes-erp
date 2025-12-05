const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const reportRoutes = require('./routes/report');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/report', reportRoutes);

app.get('/', (req, res) => {
    res.send('API Reporting Ventes is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

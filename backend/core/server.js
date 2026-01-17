// Force restart - DB Link update
require('dotenv').config();
const express = require('express');
const app = express();
const quotesRoutes = require('./routes/quotes.routes');
const ordersRoutes = require('./routes/orders.routes');

app.use(express.json());

// Routes
app.use('/api/quotes', quotesRoutes);
app.use('/api/orders', ordersRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ERP backend (Core) running on port ${PORT}`));

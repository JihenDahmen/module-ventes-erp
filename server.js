const express = require('express');
const app = express();
const quotesRoutes = require('./routes/quotes.routes');
const ordersRoutes = require('./routes/orders.routes');

app.use(express.json());

// Routes
app.use('/api/quotes', quotesRoutes);
app.use('/api/orders', ordersRoutes);

app.listen(5000, () => console.log("ERP backend running on port 5000"));

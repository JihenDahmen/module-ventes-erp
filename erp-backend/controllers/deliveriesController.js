import db from "../config/db.js";

// Create a delivery
export const createDelivery = (req, res) => {
    const { order_id, client_id, status } = req.body;

    const sql = `
        INSERT INTO deliveries (order_id, client_id, status)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [order_id, client_id, status || "prepared"], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Delivery created", delivery_id: result.insertId });
    });
};

// Read a delivery
export const getDeliveryById = (req, res) => {
    const sql = "SELECT * FROM deliveries WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: "Delivery not found" });
        res.json(results[0]);
    });
};

// Update status
export const updateDeliveryStatus = (req, res) => {
    const { status } = req.body;

    const sql = "UPDATE deliveries SET status = ? WHERE id = ?";

    db.query(sql, [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Delivery status updated" });
    });
};

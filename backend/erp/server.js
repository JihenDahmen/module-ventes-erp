// Force restart - DB Link update
import express from "express";
import cors from "cors";
import deliveriesRoutes from "./routes/deliveries.js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

// Register the route
app.use("/api/deliveries", deliveriesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});

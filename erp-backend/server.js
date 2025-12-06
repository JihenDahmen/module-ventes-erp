import express from "express";
import cors from "cors";
import deliveriesRoutes from "./routes/deliveries.js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

// Register the route
app.use("/deliveries", deliveriesRoutes);

app.listen(3000, () => {
    console.log("API running on http://localhost:3000");
});

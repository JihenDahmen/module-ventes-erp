import express from "express";
import { createDelivery, getDeliveryById, updateDeliveryStatus } from "../controllers/deliveriesController.js";

const router = express.Router();

router.post("/", createDelivery);
router.get("/:id", getDeliveryById);
router.patch("/:id/status", updateDeliveryStatus);

export default router;

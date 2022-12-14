import { Router } from "express";
import { createRental } from "../controllers/rentalsControllers.js"
import { getRentals } from "../controllers/rentalsControllers.js"
import { endRental } from "../controllers/rentalsControllers.js"
import { deleteRental } from "../controllers/rentalsControllers.js"


const router = Router();

router.get("/rentals", getRentals);
router.post("/rentals", createRental);
router.post("/rentals/:id/return", endRental)
router.delete("/rentals/:id", deleteRental)

export default router
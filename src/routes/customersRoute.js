import { Router } from "express";
import {getCustomers} from "../controllers/categoriesControllers.js"
import {createCustomer} from "../controllers/categoriesControllers.js"

const router = Router();

router.get("/customers", getCustomers)
router.post("/customers", createCustomer)

export default router
import { Router } from "express";
import {getCustomers} from "../controllers/customersControllers.js"
import {createCustomer} from "../controllers/customersControllers.js"
import { getCustomersById } from "../controllers/customersControllers.js"
import { setCustomer } from "../controllers/customersControllers.js"

const router = Router();

router.get("/customers", getCustomers)
router.post("/customers", createCustomer)
router.get("/customers/:id", getCustomersById)
router.put("/customers/:id", setCustomer)

export default router
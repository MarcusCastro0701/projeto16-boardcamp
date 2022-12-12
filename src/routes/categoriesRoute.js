import { Router } from "express";
import {getCategories} from "../controllers/categoriesControllers.js"
import {createCategories} from "../controllers/categoriesControllers.js"

const router = Router();

router.get("/categories", getCategories)
router.post("/categories", createCategories)

export default router
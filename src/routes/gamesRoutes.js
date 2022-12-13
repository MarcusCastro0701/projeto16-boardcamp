import { Router } from "express";
import { getGames } from "../controllers/gamesController.js"
import { createGame } from "../controllers/gamesController.js"


const router = Router();

router.get("/games", getGames);
router.post("/games", createGame)

export default router
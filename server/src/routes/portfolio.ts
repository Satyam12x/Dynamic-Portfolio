import { Router } from "express";
import { getPortfolio } from "../controllers/portfolio";

const router = Router();

router.get("/", getPortfolio);

export default router;

import express, { Router } from "express";
import { getCategories } from "../di/categorie.di";

const router: Router = express.Router();

router.get("/", getCategories.handle());

export default router;

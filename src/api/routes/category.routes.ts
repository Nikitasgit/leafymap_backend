import express, { Router } from "express";
import { getCategories } from "@src/api/composition/categories.composition";

const router: Router = express.Router();

router.get("/", getCategories.handle());

export default router;

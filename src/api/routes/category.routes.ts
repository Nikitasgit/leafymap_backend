import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { categoriesController } = cradle;

const router: Router = express.Router();

router.get("/", categoriesController.list());

export default router;

import express, { Router } from "express";
import MongooseCategoryRepository from "../repositories/categories/MongooseCategoryRepository";
import GetCategoriesAction from "../actions/categories/GetCategoriesAction";
import GetCategoriesController from "../controllers/categories/getCategoriesController";

// Initialize repositories
const categoryRepository = new MongooseCategoryRepository();

// Initialize actions
const getCategoriesAction = new GetCategoriesAction(categoryRepository);

// Initialize controllers
const getCategoriesController = new GetCategoriesController(
  getCategoriesAction
);

const router: Router = express.Router();

router.get("/", getCategoriesController.handle());

export default router;

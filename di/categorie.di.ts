import { CategoryRepository } from "@/repositories";
import { GetCategoriesAction } from "@/actions/categories";
import { GetCategoriesController } from "@/controllers/categories";

// Initialize repositories
const categoryRepository = new CategoryRepository();

// Initialize actions
const getCategoriesAction = new GetCategoriesAction(categoryRepository);

// Initialize controllers
export const getCategories = GetCategoriesController(getCategoriesAction);

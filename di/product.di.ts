import { ProductRepository } from "@/repositories";
import {
  CreateProductAction,
  GetProductsAction,
  GetProductByIdAction,
  UpdateProductAction,
  DeleteProductAction,
} from "@/actions/products";
import {
  CreateProductController,
  GetProductsController,
  GetProductByIdController,
  UpdateProductController,
  DeleteProductController,
} from "@/controllers/products";
import { AuthMiddleware, ProductsMiddleware } from "@/middlewares";
import { UserRepository } from "@/repositories";

const userRepository = new UserRepository();
const productRepository = new ProductRepository();

export const authMiddleware = new AuthMiddleware(userRepository);
export const productsMiddleware = new ProductsMiddleware(productRepository);

const createProductAction = new CreateProductAction(productRepository);
const getProductsAction = new GetProductsAction(productRepository);
const getProductByIdAction = new GetProductByIdAction(productRepository);
const updateProductAction = new UpdateProductAction(productRepository);
const deleteProductAction = new DeleteProductAction(productRepository);

export const createProduct = CreateProductController(createProductAction);
export const getProducts = GetProductsController(getProductsAction);
export const getProductById = GetProductByIdController(
  getProductByIdAction
);
export const updateProduct = UpdateProductController(updateProductAction);
export const deleteProduct = DeleteProductController(deleteProductAction);

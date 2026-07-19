import CreateProductUseCase from "@src/application/usecases/products/CreateProduct.usecase";
import UpdateProductUseCase from "@src/application/usecases/products/UpdateProduct.usecase";
import DeleteProductUseCase from "@src/application/usecases/products/DeleteProduct.usecase";
import GetProductsUseCase from "@src/application/usecases/products/GetProducts.usecase";
import GetProductByIdUseCase from "@src/application/usecases/products/GetProductById.usecase";
import CreateProductController from "@src/api/controllers/products/createProduct.controller";
import UpdateProductController from "@src/api/controllers/products/updateProduct.controller";
import DeleteProductController from "@src/api/controllers/products/deleteProduct.controller";
import GetProductsController from "@src/api/controllers/products/getProducts.controller";
import GetProductByIdController from "@src/api/controllers/products/getProductById.controller";
import {
  authMiddleware,
  mongooseProductRepository,
} from "@src/di/container";

const createProductUseCase = new CreateProductUseCase(
  mongooseProductRepository
);
const updateProductUseCase = new UpdateProductUseCase(
  mongooseProductRepository
);
const deleteProductUseCase = new DeleteProductUseCase(
  mongooseProductRepository
);
const getProductsUseCase = new GetProductsUseCase(mongooseProductRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(
  mongooseProductRepository
);

export { authMiddleware };

export const createProduct = CreateProductController(createProductUseCase);
export const updateProduct = UpdateProductController(updateProductUseCase);
export const deleteProduct = DeleteProductController(deleteProductUseCase);
export const getProducts = GetProductsController(getProductsUseCase);
export const getProductById = GetProductByIdController(getProductByIdUseCase);

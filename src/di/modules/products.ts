import { asClass, AwilixContainer } from "awilix";
import ProductsController from "@src/api/controllers/ProductsController";
import CreateProductUseCase from "@src/application/usecases/products/CreateProduct.usecase";
import DeleteProductUseCase from "@src/application/usecases/products/DeleteProduct.usecase";
import GetProductByIdUseCase from "@src/application/usecases/products/GetProductById.usecase";
import GetProductsUseCase from "@src/application/usecases/products/GetProducts.usecase";
import UpdateProductUseCase from "@src/application/usecases/products/UpdateProduct.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerProductsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    createProductUseCase: asClass(CreateProductUseCase).singleton(),
    updateProductUseCase: asClass(UpdateProductUseCase).singleton(),
    deleteProductUseCase: asClass(DeleteProductUseCase).singleton(),
    getProductsUseCase: asClass(GetProductsUseCase).singleton(),
    getProductByIdUseCase: asClass(GetProductByIdUseCase).singleton(),

    productsController: asClass(ProductsController).singleton(),
  });
};

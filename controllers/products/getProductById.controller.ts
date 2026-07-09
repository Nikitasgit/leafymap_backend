import { IGetProductByIdAction } from "@/actions/products";
import { NotFoundError } from "@/utils/errors";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetProductByIdController = (
  getProductByIdAction: IGetProductByIdAction
): Controller =>
  createController({
    execute: async (req) => {
      const product = await getProductByIdAction.execute(
        requireObjectIdParam(req, "productId")
      );
      if (!product) {
        throw new NotFoundError("Product not found");
      }
      return product;
    },
    successMessage: "Product retrieved successfully",
  });

export default GetProductByIdController;

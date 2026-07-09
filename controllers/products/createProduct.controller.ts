import { newProductSchema } from "../../validations/product.validations";
import { ICreateProductAction } from "@/actions/products";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateProductController = (
  createProductAction: ICreateProductAction
): Controller =>
  createController({
    execute: (req) =>
      createProductAction.execute({
        productData: validateOrThrow(newProductSchema, req.body),
        userId: requireAuth(req).id,
      }),
    successMessage: "Product created successfully",
    successStatus: 201,
  });

export default CreateProductController;

import { updateProductSchema } from "../../validations/product.validations";
import { IUpdateProductAction } from "@/actions/products";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const UpdateProductController = (
  updateProductAction: IUpdateProductAction
): Controller =>
  createController({
    execute: async (req) => {
      await updateProductAction.execute({
        productId: req.productId!,
        updateData: validateOrThrow(updateProductSchema, req.body),
      });
    },
    successMessage: "Product updated successfully",
  });

export default UpdateProductController;

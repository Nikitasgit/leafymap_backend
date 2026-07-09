import { IDeleteProductAction } from "@/actions/products";
import { Controller, createController } from "@/utils/controllerFactory";

const DeleteProductController = (
  deleteProductAction: IDeleteProductAction
): Controller =>
  createController({
    execute: async (req) => {
      await deleteProductAction.execute({ productId: req.productId! });
    },
    successMessage: "Product deleted successfully",
  });

export default DeleteProductController;

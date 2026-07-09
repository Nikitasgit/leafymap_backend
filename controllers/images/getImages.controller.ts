import { getImagesQuerySchema } from "../../validations/image.validations";
import { IGetImagesAction } from "@/actions/images";
import {
  ImageFilters,
  ImageReferenceType,
  ImageType,
} from "@/types/repositories/image.repository.types";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const GetImagesController = (getImagesAction: IGetImagesAction): Controller =>
  createController({
    execute: async (req) => {
      const query = validateOrThrow(getImagesQuerySchema, req.query);
      const filters: ImageFilters = {
        reference: query.reference,
        referenceType: query.referenceType as ImageReferenceType,
      };
      if (query.type) {
        filters.type = query.type as ImageType;
      }
      if (query.user) {
        filters.user = query.user;
      }
      const images = await getImagesAction.execute({ filters });
      return { images };
    },
    successMessage: "Images récupérées avec succès",
  });

export default GetImagesController;

import {
  IImageRepository,
  ImageFilters,
} from "@/types/repositories/image.repository.types";
import { IImage } from "@/types/models/Image";

export interface IGetImagesAction {
  execute(params: { filters?: ImageFilters }): Promise<IImage[]>;
}

class GetImagesAction implements IGetImagesAction {
  private readonly project: (keyof IImage | string)[] = [
    "_id",
    "urls",
    "user",
    "reference",
    "referenceType",
    "type",
    "originalName",
    "size",
    "mimetype",
    "createdAt",
    "updatedAt",
  ];

  constructor(private imageRepository: IImageRepository) {}

  async execute({ filters }: { filters?: ImageFilters }): Promise<IImage[]> {
    const images = await this.imageRepository.findAll({
      filters,
      project: this.project,
    });

    return images as IImage[];
  }
}

export default GetImagesAction;

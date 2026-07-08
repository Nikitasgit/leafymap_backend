import Image from "../models/Image";
import { IImage } from "@/types/models/Image";
import {
  IImageRepository,
  ImageFilters,
} from "@/types/repositories/image.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class ImageRepository implements IImageRepository {
  private buildQuery(filters?: ImageFilters): FilterQuery<IImage> {
    const query: FilterQuery<IImage> = {};

    if (!filters) return query;

    if (filters.reference) {
      if (typeof filters.reference === "string") {
        query.reference = new Types.ObjectId(filters.reference);
      } else if (filters.reference.$in) {
        query.reference = {
          $in: filters.reference.$in.map(
            (id: string) => new Types.ObjectId(id)
          ),
        };
      }
    }
    if (filters.referenceType) {
      query.referenceType = filters.referenceType;
    }
    if (filters.user) {
      query.user = new Types.ObjectId(filters.user);
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters._id) {
      query._id = {
        $in: filters._id.$in.map((id: string) => new Types.ObjectId(id)),
      };
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }

    Object.keys(filters).forEach((key) => {
      if (
        !["reference", "referenceType", "user", "type", "_id", "deleted"].includes(key)
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(image: Partial<IImage>): Promise<Types.ObjectId> {
    const newImage = new Image(image);
    await newImage.save();
    return newImage._id;
  }

  async createMany(images: Partial<IImage>[]): Promise<Types.ObjectId[]> {
    const createdImages = await Image.insertMany(images);
    return createdImages.map((img) => img._id);
  }

  async findById(
    id: string,
    project?: (keyof IImage | string)[]
  ): Promise<IImage | null> {
    let query: any = Image.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as any;
    }

    const image = await query.lean();
    return image as unknown as IImage | null;
  }

  async findAll<K extends keyof IImage>(params: {
    filters?: ImageFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IImage, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery: any = Image.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    } else {
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project && params.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(params.project);

      if (selectFields.length > 0) {
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      ) as any;
    }

    const images = await mongooseQuery.lean();
    return images as unknown as Pick<IImage, K>[];
  }

  async updateOne(id: string, update: Partial<IImage>): Promise<void> {
    await Image.findByIdAndUpdate(id, update).exec();
  }

  async deleteMany(ids: string[]): Promise<void> {
    await Image.deleteMany({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }
}

export default ImageRepository;

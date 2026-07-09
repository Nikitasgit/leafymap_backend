import {
  FilterQuery,
  Model,
  Query,
  SortOrder,
  Types,
} from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

export interface FindAllParams<TDoc, TFilters> {
  filters?: TFilters;
  project?: (keyof TDoc | string)[];
  sort?: Record<string, SortOrder>;
  limit?: number;
  populate?: (keyof TDoc | string)[];
}

export abstract class BaseMongooseRepository<
  TDoc,
  TFilters extends Record<string, unknown> = Record<string, unknown>,
> {
  constructor(protected readonly model: Model<TDoc>) {}

  protected abstract buildQuery(filters?: TFilters): FilterQuery<TDoc>;

  protected toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  protected applyProject(
    query: Query<unknown, unknown>,
    project?: (keyof TDoc | string)[]
  ): Query<unknown, unknown> {
    if (!project || project.length === 0) {
      return query;
    }

    const { selectFields, populateConfig } =
      PopulateParser.parseProjectFields(project);

    let resultQuery = query;

    if (selectFields.length > 0) {
      resultQuery = resultQuery.select(selectFields.join(" "));
    }

    return PopulateParser.applyPopulate(resultQuery, populateConfig);
  }

  async create(data: Partial<TDoc>): Promise<Types.ObjectId> {
    const document = new this.model(data);
    await document.save();
    return document._id as Types.ObjectId;
  }

  async findById(
    id: string,
    project?: (keyof TDoc | string)[]
  ): Promise<TDoc | null> {
    let query = this.model.findById(id);
    query = this.applyProject(query, project) as typeof query;
    const document = await query.lean();
    return document as TDoc | null;
  }

  async findAll<K extends keyof TDoc>(
    params: FindAllParams<TDoc, TFilters>
  ): Promise<Pick<TDoc, K>[]> {
    const query = this.buildQuery(params.filters);
    let mongooseQuery = this.model.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    const project = params.project ?? params.populate;
    mongooseQuery = this.applyProject(
      mongooseQuery,
      project
    ) as typeof mongooseQuery;

    const documents = await mongooseQuery.lean();
    return documents as unknown as Pick<TDoc, K>[];
  }

  async updateOne(id: string, data: Partial<TDoc>): Promise<void> {
    await this.model.updateOne({ _id: id }, data).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }

  async deleteMany(filters: TFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await this.model.deleteMany(query).exec();
  }
}

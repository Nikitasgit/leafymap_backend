import Message from "../../models/Message";
import { IMessage, MessageReferenceType } from "../../types/models/message";
import { IMessageRepository, MessageFilters } from "./IMessageRepository";
import { Types } from "mongoose";

const MongooseMessageRepository = (): IMessageRepository => {
  // Helper to build query from filters
  const buildQuery = (filters?: MessageFilters): any => {
    const query: any = {};

    if (!filters) return query;

    if (filters.reference) {
      query.reference = new Types.ObjectId(filters.reference);
    }

    if (filters.referenceType) {
      query.referenceType = filters.referenceType;
    }

    if (filters.author) {
      query.author = new Types.ObjectId(filters.author);
    }

    if (filters._id) {
      query._id = {
        $in: filters._id.$in.map((id) => new Types.ObjectId(id)),
      };
    }

    // Add all other filters (for flexibility)
    Object.keys(filters).forEach((key) => {
      if (!["reference", "referenceType", "author", "_id"].includes(key)) {
        query[key] = filters[key];
      }
    });

    return query;
  };

  return {
    create: async (message: Partial<IMessage>) => {
      const newMessage = new Message(message);
      await newMessage.save();
      return newMessage._id;
    },

    findById: async (id: string, project?: (keyof IMessage)[]) => {
      let query = Message.findById(id);

      if (project && project.length > 0) {
        query = query.select(project.join(" "));
      }

      // Always populate author if not specifically projecting
      if (!project || project.includes("author")) {
        query = query.populate("author", "username image");
      }

      const message = await query.lean();
      return message as IMessage | null;
    },

    findAll: async <K extends keyof IMessage>(params: {
      filters?: MessageFilters;
      project: K[];
      limit?: number;
      sort?: { [key: string]: 1 | -1 };
    }) => {
      const query = buildQuery(params.filters);

      let mongooseQuery = Message.find(query);

      // Default sort if not specified
      if (params.sort) {
        mongooseQuery = mongooseQuery.sort(params.sort);
      } else {
        mongooseQuery = mongooseQuery.sort({ createdAt: 1 });
      }

      // Limit if specified
      if (params.limit) {
        mongooseQuery = mongooseQuery.limit(params.limit);
      }

      if (params.project && params.project.length > 0) {
        mongooseQuery = mongooseQuery.select(params.project.join(" "));
      }

      // Populate author if requested in the project
      if (params.project.includes("author" as K)) {
        mongooseQuery = mongooseQuery.populate("author", "username image");
      }

      const messages = await mongooseQuery.lean();
      return messages as Pick<IMessage, K>[];
    },

    findAllById: async (ids: string[], project?: (keyof IMessage)[]) => {
      const objectIds = ids.map((id) => new Types.ObjectId(id));
      const query = { _id: { $in: objectIds } };

      let mongooseQuery = Message.find(query);

      if (project && project.length > 0) {
        mongooseQuery = mongooseQuery.select(project.join(" "));
      }

      // Always populate author if not specifically projecting
      if (!project || project.includes("author")) {
        mongooseQuery = mongooseQuery.populate("author", "username image");
      }

      const messages = await mongooseQuery.lean();
      return messages as IMessage[];
    },

    updateOne: async (id: string, update: Partial<IMessage>) => {
      await Message.updateOne({ _id: id }, update).exec();
    },

    deleteOne: async (id: string) => {
      await Message.deleteOne({ _id: id }).exec();
    },
  };
};

export default MongooseMessageRepository;

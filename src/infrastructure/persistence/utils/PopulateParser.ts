import { Query, PopulateOptions } from "mongoose";

interface PopulateConfig {
  path: string;
  select?: string;
  populate?: PopulateConfig[];
}

interface PathTree {
  fields: Set<string>;
  children: Map<string, PathTree>;
  mongooseDirectPath?: string; // For Mongoose paths like "timeSlots.collaborators" when base is "schedule"
  mongooseDirectPathChildren?: PathTree;
}

export class PopulateParser {
  static parseProjectFields(project: (string | number | symbol)[]): {
    selectFields: string[];
    populateConfig: PopulateConfig[];
  } {
    const selectFields: string[] = [];
    const rootTree = new Map<string, PathTree>();

    for (const field of project) {
      const fieldStr = String(field);

      if (!fieldStr.includes(".")) {
        selectFields.push(fieldStr);
        continue;
      }

      const parts = fieldStr.split(".");
      const basePath = parts[0];

      if (!selectFields.includes(basePath)) {
        selectFields.push(basePath);
      }

      if (!rootTree.has(basePath)) {
        rootTree.set(basePath, {
          fields: new Set(),
          children: new Map(),
        });
      }

      this.addToTree(rootTree.get(basePath)!, parts.slice(1));
    }

    const populateConfig: PopulateConfig[] = [];
    rootTree.forEach((tree, basePath) => {
      const config = this.buildConfig(basePath, tree);
      if (config) {
        populateConfig.push(config);
      }
    });

    return { selectFields, populateConfig };
  }

  private static addToTree(tree: PathTree, parts: string[]): void {
    if (parts.length === 0) return;

    // For deep paths (5+ parts total, so 4+ here), detect Mongoose direct path pattern
    // Example: "timeSlots.collaborators.image.urls" where base is "schedule"
    // Mongoose can use "schedule.timeSlots.collaborators" as direct path
    // So we detect "timeSlots.collaborators" (first 2 parts) as Mongoose direct path
    if (parts.length >= 4) {
      const mongoosePath = parts.slice(0, 2).join("."); // "timeSlots.collaborators"
      const remaining = parts.slice(2); // ["image", "urls"]

      if (
        !tree.mongooseDirectPath ||
        tree.mongooseDirectPath !== mongoosePath
      ) {
        if (
          tree.mongooseDirectPath &&
          tree.mongooseDirectPath !== mongoosePath
        ) {
          // Conflict: different mongoose paths detected, fall back to nested approach
          const firstPart = parts[0];
          if (!tree.children.has(firstPart)) {
            tree.children.set(firstPart, {
              fields: new Set(),
              children: new Map(),
            });
          }
          this.addToTree(tree.children.get(firstPart)!, parts.slice(1));
          return;
        }

        tree.mongooseDirectPath = mongoosePath;
        if (!tree.mongooseDirectPathChildren) {
          tree.mongooseDirectPathChildren = {
            fields: new Set(),
            children: new Map(),
          };
        }
      }

      this.addToTree(tree.mongooseDirectPathChildren!, remaining);
      return;
    }

    // Standard nested path handling
    if (parts.length === 1) {
      tree.fields.add(parts[0]);
    } else {
      const firstPart = parts[0];
      tree.fields.add(firstPart);

      if (!tree.children.has(firstPart)) {
        tree.children.set(firstPart, {
          fields: new Set(),
          children: new Map(),
        });
      }

      this.addToTree(tree.children.get(firstPart)!, parts.slice(1));
    }
  }

  private static buildConfig(
    path: string,
    tree: PathTree
  ): PopulateConfig | null {
    const config: PopulateConfig = {
      path,
    };

    // Collect fields that are not in children
    const selectFields: string[] = [];
    tree.fields.forEach((field) => {
      if (!tree.children.has(field)) {
        selectFields.push(field);
      }
    });

    if (selectFields.length > 0) {
      config.select = selectFields.join(" ");
    }

    // Build populate configs
    const populateConfigs: PopulateConfig[] = [];

    // Handle Mongoose direct path (e.g., "schedule.timeSlots.collaborators")
    if (tree.mongooseDirectPath && tree.mongooseDirectPathChildren) {
      const fullPath = `${path}.${tree.mongooseDirectPath}`;
      const nestedConfig = this.buildConfig(
        fullPath,
        tree.mongooseDirectPathChildren
      );
      if (nestedConfig) {
        populateConfigs.push(nestedConfig);
      }
    }

    // Handle standard nested paths
    tree.children.forEach((childTree, childPath) => {
      const nestedConfig = this.buildConfig(childPath, childTree);
      if (nestedConfig) {
        populateConfigs.push(nestedConfig);
      }
    });

    if (populateConfigs.length > 0) {
      config.populate = populateConfigs;
    }

    // Return null if no meaningful content
    if (!config.select && (!config.populate || config.populate.length === 0)) {
      return null;
    }

    return config;
  }

  static applyPopulate<T, TReturn = T>(
    query: Query<T, TReturn>,
    populateConfig: PopulateConfig[]
  ): Query<T, TReturn> {
    let resultQuery: Query<T, TReturn> = query;
    for (const config of populateConfig) {
      resultQuery = resultQuery.populate(config as PopulateOptions) as Query<
        T,
        TReturn
      >;
    }
    return resultQuery;
  }
}

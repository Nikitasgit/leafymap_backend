import { Query, PopulateOptions } from "mongoose";

interface PopulateConfig {
  path: string;
  select: string;
  populate?: PopulateConfig[];
}

export class PopulateParser {
  static parseProjectFields(project: (string | number | symbol)[]): {
    selectFields: string[];
    populateConfig: PopulateConfig[];
  } {
    const selectFields: string[] = [];
    const populateMap = new Map<
      string,
      { fields: Set<string>; nested: Map<string, Set<string>> }
    >();

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

      if (!populateMap.has(basePath)) {
        populateMap.set(basePath, { fields: new Set(), nested: new Map() });
      }
      const populateInfo = populateMap.get(basePath)!;

      if (parts.length === 2) {
        populateInfo.fields.add(parts[1]);
      } else if (parts.length === 3) {
        populateInfo.fields.add(parts[1]);
        if (!populateInfo.nested.has(parts[1])) {
          populateInfo.nested.set(parts[1], new Set());
        }
        populateInfo.nested.get(parts[1])!.add(parts[2]);
      }
    }

    const populateConfig: PopulateConfig[] = [];
    populateMap.forEach((info, path) => {
      const config: PopulateConfig = {
        path,
        select: Array.from(info.fields).join(" "),
      };

      if (info.nested.size > 0) {
        config.populate = [];
        info.nested.forEach((nestedFields, nestedPath) => {
          config.populate!.push({
            path: nestedPath,
            select: Array.from(nestedFields).join(" "),
          });
        });
      }

      populateConfig.push(config);
    });

    return { selectFields, populateConfig };
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

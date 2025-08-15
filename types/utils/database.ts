// Database utility types
export interface DatabaseConnection {
  isConnected: boolean;
  host: string;
  port: number;
  name: string;
}

export interface QueryOptions {
  sort?: { [key: string]: 1 | -1 };
  limit?: number;
  skip?: number;
  select?: string;
  populate?: string | string[];
  lean?: boolean;
}

export interface UpdateOptions {
  new?: boolean;
  runValidators?: boolean;
  upsert?: boolean;
}

export interface DeleteOptions {
  soft?: boolean;
  cascade?: boolean;
}

export interface SearchOptions {
  text?: string;
  fields?: string[];
  fuzzy?: boolean;
}

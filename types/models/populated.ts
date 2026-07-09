import { Types } from "mongoose";

/**
 * Lean query results keep ObjectId references on unpopulated fields.
 * Use PopulatedField<T> when a ref may be either an ObjectId or the populated document.
 */
export type PopulatedField<T> = Types.ObjectId | T;

export type LeanRef<T> = Types.ObjectId | T;

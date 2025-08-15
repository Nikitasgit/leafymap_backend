import { Document, Types } from "mongoose";

// Application-related interfaces
export interface IApplicationDetails {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  price?: number;
  images?: string[];
  eventType?: "workshop" | "exhibition" | "meetup" | "other";
  placeType?: "studio" | "gallery" | "workshop" | "exhibition" | "other";
  artistType?: "painter" | "sculptor" | "photographer" | "other";
}

export interface IApplicationDocument {
  name: string;
  url: string;
  type: string;
}

export interface IApplication extends Document {
  applicant: Types.ObjectId;
  type: "event" | "place" | "artist" | "other";
  status: "pending" | "approved" | "rejected" | "cancelled";
  details: IApplicationDetails;
  documents: IApplicationDocument[];
  notes?: string;
  reviewedBy?: Types.ObjectId;
  reviewDate?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

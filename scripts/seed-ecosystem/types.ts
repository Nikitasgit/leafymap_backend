import { Types } from "mongoose";
import type { ImageTheme } from "./config";
import type { CityCluster } from "./config";
import type { CreatorArchetype } from "./config";

export type SeedTarget = "local" | "staging" | "production";

export interface SeedCliOptions {
  target: SeedTarget;
  confirmStaging: boolean;
  confirmProduction: boolean;
  reset: boolean;
  skipImages: boolean;
  userCount: number;
  eventCount: number;
}

export interface SeedLocation {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface SeedUserDoc {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  username: string;
  userType: "creator" | "guest";
  role: "user";
  userCategory?: Types.ObjectId;
  description: string;
  website?: string;
  phone?: string;
  country: "FR";
  address: { number: string; street: string; code: string };
  image?: Types.ObjectId;
  followers: number;
  interests?: Types.ObjectId[];
  place?: Types.ObjectId;
  acceptedAt: Date;
  emailVerified: true;
  deleted: false;
  preferences: { emailNotifications: false };
  city: CityCluster;
  archetype?: CreatorArchetype;
}

export interface SeedPlaceDoc {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  location: SeedLocation;
  placeCategory: Types.ObjectId;
  defaultSchedule: Record<
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday",
    { open: boolean; timeSlots: Array<{ startTime: string; endTime: string }> }
  >;
  customDates: [];
  rating: number;
  deleted: false;
}

export interface SeedEventDoc {
  _id: Types.ObjectId;
  name: string;
  description: string;
  schedule: Array<{
    startDate: Date;
    endDate: Date;
    timeSlots?: Array<{
      title: string;
      startTime: string;
      endTime: string;
      collaborators: Types.ObjectId[];
    }>;
  }>;
  eventCategory: Types.ObjectId;
  eventCategoryName: string;
  user: Types.ObjectId;
  place?: Types.ObjectId | null;
  location?: SeedLocation | null;
  online: boolean;
  image?: Types.ObjectId;
  status: "cancelled" | "full" | "available";
  lifecycleStatus: "upcoming" | "ongoing" | "completed";
  dateRange: { firstDate: Date; latestDate: Date };
  rating: number;
  isBookable: boolean;
  capacity?: number | null;
  maxSeatsPerBooking: number;
  deleted: false;
}

export interface SeedImageDoc {
  _id: Types.ObjectId;
  urls: { original: string; thumbnail: string; medium: string };
  user: Types.ObjectId;
  reference: Types.ObjectId;
  referenceType: "User" | "Event";
  type: "profile";
  originalName: string;
  size: number;
  mimetype: "image/jpeg";
  deleted: false;
  theme: ImageTheme;
}

export interface SeedInvitationDoc {
  event: Types.ObjectId;
  initiator: Types.ObjectId;
  collaborator: Types.ObjectId;
  status: "pending" | "accepted" | "refused" | "cancelled";
  deleted: boolean;
}

export interface SeedBookingDoc {
  event: Types.ObjectId;
  user: Types.ObjectId;
  seats: number;
  status: "confirmed" | "cancelled";
  cancelledAt: Date | null;
}

export interface SeedFollowDoc {
  follower: Types.ObjectId;
  following: Types.ObjectId;
}

export interface SeedFavoriteDoc {
  user: Types.ObjectId;
  reference: Types.ObjectId;
  referenceType: "Place";
}

export interface SeedPartnershipDoc {
  initiator: Types.ObjectId;
  collaborator: Types.ObjectId;
  status: "pending" | "accepted" | "refused";
  deleted: false;
}

export interface CategoryMaps {
  user: Map<string, Types.ObjectId>;
  place: Map<string, Types.ObjectId>;
  event: Map<string, Types.ObjectId>;
}

export interface SeedContext {
  users: SeedUserDoc[];
  places: SeedPlaceDoc[];
  events: SeedEventDoc[];
  images: SeedImageDoc[];
  invitations: SeedInvitationDoc[];
  bookings: SeedBookingDoc[];
  follows: SeedFollowDoc[];
  favorites: SeedFavoriteDoc[];
  partnerships: SeedPartnershipDoc[];
}

export interface ImagePoolUrls {
  original: string;
  thumbnail: string;
  medium: string;
}

export type ImagePool = Record<ImageTheme, ImagePoolUrls[]>;

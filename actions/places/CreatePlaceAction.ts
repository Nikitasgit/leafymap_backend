import { IPlaceRepository } from "../../repositories/places/IPlaceRepository";
import { IUserRepository } from "../../repositories/users/IUserRepository";
import { Types } from "mongoose";
import {
  IPlace,
  PlaceType,
  IDefaultSchedule,
  ICustomDate,
} from "../../types/models/place";

export interface CreatePlaceInput {
  name?: string;
  description?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    label: string;
    id: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  placeCategory: string;
  placeType?: string[];
  active?: boolean;
  isCreatorPlace?: boolean;
  defaultSchedule?: IDefaultSchedule;
  customDates?: ICustomDate[];
}

export interface ICreatePlaceAction {
  execute(params: {
    placeData: CreatePlaceInput;
    userId: string;
    userType: "creator" | "organizer";
  }): Promise<{ _id: string }>;
}

class CreatePlaceAction implements ICreatePlaceAction {
  constructor(
    private placeRepository: IPlaceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    placeData,
    userId,
    userType,
  }: {
    placeData: CreatePlaceInput;
    userId: string;
    userType: "creator" | "organizer";
  }): Promise<{ _id: string }> {
    // Check user exists and get creatorName for creators
    const user = await this.userRepository.findOne({ _id: userId }, [
      "creatorName",
      "places",
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    // Business rules: creators can only have 1 place, organizers can have up to 3
    const userPlaces = Array.isArray(user.places) ? user.places : [];
    if (userPlaces.length >= 1 && userType === "creator") {
      throw new Error("Creator already have a place");
    }
    if (userPlaces.length >= 3 && userType === "organizer") {
      throw new Error("Organizer already have 3 places");
    }

    // For creators, the place name is automatically set from their creator name
    const finalPlaceData: Partial<IPlace> = {
      ...placeData,
      user: new Types.ObjectId(userId),
      placeCategory: new Types.ObjectId(placeData.placeCategory),
      placeType: placeData.placeType as PlaceType[] | undefined,
    };

    if (userType === "creator") {
      finalPlaceData.isCreatorPlace = true;
      finalPlaceData.name = user.creatorName || placeData.name || "";
    }

    const placeId = await this.placeRepository.create(finalPlaceData);

    // Add place to user's places array
    await this.userRepository.updateOne(userId, {
      $push: { places: placeId },
    } as any);

    return { _id: placeId.toString() };
  }
}

export default CreatePlaceAction;

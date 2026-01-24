import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { Types } from "mongoose";
import {
  IPlace,
  PlaceType,
  IDefaultSchedule,
  ICustomDate,
} from "@/types/models/place";

export interface CreatePlaceInput {
  location: {
    type: "Point";
    coordinates: [number, number];
    label: string;
    id: string;
  };
  placeCategory: string;
  placeType: string[];
  defaultSchedule?: IDefaultSchedule;
  customDates?: ICustomDate[];
}

export interface ICreatePlaceAction {
  execute(params: {
    placeData: CreatePlaceInput;
    userId: string;
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
  }: {
    placeData: CreatePlaceInput;
    userId: string;
  }): Promise<{ _id: string }> {

    
    const user = await this.userRepository.findOne({ _id: userId }, [
      "username",
      "place",
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    // Business rule: users can only have 1 place
    if (user.place) {
      throw new Error("User already has a place");
    }

    const newPlace = {
      ...placeData,
      user: new Types.ObjectId(userId),
      placeCategory: new Types.ObjectId(placeData.placeCategory),
      placeType: placeData.placeType,
    };

    const placeId = await this.placeRepository.create(newPlace);

    // Set place to user's place field
    await this.userRepository.updateOne(userId, {
      place: placeId,
    } as any);

    return { _id: placeId.toString() };
  }
}

export default CreatePlaceAction;

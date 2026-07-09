import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IUser } from "@/types/models/user";
import { IGetPlaceByIdAction } from "@/actions/places";
import { toId } from "@/utils/mongoose";
import { NotFoundError } from "@/utils/errors";

export interface UserProfile {
  user: IUser;
  place: Awaited<ReturnType<IGetPlaceByIdAction["execute"]>> | null;
}

export interface IGetUserProfileAction {
  execute(params: { userId: string }): Promise<UserProfile>;
}

/**
 * Aggregated creator profile: user + populated place with the schedule
 * enriched with events, in a single request (replaces the frontend
 * waterfall GET /users/:id then GET /places/:placeId).
 */
class GetUserProfileAction implements IGetUserProfileAction {
  private readonly userProject: (keyof IUser | string)[] = [
    "_id",
    "firstname",
    "lastname",
    "username",
    "userType",
    "email",
    "website",
    "phone",
    "description",
    "country",
    "followers",
    "place._id",
    "image.urls",
    "googlePictureUrl",
    "userCategory.name",
    "userCategory.type",
    "userCategory.type.name",
  ];

  constructor(
    private userRepository: IUserRepository,
    private getPlaceByIdAction: IGetPlaceByIdAction
  ) {}

  async execute({ userId }: { userId: string }): Promise<UserProfile> {
    const user = await this.userRepository.findOne(
      { _id: userId, deleted: false },
      this.userProject
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const placeId = toId(user.place);
    const place = placeId
      ? await this.getPlaceByIdAction.execute({
          placeId,
          scheduleWithEvents: true,
        })
      : null;

    return { user, place };
  }
}

export default GetUserProfileAction;

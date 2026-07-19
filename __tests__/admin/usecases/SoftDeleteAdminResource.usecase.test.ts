import { Types } from "mongoose";
import SoftDeleteAdminResourceUseCase from "@src/application/usecases/admin/SoftDeleteAdminResource.usecase";
import { EventId, PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

const createContentRepository = () =>
  ({
    findById: jest.fn().mockResolvedValue({ id: "exists" }),
    updateOne: jest.fn(),
    softDelete: jest.fn(),
  }) as any;

describe("SoftDeleteAdminResourceUseCase", () => {
  it("soft deletes events via domain softDelete", async () => {
    const eventRepository = createContentRepository();
    const useCase = new SoftDeleteAdminResourceUseCase(
      eventRepository,
      createContentRepository(),
      createContentRepository(),
      createContentRepository(),
      createContentRepository()
    );

    const adminId = new Types.ObjectId().toString();
    const resourceId = new Types.ObjectId().toString();

    await useCase.execute({
      adminId,
      resource: "events",
      resourceId,
      reason: "Moderation",
    });

    expect(eventRepository.softDelete).toHaveBeenCalledWith(
      EventId.from(resourceId),
      expect.objectContaining({
        deleted: true,
        adminId: UserId.from(adminId),
        reason: "Moderation",
      })
    );
    expect(eventRepository.updateOne).not.toHaveBeenCalled();
  });

  it("soft deletes places via domain softDelete", async () => {
    const placeRepository = createContentRepository();
    const useCase = new SoftDeleteAdminResourceUseCase(
      createContentRepository(),
      placeRepository,
      createContentRepository(),
      createContentRepository(),
      createContentRepository()
    );

    const adminId = new Types.ObjectId().toString();
    const resourceId = new Types.ObjectId().toString();

    await useCase.execute({
      adminId,
      resource: "places",
      resourceId,
      reason: "Moderation",
    });

    expect(placeRepository.softDelete).toHaveBeenCalledWith(
      PlaceId.from(resourceId),
      expect.objectContaining({
        deleted: true,
        deleteReason: "Moderation",
        deletedBy: UserId.from(adminId),
      })
    );
    expect(placeRepository.updateOne).not.toHaveBeenCalled();
  });
});

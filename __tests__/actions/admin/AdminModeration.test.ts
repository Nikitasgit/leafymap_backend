import { Types } from "mongoose";
import SoftDeleteAdminResourceAction from "@/actions/admin/SoftDeleteAdminResource.action";

const createContentRepository = () =>
  ({
    findById: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    updateOne: jest.fn(),
    softDelete: jest.fn(),
  }) as any;

describe("Admin moderation", () => {
  it("soft deletes events via domain softDelete", async () => {
    const eventRepository = createContentRepository();
    const action = new SoftDeleteAdminResourceAction(
      eventRepository,
      createContentRepository(),
      createContentRepository(),
      createContentRepository(),
      createContentRepository()
    );

    const adminId = new Types.ObjectId().toString();
    const resourceId = new Types.ObjectId().toString();

    await action.execute({
      adminId,
      resource: "events",
      resourceId,
      deleted: true,
      reason: "Moderation",
    });

    expect(eventRepository.softDelete).toHaveBeenCalledWith(
      resourceId,
      expect.objectContaining({
        deleted: true,
        adminId,
        reason: "Moderation",
      })
    );
    expect(eventRepository.updateOne).not.toHaveBeenCalled();
  });

  it("soft deletes places via updateOne", async () => {
    const placeRepository = createContentRepository();
    const action = new SoftDeleteAdminResourceAction(
      createContentRepository(),
      placeRepository,
      createContentRepository(),
      createContentRepository(),
      createContentRepository()
    );

    await action.execute({
      adminId: new Types.ObjectId().toString(),
      resource: "places",
      resourceId: new Types.ObjectId().toString(),
      deleted: true,
      reason: "Moderation",
    });

    expect(placeRepository.updateOne).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ deleted: true, deleteReason: "Moderation" })
    );
  });
});

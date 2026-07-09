import { Types } from "mongoose";
import SoftDeleteAdminResourceAction from "@/actions/admin/SoftDeleteAdminResource.action";

const createContentRepository = () =>
  ({
    findById: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    updateOne: jest.fn(),
  }) as any;

describe("Admin moderation", () => {
  it("soft deletes content without hard deletion", async () => {
    const eventRepository = createContentRepository();
    const action = new SoftDeleteAdminResourceAction(
      eventRepository,
      createContentRepository(),
      createContentRepository(),
      createContentRepository(),
      createContentRepository()
    );

    await action.execute({
      adminId: new Types.ObjectId().toString(),
      resource: "events",
      resourceId: new Types.ObjectId().toString(),
      deleted: true,
      reason: "Moderation",
    });

    expect(eventRepository.updateOne).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ deleted: true, deleteReason: "Moderation" })
    );
    expect(eventRepository.deleteOne).toBeUndefined();
  });
});

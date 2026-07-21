import { Types } from "mongoose";

interface SoftDeleteUpdate {
  deleted: boolean;
  adminId?: string;
  deletedAt?: Date;
  reason?: string;
}

export function buildSoftDeleteUpdate(update: SoftDeleteUpdate) {
  if (!update.deleted) {
    return {
      $set: { deleted: false },
      $unset: { deletedAt: 1, deletedBy: 1, deleteReason: 1 },
    };
  }

  return {
    $set: {
      deleted: true,
      deletedAt: update.deletedAt ?? new Date(),
      ...(update.adminId
        ? { deletedBy: new Types.ObjectId(update.adminId) }
        : {}),
      ...(update.reason !== undefined ? { deleteReason: update.reason } : {}),
    },
  };
}

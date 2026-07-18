import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";
import { ValidationError } from "@src/shared/errors";

export interface CreatePartnershipParams {
  initiatorId: UserId;
  collaboratorId: UserId;
}

export interface ReconstitutePartnershipParams {
  id: PartnershipId;
  initiatorId: UserId;
  collaboratorId: UserId;
  status: PartnershipStatus;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Partnership {
  private constructor(
    public readonly id: PartnershipId | null,
    public readonly initiatorId: UserId,
    public readonly collaboratorId: UserId,
    public readonly status: PartnershipStatus,
    public readonly deleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreatePartnershipParams): Partnership {
    if (params.initiatorId === params.collaboratorId) {
      throw new ValidationError({
        collaborator: "Cannot partner with yourself",
      });
    }

    const now = new Date();
    return new Partnership(
      null,
      params.initiatorId,
      params.collaboratorId,
      "pending",
      false,
      now,
      now
    );
  }

  static reconstitute(params: ReconstitutePartnershipParams): Partnership {
    return new Partnership(
      params.id,
      params.initiatorId,
      params.collaboratorId,
      params.status,
      params.deleted,
      params.createdAt,
      params.updatedAt
    );
  }

  accept(): Partnership {
    if (this.status !== "pending") {
      throw new ValidationError({
        status: "Only pending partnerships can be accepted",
      });
    }
    return this.withStatus("accepted");
  }

  refuse(): Partnership {
    if (this.status !== "pending") {
      throw new ValidationError({
        status: "Only pending partnerships can be refused",
      });
    }
    return this.withStatus("refused");
  }

  cancel(): Partnership {
    if (this.status === "cancelled" && this.deleted) {
      return this;
    }
    return new Partnership(
      this.id,
      this.initiatorId,
      this.collaboratorId,
      "cancelled",
      true,
      this.createdAt,
      new Date()
    );
  }

  restore(): Partnership {
    return new Partnership(
      this.id,
      this.initiatorId,
      this.collaboratorId,
      this.status,
      false,
      this.createdAt,
      new Date()
    );
  }

  isInitiator(userId: UserId): boolean {
    return this.initiatorId === userId;
  }

  isCollaborator(userId: UserId): boolean {
    return this.collaboratorId === userId;
  }

  isParticipant(userId: UserId): boolean {
    return this.isInitiator(userId) || this.isCollaborator(userId);
  }

  private withStatus(status: PartnershipStatus): Partnership {
    return new Partnership(
      this.id,
      this.initiatorId,
      this.collaboratorId,
      status,
      this.deleted,
      this.createdAt,
      new Date()
    );
  }
}

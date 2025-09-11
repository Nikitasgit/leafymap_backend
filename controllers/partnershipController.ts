import { Request, Response } from "express";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { CustomRequest } from "../types/custom";
import { Partnership } from "../models/Partnership";
import { IPartnership } from "../types/models/partnership";
import { PartnershipDTO } from "../types/api/partnership.dto";
import { IEvent, IUser } from "types/models";
import { getEventStatusFromSchedule } from "../utils/eventDates";
import mongoose from "mongoose";

const createPartnerships = async (req: CustomRequest, res: Response) => {
  try {
    const decoded = req.decoded!;
    const { placeId, eventId } = req.params;
    const { partnerships } = req.body;

    const createPromises = partnerships.map(
      async (partnership: PartnershipDTO) => {
        const existingPartnership = await Partnership.findOne({
          place: placeId,
          event: eventId,
          collaborator: partnership.collaborator._id,
        });
        if (existingPartnership) {
          return existingPartnership;
        }
        const newPartnership = new Partnership({
          place: placeId,
          event: eventId,
          initiator: decoded.id,
          collaborator: partnership.collaborator._id,
          type: eventId ? "event" : "place",
        });

        return await newPartnership.save();
      }
    );

    const createdPartnerships = await Promise.all(createPromises);

    APIResponse(
      res,
      createdPartnerships,
      "Partnerships created successfully",
      201
    );
  } catch (error) {
    logger.error("Error creating partnership:", error);
    APIResponse(res, null, "Failed to create partnership", 500);
  }
};

// organizer can update deleted field
// collaborator can update status
const updatePartnerships = async (req: CustomRequest, res: Response) => {
  try {
    const decoded = req.decoded!;
    const { partnerships } = req.body;

    const updatePromises = partnerships.map(async (partnership: any) => {
      const existingPartnership = await Partnership.findById(partnership._id);
      if (!existingPartnership) {
        throw new Error(`Partnership ${partnership._id} not found`);
      }
      const isInitiator =
        existingPartnership.initiator.toString() === decoded.id;
      const isCollaborator =
        existingPartnership.collaborator.toString() === decoded.id;

      let updateData: any = {};

      if (isInitiator) {
        updateData.deleted = partnership.deleted;
      } else if (isCollaborator) {
        if (partnership.status) {
          updateData.status = partnership.status;
        }
      } else {
        throw new Error("You don't have permission to update this partnership");
      }

      return await Partnership.findByIdAndUpdate(partnership._id, updateData, {
        new: true,
      });
    });

    await Promise.all(updatePromises);

    APIResponse(res, null, "Partnerships updated successfully", 200);
  } catch (error) {
    logger.error("Error updating partnership:", error);
    APIResponse(res, null, "Failed to update partnership", 500);
  }
};

// get partnerships by place id or event id
const getPartnerships = async (req: Request, res: Response) => {
  try {
    const { placeId, eventId } = req.params;
    const type = req.query.type as "place" | "event";
    const partnerships = await Partnership.find({
      place: placeId,
      event: eventId,
      type,
    })
      .populate({
        path: "collaborator",
        select: "creatorName creatorCategories image deleted",
        model: "User",
        populate: {
          path: "image",
          model: "Image",
          select: "url",
        },
      })
      .select("collaborator status deleted")
      .lean();

    const transformedPartnerships = await Promise.all(
      partnerships.map(async (partnership: IPartnership) => {
        const collaborator = partnership.collaborator as Partial<IUser>;
        if (collaborator.deleted) {
          return null;
        }

        return {
          ...partnership,
          collaborator: {
            _id: collaborator._id,
            name: collaborator.creatorName,
            categories: collaborator.creatorCategories,
            image: collaborator.image,
            deleted: collaborator.deleted,
          },
        };
      })
    );

    APIResponse(
      res,
      transformedPartnerships,
      "Partnerships rieved successfully",
      200
    );
  } catch (error) {
    logger.error("Error getting partnerships by place id:", error);
    APIResponse(res, null, "Failed to get partnerships by place id", 500);
  }
};

const getPartnershipsByUserId = async (req: CustomRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { asCollaborator, includeCancelledEvents, includePastEvents } =
      req.query;

    const isCollaborator = asCollaborator === "true";
    const query = isCollaborator
      ? { collaborator: new mongoose.Types.ObjectId(userId) }
      : { initiator: new mongoose.Types.ObjectId(userId) };

    let eventPopulateQuery: any = {
      path: "event",
      select: "name description image schedule status",
      populate: {
        path: "image",
        model: "Image",
        select: "urls",
      },
    };

    if (includeCancelledEvents !== "true") {
      eventPopulateQuery.match = { status: { $ne: "cancelled" } };
    }

    const partnerships = await Partnership.find({ ...query, deleted: false })
      .populate("initiator", "firstName lastName email")
      .populate("collaborator", "firstName lastName email")
      .populate({
        path: "place",
        match: {
          deleted: { $ne: true },
          active: { $ne: false },
        },
        select: "name address image location active deleted",
        populate: {
          path: "image",
          model: "Image",
          select: "urls",
        },
      })
      .populate({
        path: "event",
        match:
          includeCancelledEvents !== "true"
            ? { status: { $ne: "cancelled" } }
            : {},
        select: "name description image schedule status",
        populate: {
          path: "image",
          model: "Image",
          select: "urls",
        },
      })
      .lean();

    const validPartnerships = partnerships.filter((partnership) => {
      if (partnership.place === null) {
        return false;
      }
      if (partnership.type === "event" && partnership.event === null) {
        return false;
      }

      return true;
    });

    let filteredPartnerships = validPartnerships;
    if (includePastEvents !== "true") {
      filteredPartnerships = filteredPartnerships.filter((partnership) => {
        if (!partnership.event) {
          return true;
        }
        const event = partnership.event as unknown as IEvent;
        const eventStatusResult = getEventStatusFromSchedule(event.schedule);
        return (
          eventStatusResult === "ongoing" || eventStatusResult === "upcoming"
        );
      });
    }

    APIResponse(
      res,
      filteredPartnerships,
      "Partnerships retrieved successfully",
      200
    );
  } catch (error) {
    logger.error("Error getting partnerships by user id:", error);
    APIResponse(res, null, "Failed to get partnerships by user id", 500);
  }
};

export {
  createPartnerships,
  updatePartnerships,
  getPartnerships,
  getPartnershipsByUserId,
};

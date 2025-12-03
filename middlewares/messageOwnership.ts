import { Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import Message from "../models/Message";
import { isValidObjectId } from "mongoose";

const messageOwnership = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decoded = req.decoded!;
    const messageId = req.params.messageId;

    if (!messageId) {
      APIResponse(res, null, "Message ID requis", 400);
      return;
    }

    if (!isValidObjectId(messageId)) {
      APIResponse(res, null, "ID de message invalide", 400);
      return;
    }

    const message = await Message.findById(messageId).lean();
    if (!message) {
      APIResponse(res, null, "Message non trouvé", 404);
      return;
    }

    if (message.author.toString() !== decoded.id) {
      APIResponse(
        res,
        null,
        "Vous n'êtes pas autorisé à modifier ou supprimer ce message",
        403
      );
      return;
    }

    // Store message in request for potential use in controllers/actions
    req.message = message;
    next();
  } catch (error) {
    APIResponse(res, null, "Erreur lors de la vérification de propriété", 500);
  }
};

export default messageOwnership;

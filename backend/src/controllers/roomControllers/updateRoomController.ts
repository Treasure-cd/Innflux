import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../authControllers/createStaffController.js";
import { createError } from "../../utils/createError.js";
import { FieldValidators, isString, isNumber, validate } from "../../utils/validateFields.js";
import { prisma } from "../../lib/prisma.js";

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError("Unauthorized", 401));
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(createError("Request body required", 400));
  }

  const { hotelId, userRole } = req.user as AuthUser;

  const allowedRoles = ["owner", "manager"];
  if (!allowedRoles.includes(userRole)) {
    return next(createError("Forbidden", 403));
  }

  const roomId = Number(req.params.roomId);
  if (isNaN(roomId)) return next(createError("Invalid room ID", 400));


  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return next(createError("Room not found", 404));
  if (room.hotelId !== hotelId) return next(createError("Forbidden", 403));

  const allowedFields = ["alias", "specialName", "description", "roomType", "quality", "floor", "price"] as const;
  const updates: Record<string, any> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = typeof req.body[field] === "string"
        ? req.body[field].trim()
        : req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return next(createError("No valid fields provided", 400));
  }


  const updateRoomValidators: FieldValidators = {};
  if (updates.alias) updateRoomValidators.alias = [isString];
  if (updates.specialName) updateRoomValidators.specialName = [isString];
  if (updates.description) updateRoomValidators.description = [isString];
  if (updates.roomType) updateRoomValidators.roomType = [isString];
  if (updates.quality) updateRoomValidators.quality = [isString];
  if (updates.floor) updateRoomValidators.floor = [isNumber];
  if (updates.price) updateRoomValidators.price = [isNumber];

  const errors = validate(updates, updateRoomValidators);
  if (errors) return next(createError("Validation error", 400, errors));

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: updates,
  });

  res.status(200).json({ success: true, room: updatedRoom });
};
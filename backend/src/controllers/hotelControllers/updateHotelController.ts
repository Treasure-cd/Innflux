// updateHotelController.ts
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../authControllers/createStaffController.js";
import { createError } from "../../utils/createError.js";
import { FieldValidators, isString, isCloudinaryUrl, isValidTimezone, minLength, isNumber, validate } from "../../utils/validateFields.js";
import { prisma } from "../../lib/prisma.js";

export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError("Unauthorized", 401));
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(createError("Request body required", 400));
  }

  const { hotelId, userRole } = req.user as AuthUser;

  const allowedRoles = ["owner", "manager"];
  if (!allowedRoles.includes(userRole)) {
    return next(createError("Forbidden", 403));
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) return next(createError("Hotel not found", 404));

  const allowedFields = ["name", "address", "email", "phone", "logo", "numberOfRooms", "timezone"] as const;
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


  const updateHotelValidators: FieldValidators = {};
  if (updates.name) updateHotelValidators.name = [isString];
  if (updates.address) updateHotelValidators.address = [isString];
  if (updates.email) updateHotelValidators.email = [isString];
  if (updates.phone) updateHotelValidators.phone = [isString, minLength(10)];
  if (updates.logo) updateHotelValidators.logo = [isString, isCloudinaryUrl];
  if (updates.numberOfRooms) updateHotelValidators.numberOfRooms = [isNumber];
  if (updates.timezone) updateHotelValidators.timezone = [isValidTimezone];

  const errors = validate(updates, updateHotelValidators);
  if (errors) return next(createError("Validation error", 400, errors));

  const updatedHotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: updates,
  });

  res.status(200).json({ success: true, hotel: updatedHotel });
};
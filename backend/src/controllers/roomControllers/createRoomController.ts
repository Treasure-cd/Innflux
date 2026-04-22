import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/createError.js";
import { AuthUser } from "../authControllers/createStaffController.js";
import { prisma } from "../../lib/prisma.js";

export const createRooms = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError("Unauthorized", 401));
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(createError("Request body required", 400))
    }


  const { hotelId, userRole } = req.user as AuthUser;

  const allowedRoles = ["owner", "manager"];
  if (!allowedRoles.includes(userRole)) {
    return next(createError("Forbidden", 403));
  }

  const { price, roomType, quality, floor, aliases, count, description, specialName } = req.body;

  if (
  !Array.isArray(aliases) ||
  !count ||
  count < 1 ||
  count > 100 ||
  aliases.length !== count
    ) {
    return next(createError("Invalid input: check count and aliases", 400));
    }

if (!price || !roomType) {
  return next(createError("price and roomType are required", 400));
}

  if (!count || count < 1 || count > 100 || aliases.length !== count) {
    return next(createError("Count must be between 1 and 100", 400));
  }

  const roomsData = Array.from({ length: count }, (_, i) => ({
    hotelId,
    alias: aliases[i],
    price,
    roomType,
    quality: quality ?? "standard",
    floor: floor ?? null,
    description: description ?? null,
    specialName: specialName ?? null,
  }));


  await prisma.room.createMany({ data: roomsData });

  res.status(201).json({
    success: true,
    message: `${count} rooms created successfully`,
  });
};
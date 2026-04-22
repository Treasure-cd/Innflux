import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../authControllers/createStaffController.js";
import { createError } from "../../utils/createError.js";
import { prisma } from "../../lib/prisma.js";

export const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError("Unauthorized", 401));
  }

  const { hotelId, userRole } = req.user as AuthUser;

  if (userRole !== "owner") {
    return next(createError("Forbidden. Only the owner can delete this hotel", 403));
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) return next(createError("Hotel not found", 404));

  if (!hotel.isActive) {
    return next(createError("Hotel is already deactivated", 400));
  }

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { isActive: false },
  });

  res.status(200).json({ success: true, message: "Hotel deactivated successfully" });
};
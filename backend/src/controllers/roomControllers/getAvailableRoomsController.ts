import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/createError.js";
import { AuthUser } from "../authControllers/createStaffController.js";
import { prisma } from "../../lib/prisma.js";

export const getAvailableRooms = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError("Unauthorized", 401));

  const { hotelId } = req.user as AuthUser;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20); 
  const skip = (page - 1) * limit;

  const where: any = { hotelId };
  if (req.query.available !== undefined) {
    where.isAvailable = req.query.available === "true";
  }
  if (req.query.floor !== undefined) {
    where.floor = Number(req.query.floor);
  }
  if (req.query.quality !== undefined) {
    where.quality = req.query.quality;
  }
  if (req.query.roomType !== undefined) {
    where.roomType = req.query.roomType;
  }

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.room.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: rooms,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });
};
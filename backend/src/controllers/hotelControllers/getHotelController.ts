import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../authControllers/createStaffController.js";
import { createError } from "../../utils/createError.js";
import { prisma } from "../../lib/prisma.js"

export const getHotel = async(req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
    console.log("Problem is no user, req.user failed")
    return next(createError("Unauthorized", 401));
    }

    const { hotelId } = req.user as AuthUser;
    
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
        },
      });

    if (!hotel) {
      return next(createError("Hotel not found", 404));
    }

    res.status(200).json({ hotel })
}
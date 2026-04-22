import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/createError.js";
import { AuthUser } from "../authControllers/createStaffController.js";
import { prisma } from "../../lib/prisma.js";

export const toggleRoomAvailability = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(createError("Unauthorized", 401));

      const { hotelId, userRole } = req.user as AuthUser;
      const roomId = Number(req.query.roomId);

    if (isNaN(roomId)) return next(createError("No room Id provided", 400));

    const room = await prisma.room.findUnique({
        where: { id: roomId },
    });

    if (!room || room.hotelId !== hotelId) return next(createError("Room not found", 404));
    
    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { isAvailable: !room.isAvailable },
    });

    res.status(200).json({ success: true, roomIsAvailable: updatedRoom.isAvailable });

    


}
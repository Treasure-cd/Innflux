import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/createError.js";
import { FieldValidators, isCloudinaryUrl, isString, isValidTimezone, minLength, validate, isNumber, optional } from "../../utils/validateFields.js";
import { prisma } from "../../lib/prisma.js";
import jwt from 'jsonwebtoken';

export const createHotel = async(req: Request, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(createError("Request body required", 400))
    }

    const name = req.body.name?.trim();
    const address = req.body.address?.trim();
    const email = req.body.email?.trim();
    const phone = req.body.phone?.trim();
    const logo = req.body.logo?.trim();
    const numberOfRooms = Number(req.body.numberOfRooms);
    const timezone = req.body.timezone?.trim();

    const data = {
        name,
        address,
        email,
        phone,
        logo,
        numberOfRooms,
        timezone,
    }

    const createHotelValidator: FieldValidators = {
            name: [isString],
            address: [isString],
            email: [optional(isString)],
            phone: [optional(minLength(10))],
            logo: [optional(isCloudinaryUrl)],
            numberOfRooms: [isNumber],
            timezone: [isValidTimezone],
        };

    const errors = validate(data, createHotelValidator)
    if (errors) return next(createError("Validation error", 400, errors));

console.log("DATABASE_URL:", process.env.DATABASE_URL)
      const hotel = await prisma.hotel.create({
      data: { name, address, email, phone, logo, numberOfRooms, timezone }
    })

    const secret = process.env.SECRET_KEY;
    if (!secret) {
      throw new Error("SECRET_KEY not configured");
    }

    const token = jwt.sign({ hotelId: hotel.id, type: "onboarding" }, secret, { expiresIn: "15m" });

    res.status(201).json({
      success: true,
      token,
    })

}
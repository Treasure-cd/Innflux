import { Request, Response, NextFunction } from "express"
import { prisma } from "../../lib/prisma.js"
import { createError } from "../../utils/createError.js";
import { FieldValidators, isString, minLength, isValidUsername, validate } from "../../utils/validateFields.js";
import { hashPassword } from "../../utils/passwordHash.js";

interface AuthHotel {
  hotelId: number;
  type: "onboarding";
}

export const createUser = async(req: Request, res: Response, next: NextFunction) => {

if (!req.user) {
  return next(createError("Unauthorized user", 401))
}
if (!req.body || Object.keys(req.body).length === 0) {
  return next(createError("Request body required", 400))
}
   const username = req.body.username?.trim();
   const password = req.body.password?.trim();

   const { hotelId } = req.user as AuthHotel;

  const data = {
    username,
    password, 
  }

  const createUserValidators: FieldValidators = {
    username: [isString, minLength(6), isValidUsername],
    password: [isString, minLength(8)],
  };

  const errors = validate(data, createUserValidators);

  if (errors) return next(createError("Validation error", 400, errors));

    const hotel = await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
  });

  if (!hotel) {
    return next(createError("Hotel not found", 404))
  }

  const existingOwner = await prisma.auth.findFirst({
  where: {
    hotelId,
      role: "owner",
    },
  });

  if (existingOwner) {
    return next(createError("Owner already exists", 400));
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.auth.create({
  data: { hotelId, username, passwordHash, role: "owner" }
})
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({
    success: true,
    user: safeUser,
  })
}
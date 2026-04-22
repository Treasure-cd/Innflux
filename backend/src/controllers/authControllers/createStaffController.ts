import { Request, Response, NextFunction } from "express"
import { createError } from "../../utils/createError.js";
import { prisma } from "../../lib/prisma.js";
import { FieldValidators, isString, isValidUsername, minLength, validate } from "../../utils/validateFields.js";
import { hashPassword } from "../../utils/passwordHash.js";

export interface AuthUser {
  id: number;
  userRole: string,
  hotelId: number,
  type: "auth",
}

export const createStaff = async(req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError("Unauthorized user", 401))
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(createError("Request body required", 400))
    }

    const { id, userRole, hotelId, type } = req.user as AuthUser;
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();
    const role = req.body.role?.trim();
      
    const allowedRoles = ['manager', 'receptionist']
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' })
    }

    const data = {
        username,
        password, 
    }
  const createUserValidators: FieldValidators = {
    username: [isString, minLength(6), isValidUsername],
    password: [isString, minLength(8)],
  };
  const errors = validate(data, createUserValidators);
  if (errors) next(createError("Validation error", 400, errors))

    const hotelOwnerValid = await prisma.auth.findUnique({
    where: {
        id,
        hotelId,
    },
    });


    const isValid = hotelOwnerValid && userRole === "owner" && type === "auth";
    if (!isValid) return next(createError("Invalid or unauthorised user", 401));

  const passwordHash = await hashPassword(password);

  const user = await prisma.auth.create({
  data: { hotelId, username, passwordHash, role }
})
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({
    success: true,
    user: safeUser,
  })
}

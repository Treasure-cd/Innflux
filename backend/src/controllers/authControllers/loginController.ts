import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import { prisma } from "../../lib/prisma.js";
import { createError } from "../../utils/createError.js";
import { FieldValidators, isString, minLength, validate } from "../../utils/validateFields.js";
import comparePasswords from "../../utils/comparePasswords.js";


export const getUserByIdentifier = async(req: Request, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
       return next(createError("Request body required", 400));
    }

    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    const data = {
        username,
        password,
    }
    const getUserValidator: FieldValidators = {
        username: [isString],
        password: [isString, minLength(8)]
    };
    const errors = validate(data, getUserValidator);
    if (errors) return next(createError("Validation error", 400, errors));

    const user = await prisma.auth.findUnique({
        where: { username }
    })
    if (!user) return next(createError("Invalid username or password", 400));
    const isValid = await comparePasswords(password, user?.passwordHash)
        if (!isValid) return next(createError("Invalid username, or password", 400));


    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not defined");
    }
    const token = jwt.sign(
    { 
        id: user.id,
        userRole: user.role,
        hotel: user.hotelId,
        type: "auth",
     },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
    );


    res.status(201).json({
        success: true,
        token,
    });


}
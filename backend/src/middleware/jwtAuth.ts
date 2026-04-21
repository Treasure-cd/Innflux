import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError.js";

export const jwtAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    console.log(token);
    
    if (!token) {
      return next(createError("Unauthorized", 401))
    }
    console.log("Token loaded")
    const secret = process.env.SECRET_KEY;
    if (!secret) {
      throw new Error("SECRET_KEY not configured");
    }

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    req.user = decoded;

    next();
  } catch (err) {
    return next(createError("Invalid or missing token", 401))
  }
};

import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createStaff } from "../controllers/authControllers/createStaffController.js";
import { createUser } from "../controllers/authControllers/registerController.js";
import { getUserByIdentifier } from "../controllers/authControllers/loginController.js";

const authRouter = express.Router();

authRouter.get('/login', asyncHandler(getUserByIdentifier))
authRouter.get('/register', asyncHandler(createUser))
authRouter.get('/create-staff', asyncHandler(createStaff))

export default authRouter
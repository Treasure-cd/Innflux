import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createStaff } from "../controllers/authControllers/createStaffController.js";
import { createUser } from "../controllers/authControllers/registerController.js";
import { getUserByIdentifier } from "../controllers/authControllers/loginController.js";
import { jwtAuth } from "../middleware/jwtAuth.js";

const authRouter = express.Router();

authRouter.post('/login', asyncHandler(getUserByIdentifier))
authRouter.post('/register', jwtAuth, asyncHandler(createUser))
authRouter.post('/create-staff', jwtAuth, asyncHandler(createStaff))

export default authRouter
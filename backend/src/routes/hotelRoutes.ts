import express from "express";
import { createHotel } from "../controllers/hotelControllers/createHotelController.js";
import { getHotel } from "../controllers/hotelControllers/getHotelController.js";
import { deleteHotel } from "../controllers/hotelControllers/deleteHotelController.js";
import { updateHotel } from "../controllers/hotelControllers/updateHotelController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";


const hotelRouter = express.Router();

hotelRouter.get('/', asyncHandler(getHotel))
hotelRouter.post('/', asyncHandler(createHotel))
hotelRouter.patch('/', asyncHandler(updateHotel))
hotelRouter.post('/', asyncHandler(deleteHotel))

export default hotelRouter
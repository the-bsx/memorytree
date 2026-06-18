//import event models
import eventModel from "../models/event.model.js";

// import utilites
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// create event logic
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    isPrivate,
    isOngoing,
    startedAt,
    endedAt,
  } = req.body;
  if (!title || !category) {
    throw new ApiError(400, "ALl fields are required");
  }

  const userId = req.user.id;

  let cover_image_url = null;
  let cover_image_public_id = null;
  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(
      req.file.buffer,
      "memory-project/coverimages",
    );
    if (cloudinaryResponse) {
      cover_image_url = cloudinaryResponse.secure_url;
      cover_image_public_id = cloudinaryResponse.public_id;
    }
  }
  const newEvent = await eventModel.create({
    user_id: userId,
    title,
    description,
    category,
    cover_image_url,
    cover_image_public_id,
    is_private: isPrivate,
    is_ongoing: isOngoing,
    started_at: startedAt,
    ended_at: endedAt,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Event created Sucessfully.", newEvent));
});

// get all events for loggedIn user
const getAllEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const events = await eventModel.findAllByUser(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Events fetched sucessfully.", events));
});

// get single event by id
const getEventById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const event = await eventModel.findById(id, userId);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Event fetched sucessfully.", event));
});

//update event by id and userId
const updateEvent = asyncHandler(async (req, res) => {
    const { id } =req.params;
    const userId = req.user.id;
    const {title, description, category, isPrivate, isOngoing, startedAt, endedAt } = req.body;
    
    // check event exists and belongs to user
    const existingEvent = await eventModel.findById(id, userId);
    if(!existingEvent) {
        throw new ApiError(404, "Event not found");
    }

    // handle cover image if uploaded
     let cover_image_url = null;
    let cover_image_public_id = null;

    if(req.file) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.buffer, "memory-project/coverimages");
        if(cloudinaryResponse) { 
            cover_image_url = cloudinaryResponse.secure_url;
            cover_image_public_id = cloudinaryResponse.public_id;

            // delete old image from cloudinary if it existed
            if(existingEvent.cover_image_public_id) {
                await deleteFromCloudinary(existingEvent.cover_image_public_id);
            }
        }
    }

    const updateEvent = await eventModel.updateById(id ,userId, {
        title,
        description,
        category,
        cover_image_url,
        cover_image_public_id,
        is_private: isPrivate,
        is_ongoing: isOngoing,
        started_at: startedAt,
        ended_at: endedAt
    } )

    return res.status(200).json(new ApiResponse(200, "Event updated sucessfully.", updateEvent));
});

// delete event by id and userId
const deleteEvent = asyncHandler(async(req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const deleteEvent = await eventModel.softDeleteById(id, userId);
    
    if(!deleteEvent) {
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(new ApiResponse(200, "Event deleted sucessfully", deleteEvent));
})


export {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
}
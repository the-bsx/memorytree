//import models
import memoryModel from "../models/memory.model.js";
import eventModel from "../models/event.model.js";
import mediaModel from "../models/media.model.js";

// import utilites
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const createMedia = asyncHandler(async(req, res) => {
    const { memoryId } = req.params;
    const userId = req.user.id;

    // verify memory entry exists
    const existingMemory = await memoryModel.findById(memoryId);
    if(!existingMemory) {
        throw new ApiError(404, "Memory Entry not found")
    }

    //verify ownership through events
    const event = await eventModel.findById(existingMemory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Memory Entry not found")
    }

    if(!req.files || req.files.length === 0) {
        throw new ApiError(400, "At least one media file is required");
    }

    const uploadedMedia = [];

    for(const file of req.files) {

        const cloudinaryResponse = await uploadOnCloudinary(file.buffer, "memory-project/media");

        if(cloudinaryResponse) {
            const mediaDetail = await mediaModel.create({
                memory_entry_id: memoryId,
                url: cloudinaryResponse.secure_url,
                public_id: cloudinaryResponse.public_id,
                media_type: 'image',
                caption: null,
                file_size_bytes: file.size,
                mime_type: file.mimetype
            })
            uploadedMedia.push(mediaDetail)
        }
    }
    return res.status(201).json(new ApiResponse(201, "Media created sucessfully", uploadedMedia));
})

const getAllMediaForMemory = asyncHandler(async(req, res) => {
    const { memoryEntryId }= req.params;
    const userId = req.user.id;

    const existingMemory = await memoryModel.findById(memoryEntryId);
    if(!existingMemory) {
        throw new ApiError(404, "Memory Entry not found");
    }
    const event = await eventModel.findById(existingMemory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Memory Entry not found");
    }

    const media = await mediaModel.findAllByMemoryEntry(memoryEntryId);
    return res.status(200).json(new ApiResponse(200, "Medias fetched sucessfully", media));
})

const getMediaById = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const media = await mediaModel.findById(id);
    if(!media) {
        throw new ApiError(404, "Media not found");
    }
    const memory = await memoryModel.findById(media.memory_entry_id);
    if(!memory) {
        throw new ApiError(404, "Media not found");
    }

    const event = await eventModel.findById(memory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Media not found");
    }

    return res.status(200).json(new ApiResponse(200, "Media fetched sucessfully", media));
})

const updateMediaCaption = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { caption } = req.body;

    // verify media exists
    const existingMedia = await mediaModel.findById(id);
    if(!existingMedia) {
        throw new ApiError(404, "Media not found");
    }
    // verify the ownership of media and memory_entry
    const memory = await memoryModel.findById(existingMedia.memory_entry_id);
    if(!memory) {
        throw new ApiError(404, "Media not found");
    }

    const event = await eventModel.findById(memory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Media not found");
    }
    const updatedCaption = await  mediaModel.updateCaption(id, caption);

    return res.status(201).json(new ApiResponse(201, "Caption updated sucessfully", updatedCaption));
})
const deleteMedia = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const existingMedia = await mediaModel.findById(id);
    if(!existingMedia) {
        throw new ApiError(404, "Media not found");
    }

    // verify the ownership of media and memory_entry
    const memory = await memoryModel.findById(existingMedia.memory_entry_id);
    if(!memory) {
        throw new ApiError(404, "Media not found");
    }
    const event = await eventModel.findById(memory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Media not found");
    }
    const deletedMedia = await mediaModel.deleteById(id);

    if(deletedMedia.public_id) {
        await deleteFromCloudinary(deletedMedia.public_id)
    }
    return res.status(200).json(new ApiResponse(200, "Medias deleted sucessfully", deletedMedia));
})

export {
    createMedia,
    getAllMediaForMemory,
    getMediaById,
    updateMediaCaption,
    deleteMedia
}
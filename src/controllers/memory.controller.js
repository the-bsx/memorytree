//import models
import memoryModel from "../models/memory.model.js";
import eventModel from "../models/event.model.js";
import mediaModel from "../models/media.model.js";
// import utilites
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createMemory = asyncHandler(async(req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
    const{ title, body, chapter, mood, moodScore, locationName, latitude, longitude , memoryDate, parentId} = req.body;

    //verify event exists and belong to user
    const existingEvent = await eventModel.findById(eventId, userId);
    if(!existingEvent) {
        throw new ApiError(404, "Event not found");
    }

    const newMemory = await memoryModel.create({
        event_id: eventId,
        parent_id: parentId,
        title,
        body,
        chapter,
        mood,
        mood_score: moodScore,
        location_name: locationName,
        latitude,
        longitude,
        memory_date: memoryDate,
    });

    return res.status(201).json(new ApiResponse(201, "Memory created sucessfully.", newMemory));
})

const getAllMemoriesForEvent = asyncHandler(async(req, res) => {
    const { eventId } =req.params;
    const userId = req.user.id;

    // verify event belongs to user
    const existingEvent = await eventModel.findById(eventId, userId);
    if(!existingEvent) {
        throw new ApiError(404, "Event not found");
    }


    const memories = await memoryModel.findAllByEvent(eventId);

    //attch media to each memory
    const memoriesWithMedia = await Promise.all(
        memories.map(async(memory) => {
            const media = await mediaModel.findAllByMemoryEntry(memory.id);
            return {...memory, media};
        })
    )

    return res.status(200).json(new ApiResponse(200, "memories fetched sucessfully", memoriesWithMedia));
})

const getMemoryById = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const memory = await memoryModel.findById(id);
    if(!memory) {
        throw new ApiError(404, "Memory not found");
    }

    //verify the ownership
    const event = await eventModel.findById(memory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Memory not found");
    }

        // fetch media for this memory entry
        const media = await mediaModel.findAllByMemoryEntry(id);

    // combine memory + its media into one response object
    const memoryWithMedia = {
        ...memory,
        media
    };
    return res.status(200).json(new ApiResponse(200, "Memory fetched sucessfully", memoryWithMedia));

})

const updateMemory = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const{ title, body, chapter, mood, moodScore, locationName, latitude, longitude , memoryDate, parentId} = req.body;

    // verify memory exists
    const existingMemory = await memoryModel.findById(id);
    if(!existingMemory) {
        throw new ApiError(404, "Memory not found")
    }

    // verify the ownership of memory
    const event = await eventModel.findById(existingMemory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Memory not found");
    }

    const updatedMemory = await memoryModel.updateById(id, {
        title,
        body,
        chapter,
        mood,
        mood_score: moodScore,
        location_name: locationName,
        latitude,
        longitude,
        memory_date: memoryDate
    })
    return res.status(200).json(new ApiResponse(200, "Memory updated sucessfullly", updatedMemory))
})

const deleteMemory = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const memory = await memoryModel.findById(id);
    if(!memory) {
        throw new ApiError(404, "Memory not found");
    }
    const event = await eventModel.findById(memory.event_id, userId);
    if(!event) {
        throw new ApiError(404, "Memory not found");
    }
    const deletedMemory = await memoryModel.softDeleteById(id);

    return res.status(200).json(new ApiResponse(200, "Memory deleted sucessfully", deletedMemory));
})

export {
    createMemory,
    getAllMemoriesForEvent,
    getMemoryById,
    updateMemory,
    deleteMemory
}
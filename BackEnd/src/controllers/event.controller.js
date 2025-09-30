import {Event} from "../models/event.models.js"; // make sure default export

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      location,
      eligibility,
      image,
      registrationFee,
      winningPrize,
      description,
      status, // optional, default pending
    } = req.body;

    // Basic validation
    if (!name || !date || !location || !eligibility) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newEvent = new Event({
      name,
      date,
      location,
      eligibility,
      image: image || "",
      registrationFee: registrationFee || 0,
      winningPrize: winningPrize || "",
      description: description || "",
      status: status || "pending", // default pending
    });

    await newEvent.save();
    return res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // sorted by date ascending
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all pending event requests (admin only)
const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" }).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Approve an event request
const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({ message: "Event approved", event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Decline an event request
const declineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { status: "declined" },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({ message: "Event declined", event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export {
  createEvent,
  getEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  declineEvent,
};

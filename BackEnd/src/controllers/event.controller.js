import {Event} from "../models/event.models.js";

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
      status,
    } = req.body;

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
      status: status || "pending",
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

const getEvents = async (req, res) => {
  try {
    // Only approved events
    const events = await Event.find({ status: "approved" }).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};


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

const getPendingEvents = async (req, res) => {
  try {
    // Get all events with filter support
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    
    const events = await Event.find(filter).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      id,
      { 
        status: "approved",
        adminNotes: adminNotes || "",
        reviewedAt: new Date()
      },
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

const declineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      id,
      { 
        status: "rejected",
        adminNotes: adminNotes || "",
        reviewedAt: new Date()
      },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({ message: "Event rejected", event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// DELETE EVENT FUNCTION - YE ADD KARO
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    return res.status(200).json({ 
      message: "Event deleted successfully",
      event: deletedEvent 
    });
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
  deleteEvent,  // YE BHI EXPORT KARO
};
import { Event } from "../models/event.models.js";

// ✅ Create Event
export const createEvent = async (req, res) => {
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
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get Approved Events (for homepage)
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get Single Event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get Pending Events (Admin)
export const getPendingEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Approve Event
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      { status: "approved", adminNotes: adminNotes || "", reviewedAt: new Date() },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event approved", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Reject Event
export const declineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      { status: "rejected", adminNotes: adminNotes || "", reviewedAt: new Date() },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event rejected", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event deleted successfully", event: deletedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

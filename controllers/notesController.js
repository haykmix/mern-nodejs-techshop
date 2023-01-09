const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

/* 
    @desc Get all notes
    @route GET /notes
    access Private
*/

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  if (!notes?.length)
    return res.status(400).json({ message: "No notes found" });

  // Concatenate the username to the note object
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.status(200).json(notesWithUser);
});

/* 
    @desc Create new note
    @route POST /notes
    access Private
*/

const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // sending all the user data
  if (!user || !title || !text)
    return res.status(409).json({ message: "All fields are required" });

  const duplicated = await Note.findOne({ title }).lean().exec();

  if (duplicated) {
    return res.status(409).json({ message: "Duplicated note title" });
  }

  const note = await Note.create({ user, title, text });

  if (note) res.status(201).json({ message: `New note ${title} created` });
  else res.status(400).json({ message: `Invalid note data received` });
});

/* 
    @desc Update a note
    @route GET /notes
    access Private
*/

const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== "boolean")
    return res.status(409).json({ message: "All fields are required" });

  const note = await Note.findById(id).exec();

  if (!note) return res.status(400).json({ message: "Note not found" });

  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`${updatedNote.title} updated`);
});

/* 
    @desc Delete a note
    @route DELETE /notes
    access Private
*/

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const note = await Note.findById(id).exec();

  if (!note) return res.status(400).json({ message: "Note not found" });

  const result = await note.deleteOne();
  res.json(`Note ${result.title} with ID ${result.id} deleted`);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};

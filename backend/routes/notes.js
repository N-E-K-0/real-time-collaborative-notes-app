const express = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * POST /api/notes
 * Create a new note.
 * Protected route: requires valid access token.
 */
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    // Create a note and initialize history with the initial content.
    const note = new Note({
      title,
      content,
      author: req.user.id,
      history: [{ content, updatedAt: new Date() }],
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/notes
 * Retrieve all notes for the authenticated user.
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ author: req.user.id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/notes/:id
 * Retrieve a single note by its ID.
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notes/:id
 * Update a note and store its previous version in the history.
 */
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    // Before updating, save the current content to history.
    note.history.push({ content: note.content, updatedAt: new Date() });

    // Update note fields.
    note.title = title || note.title;
    note.content = content;

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

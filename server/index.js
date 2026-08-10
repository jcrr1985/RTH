require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const { MONGODB_URI, GOOGLE_PLACES_API_KEY, PORT = 5000 } = process.env;

if (!MONGODB_URI || !GOOGLE_PLACES_API_KEY) {
  console.error(
    "Missing required environment variables: MONGODB_URI, GOOGLE_PLACES_API_KEY. See server/.env.example."
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

// Feedback Schema and Model
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  comment: { type: String, required: true },
});

const Feedback = mongoose.model("feedback", feedbackSchema);

// API Endpoint to handle form submission
app.post("/feedback", async (req, res) => {
  const { name, email, country, comment } = req.body;

  try {
    const feedback = await new Feedback({ name, email, country, comment }).save();
    res.status(201).json({ message: "successfully saved", feedback });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Short-lived in-memory cache for Places lookups: identical searches (same
// country/city/speciality) are extremely common and otherwise each one pays
// full Google API latency on every request.
const PLACES_CACHE_TTL_MS = 10 * 60 * 1000;
const placesCache = new Map();

const getCached = (key) => {
  const entry = placesCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > PLACES_CACHE_TTL_MS) {
    placesCache.delete(key);
    return undefined;
  }
  return entry.data;
};

app.get("/places", async (req, res) => {
  const { apiUrl } = req.query;
  if (!apiUrl) {
    return res.status(400).json({ error: "Missing apiUrl query parameter" });
  }

  const cached = getCached(apiUrl);
  if (cached) {
    return res.json(cached);
  }

  const requestUrl = `${apiUrl}&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await axios.get(requestUrl);
    placesCache.set(apiUrl, { data: response.data, timestamp: Date.now() });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from Google Places API:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

import { parseJson, parseLocation } from "../helpers/userHelpers.js";
import Place from "../models/Place.js";
import User from "../models/User.js";
import { generateSignedUrlFromFullUrl } from "../utils/s3.js";

const updatePlace = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { placeId } = req.params;
    if (!placeId) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    if (user.userType !== "organizer" && !user.places.includes(placeId)) {
      return res.status(400).json({ error: "You can't update this place" });
    }

    const {
      name,
      description,
      location,
      phone,
      email,
      website,
      placeCategory,
      defaultSchedule,
      collaborators,
      createdCollaborators,
    } = req.body;

    const formattedLocation = parseLocation(location);

    if (!formattedLocation && location) {
      return res.status(400).json({ error: "Invalid location format" });
    }

    const parsedDefaultSchedule = parseJson(defaultSchedule, {});
    const parsedCollaborators = parseJson(collaborators, []).map((id) => ({
      userId: id,
      status: "pending",
    }));
    const parsedCreatedCollaborators = parseJson(createdCollaborators, []);

    const updateData = {
      name,
      description,
      location: formattedLocation,
      phone,
      email,
      website,
      placeCategory,
      defaultSchedule: parsedDefaultSchedule,
      collaborators: parsedCollaborators,
      createdCollaborators: parsedCreatedCollaborators,
    };

    if (req.file) {
      updateData.image = req.file.location;
    }

    const place = await Place.findByIdAndUpdate(placeId, updateData, {
      new: true,
    });

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.status(200).json(place);
  } catch (error) {
    console.error("Error updating place:", error);
    res
      .status(500)
      .json({ error: "Failed to update place", details: error.message });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    let place = await Place.findById(id)
      .populate({
        path: "categories",
        model: "SubCategory",
      })
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .populate({
        path: "collaborators.userId",
        model: "User",
        select: "-password",
      });

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    place = place.toObject();
    if (place.image) {
      place.image = await generateSignedUrlFromFullUrl(place.image);
    }
    place.collaborators = await Promise.all(
      place.collaborators.map(async (collab) => {
        const user = await User.findById(collab.userId);
        user.image = await generateSignedUrlFromFullUrl(user.image);
        const { userId, ...rest } = collab;
        return { ...rest, user };
      })
    );

    res.status(200).json(place);
  } catch (error) {
    console.error("Error fetching place:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getPlacesInView = async (req, res) => {
  try {
    const { ne, sw, filters } = req.query;
    if (!ne || !sw) {
      return res.status(400).json({ error: "Missing required coordinates" });
    }
    let bounds;
    try {
      bounds = {
        ne: JSON.parse(ne),
        sw: JSON.parse(sw),
      };
    } catch (error) {
      return res.status(400).json({ error: "Invalid coordinate format" });
    }
    const places = await Place.find({
      location: {
        $geoWithin: {
          $box: [bounds.sw, bounds.ne],
        },
      },
    }).lean();

    res.status(200).json(places);
  } catch (error) {
    console.error("Error fetching places in view:", error);
    res.status(500).json({ error: "Failed to fetch places in view" });
  }
};

export { updatePlace, getPlaceById, getPlacesInView };

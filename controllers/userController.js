const User = require("../models/User");
const Place = require("../models/Place");
const { parseJson, parseLocation } = require("../helpers/userHelpers");
const { generateSignedUrlFromFullUrl } = require("../utils/s3");

const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "creatorProfile.categories",
        model: "SubCategory",
      })
      .populate({
        path: "creatorProfile.place",
        populate: [
          {
            path: "categories",
            model: "SubCategory",
          },
          {
            path: "placeCategory",
            model: "PlaceCategory",
          },
        ],
      })
      .populate({
        path: "places",
        model: "Place",
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user?.places && user.places.length > 0) {
      await Promise.all(
        user.places.map(async (place) => {
          if (place.image) {
            place.image = await generateSignedUrlFromFullUrl(place.image);
          }
        })
      );
    }
    if (user?.image) {
      const signedUrl = await generateSignedUrlFromFullUrl(user.image);
      user.image = signedUrl;
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error getting user:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const addCreator = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      location,
      defaultSchedule,
      phone,
      email,
      website,
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.userType !== "guest") {
      return res.status(400).json({ error: "User can not be a creator" });
    }
    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = parseLocation(location);

    if (location && !formattedLocation) {
      return res.status(400).json({ error: "Invalid location format" });
    }

    user.userType = "creator";
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.image = profilePicture || user.image;
    user.creatorProfile = {
      name,
      categories: [category],
    };

    let place = null;

    if (formattedLocation) {
      place = new Place({
        name: name || user.username,
        description,
        userId: user._id,
        location: formattedLocation,
        isCreatorPlace: true,
        placeCategory,
        categories: category ? [category] : [],
        defaultSchedule: parseJson(defaultSchedule, {}),
      });

      await place.save();
      user.creatorProfile.place = place._id;
    }

    await user.save();

    return res.status(201).json({
      message: "Creator profile added successfully",
      data: {
        user,
        place,
      },
    });
  } catch (err) {
    console.error("Error adding creator:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const addOrganizer = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      location,
      defaultSchedule,
      phone,
      email,
      website,
      collaborators,
      createdCollaborators,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.userType !== "guest") {
      return res.status(400).json({ error: "User can not be an organizer" });
    }
    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = parseLocation(location);

    if (!location && !formattedLocation) {
      return res.status(400).json({ error: "Invalid location format" });
    }

    user.userType = "organizer";
    let place = null;
    if (formattedLocation) {
      place = new Place({
        name: name,
        description,
        userId: user._id,
        phone,
        email,
        website,
        image: profilePicture,
        location: formattedLocation,
        isCreatorPlace: false,
        placeCategory,
        categories: category ? [category] : [],
        defaultSchedule: parseJson(defaultSchedule, {}),
        collaborators: parseJson(collaborators, []).map((id) => ({
          userId: id,
          status: "pending",
        })),
        createdCollaborators: parseJson(createdCollaborators, []),
      });
      await place.save();
      user.places.push(place._id);
    }

    await user.save();

    return res.status(201).json({
      message: "Organizer profile added successfully",
      data: {
        user,
        place,
      },
    });
  } catch (err) {
    console.error("Error adding creator:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const updateCreator = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      location,
      defaultSchedule,
      phone,
      email,
      website,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.userType !== "creator") {
      return res.status(400).json({ error: "User is not a creator" });
    }
    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = location ? parseLocation(location) : null;
    if (location && !formattedLocation) {
      return res.status(400).json({ error: "Invalid location format" });
    }
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.image = profilePicture || user.image;
    user.creatorProfile.name = name || user.creatorProfile.name;
    if (category) {
      user.creatorProfile.categories = [category];
    }
    let place = null;
    if (user.creatorProfile.place) {
      place = await Place.findById(user.creatorProfile.place);
      if (!place) {
        return res.status(404).json({ error: "Place not found" });
      }
      place.name = name || place.name;
      place.description = description || place.description;
      place.placeCategory = placeCategory || place.placeCategory;
      place.categories = category ? [category] : place.categories;
      if (!formattedLocation) {
        place.active = false;
      } else {
        place.location = formattedLocation;
        place.active = true;
        place.defaultSchedule = defaultSchedule
          ? parseJson(defaultSchedule, place.defaultSchedule)
          : place.defaultSchedule;
      }
      await place.save();
    } else if (formattedLocation) {
      place = new Place({
        name: name || user.creatorProfile.name,
        userId: user._id,
        location: formattedLocation,
        isCreatorPlace: true,
        placeCategory,
        categories: category ? [category] : [],
        defaultSchedule: parseJson(defaultSchedule, {}),
      });
      await place.save();
      user.creatorProfile.place = place._id;
    }

    await user.save();

    return res.status(200).json({
      message: "Creator profile updated successfully",
      data: { user, place },
    });
  } catch (err) {
    console.error("Error updating creator:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const findUsers = async (req, res) => {
  try {
    const { role, category, city, name, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.userType = role;
    }

    if (name) {
      query["creatorProfile.name"] = { $regex: name, $options: "i" };
    }

    if (category) {
      query["creatorProfile.categories"] = category;
    }

    if (city) {
      query["creatorProfile.place.location.city"] = city;
    }

    const users = await User.find(query)
      .select("-password")
      .limit(parseInt(limit))
      .populate({
        path: "creatorProfile.categories",
        model: "SubCategory",
      })
      .populate({
        path: "creatorProfile.place",
        populate: [
          {
            path: "categories",
            model: "SubCategory",
          },
          {
            path: "placeCategory",
            model: "PlaceCategory",
          },
        ],
      });

    for (let user of users) {
      if (user?.image) {
        user.image = await generateSignedUrlFromFullUrl(user.image);
      }
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error finding users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addCreator,
  updateCreator,
  getUser,
  addOrganizer,
  findUsers,
};

const User = require("../models/User");
const Place = require("../models/Place");
const {
  upsertOrganizerPlace,
  upsertCreatorPlace,
  updateCreatorProfile,
  parseJson,
  parseAddress,
} = require("../helpers/userHelpers");

const createOrUpdateUserAndPlace = async (req, res) => {
  try {
    const {
      userType,
      name,
      description,
      category,
      placeCategory,
      address,
      defaultSchedule,
      phone,
      email,
      website,
      collaborators,
      createdCollaborators,
      placeId,
    } = req.body;

    const userId = req.user.id;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const parsedSchedule = parseJson(defaultSchedule, {});
    const parsedCollaborators = parseJson(collaborators, []);
    const parsedCreatedCollaborators = parseJson(createdCollaborators, []);
    const formattedAddress = parseAddress(address);
    if (address && !formattedAddress) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    user.userType = userType;

    let place = placeId ? await Place.findById(placeId) : null;
    if (placeId && !place) {
      return res.status(404).json({ error: "Place not found with given ID" });
    }

    if (userType === "creator") {
      updateCreatorProfile(user, {
        name,
        description,
        phone,
        email,
        website,
        profilePicture,
        category,
      });

      if (formattedAddress) {
        place = await upsertCreatorPlace({
          place,
          placeId,
          user,
          name,
          description,
          category,
          placeCategory,
          formattedAddress,
          parsedSchedule,
        });
        user.creatorProfile.creatorPlace = place._id;
      }
    }

    if (userType === "organizer") {
      if (!formattedAddress) {
        return res
          .status(400)
          .json({ error: "Organizer must provide a valid address" });
      }

      place = await upsertOrganizerPlace({
        place,
        placeId,
        userId,
        name,
        description,
        phone,
        email,
        website,
        placeCategory,
        formattedAddress,
        parsedSchedule,
        parsedCollaborators,
        parsedCreatedCollaborators,
        category,
      });
    }

    await user.save();

    return res.status(201).json({
      message: "Profile created successfully",
      data: { user, place },
    });
  } catch (err) {
    console.error("Error creating profile:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

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
        path: "creatorProfile.creatorPlace",
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
      address,
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
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
    const formattedAddress = parseAddress(address);

    if (address && !formattedAddress) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    user.userType = "creator";
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.userImg = profilePicture || user.userImg;
    user.creatorProfile = {
      creatorName: name,
      categories: [category],
    };

    let place = null;

    if (formattedAddress) {
      place = new Place({
        title: name || user.username,
        description,
        userId: user._id,
        location: formattedAddress,
        isCreatorPlace: true,
        placeCategory,
        categories: category ? [category] : [],
        defaultSchedule: parseJson(defaultSchedule, {}),
      });

      await place.save();
      user.creatorProfile.creatorPlace = place._id;
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
      address,
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
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
    const formattedAddress = parseAddress(address);

    if (!address && !formattedAddress) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    user.userType = "organizer";
    let place = null;
    if (formattedAddress) {
      place = new Place({
        title: name,
        description,
        userId: user._id,
        phone,
        email,
        website,
        placeImg: profilePicture,
        location: formattedAddress,
        isCreatorPlace: false,
        placeCategory,
        categories: category ? [category] : [],
        defaultSchedule: parseJson(defaultSchedule, {}),
        collaborators: parseJson(collaborators, []),
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
      address,
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
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
    const formattedAddress = address ? parseAddress(address) : null;
    if (address && !formattedAddress) {
      return res.status(400).json({ error: "Invalid address format" });
    }
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.userImg = profilePicture || user.userImg;
    user.creatorProfile.creatorName = name || user.creatorProfile.creatorName;
    if (category) {
      user.creatorProfile.categories = [category];
    }

    let place = null;
    if (user.creatorProfile.creatorPlace) {
      place = await Place.findById(user.creatorProfile.creatorPlace);
      if (!place) {
        if (formattedAddress) {
          place = new Place({
            title: name || user.username,
            description,
            userId: user._id,
            location: formattedAddress,
            isCreatorPlace: true,
            placeCategory,
            categories: category ? [category] : [],
            defaultSchedule: parseJson(defaultSchedule, {}),
          });
          await place.save();
          user.creatorProfile.creatorPlace = place._id;
        }
      } else {
        place.title = name || place.title;
        place.description = description || place.description;
        place.placeCategory = placeCategory || place.placeCategory;
        place.categories = category ? [category] : place.categories;
        if (formattedAddress) place.location = formattedAddress;
        place.defaultSchedule = defaultSchedule
          ? parseJson(defaultSchedule, place.defaultSchedule)
          : place.defaultSchedule;

        await place.save();
      }
    } else if (formattedAddress) {
      place = new Place({
        title: name || user.username,
        description,
        userId: user._id,
        location: formattedAddress,
        isCreatorPlace: true,
        placeCategory,
        categories: category ? [category] : [],
        defaultSchedule: parseJson(defaultSchedule, {}),
      });
      await place.save();
      user.creatorProfile.creatorPlace = place._id;
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

module.exports = {
  addCreator,
  updateCreator,
  getUser,
  addOrganizer,
};

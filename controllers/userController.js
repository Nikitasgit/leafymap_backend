const User = require("../models/User");
const Place = require("../models/Place");

const placeId = "68287c18529c60a23e4b19d4";

const createProfile = async (req, res) => {
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

    //  const userId = req.auth?.payload?.sub;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let place = null;
    if (placeId) {
      place = await Place.findById(placeId);
      if (!place) {
        return res.status(404).json({ error: "Place not found with given ID" });
      }
    }

    let parsedAddress = null;
    let formattedAddress = null;
    let parsedSchedule = defaultSchedule ? JSON.parse(defaultSchedule) : {};
    let parsedCollaborators = collaborators ? JSON.parse(collaborators) : [];
    let parsedCreatedCollaborators = createdCollaborators
      ? JSON.parse(createdCollaborators)
      : [];

    if (address) {
      try {
        parsedAddress = JSON.parse(address);
        if (
          !parsedAddress.coordinates ||
          parsedAddress.coordinates.latitude == null ||
          parsedAddress.coordinates.longitude == null ||
          !parsedAddress.label
        ) {
          throw new Error("Missing address fields");
        }
        formattedAddress = {
          type: "Point",
          coordinates: [
            parsedAddress.coordinates.longitude,
            parsedAddress.coordinates.latitude,
          ],
          label: parsedAddress.label,
          id: parsedAddress.id,
        };
      } catch (error) {
        return res.status(400).json({ error: "Invalid address format" });
      }
    }

    user.userType = userType;

    // ========== CREATOR ==========
    if (userType === "creator") {
      user.description = description || user.description;
      user.phone = phone || user.phone;
      user.email = email || user.email;
      user.website = website || user.website;
      user.userImg = profilePicture || user.userImg;
      user.creatorProfile = {
        creatorName: name || user.creatorProfile.creatorName,
        categories: [category] || user.creatorProfile.categories,
      };

      let place = null;

      if (formattedAddress) {
        if (placeId) {
          place = await Place.findById(placeId);
          if (!place) {
            return res
              .status(404)
              .json({ error: "Place not found with given ID" });
          }
          place.title = name || place.title;
          place.description = description || place.description;
          place.categories = [category] || place.categories;
          place.placeCategory = placeCategory || place.placeCategory;
          place.location = formattedAddress || place.location;
          place.defaultSchedule = parsedSchedule || place.defaultSchedule;
          await place.save();
        }

        if (!place) {
          place = new Place({
            title: user.username,
            description,
            userId,
            location: formattedAddress,
            isCreatorPlace: true,
            placeCategory,
            categories: [category],
            defaultSchedule: parsedSchedule,
          });
          await place.save();
        }
        user.creatorProfile = {
          ...user.creatorProfile,
          creatorPlace: place._id,
        };
      }
    }

    // ========== ORGANIZER ==========
    else if (userType === "organizer") {
      if (!formattedAddress) {
        return res
          .status(400)
          .json({ error: "Organizer must provide a valid address" });
      }
      let place = null;

      if (placeId) {
        place = await Place.findById(placeId);
        if (!place) {
          return res
            .status(404)
            .json({ error: "Place not found with given ID" });
        }

        place.title = name;
        place.description = description;
        place.phone = phone;
        place.email = email;
        place.website = website;
        place.placeCategory = placeCategory;
        place.location = formattedAddress;
        place.defaultSchedule = parsedSchedule;
        place.collaborators = parsedCollaborators;
        place.createdCollaborators = parsedCreatedCollaborators;
        place.categories = [category];
        await place.save();
      }

      if (!place) {
        place = new Place({
          title: name,
          description,
          userId,
          location: formattedAddress,
          phone,
          email,
          website,
          isCreatorPlace: false,
          placeCategory,
          defaultSchedule: parsedSchedule,
          collaborators: parsedCollaborators,
          createdCollaborators: parsedCreatedCollaborators,
          categories: [category],
        });

        await place.save();
      }
    }

    await user.save();

    const savedPlace =
      userType === "organizer" || (userType === "creator" && formattedAddress)
        ? await Place.findOne({ userId })
        : null;

    return res.status(201).json({
      message: "Profile created successfully",
      data: {
        user,
        place: savedPlace,
      },
    });
  } catch (err) {
    console.error("Error creating profile:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getUser = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId)
    .populate({
      path: "creatorProfile.categories",
      model: "SubCategory",
    })
    .populate({
      path: "creatorProfile.creatorPlace",
      populate: {
        path: "categories",
        model: "SubCategory",
      },
      populate: {
        path: "placeCategory",
        model: "PlaceCategory",
      },
    });
  res.status(200).json({ user });
};

module.exports = {
  createProfile,
  getUser,
};

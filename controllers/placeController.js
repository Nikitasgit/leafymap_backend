const Place = require("../models/Place");
const User = require("../models/User");

const updatePlace = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { placeId } = req.params;
  if (user.userType !== "organizer" && !user.places.includes(placeId)) {
    return res.status(400).json({ error: "You can't update this place" });
  }
  const { title, description, location, phone, email, website, placeCategory } =
    req.body;

  const placeImg = req.file ? req.file.location : null;

  const place = await Place.findByIdAndUpdate(
    placeId,
    {
      title,
      description,
      placeImg,
      location,
      phone,
      email,
      website,
      placeCategory,
      categories,
      defaultSchedule,
      collaborators,
      createdCollaborators,
    },
    { new: true }
  );

  res.status(200).json(place);
};

const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id)
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
      })
      .populate({
        path: "createdCollaborators.category",
        model: "SubCategory",
      });

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.status(200).json(place);
  } catch (error) {
    console.error("Error fetching place:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  updatePlace,
  getPlaceById,
};

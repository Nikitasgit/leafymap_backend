import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import Place, { IPlace } from "../models/Place";
import { parseJson, parseLocation } from "../helpers/userHelpers";
import { generateSignedUrlFromFullUrl } from "../types/s3";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
  file?: Express.Multer.File & { location?: string };
}

const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
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
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user?.places) {
      await Promise.all(
        (user.places as unknown as IPlace[]).map(async (place) => {
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
    res.status(500).json({ error: "Server error" });
  }
};

const addCreator = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.userType !== "guest") {
      res.status(400).json({ error: "User can not be a creator" });
      return;
    }
    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = parseLocation(location);

    if (location && !formattedLocation) {
      res.status(400).json({ error: "Invalid location format" });
      return;
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

    res.status(201).json({
      message: "Creator profile added successfully",
      data: {
        user,
        place,
      },
    });
  } catch (err) {
    console.error("Error adding creator:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const addOrganizer = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.userType !== "guest") {
      res.status(400).json({ error: "User can not be an organizer" });
      return;
    }
    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = parseLocation(location);

    if (!location && !formattedLocation) {
      res.status(400).json({ error: "Invalid location format" });
      return;
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
        collaborators: parseJson(collaborators, []).map((id: string) => ({
          userId: id,
          status: "pending",
        })),
        createdCollaborators: parseJson(createdCollaborators, []),
      });
      await place.save();
      user.places.push(place._id);
    }

    await user.save();

    res.status(201).json({
      message: "Organizer profile added successfully",
      data: {
        user,
        place,
      },
    });
  } catch (err) {
    console.error("Error adding creator:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateCreator = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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
      placeActive,
    } = req.body;

    const placeActiveBoolean = placeActive === "true";
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.userType !== "creator") {
      res.status(400).json({ error: "User is not a creator" });
      return;
    }
    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = location ? parseLocation(location) : null;
    if (location && !formattedLocation) {
      res.status(400).json({ error: "Invalid location format" });
      return;
    }
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.image = profilePicture || user.image;

    if (!user.creatorProfile) {
      user.creatorProfile = { name: "", categories: [] };
    }
    user.creatorProfile.name = name || user.creatorProfile.name;
    if (category) {
      user.creatorProfile.categories = [category];
    }
    let place = null;
    if (user.creatorProfile.place) {
      place = await Place.findById(user.creatorProfile.place);
      if (!place) {
        res.status(404).json({ error: "Place not found" });
        return;
      }
      if (!placeActiveBoolean) {
        place.active = false;
      } else {
        place.name = name || place.name;
        place.active = true;
        place.description = description || place.description;
        place.placeCategory = placeCategory || place.placeCategory;
        place.categories = category ? [category] : place.categories;
        if (formattedLocation) {
          place.location = { ...formattedLocation, type: "Point" };
        }
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

    res.status(200).json({
      message: "Creator profile updated successfully",
      data: { user, place },
    });
  } catch (err) {
    console.error("Error updating creator:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const findUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, category, city, name, limit = 10 } = req.query;
    const query: any = {};

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
      .limit(parseInt(limit as string))
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

export { getUser, addCreator, addOrganizer, updateCreator, findUsers };

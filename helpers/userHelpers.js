export const parseJson = (str, fallback) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

export const parseAddress = (address) => {
  try {
    const parsed = JSON.parse(address);
    if (
      parsed?.coordinates?.latitude == null ||
      parsed?.coordinates?.longitude == null ||
      !parsed.label
    ) {
      throw new Error("Invalid address fields");
    }
    return {
      type: "Point",
      coordinates: [parsed.coordinates.longitude, parsed.coordinates.latitude],
      label: parsed.label,
      id: parsed.id,
    };
  } catch {
    return null;
  }
};

export const updateCreatorProfile = (
  user,
  { name, description, phone, email, website, profilePicture, category }
) => {
  user.description = description || user.description;
  user.phone = phone || user.phone;
  user.email = email || user.email;
  user.website = website || user.website;
  user.userImg = profilePicture || user.userImg;
  user.creatorProfile = {
    creatorName: name || user.creatorProfile?.creatorName,
    categories: category ? [category] : user.creatorProfile?.categories || [],
  };
};

export const upsertCreatorPlace = async ({
  place,
  placeId,
  user,
  name,
  description,
  category,
  placeCategory,
  formattedAddress,
  parsedSchedule,
}) => {
  if (place) {
    place.title = name || place.title;
    place.description = description || place.description;
    place.categories = category ? [category] : place.categories;
    place.placeCategory = placeCategory || place.placeCategory;
    place.location = formattedAddress || place.location;
    place.defaultSchedule = parsedSchedule || place.defaultSchedule;
    await place.save();
    return place;
  }

  const newPlace = new Place({
    title: user.username,
    description,
    userId: user._id,
    location: formattedAddress,
    isCreatorPlace: true,
    placeCategory,
    categories: [category],
    defaultSchedule: parsedSchedule,
  });
  await newPlace.save();
  return newPlace;
};

export const upsertOrganizerPlace = async ({
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
}) => {
  if (place) {
    Object.assign(place, {
      title: name || place.title,
      description: description || place.description,
      phone: phone || place.phone,
      email: email || place.email,
      website: website || place.website,
      placeCategory: placeCategory || place.placeCategory,
      location: formattedAddress || place.location,
      defaultSchedule: parsedSchedule || place.defaultSchedule,
      collaborators: parsedCollaborators || place.collaborators,
      createdCollaborators:
        parsedCreatedCollaborators || place.createdCollaborators,
      categories: category ? [category] : place.categories,
    });
    await place.save();
    return place;
  }

  const newPlace = new Place({
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

  await newPlace.save();
  return newPlace;
};

interface Location {
  type: string;
  coordinates: [number, number];
  label: string;
  id: string;
}

interface ParsedLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  label: string;
  id: string;
}

export const parseJson = <T>(str: string | undefined, fallback: T): T => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

export const parseLocation = (location: string): Location | null => {
  try {
    const parsed = JSON.parse(location) as ParsedLocation;
    if (
      parsed?.coordinates?.latitude == null ||
      parsed?.coordinates?.longitude == null ||
      !parsed.label ||
      !parsed.id
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

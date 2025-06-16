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
    const parsed = JSON.parse(location) as Location;
    if (
      !parsed.coordinates ||
      !Array.isArray(parsed.coordinates) ||
      parsed.coordinates.length !== 2 ||
      !parsed.label ||
      !parsed.id ||
      !parsed.type
    ) {
      throw new Error("Invalid location fields");
    }
    return parsed;
  } catch {
    return null;
  }
};

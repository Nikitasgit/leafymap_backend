interface Location {
  type: string;
  coordinates: [number, number];
  label: string;
  id: string;
}

export function parseJson<T>(json: string | undefined, fallback: T): T;
export function parseLocation(location: string | undefined): Location | null;

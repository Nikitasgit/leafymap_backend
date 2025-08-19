export const parseJson = <T>(str: string | undefined, fallback: T): T => {
    try {
      return str ? JSON.parse(str) : fallback;
    } catch {
      return fallback;
    }
  };
  
import "dotenv/config";

// App constants

export const APP_NAME = "Leafy Map";

export const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? ["https://leafymap.com", "https://www.leafymap.com"]
    : [
        "http://localhost:3001",
        "https://leafymap.com",
        "https://www.leafymap.com",
      ];

export const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://leafymap.com"
    : "http://localhost:3001";

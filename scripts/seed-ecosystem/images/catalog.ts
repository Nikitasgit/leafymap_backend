import type { ImageTheme } from "../config";

export const THEME_COLORS: Record<ImageTheme, string> = {
  portrait: "#6B7C5E",
  bakery: "#C4A574",
  bar: "#3D2B1F",
  market: "#E07A3D",
  concert: "#2C1A4D",
  gallery: "#D9D2C5",
  workshop: "#8B6914",
  farm: "#4A7C3F",
  brewery: "#B8860B",
  restaurant: "#8B3A3A",
};

/** Curated Unsplash photo IDs (Unsplash License). Downloaded at seed time, stored on S3. */
export const UNSPLASH_CATALOG: Record<ImageTheme, string[]> = {
  portrait: [
    "photo-1494790108377-be9c29b29330",
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1500648767791-00dcc994a43e",
    "photo-1438761681033-6461ffad8d80",
    "photo-1472099645785-5658abf4ff4e",
    "photo-1534528741775-53994a69daeb",
  ],
  bakery: [
    "photo-1509440159596-0249088772ff",
    "photo-1555507036-ab1f4038808a",
    "photo-1517433670267-08bbd4be890f",
    "photo-1509722747041-616f39b57569",
    "photo-1608198093002-ad4e005484ec",
    "photo-1586444248902-2f64eddc13df",
  ],
  bar: [
    "photo-1514933651103-005eec06c04b",
    "photo-1514362545857-3bc16c4c7d1b",
    "photo-1470337458703-46ad1756a187",
    "photo-1543007630-9710e4a00a20",
    "photo-1575444758702-4a6b9222336e",
    "photo-1566417713940-fe7c737a9ef2",
  ],
  market: [
    "photo-1518843875459-f738682238a6",
    "photo-1542838132-92c53300491e",
    "photo-1533900298318-6b8da08a523e",
    "photo-1579113800032-c38bd7635818",
    "photo-1516594798947-e65505dbb29d",
    "photo-1461354464878-ad92f492a5a0",
  ],
  concert: [
    "photo-1501386761578-eac5c94b800a",
    "photo-1540039155733-5bb30b53aa14",
    "photo-1524368535928-5b5e00ddc76b",
    "photo-1514525253161-7a46d19cd819",
    "photo-1493225457124-a3eb161ffa5f",
    "photo-1429962714451-bb934ecdc4ec",
  ],
  gallery: [
    "photo-1536924940846-227afb31e2a5",
    "photo-1579783902614-a3fb3927b6a5",
    "photo-1518998053901-5348d3961a04",
    "photo-1554907984-15263bfd63bd",
    "photo-1541961017774-22349e4a1262",
    "photo-1513364776144-60967b0f800f",
  ],
  workshop: [
    "photo-1452860606245-08befc0ff44b",
    "photo-1459411552884-841db9b3cc2a",
    "photo-1565193566173-7a0ee3dbe261",
    "photo-1610701596007-11502861dcfa",
    "photo-1493106819501-66d381c466f1",
    "photo-1605721911519-3dfeb3be25e7",
  ],
  farm: [
    "photo-1500382017468-9049fed747ef",
    "photo-1464226184884-fa280b87c399",
    "photo-1500595046743-cd271d694d30",
    "photo-1574943320219-553eb213f72d",
    "photo-1416879595882-3373a0480b5b",
    "photo-1560493676-04071c5f467b",
  ],
  brewery: [
    "photo-1559526324-4b87b5e36e44",
    "photo-1600788886242-5c96aabe3757",
    "photo-1558642452-9d2a7deb7f62",
    "photo-1608270586620-248524c67de9",
    "photo-1532634922-8fe0b757fb13",
    "photo-1436076863939-06870fe779c2",
  ],
  restaurant: [
    "photo-1517248135467-4c7edcad34c4",
    "photo-1504674900247-0877df9cc836",
    "photo-1559339352-11d035aa65de",
    "photo-1466978913421-dad2ebd01d17",
    "photo-1552566626-52f8b828add9",
    "photo-1551218808-94e220e084d2",
  ],
};

export function unsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=800&q=80`;
}

export const EVENT_THEME_BY_CATEGORY: Record<string, ImageTheme> = {
  workshop: "workshop",
  exhibition: "gallery",
  market: "market",
  tasting: "brewery",
  concert: "concert",
  festival: "concert",
  conference: "gallery",
  performance: "concert",
  meetup: "bar",
  online_event: "workshop",
};

import { signNestedImageUrls } from "@src/application/services/signNestedImageUrls";
import { IImageStorage } from "@src/domain/interfaces/IImageStorage";

describe("signNestedImageUrls", () => {
  const imageStorage: jest.Mocked<IImageStorage> = {
    upload: jest.fn(),
    signUrl: jest.fn(async (url: string) => `${url}?signed=1`),
    signUrls: jest.fn(async (urls) => ({
      original: `${urls.original}?signed=1`,
      thumbnail: `${urls.thumbnail}?signed=1`,
      medium: `${urls.medium}?signed=1`,
    })),
    deleteUrls: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preserves dates and buffers", async () => {
    const createdAt = new Date("2026-07-21T08:00:00.000Z");
    const contents = Buffer.from("image");

    const result = await signNestedImageUrls(imageStorage, {
      createdAt,
      contents,
    });

    expect(result.createdAt).toBe(createdAt);
    expect(result.contents).toBe(contents);
    expect(imageStorage.signUrl).not.toHaveBeenCalled();
  });

  it("signs nested image urls objects", async () => {
    const urls = {
      original: "https://linkal.s3.eu-west-3.amazonaws.com/images/original/a.jpg",
      thumbnail:
        "https://linkal.s3.eu-west-3.amazonaws.com/images/thumbnail/a.jpg",
      medium: "https://linkal.s3.eu-west-3.amazonaws.com/images/medium/a.jpg",
    };

    const result = await signNestedImageUrls(imageStorage, {
      events: [{ image: { id: "1", urls } }],
    });

    expect(imageStorage.signUrl).toHaveBeenCalledTimes(3);
    expect(result.events[0].image.urls.thumbnail).toBe(
      `${urls.thumbnail}?signed=1`
    );
  });

  it("signs standalone S3 url strings and caches duplicates", async () => {
    const thumbnail =
      "https://linkal.s3.eu-west-3.amazonaws.com/images/thumbnail/a.jpg";

    const result = await signNestedImageUrls(imageStorage, {
      collaborators: [{ image: thumbnail }, { image: thumbnail }],
      name: "keep-me",
    });

    expect(imageStorage.signUrl).toHaveBeenCalledTimes(1);
    expect(result.collaborators[0].image).toBe(`${thumbnail}?signed=1`);
    expect(result.collaborators[1].image).toBe(`${thumbnail}?signed=1`);
    expect(result.name).toBe("keep-me");
  });

  it("signs duplicate urls and signedUrls only once per URL", async () => {
    const urls = {
      original: "https://linkal.s3.eu-west-3.amazonaws.com/original/a.jpg",
      thumbnail: "https://linkal.s3.eu-west-3.amazonaws.com/thumbnail/a.jpg",
      medium: "https://linkal.s3.eu-west-3.amazonaws.com/medium/a.jpg",
    };

    const result = await signNestedImageUrls(imageStorage, {
      images: [{ urls, signedUrls: urls }],
    });

    expect(imageStorage.signUrl).toHaveBeenCalledTimes(3);
    expect(result.images[0].urls).toEqual({
      original: `${urls.original}?signed=1`,
      thumbnail: `${urls.thumbnail}?signed=1`,
      medium: `${urls.medium}?signed=1`,
    });
    expect(result.images[0].signedUrls).toEqual(result.images[0].urls);
  });

  it("leaves non-S3 strings untouched", async () => {
    const result = await signNestedImageUrls(imageStorage, {
      googlePictureUrl: "https://lh3.googleusercontent.com/photo.jpg",
    });

    expect(imageStorage.signUrl).not.toHaveBeenCalled();
    expect(result.googlePictureUrl).toBe(
      "https://lh3.googleusercontent.com/photo.jpg"
    );
  });
});

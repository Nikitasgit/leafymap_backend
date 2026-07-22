import { Announcement } from "@src/domain/entities/Announcement.entity";

describe("Announcement entity", () => {
  const base = {
    id: "ann_1",
    slug: "maintenance",
    status: "published" as const,
    priority: 10,
    startsAt: null as Date | null,
    endsAt: null as Date | null,
    deletedAt: null as Date | null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    translations: [
      {
        locale: "fr" as const,
        title: "Maintenance",
        body: "Le site sera indisponible",
        ctaLabel: null,
        ctaHref: null,
      },
    ],
  };

  it("is active when published without date window", () => {
    const announcement = Announcement.reconstitute(base);
    expect(announcement.isActiveAt(new Date("2026-07-01T12:00:00.000Z"))).toBe(
      true
    );
  });

  it("is inactive before startsAt", () => {
    const announcement = Announcement.reconstitute({
      ...base,
      startsAt: new Date("2026-07-10T00:00:00.000Z"),
    });
    expect(announcement.isActiveAt(new Date("2026-07-01T12:00:00.000Z"))).toBe(
      false
    );
  });

  it("is inactive after endsAt", () => {
    const announcement = Announcement.reconstitute({
      ...base,
      endsAt: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(announcement.isActiveAt(new Date("2026-07-01T12:00:00.000Z"))).toBe(
      false
    );
  });

  it("is inactive when soft-deleted", () => {
    const announcement = Announcement.reconstitute(base).softDelete();
    expect(announcement.isSoftDeleted()).toBe(true);
    expect(announcement.isActiveAt()).toBe(false);
  });

  it("falls back to fr when en translation is missing", () => {
    const announcement = Announcement.reconstitute(base);
    const translation = announcement.translationFor("en");
    expect(translation?.locale).toBe("fr");
    expect(translation?.title).toBe("Maintenance");
  });

  it("returns requested locale when available", () => {
    const announcement = Announcement.reconstitute({
      ...base,
      translations: [
        ...base.translations,
        {
          locale: "en",
          title: "Maintenance",
          body: "The site will be unavailable",
          ctaLabel: null,
          ctaHref: null,
        },
      ],
    });
    expect(announcement.translationFor("en")?.body).toBe(
      "The site will be unavailable"
    );
  });
});

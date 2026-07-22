import GetActiveAnnouncementsUseCase from "@src/application/usecases/announcements/GetActiveAnnouncements.usecase";
import SoftDeleteAnnouncementUseCase from "@src/application/usecases/announcements/SoftDeleteAnnouncement.usecase";
import { Announcement } from "@src/domain/entities/Announcement.entity";
import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import { ERROR_CODES } from "@src/shared/errors";

const makeAnnouncement = (
  overrides: Partial<Parameters<typeof Announcement.reconstitute>[0]> = {}
) =>
  Announcement.reconstitute({
    id: "ann_1",
    slug: "maintenance",
    status: "published",
    priority: 5,
    startsAt: null,
    endsAt: null,
    deletedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    translations: [
      {
        locale: "fr",
        title: "Maintenance",
        body: "Message FR",
        ctaLabel: null,
        ctaHref: null,
      },
    ],
    ...overrides,
  });

describe("GetActiveAnnouncementsUseCase", () => {
  let announcementRepository: jest.Mocked<IAnnouncementRepository>;
  let useCase: GetActiveAnnouncementsUseCase;

  beforeEach(() => {
    announcementRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      listAdmin: jest.fn(),
      listActive: jest.fn(),
    };
    useCase = new GetActiveAnnouncementsUseCase(announcementRepository);
  });

  it("maps active announcements with locale fallback to fr", async () => {
    announcementRepository.listActive.mockResolvedValue([makeAnnouncement()]);

    const result = await useCase.execute({ locale: "en" });

    expect(result.announcements).toHaveLength(1);
    expect(result.announcements[0]).toMatchObject({
      id: "ann_1",
      locale: "fr",
      title: "Maintenance",
      body: "Message FR",
    });
  });

  it("uses en translation when present", async () => {
    announcementRepository.listActive.mockResolvedValue([
      makeAnnouncement({
        translations: [
          {
            locale: "fr",
            title: "Maintenance",
            body: "Message FR",
            ctaLabel: null,
            ctaHref: null,
          },
          {
            locale: "en",
            title: "Maintenance",
            body: "Message EN",
            ctaLabel: null,
            ctaHref: null,
          },
        ],
      }),
    ]);

    const result = await useCase.execute({ locale: "en" });
    expect(result.announcements[0].body).toBe("Message EN");
    expect(result.announcements[0].locale).toBe("en");
  });
});

describe("SoftDeleteAnnouncementUseCase", () => {
  let announcementRepository: jest.Mocked<IAnnouncementRepository>;
  let useCase: SoftDeleteAnnouncementUseCase;

  beforeEach(() => {
    announcementRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      listAdmin: jest.fn(),
      listActive: jest.fn(),
    };
    useCase = new SoftDeleteAnnouncementUseCase(announcementRepository);
  });

  it("soft-deletes an existing announcement", async () => {
    announcementRepository.findById.mockResolvedValue(makeAnnouncement());
    announcementRepository.update.mockResolvedValue(makeAnnouncement());

    await useCase.execute("ann_1");

    expect(announcementRepository.update).toHaveBeenCalledWith(
      "ann_1",
      expect.objectContaining({
        deletedAt: expect.any(Date),
      })
    );
  });

  it("rejects when announcement is missing", async () => {
    announcementRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute("missing")).rejects.toMatchObject({
      code: ERROR_CODES.ANNOUNCEMENT_NOT_FOUND,
    });
  });
});

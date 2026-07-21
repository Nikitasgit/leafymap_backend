import GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";
import {
  CategoriesResult,
  ICategoryRepository,
} from "@src/domain/interfaces/ICategoryRepository";

describe("GetCategoriesUseCase", () => {
  let categoryRepository: jest.Mocked<ICategoryRepository>;
  let useCase: GetCategoriesUseCase;

  beforeEach(() => {
    categoryRepository = {
      findAll: jest.fn(),
    };
    useCase = new GetCategoriesUseCase(categoryRepository);
  });

  it("returns the aggregated categories payload", async () => {
    const payload: CategoriesResult = {
      categoryTypes: [{ id: "ct1", name: "craft" }],
      userCategories: [{ id: "uc1", name: "weaver" }],
      placeCategories: [{ id: "pc1", name: "atelier" }],
      productCategories: [{ id: "prc1", name: "textile" }],
      eventCategories: [{ id: "ec1", name: "workshop" }],
    };

    categoryRepository.findAll.mockResolvedValue(payload);

    const result = await useCase.execute();

    expect(result).toEqual(payload);
    expect(categoryRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("returns empty arrays when no categories exist", async () => {
    const emptyPayload: CategoriesResult = {
      categoryTypes: [],
      userCategories: [],
      placeCategories: [],
      productCategories: [],
      eventCategories: [],
    };

    categoryRepository.findAll.mockResolvedValue(emptyPayload);

    await expect(useCase.execute()).resolves.toEqual(emptyPayload);
  });
});

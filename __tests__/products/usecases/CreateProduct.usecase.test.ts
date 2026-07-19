import { Types } from "mongoose";
import CreateProductUseCase from "@src/application/usecases/products/CreateProduct.usecase";
import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import { ProductId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("CreateProductUseCase", () => {
  let productRepository: jest.Mocked<IProductRepository>;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    productRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findDetailsById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
      findList: jest.fn(),
      deleteManyByUserId: jest.fn(),
    };
    useCase = new CreateProductUseCase(productRepository);
  });

  it("creates a product when under the limit", async () => {
    const userId = mockObjectId();
    const productCategoryId = mockObjectId();
    const productId = ProductId.from(mockObjectId());

    productRepository.countByUserId.mockResolvedValue(3);
    productRepository.save.mockResolvedValue(productId);

    const result = await useCase.execute({ productCategoryId, userId });

    expect(result).toEqual({ id: productId });
    expect(productRepository.save).toHaveBeenCalled();
  });

  it("rejects when max products is reached", async () => {
    productRepository.countByUserId.mockResolvedValue(10);

    await expect(
      useCase.execute({
        productCategoryId: mockObjectId(),
        userId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.MAX_PRODUCTS_REACHED,
      statusCode: 409,
    });

    expect(productRepository.save).not.toHaveBeenCalled();
  });
});

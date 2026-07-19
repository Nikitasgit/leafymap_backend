import { Types } from "mongoose";
import UpdateProductUseCase from "@src/application/usecases/products/UpdateProduct.usecase";
import { Product } from "@src/domain/entities/Product.entity";
import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("UpdateProductUseCase", () => {
  let productRepository: jest.Mocked<IProductRepository>;
  let useCase: UpdateProductUseCase;

  const userId = mockObjectId();
  const productId = mockObjectId();
  const categoryId = mockObjectId();

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
    useCase = new UpdateProductUseCase(productRepository);
  });

  const existingProduct = () =>
    Product.reconstitute({
      id: ProductId.from(productId),
      userId: UserId.from(userId),
      productCategoryId: ProductCategoryId.from(categoryId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it("updates the product category when owner", async () => {
    const nextCategoryId = mockObjectId();
    productRepository.findById.mockResolvedValue(existingProduct());

    await useCase.execute({
      productId,
      userId,
      productCategoryId: nextCategoryId,
    });

    expect(productRepository.update).toHaveBeenCalled();
    const updated = productRepository.update.mock.calls[0][0];
    expect(updated.productCategoryId).toBe(
      ProductCategoryId.from(nextCategoryId)
    );
  });

  it("rejects when product is not found", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        productId,
        userId,
        productCategoryId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PRODUCT_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("rejects when user is not the owner", async () => {
    productRepository.findById.mockResolvedValue(existingProduct());

    await expect(
      useCase.execute({
        productId,
        userId: mockObjectId(),
        productCategoryId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PRODUCT_FORBIDDEN,
      statusCode: 403,
    });

    expect(productRepository.update).not.toHaveBeenCalled();
  });
});

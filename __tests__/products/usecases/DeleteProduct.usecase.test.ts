import { Types } from "mongoose";
import DeleteProductUseCase from "@src/application/usecases/products/DeleteProduct.usecase";
import { Product } from "@src/domain/entities/Product.entity";
import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("DeleteProductUseCase", () => {
  let productRepository: jest.Mocked<IProductRepository>;
  let useCase: DeleteProductUseCase;

  const userId = mockObjectId();
  const productId = mockObjectId();

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
    useCase = new DeleteProductUseCase(productRepository);
  });

  it("deletes the product when owner", async () => {
    productRepository.findById.mockResolvedValue(
      Product.reconstitute({
        id: ProductId.from(productId),
        userId: UserId.from(userId),
        productCategoryId: ProductCategoryId.from(mockObjectId()),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await useCase.execute({ productId, userId });

    expect(productRepository.delete).toHaveBeenCalledWith(
      ProductId.from(productId)
    );
  });

  it("rejects when product is not found", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ productId, userId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PRODUCT_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("rejects when user is not the owner", async () => {
    productRepository.findById.mockResolvedValue(
      Product.reconstitute({
        id: ProductId.from(productId),
        userId: UserId.from(userId),
        productCategoryId: ProductCategoryId.from(mockObjectId()),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ productId, userId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PRODUCT_FORBIDDEN,
      statusCode: 403,
    });

    expect(productRepository.delete).not.toHaveBeenCalled();
  });
});

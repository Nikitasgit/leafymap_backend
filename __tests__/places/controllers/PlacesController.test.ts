import { NextFunction, Response } from "express";
import PlacesController from "@src/api/controllers/PlacesController";
import { CustomRequest } from "@src/api/types/custom";
import GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import { ERROR_CODES } from "@src/shared/errors";

jest.mock("@src/api/http/response", () => ({
  APIResponse: jest.fn(),
}));

describe("PlacesController.getInView", () => {
  const response: Response = Object.assign(Object.create(null), {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });
  const next = jest.fn() as NextFunction;
  const execute = jest.fn().mockResolvedValue([]);
  const getPlacesInViewUseCase: GetPlacesInViewUseCase = Object.assign(
    Object.create(GetPlacesInViewUseCase.prototype),
    { execute }
  );
  const controller = new PlacesController(
    undefined as never,
    undefined as never,
    undefined as never,
    getPlacesInViewUseCase,
    undefined as never,
    undefined as never
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards the parsed query to the use case", async () => {
    const request: CustomRequest = Object.assign(Object.create(null), {
      query: {
        ids: " first, second ",
        filters: '{"placeCategories":["market"]}',
        limit: "2",
      },
    });

    await controller.getInView()(request, response, next);

    expect(execute).toHaveBeenCalledWith({
      ids: ["first", "second"],
      clientFilters: '{"placeCategories":["market"]}',
      limit: 2,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a request without ids or coordinates", async () => {
    const request: CustomRequest = Object.assign(Object.create(null), {
      query: {},
    });

    await controller.getInView()(request, response, next);

    expect(execute).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: ERROR_CODES.VALIDATION_ERROR })
    );
  });
});

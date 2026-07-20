import { RequestHandler } from "express";
import {
  createController,
  type ControllerOptions,
} from "@src/api/http/controllerFactory";

export abstract class BaseHttpController {
  /** Wraps createController(...).handle() for subclasses. */
  protected handler<TResult>(
    options: ControllerOptions<TResult>
  ): RequestHandler {
    return createController(options).handle();
  }
}

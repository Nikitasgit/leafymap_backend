export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_ROUTE_PARAM: "INVALID_ROUTE_PARAM",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  AUTH_ACCOUNT_INACCESSIBLE: "AUTH_ACCOUNT_INACCESSIBLE",
  AUTH_USER_BANNED: "AUTH_USER_BANNED",
  AUTH_EMAIL_ALREADY_USED: "AUTH_EMAIL_ALREADY_USED",
  AUTH_INVALID_EMAIL_VERIFICATION_TOKEN: "AUTH_INVALID_EMAIL_VERIFICATION_TOKEN",
  AUTH_INVALID_RESET_PASSWORD_TOKEN: "AUTH_INVALID_RESET_PASSWORD_TOKEN",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_HAS_PLACE: "USER_ALREADY_HAS_PLACE",
  PLACE_NOT_FOUND: "PLACE_NOT_FOUND",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  EVENT_PLACE_FORBIDDEN: "EVENT_PLACE_FORBIDDEN",
  EVENT_NOT_BOOKABLE: "EVENT_NOT_BOOKABLE",
  EVENT_BOOKING_CLOSED: "EVENT_BOOKING_CLOSED",
  EVENT_BOOKING_OWN_EVENT: "EVENT_BOOKING_OWN_EVENT",
  EVENT_BOOKING_ALREADY_EXISTS: "EVENT_BOOKING_ALREADY_EXISTS",
  EVENT_BOOKING_TOO_MANY_SEATS: "EVENT_BOOKING_TOO_MANY_SEATS",
  EVENT_BOOKING_NOT_ENOUGH_SEATS: "EVENT_BOOKING_NOT_ENOUGH_SEATS",
  EVENT_BOOKING_NOT_FOUND: "EVENT_BOOKING_NOT_FOUND",
  EVENT_BOOKING_UPDATE_CLOSED: "EVENT_BOOKING_UPDATE_CLOSED",
  EVENT_BOOKING_CANCEL_CLOSED: "EVENT_BOOKING_CANCEL_CLOSED",
  PARTNERSHIP_COLLABORATOR_REQUIRED: "PARTNERSHIP_COLLABORATOR_REQUIRED",
  PARTNERSHIP_ALREADY_EXISTS: "PARTNERSHIP_ALREADY_EXISTS",
  PARTNERSHIP_INVITATION_ALREADY_SENT: "PARTNERSHIP_INVITATION_ALREADY_SENT",
  PARTNERSHIP_CREATE_FAILED: "PARTNERSHIP_CREATE_FAILED",
  PARTNERSHIP_NOT_FOUND: "PARTNERSHIP_NOT_FOUND",
  PARTNERSHIP_ACCEPT_FORBIDDEN: "PARTNERSHIP_ACCEPT_FORBIDDEN",
  PARTNERSHIP_UPDATE_FORBIDDEN: "PARTNERSHIP_UPDATE_FORBIDDEN",
  PARTNERSHIP_DELETE_FORBIDDEN: "PARTNERSHIP_DELETE_FORBIDDEN",
  EVENT_INVITATION_NOT_FOUND: "EVENT_INVITATION_NOT_FOUND",
  EVENT_INVITATION_RESPOND_FORBIDDEN: "EVENT_INVITATION_RESPOND_FORBIDDEN",
  EVENT_INVITATION_UPDATE_FORBIDDEN: "EVENT_INVITATION_UPDATE_FORBIDDEN",
  ADMIN_SELF_BAN_FORBIDDEN: "ADMIN_SELF_BAN_FORBIDDEN",
  ADMIN_SELF_UNBAN_FORBIDDEN: "ADMIN_SELF_UNBAN_FORBIDDEN",
  ADMIN_SELF_DELETE_FORBIDDEN: "ADMIN_SELF_DELETE_FORBIDDEN",
  ADMIN_RESOURCE_NOT_FOUND: "ADMIN_RESOURCE_NOT_FOUND",
  FAVORITE_ALREADY_EXISTS: "FAVORITE_ALREADY_EXISTS",
  FAVORITE_NOT_FOUND: "FAVORITE_NOT_FOUND",
  FAVORITE_FORBIDDEN: "FAVORITE_FORBIDDEN",
  FOLLOW_SELF_NOT_ALLOWED: "FOLLOW_SELF_NOT_ALLOWED",
  FOLLOW_ALREADY_EXISTS: "FOLLOW_ALREADY_EXISTS",
  FOLLOW_NOT_FOUND: "FOLLOW_NOT_FOUND",
  FOLLOW_FORBIDDEN: "FOLLOW_FORBIDDEN",
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
  COMMENT_FORBIDDEN: "COMMENT_FORBIDDEN",
  COMMENT_REFERENCE_NOT_FOUND: "COMMENT_REFERENCE_NOT_FOUND",
  COMMENT_REFERENCE_UNSUPPORTED: "COMMENT_REFERENCE_UNSUPPORTED",
  REVIEW_ALREADY_EXISTS: "REVIEW_ALREADY_EXISTS",
  REVIEW_NOT_FOUND: "REVIEW_NOT_FOUND",
  REVIEW_FORBIDDEN: "REVIEW_FORBIDDEN",
  REVIEW_REFERENCE_NOT_FOUND: "REVIEW_REFERENCE_NOT_FOUND",
  REVIEW_OWN_ENTITY_FORBIDDEN: "REVIEW_OWN_ENTITY_FORBIDDEN",
} as const;

export type ErrorCode =
  | (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
  | (string & {});

const isStableErrorCode = (value: string): boolean => /^[A-Z0-9_]+$/.test(value);

const defaultCodeForStatus = (statusCode: number): ErrorCode => {
  if (statusCode === 400) return ERROR_CODES.VALIDATION_ERROR;
  if (statusCode === 401) return ERROR_CODES.UNAUTHORIZED;
  if (statusCode === 403) return ERROR_CODES.FORBIDDEN;
  if (statusCode === 404) return ERROR_CODES.NOT_FOUND;
  if (statusCode === 409) return ERROR_CODES.CONFLICT;
  return ERROR_CODES.INTERNAL_SERVER_ERROR;
};

/**
 * Operational error carrying a stable code and HTTP status, handled by the
 * central error handler middleware. Throw these from actions, middlewares and
 * controllers instead of responding manually.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;

  public readonly statusCode: number;

  public readonly data: unknown;

  constructor(
    codeOrMessage: ErrorCode,
    statusCode: number,
    message?: string,
    data: unknown = null
  ) {
    const hasExplicitCode = isStableErrorCode(codeOrMessage);
    super(hasExplicitCode ? message ?? codeOrMessage : codeOrMessage);
    this.name = new.target.name;
    this.code = hasExplicitCode
      ? codeOrMessage
      : defaultCodeForStatus(statusCode);
    this.statusCode = statusCode;
    this.data = data;
  }
}

const resolveCodeAndMessage = (
  defaultCode: ErrorCode,
  defaultMessage: string,
  codeOrMessage?: ErrorCode,
  message?: string
) => {
  if (!codeOrMessage) {
    return { code: defaultCode, message: defaultMessage };
  }

  return isStableErrorCode(codeOrMessage)
    ? { code: codeOrMessage, message: message ?? defaultMessage }
    : { code: defaultCode, message: codeOrMessage };
};

export class ValidationError extends AppError {
  constructor(
    errors: Record<string, string>,
    code: ErrorCode = ERROR_CODES.VALIDATION_ERROR,
    message = "Données invalides"
  ) {
    super(code, 400, message, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    codeOrMessage?: ErrorCode,
    message = "Non autorisé"
  ) {
    const resolved = resolveCodeAndMessage(
      ERROR_CODES.UNAUTHORIZED,
      message,
      codeOrMessage,
      message
    );
    super(resolved.code, 401, resolved.message);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    codeOrMessage?: ErrorCode,
    message = "Accès interdit"
  ) {
    const resolved = resolveCodeAndMessage(
      ERROR_CODES.FORBIDDEN,
      message,
      codeOrMessage,
      message
    );
    super(resolved.code, 403, resolved.message);
  }
}

export class NotFoundError extends AppError {
  constructor(
    codeOrMessage?: ErrorCode,
    message = "Ressource introuvable"
  ) {
    const resolved = resolveCodeAndMessage(
      ERROR_CODES.NOT_FOUND,
      message,
      codeOrMessage,
      message
    );
    super(resolved.code, 404, resolved.message);
  }
}

export class ConflictError extends AppError {
  constructor(
    codeOrMessage?: ErrorCode,
    message = "Conflit avec l'état actuel de la ressource"
  ) {
    const resolved = resolveCodeAndMessage(
      ERROR_CODES.CONFLICT,
      message,
      codeOrMessage,
      message
    );
    super(resolved.code, 409, resolved.message);
  }
}

# Backend Types Organization

This directory contains all TypeScript types for the Innovastay backend, organized by their purpose and usage.

## Structure

```
types/
├── index.ts                 # Main exports
├── custom.d.ts             # Custom Express request types
├── models/                 # Database model interfaces
│   ├── index.ts
│   ├── user.ts
│   ├── place.ts
│   ├── event.ts
│   ├── category.ts
│   ├── subCategory.ts
│   └── placeCategory.ts
├── api/                    # Frontend-like API types
│   ├── index.ts
│   ├── common.ts
│   ├── user.ts
│   ├── place.ts
│   ├── event.ts
│   └── category.ts
├── requests/               # API request types
│   ├── index.ts
│   ├── common.ts
│   └── auth.ts
├── responses/              # API response types
│   ├── index.ts
│   └── common.ts
└── utils/                  # Utility types
    ├── index.ts
    ├── s3.ts
    ├── jwt.ts
    ├── validation.ts
    └── database.ts
```

## Type Categories

### 1. Models (`/models`)

**Purpose**: Database schema interfaces that extend Mongoose Document
**Usage**: Used in model files and database operations
**Example**: `IUser`, `IPlace`, `IEvent`

### 2. API (`/api`)

**Purpose**: Frontend-like interfaces for API responses
**Usage**: Used in controllers to type response data sent to frontend
**Example**: `User`, `Place`, `Event` (without Document extension)

### 3. Requests (`/requests`)

**Purpose**: Request body and query parameter interfaces
**Usage**: Used in controllers and validation middleware
**Example**: `LoginRequest`, `CreatePlaceRequest`

### 4. Responses (`/responses`)

**Purpose**: Standardized API response interfaces
**Usage**: Used in controllers to ensure consistent response structure
**Example**: `APIResponse<T>`, `PaginatedResponse<T>`

### 5. Utils (`/utils`)

**Purpose**: Utility and helper type interfaces
**Usage**: Used in utility functions and services
**Example**: `JWTPayload`, `ValidationResult`

## Usage Examples

### In Controllers

```typescript
import { CustomRequest } from "../types/custom";
import { IUser } from "../types/models/user";
import { User } from "../types/api/user";
import { APIResponse } from "../types/responses/common";

const getUser = async (req: CustomRequest, res: Response): Promise<void> => {
  const user: IUser = await User.findById(req.user?.id);
  const userResponse: User = {
    _id: user._id.toString(),
    username: user.username,
    // ... other fields
  };

  APIResponse(res, userResponse, "User found", 200);
};
```

### In Models

```typescript
import { IUser } from "../types/models/user";

const userSchema = new Schema<IUser>({
  // schema definition
});
```

### In Middleware

```typescript
import { ValidationResult } from "../types/utils/validation";

const validateRequest = (data: any): ValidationResult => {
  // validation logic
};
```

## Key Differences from Frontend Types

1. **Model Types**: Include Mongoose Document properties (`_id`, `createdAt`, `updatedAt`)
2. **API Types**: Use string IDs instead of ObjectId references
3. **Request Types**: Include validation and parsing helpers
4. **Response Types**: Include HTTP status codes and error handling

## Best Practices

1. **Import from specific files**: Don't use wildcard imports from index files
2. **Use appropriate types**: Use model types for database operations, API types for responses
3. **Keep types focused**: Each type file should have a single responsibility
4. **Document complex types**: Add JSDoc comments for complex interfaces
5. **Maintain consistency**: Follow naming conventions (I prefix for models, no prefix for API types)

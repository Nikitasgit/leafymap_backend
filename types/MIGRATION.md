# Type Organization Migration Guide

This guide helps you migrate from the old type organization to the new structured approach.

## Before (Old Structure)

```typescript
// Old imports
import { IUser } from "../models/User";
import { IPlace } from "../models/Place";
import { CustomRequest } from "../types/custom";
```

## After (New Structure)

```typescript
// New imports
import { IUser } from "../types/models/user";
import { IPlace } from "../types/models/place";
import { CustomRequest } from "../types/custom";
import { User } from "../types/api/user";
import { Place } from "../types/api/place";
```

## Migration Steps

### 1. Update Model Files

**Before:**

```typescript
// models/User.ts
interface IUser extends Document {
  // interface definition
}
```

**After:**

```typescript
// models/User.ts
import { IUser } from "../types/models/user";

const userSchema = new Schema<IUser>({
  // schema definition
});
```

### 2. Update Controllers

**Before:**

```typescript
// controllers/userController.ts
import { IUser } from "../models/User";

const getUser = async (req: Request, res: Response) => {
  const user: IUser = await User.findById(id);
  res.json(user);
};
```

**After:**

```typescript
// controllers/userController.ts
import { IUser } from "../types/models/user";
import { User } from "../types/api/user";
import { APIResponse } from "../types/responses/common";

const getUser = async (req: Request, res: Response) => {
  const user: IUser = await User.findById(id);
  const userResponse: User = {
    _id: user._id.toString(),
    username: user.username,
    // ... map other fields
  };
  APIResponse(res, userResponse, "User found", 200);
};
```

### 3. Update Middleware

**Before:**

```typescript
// middlewares/auth.ts
import { IUser } from "../models/User";
```

**After:**

```typescript
// middlewares/auth.ts
import { IUser } from "../types/models/user";
import { JWTPayload } from "../types/utils/jwt";
```

### 4. Update Validation

**Before:**

```typescript
// validations/authValidations.ts
// No specific types
```

**After:**

```typescript
// validations/authValidations.ts
import { LoginRequest, RegisterRequest } from "../types/requests/auth";
import { ValidationResult } from "../types/utils/validation";

const validateLogin = (data: any): ValidationResult => {
  // validation logic
};
```

## Common Migration Patterns

### 1. Database Operations

Use model types (`IUser`, `IPlace`, etc.)

### 2. API Responses

Use API types (`User`, `Place`, etc.)

### 3. Request Validation

Use request types (`LoginRequest`, `CreatePlaceRequest`, etc.)

### 4. Utility Functions

Use utility types (`JWTPayload`, `ValidationResult`, etc.)

## Benefits of New Structure

1. **Clear Separation**: Model types vs API types
2. **Better Type Safety**: Specific types for different use cases
3. **Easier Maintenance**: Organized by purpose
4. **Consistent Patterns**: Standardized approach across the codebase
5. **Better Documentation**: Self-documenting structure

## Testing the Migration

1. Update imports in one file at a time
2. Run TypeScript compiler to check for errors
3. Test the specific functionality
4. Move to the next file

## Rollback Plan

If issues arise, you can temporarily revert to the old structure by:

1. Keeping the old interface definitions in model files
2. Using the old import paths
3. Gradually migrating files one by one

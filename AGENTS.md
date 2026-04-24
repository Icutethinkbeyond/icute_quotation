# AGENTS.md

## Before Started

Read the prisma.schema 

## API Development Rules

This project uses a centralized API service architecture.

All API calls must follow these rules strictly.

## Image Upload Rules (Cloudinary)

This project uses a centralized image upload system for Service images.

All image uploads must follow these rules strictly. At /api/*


---

## Core Rule

Use only the shared utility functions below:

import { deleteImage, handleImageUpload } from "@/services/utils/Cloudinary";

can use handleImageUpload for upload

if it's have error can use deleteImage()

and this is pattern \src\app\api\store\services\route.ts

---

## Core Rule

Create API modules only inside:


/src/ApiServices/

HTTP Request Standard

All requests must use the global API service only:

import APIServices from "../utils/ApiServices";

## Do not use:

fetch()
axios directly
any custom HTTP instance outside APIServices
File Naming Rule

## When creating a new service file, use:

[serviceName]API.ts

Examples:

UserAPI.ts
BookingAPI.ts
ProductAPI.ts
AuthAPI.ts
Next.js Page Structure Rule

Whenever creating a new page, always separate reusable UI components from page.tsx.

## Do not place large UI logic directly inside:

/app/.../page.tsx

Instead:

/app/users/page.tsx
/components/users/UserPage.tsx
/components/users/UserForm.tsx
/components/users/UserTable.tsx
page.tsx Responsibility

Keep page.tsx minimal.

Example:

## mport UserPage from "@/components/users/UserPage";

export default function Page() {
  return <UserPage />;
}
Component Rules

## Create reusable components for:

Forms
Tables
Dialogs
Cards
Filters
Sections
Layout blocks

## Clean Code Rules

Keep business logic outside page files
Reuse components whenever possible
Separate API logic from UI logic
Use TypeScript types/interfaces
Keep folder structure organized
Summary

## Always follow:

API files only in /src/ApiServices/
Use APIServices only
Name files [serviceName]API.ts
Separate components from page.tsx
Build reusable components
Keep code scalable and maintainable

---

## API Route Method Rules

Every API route file must use only standard HTTP methods below:

GET
POST
PUT
PATCH
DELETE

### Do not use custom method names or misuse method purposes.

Allowed Usage
Method	Purpose
GET	Read / Fetch data
POST	Create new data
PUT	Replace full data
PATCH	Update partial data
DELETE	Remove data
Strict Rules
GET

### Use only for reading data.

Allowed:

GET /api/service
GET /api/service/:id

### Forbidden:

Create data
Update data
Delete data

### Wrong Example:

GET /api/create-service
POST

### Use only for creating new records.

Allowed:

POST /api/service
POST /api/booking

### Forbidden:

Fetch data
Delete data
PUT

### Use for replacing all fields of existing data.

Allowed:

PUT /api/service/:id

Use when sending complete object.

PATCH

Use for partial updates.

Allowed:

PATCH /api/service/:id
PATCH /api/user/status

Examples:

update status
update price
update active flag
DELETE

Use only for deleting records.

Allowed:

DELETE /api/service/:id

Forbidden:

Update data
Read data
Folder Naming Rules

### API folders can be named by feature name.

Examples:

/app/api/service/route.ts
/app/api/booking/route.ts
/app/api/employee/route.ts
/app/api/store/route.ts
/app/api/package/route.ts

Nested feature allowed:

/app/api/service/[id]/route.ts
/app/api/booking/calendar/route.ts
/app/api/store/settings/route.ts

### Use meaningful feature names only.

Forbidden Patterns

Do NOT create routes like:

/api/getServiceData
/api/createBooking
/api/updateUser
/api/deleteStore

Use REST structure instead:

GET    /api/service
POST   /api/booking
PATCH  /api/user/:id
DELETE /api/store/:id
One Route File Rule

### Each route.ts may contain only needed HTTP methods.

Example:

export async function GET() {}
export async function POST() {}
export async function PATCH() {}

### Do not place unrelated business logic in same route.

Result

### Benefits:

Clean REST API structure
Easy frontend integration
Predictable endpoints
Easier maintenance
Standardized backend architecture


---

## Shared API Utility Rules

To keep project structure clean, reusable, and maintainable, all repeated API route logic must be extracted into shared utility files.

Do not duplicate common logic inside multiple `route.ts` files.

---

## Core Rule

Reusable functions for API routes must be stored only inside:

/src/services/api/
/src/services/utils/

### Use clear names based on responsibility.

Recommended Structure
/src/services/api/
  auth.ts
  response.ts
  pagination.ts
  validation.ts
  permission.ts
  transaction.ts

/src/services/utils/
  Cloudinary.ts
  formatter.ts
  date.ts
  string.ts
  number.ts

### Naming Rules

Use names by feature or responsibility.

Examples:

File Name	Responsibility
auth.ts	token / current user
permission.ts	role access control
response.ts	success / error response
validation.ts	body validation
pagination.ts	page / limit / skip
transaction.ts	prisma transaction helpers
date.ts	date formatting
formatter.ts	transform response data

Avoid generic names like:

helper.ts
common.ts
misc.ts
temp.ts
utils2.ts
Required Reuse Targets

### The following repeated logic must be extracted:

Authentication
getCurrentUserAndStoreIdsByToken()
Role Permission
requireRole()
denyRole()
Standard Response
successResponse()
errorResponse()
forbiddenResponse()
notFoundResponse()
Validation
validateRequiredFields()
validateNumber()
validateUUID()
Pagination
getPaginationParams()
buildPaginationMeta()
Prisma Helpers
safeTransaction()
softDelete()
Route File Responsibility Rule

Each route.ts should only contain:

Receive request
Call utility functions
Call database logic
Return response

### Keep route files thin and readable.

Good Example

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  requireAdmin(user);

  const body = await req.json();
  validateCreateService(body);

  const result = await createService(body);

  return successResponse(result);
}

Bad Example

Do NOT place all logic in one route:

export async function POST() {
  // auth 80 lines
  // validation 100 lines
  // formatter 50 lines
  // duplicate response 30 lines
}


###  Design Principles

Follow these principles:

Single Responsibility Principle

One file should do one thing well.

DRY (Don't Repeat Yourself)

If logic appears 2+ times, move to shared utility.

Separation of Concerns

Split auth, validation, response, business logic.

### Readability First

New developers should understand structure quickly.

Service Layer Rule

Complex database/business logic should move into service files:

/src/services/modules/serviceService.ts
/src/services/modules/bookingService.ts
/src/services/modules/userService.ts

Example:

createService()
updateService()
deleteService()
getServiceList()

Route calls service layer only.

### Response Standardization

Use one response format everywhere:

{
  success: true,
  message: "Success",
  data: {}
}

Error:

{
  success: false,
  message: "Unauthorized"
}

Forbidden

Do NOT:

Duplicate auth logic in every route
Duplicate try/catch responses
Put 300+ lines in route.ts
Mix formatter + validation + DB in same file
Use unclear utility names
Result

### Benefits:

Reusable code
Clean route files
Easier testing
Faster development
Lower bug risk
Scalable architecture
Professional project structure
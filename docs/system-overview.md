# Darun Nazaat — System Documentation

## Overview

Darun Nazaat is a madrasa management system built with:
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Hono.js mounted at `/api/v1` inside Next.js route handlers
- **Database**: MongoDB via Mongoose
- **Auth**: JWT (stored in HTTP-only cookies)

All API endpoints live under `/api/v1/`.

---

## Money Handling

All monetary values are stored as **integer paisa** (100 paisa = 1 taka) in the database.

| Context | Format |
|---|---|
| Database | Integer paisa (e.g., `3333` = 33.33) |
| API input | Decimal taka string or number (e.g., `"33.33"` or `33.33`) |
| API output | Integer paisa |
| UI display | English decimal string via `toMoney()` (e.g., `"33.33"`) |

**Utilities** (`lib/money.ts`):
```ts
toMoney(paisa: number): string       // 3333 → "33.33"
fromMoney(input: string | number): number  // "33.33" → 3333
moneyInputSchema                     // Zod schema: accepts "33.33" or 33.33, transforms to paisa
optionalMoneyInputSchema             // Same, nullable
```

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| `super_admin` | Full access to everything |
| `admin` | Full access to everything |
| `staff` | Read-only on student/guardian/class data; can update own profile |
| `guardian` | Own profile + own students' data + online payment |

---

## Modules

### 1. Class (`/api/v1/classes`)

Admin-managed list of classes (no sections). Used to categorize students.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/classes` | Any authenticated | List all classes |
| POST | `/classes` | Admin only | Create a class |
| GET | `/classes/:id` | Any authenticated | Get single class |
| PATCH | `/classes/:id` | Admin only | Update class |
| DELETE | `/classes/:id` | Admin only | Soft-delete class |

**Class fields**: `name` (unique), `description`, `order` (for sorting)

---

### 2. Guardian (`/api/v1/guardians`)

Guardians must be registered first, then linked to students at admission.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/guardians` | Admin/Staff | List all guardians |
| POST | `/guardians` | Admin only | Create guardian |
| GET | `/guardians/:id` | Admin/Staff | Get single guardian |
| PATCH | `/guardians/:id` | Admin only | Update guardian |
| GET | `/guardians/me` | Guardian only | Own profile |
| PATCH | `/guardians/me` | Guardian only | Update own profile |
| GET | `/guardians/me/students` | Guardian only | Own students list |

**Auto-generated ID**: `GRD-YYYY-NNNN` (race-safe via Counter collection)

**Guardian fields**: `guardianId`, `userId`, `fullName`, `gender`, `phone`, `bloodGroup`, `photo`, `nid`, `alternativePhone`, `whatsApp`, `occupation`, `monthlyIncome`, `address`

**Own profile update** (guardian): `photo`, `phone`, `alternativePhone`, `whatsApp`, `occupation`, `address`

---

### 3. Staff (`/api/v1/staffs`)

Staff can view all student/guardian data but cannot access finance. Can update their own profile.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/staffs` | Admin/Staff | List all staff |
| POST | `/staffs` | Admin only | Create staff |
| GET | `/staffs/:id` | Admin/Staff | Get single staff |
| PATCH | `/staffs/:id` | Admin only | Update staff |
| PATCH | `/staffs/me` | Staff only | Update own profile |

**Auto-generated ID**: `STF-YYYY-NNNN`

**Staff fields**: `staffId`, `userId`, `fullName`, `dateOfBirth`, `gender`, `bloodGroup`, `photo`, `nid`, `designation`, `department`, `branches` (array — staff can be in multiple branches), `baseSalary`, `joinDate`, `address`, `permanentAddress`, `alternativePhone`, `whatsApp`, `qualifications`, `emergencyContact`

**Own profile update** (staff): `photo`, `alternativePhone`, `whatsApp`, `address`, `permanentAddress`, `emergencyContact`

---

### 4. Student (`/api/v1/students`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/students` | Admin/Staff | List students (filterable) |
| POST | `/students` | Admin only | Admit student |
| GET | `/students/:id` | Admin/Staff | Get single student |
| PATCH | `/students/:id` | Admin only | Update student |
| DELETE | `/students/:id` | Admin only | Soft-delete student |

**Auto-generated ID**: `STU-YYYY-NNNN`

**Student filters**: `branch`, `classId`, `sessionId`, `guardianId`, `isActive`, `search`

**Fee fields** (all stored as paisa):
- `admissionFee`, `monthlyFee`, `examFee`
- `isDaycare: boolean`, `daycareFee`
- `creditBalance` (overpayment carryover)

**Note**: Student creation also creates an Enrollment record atomically (transaction).

---

### 5. Invoice (`/api/v1/invoices`)

Monthly invoices generated explicitly by admin (Option B: admin selects month + year).

**Invoice types**: `monthly`, `admission`, `exam_fee`, `other`

**Idempotency**: Unique index on `(studentId + invoiceType + periodYear + periodMonth)` prevents duplicates.

**Invoice number**: Auto-generated `INV-YYYY-NNNN`.

---

### 6. Payment (`/api/v1/payments`)

Admin can receive payments with optional discount/due (partial payment allowed).

**Payment sources**: `admin` (manual), `guardian_online` (bKash/Nagad)

**Payment methods**: `cash`, `bank`, `bkash`, `nagad`

**Receipt number**: Auto-generated `RCP-YYYY-NNNN`.

---

### 7. Online Payment — Guardian Portal

Guardian selects a student → selects unpaid invoices → initiates bKash/Nagad payment.

**Per-student cart**: Each payment transaction covers one student. If guardian has multiple children, they pay separately per child.

**Guardian constraint**: Must pay full invoice amount (no partial/discount). Discount is admin-only.

---

## Shared Patterns

### Base Schema Fields (`modules/shared/base-schema.ts`)

Every schema includes:
```ts
isDeleted: Boolean   // soft delete flag
deletedAt: Date
deletedBy: ObjectId
deleteReason: String
createdBy: ObjectId
updatedBy: ObjectId
```

### Auto-generated IDs (`modules/shared/numbering/service.ts`)

Race-safe via MongoDB `Counter` collection:
```ts
nextNumber("STU", 2025)  // → "STU-2025-0001"
nextNumber("STF", 2025)  // → "STF-2025-0001"
nextNumber("GRD", 2025)  // → "GRD-2025-0001"
nextNumber("INV", 2025)  // → "INV-2025-0001"
nextNumber("RCP", 2025)  // → "RCP-2025-0001"
```

### Audit Log Plugin (`modules/shared/audit-log/plugin.ts`)

Applied to every schema. Records every create/update in an `AuditLog` collection with `action`, `entityType`, `entityId`, `changedBy`, `before`, `after`.

### Error Helpers (`server/error/index.ts`)

```ts
badRequestError(c, { message })   // 400
serverError(c, err)                // 500
notFoundError(c)                   // 404
schemaValidationError(zodError)    // formats Zod errors
```

### Module Router (`modules/shared/hono.ts`)

```ts
import { createRouter } from "@/modules/shared/hono";
const router = createRouter();
```

---

## Branch System

Two branches:
- `balika` — Girls branch
- `balok` — Boys branch

Staff can belong to multiple branches. Students belong to exactly one branch.

---

## Directory Structure

```
modules/
  class/          schema, service, routes
  guardian/       schema, service, routes
  staff/          schema, service, routes
  student/        schema, service, routes
  invoice/        schema, service, routes
  payment/        schema, service, routes
  session/        schema, service, routes
  enrollment/     schema, service, routes
  salary/         schema, service, routes
  exam/           schema, service, routes
  shared/
    audit-log/    plugin, schema, routes
    base-schema/  baseFields
    hono/         createRouter
    numbering/    nextNumber (Counter)

server/
  config/         db.ts (MongoDB connect)
  middlewares/    auth.middleware.ts
  error/          index.ts

lib/
  money.ts        toMoney, fromMoney, moneyInputSchema
  grading.ts      grade computation

validations/
  index.ts        shared Zod schemas & enums
  student.ts      student-specific validation

app/
  api/[...route]/ route.ts — Hono app, all routes wired here
  (protected)/    Next.js protected pages
```

---

## Environment Variables

```env
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_DOMAIN=
```

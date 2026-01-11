# User Role Management Guide

## Overview

The system supports three user roles:
- **Viewer**: Read-only access to assigned/public/organization videos
- **Editor**: Can upload, edit, and manage video content
- **Admin**: Full system access including user management

## How Roles Are Assigned

### 1. During Registration (Automatic)

When a user registers:

- **First member of a new organization** → Automatically gets `admin` role
- **Joining an existing organization** → Automatically gets `editor` role

**Example Registration Flow:**
```javascript
// First user creates organization "Acme Corp"
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@acme.com",
  "password": "password123",
  "organizationName": "Acme Corp"
}
// Result: User gets 'admin' role

// Second user joins "Acme Corp"
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "password": "password123",
  "organizationName": "Acme Corp"
}
// Result: User gets 'editor' role
```

### 2. Admin Creates User (Manual - Admin Only)

Admins can create users with any role directly:

**API Endpoint:**
```javascript
POST /api/users
Headers: Authorization: Bearer <admin_token>
Body: {
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "viewer" // or "editor" or "admin"
}
```

**Example using Frontend API:**
```typescript
import { userApi } from "@shared/api";

// Create a viewer
await userApi.createUser({
  name: "Viewer User",
  email: "viewer@example.com",
  password: "password123",
  role: "viewer"
});

// Create an editor
await userApi.createUser({
  name: "Editor User",
  email: "editor@example.com",
  password: "password123",
  role: "editor"
});

// Create an admin
await userApi.createUser({
  name: "Admin User",
  email: "admin@example.com",
  password: "password123",
  role: "admin"
});
```

### 3. Admin Updates Existing User Role

Admins can change any user's role (except their own):

**API Endpoint:**
```javascript
PUT /api/users/:userId/role
Headers: Authorization: Bearer <admin_token>
Body: {
  "role": "editor" // or "viewer" or "admin"
}
```

**Example using Frontend API:**
```typescript
import { userApi } from "@shared/api";

// Change user role to editor
await userApi.updateUserRole("userId123", "editor");

// Change user role to viewer
await userApi.updateUserRole("userId123", "viewer");

// Change user role to admin
await userApi.updateUserRole("userId123", "admin");
```

## Role Permissions Summary

### Viewer Role
- ✅ View videos (own, public, organization-level)
- ❌ Cannot upload videos
- ❌ Cannot edit videos
- ❌ Cannot delete videos
- ❌ Cannot manage users

### Editor Role
- ✅ View videos (all in organization)
- ✅ Upload videos
- ✅ Edit videos (own + organization videos)
- ✅ Delete videos (own + organization videos)
- ❌ Cannot manage users

### Admin Role
- ✅ All Editor permissions
- ✅ Manage users (create, update, delete)
- ✅ Change user roles
- ✅ Activate/deactivate users
- ✅ View all organization data

## Security Rules

1. **Organization Owner Protection**: The organization owner (first admin) cannot:
   - Have their role changed from 'admin'
   - Be deactivated
   - Be deleted

2. **Self-Protection**: Users cannot:
   - Change their own role
   - Deactivate their own account
   - Delete their own account

3. **Organization Isolation**: Users can only:
   - Manage users in their own organization
   - Access videos from their own organization

## Example: Complete User Management Flow

```typescript
// 1. Admin creates a new viewer
const viewer = await userApi.createUser({
  name: "Content Viewer",
  email: "viewer@company.com",
  password: "secure123",
  role: "viewer"
});

// 2. Later, promote viewer to editor
await userApi.updateUserRole(viewer.user.id, "editor");

// 3. Even later, promote to admin
await userApi.updateUserRole(viewer.user.id, "admin");

// 4. Or demote back to viewer
await userApi.updateUserRole(viewer.user.id, "viewer");

// 5. Deactivate user (instead of deleting)
await userApi.updateUserStatus(viewer.user.id, false);

// 6. Reactivate user
await userApi.updateUserStatus(viewer.user.id, true);

// 7. Delete user (if needed)
await userApi.deleteUser(viewer.user.id);
```

## Frontend Implementation

The Navigation component automatically shows/hides features based on role:

- **Viewer**: Sees Dashboard, Library only
- **Editor**: Sees Dashboard, Library, Upload
- **Admin**: Sees Dashboard, Library, Upload, Users

## Testing Roles

### Test as Viewer:
1. Create user with `role: "viewer"`
2. Login with that user
3. Verify: Upload button is hidden, cannot access user management

### Test as Editor:
1. Create user with `role: "editor"`
2. Login with that user
3. Verify: Can upload videos, cannot access user management

### Test as Admin:
1. Create user with `role: "admin"` OR register as first user in organization
2. Login with that user
3. Verify: Can upload videos, can access user management

## Notes

- All new users created by admins are automatically added to the admin's organization
- Users cannot switch organizations (organization is set during registration/creation)
- Role changes take effect immediately (no logout required)
- The first user in an organization is automatically set as the organization owner

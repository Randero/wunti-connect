

## Analysis

After thoroughly reviewing the database, RLS policies, triggers, and application code, here are the issues found:

### Issue 1: Moderators Cannot Access All Posts
The `user_posts` table has an "Admins can manage all posts" policy using `is_admin_or_manager()`, which only checks for `admin` and `manager` roles. **Moderators (role='moderator') are excluded**, so the Moderator Dashboard cannot see or manage any user posts except their own. Same issue applies to `user_analytics` and `user_levels`.

### Issue 2: Duplicate Profiles SELECT Policy (Security)
The `profiles` table has two SELECT policies:
- "Users can only read their own profile data" -- `user_id = auth.uid() OR is_admin()`
- "Users can view all profiles" -- `true`

The second policy makes the first irrelevant, exposing all profile data (emails, phone numbers) to anyone authenticated. We should remove the overly permissive one and instead allow admins/managers/moderators to read all profiles (needed for dashboards).

### Issue 3: Overly Permissive INSERT Policies
`user_analytics`, `user_levels`, and `contact_submissions` have `WITH CHECK (true)` INSERT policies, which the linter flagged. These are used by the `initialize_user_data` trigger (which runs as SECURITY DEFINER), so the open INSERT policies are unnecessary for regular users.

### Triggers Status
Both `handle_new_user` and `initialize_user_data` triggers exist and are attached to `auth.users` -- these are working correctly.

---

## Plan

### Step 1: Create `is_admin_or_manager_or_moderator()` function
A new security definer function that checks for admin, manager, OR moderator roles. This will be used in policies where moderators need access.

### Step 2: Fix RLS Policies

**user_posts table:**
- Drop "Admins can manage all posts" policy
- Create new "Staff can manage all posts" using `is_admin_or_manager_or_moderator()`

**profiles table:**
- Drop "Users can view all profiles" (the `true` one)
- Update "Users can only read their own profile data" to allow admins, managers, and moderators to read all profiles

**user_analytics & user_levels tables:**
- Update admin policies to include moderators
- Tighten INSERT policies to use `auth.uid() = user_id` instead of `true`

**contact_submissions table:**
- Tighten INSERT policy to validate email format instead of blanket `true`

### Step 3: No Code Changes Needed
The application code already correctly checks for `isModerator` and `isManager` in the frontend. Once RLS policies allow moderators to query all posts and profiles, the Moderator Dashboard will work.

### Summary of SQL Migration
```text
1. CREATE FUNCTION is_admin_or_manager_or_moderator()
2. Fix user_posts: staff can manage all posts
3. Fix profiles: remove "true" SELECT, update to include moderators
4. Fix user_analytics: include moderators, tighten INSERT
5. Fix user_levels: include moderators, tighten INSERT
```


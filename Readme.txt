# ROLE

You are a Senior Full Stack Software Engineer, UI/UX Engineer, and Software Architect.

Your responsibility is to design and build a production-ready discussion forum web application using modern software engineering principles.

You must always prioritize:

* Clean Architecture
* Modular code
* Scalability
* Reusability
* Maintainability
* Performance
* Security
* Responsive Design

Do not generate placeholder code, dummy implementations, or TODO comments. Every feature should be fully implemented.

---

# TECHNOLOGY STACK

Frontend

* React.js
* React Router DOM
* Vite
* JavaScript (ES6+)
* Tailwind CSS
* React Hook Form
* Zod Validation
* TanStack Query (React Query)
* Axios
* React Hot Toast
* Lucide React Icons

Backend / Database

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Supabase Realtime

Deployment Ready

* Environment Variables
* Modular Configuration
* Production-ready folder structure

---

# PROJECT

Project Name

Forum Discussion Platform

Theme

Modern Community Discussion Forum

Inspiration

* Reddit
* Stack Overflow
* Discourse

The design should be modern, clean, minimal, and responsive.

Primary Color

Blue

Secondary Color

Gray

Background

White

---

# APPLICATION FLOW

Landing Page (Dashboard)

↓

Click "Masuk Forum"

↓

Forum Page

↓

Thread Detail

↓

Comment Section

↓

Reply Comment

↓

User Profile

↓

Notification

↓

Admin Dashboard

---

# PAGE REQUIREMENTS

## 1. Dashboard

This is the first page users see.

Components:

* Navbar
* Hero Section
* Website Introduction
* CTA Button ("Masuk Forum")
* Website Statistics

  * Total Users
  * Total Threads
  * Total Comments
* Trending Threads
* Latest Threads
* Categories
* Footer

---

## 2. Authentication

Pages:

* Login
* Register
* Forgot Password
* Reset Password

Authentication must use Supabase Auth.

Support:

* Email & Password
* Remember Session
* Email Verification
* Protected Routes

---

## 3. Forum Page

Display all discussion threads.

Features:

* Search Thread
* Category Filter
* Sort

  * Newest
  * Oldest
  * Most Popular
  * Most Viewed
  * Unanswered
* Pagination or Infinite Scroll

Each Thread Card contains:

* Title
* Short Description
* Category
* Author
* User Avatar
* Created Date
* Total Comments
* Total Likes
* Total Views

Actions:

* Open Thread
* Like
* Bookmark

Floating Action Button

Create Thread

---

## 4. Create Thread

Fields

* Title
* Category
* Tags
* Rich Text Content
* Image Upload
* Publish

Image upload must use Supabase Storage.

---

## 5. Thread Detail

Display

* Thread Title
* Author
* Category
* Tags
* Created Date
* Updated Date
* View Count
* Like Count
* Bookmark Count
* Thread Content
* Images

Actions

* Like
* Bookmark
* Report
* Share

---

## 6. Comments

Support:

* Nested Replies
* Unlimited Reply Depth
* Like Comment
* Edit Own Comment
* Delete Own Comment
* Report Comment

Sorting:

* Newest
* Oldest
* Most Liked

Rich Text Comment Input

---

## 7. User Profile

Display

* Avatar
* Username
* Bio
* Join Date
* Statistics

Tabs

* Threads
* Comments
* Bookmarks
* Settings

Users can:

* Update Profile
* Change Avatar
* Update Bio

---

## 8. Notifications

Realtime notifications using Supabase Realtime.

Notify users when:

* Someone comments on their thread
* Someone replies to their comment
* Someone likes their thread
* Someone mentions them

---

## 9. Admin Dashboard

Admin can manage:

Users

Threads

Comments

Categories

Reports

Statistics

Dashboard should display:

* Total Users
* Total Threads
* Active Users
* Total Comments
* Reported Posts

---

# DATABASE DESIGN

Create a normalized PostgreSQL schema in Supabase.

Tables:

profiles

roles

categories

threads

thread_tags

tags

comments

bookmarks

likes

notifications

reports

attachments

Each table must include:

* UUID primary key
* created_at
* updated_at

Use proper foreign keys and indexes.

Enable Row Level Security (RLS).

Create appropriate RLS policies for:

* Guest
* Authenticated User
* Admin

---

# STORAGE

Supabase Storage Buckets

avatars/

thread-images/

attachments/

Users may upload:

* Profile Image
* Thread Image
* Attachments

---

# FOLDER STRUCTURE

src/

assets/

components/

features/

hooks/

layouts/

pages/

routes/

services/

supabase/

contexts/

utils/

constants/

types/

styles/

App.jsx

main.jsx

Every feature must be isolated inside its own module.

---

# REUSABLE COMPONENTS

Create reusable UI components:

Navbar

Sidebar

Footer

Thread Card

Comment Card

Profile Card

Avatar

Badge

Button

Modal

Dialog

Dropdown

Tabs

Pagination

Toast

Search Input

Loading Spinner

Skeleton Loader

Empty State

Error State

Confirmation Dialog

---

# ROUTING

Create React Router structure.

Example

/

/login

/register

/forum

/forum/:threadId

/profile/:username

/settings

/notifications

/admin

Use Protected Routes.

Redirect unauthorized users.

---

# STATE MANAGEMENT

Use:

TanStack Query

React Context

Custom Hooks

Do not duplicate business logic.

---

# FORM VALIDATION

Use:

React Hook Form

Zod

Validate every input.

Display validation errors clearly.

---

# RESPONSIVE DESIGN

Desktop

Tablet

Mobile

Sidebar should collapse on smaller screens.

Navbar should become mobile-friendly.

---

# PERFORMANCE

Lazy load pages.

Code splitting.

Memoize expensive components.

Optimize images.

Avoid unnecessary re-renders.

---

# ACCESS CONTROL

Guest

* View Dashboard
* View Threads
* Search Threads

User

* Create Thread
* Edit Own Thread
* Delete Own Thread
* Comment
* Reply
* Bookmark
* Like

Admin

* Manage Users
* Manage Threads
* Manage Comments
* Manage Categories
* View Reports

---

# SECURITY

Use Supabase Authentication.

Enable Row Level Security.

Validate all inputs.

Prevent XSS.

Prevent SQL Injection.

Sanitize Rich Text.

Secure file uploads.

---

# CODING STANDARDS

Follow best practices.

Use descriptive variable names.

Keep components small and reusable.

Separate UI from business logic.

Avoid duplicated code.

Use consistent folder naming.

Use consistent file naming.

Write clean and readable code.

---

# DEVELOPMENT PROCESS

Build the application incrementally.

Complete one feature before starting the next.

Recommended order:

1. Project setup
2. Folder structure
3. Supabase configuration
4. Authentication
5. Routing
6. Dashboard
7. Forum page
8. Thread detail
9. Comments
10. User profile
11. Notifications
12. Admin dashboard
13. Responsive optimization
14. Performance optimization
15. Final testing

Do not move to the next step until the current feature is fully functional.

---

# FINAL OUTPUT

The generated project must:

* Be production-ready.
* Run without compilation errors.
* Follow React best practices.
* Use Supabase correctly.
* Have a clean, modular architecture.
* Be responsive on all screen sizes.
* Be easy to extend with future features.
* Include a clear README with installation steps, environment variables, Supabase setup, and project structure.

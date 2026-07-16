# Forum Discussion Platform

Production-ready discussion forum built with **React + Vite + Supabase**.

## Tech Stack

- React.js + React Router
- Tailwind CSS
- React Hook Form + Zod
- TanStack Query
- Supabase Auth + PostgreSQL + Storage + Realtime
- Axios, Lucide React, React Hot Toast

## Quick Start

1. Install dependency:

```bash
npm install
```

2. Setup environment:

```bash
cp .env.example .env
```

Fill:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Run development server:

```bash
npm run dev
```

## Supabase Setup

1. Open Supabase SQL Editor.
2. Execute `supabase/schema.sql`.
3. Create storage buckets:
   - `avatars` (public)
   - `thread-images` (public)
   - `attachments` (public/private sesuai kebutuhan)
4. Enable Realtime for table `notifications`.

## Main Features

- Dashboard (stats, trending threads, latest, categories)
- Authentication (login, register, forgot/reset password)
- Forum list (search, category filter, sort, pagination)
- Create thread (rich text + image upload)
- Thread detail (like, bookmark, nested comments)
- User profile (threads, comments, bookmarks)
- Notification realtime
- Admin dashboard (stats, users, reports)
- Protected routes + role-based access

## Folder Structure

```txt
src/
  assets/
  components/
    common/
    editor/
    ui/
  constants/
  contexts/
  features/
    auth/
    forum/
  hooks/
  layouts/
  pages/
  routes/
  services/
  supabase/
  styles/
  types/
  utils/
  App.jsx
  main.jsx
supabase/
  schema.sql
```

## Supabase Database

Table yang digunakan:

- profiles
- roles
- categories
- threads
- thread_tags
- tags
- comments
- bookmarks
- likes
- notifications
- reports
- attachments

Semua table menggunakan UUID PK, `created_at`, `updated_at`, foreign key, index, trigger, dan RLS policy untuk **guest**, **authenticated user**, dan **admin**.

## Build Production

```bash
npm run build
npm run preview
```

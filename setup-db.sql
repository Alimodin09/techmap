-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create issue_reports table
create table public.issue_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  room_lab_number text not null,
  issue_type text not null,
  description text not null,
  status text check (status in ('Pending', 'Ongoing', 'Resolved')) default 'Pending',
  is_archived boolean default false,
  archived_at timestamp with time zone,
  deleted_at timestamp with time zone,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create issue_updates table (Optional)
create table public.issue_updates (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references public.issue_reports(id) on delete cascade not null,
  admin_id uuid references public.profiles(id) on delete cascade not null,
  old_status text,
  new_status text,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.issue_reports enable row level security;
alter table public.issue_updates enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
-- Note: Manually changing a user role to 'admin' requires using the SQL editor.

-- Issue Reports Policies
create policy "Anyone can view issue reports" on public.issue_reports for select using (true);
create policy "Authenticated users can create issue reports" on public.issue_reports for insert with check (auth.role() = 'authenticated');
create policy "Admins can update issue reports" on public.issue_reports for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Issue Updates Policies
create policy "Anyone can view issue updates" on public.issue_updates for select using (true);
create policy "Admins can create issue updates" on public.issue_updates for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MIGRATION: Phase 1 — New feature columns (safe to re-run)
-- Run these in the Supabase SQL Editor
-- ============================================================

-- Category System
alter table public.issue_reports
  add column if not exists category text;

-- Priority Level (defaults to Medium)
alter table public.issue_reports
  add column if not exists priority text default 'Medium';

-- Department / Area Filtering
alter table public.issue_reports
  add column if not exists department_area text;

-- Image Attachment
alter table public.issue_reports
  add column if not exists image_url text;

alter table public.issue_reports
  add column if not exists image_path text;

-- ============================================================
-- STORAGE: report-images bucket policies
-- Create the bucket first via Supabase Dashboard → Storage
-- Bucket name: report-images (set to Public)
-- Then run these policies:
-- ============================================================

-- Allow authenticated users to upload to report-images
create policy "Authenticated users can upload report images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'report-images');

-- Allow everyone to view report images
create policy "Anyone can view report images"
on storage.objects for select
to public
using (bucket_id = 'report-images');

-- Allow users to delete their own uploads
create policy "Users can delete own report images"
on storage.objects for delete
to authenticated
using (bucket_id = 'report-images' and auth.uid()::text = (storage.foldername(name))[1]);

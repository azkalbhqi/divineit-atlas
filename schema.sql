-- DDL Database Schema for DivineIT Atlas Portal
-- Run this in your Supabase SQL Editor to initialize the database tables and seed them.

-- 1. Drop existing tables if they exist (in dependency order)
DROP TABLE IF EXISTS project_time_logs CASCADE;
DROP TABLE IF EXISTS project_reports CASCADE;
DROP TABLE IF EXISTS project_expenses CASCADE;
DROP TABLE IF EXISTS project_links CASCADE;
DROP TABLE IF EXISTS project_users CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension in Postgres (built-in, but good practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  global_role VARCHAR(50) NOT NULL CHECK (global_role IN ('manager', 'staff')),
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Project Users (Roster Join table)
CREATE TABLE project_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_role VARCHAR(255) NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- 5. Create Project Links table
CREATE TABLE project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_board_url VARCHAR(2083) NOT NULL DEFAULT '',
  repository_url VARCHAR(2083) NOT NULL DEFAULT '',
  deployment_url VARCHAR(2083) NOT NULL DEFAULT '',
  design_files_url VARCHAR(2083) NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Project Expenses table
CREATE TABLE project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  cost_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Project Reports table
CREATE TABLE project_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evaluation TEXT NOT NULL
);

-- 8. Create Project Time Logs table (Added for work log tracking)
CREATE TABLE project_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC(6, 2) NOT NULL,
  description TEXT NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

# Confyde Drug Discovery Platform

A full-stack application for drug discovery research that enables scientists and researchers to manage projects and simulate various clinical trial scenarios.

## Technology Stack

- **Frontend**: Next.js 14+, React, TypeScript, Tailwind CSS, Radix UI components, Shadcn UI
- **Backend**: Next.js API routes (integrated within the Next.js project)
- **Database**: Supabase (PostgreSQL with authentication)
- **Architecture**: Monorepo with shared code and components

## Features

- Multi-tenant authentication system
- Project management for research teams
- Clinical trial scenario modeling
- Protocol elements management
- Schema visualization

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL scripts in the Supabase SQL editor to set up the database schema and Row Level Security (RLS) policies:

1. Execute the SQL script in `db/migrations/01_initial_schema.sql`

This script will:
- Create all required tables (companies, users, projects, scenarios)
- Set up Row Level Security policies for each table
- Add an initial company "Confyde Test"

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components
- `db/` - Database migration scripts and schema
- `lib/` - Shared utilities and libraries
- `public/` - Static assets
- `styles/` - Global styles and Tailwind configuration

## License

This project is proprietary and confidential.

## Contact

For more information, contact the project maintainers. 
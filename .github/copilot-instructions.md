# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a **Next.js fullstack application** with the following architecture:

- **Frontend**: React components with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes serving as Node.js backend
- **Database**: In-memory data storage (for demo purposes)
- **Styling**: Tailwind CSS for responsive design

## Key Technologies

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **API Routes** for backend functionality

## Code Style Guidelines

1. **Use TypeScript** for all new files
2. **Follow React functional components** with hooks
3. **Use Tailwind CSS** for styling instead of custom CSS
4. **Implement proper error handling** in API routes
5. **Use descriptive variable and function names** in Spanish/English
6. **Add proper TypeScript interfaces** for data structures

## Project Structure

```
src/
├── app/
│   ├── api/          # Backend API routes
│   │   ├── users/    # User CRUD operations
│   │   └── health/   # Health check endpoint
│   ├── layout.tsx    # Main layout
│   └── page.tsx      # Homepage
├── components/       # React components
│   ├── UserList.tsx  # User management component
│   └── ApiStatus.tsx # API health status component
├── lib/             # Utilities and API client
│   └── api.ts       # API client functions
└── types/           # TypeScript type definitions
    └── index.ts     # Main types
```

## API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user
- `DELETE /api/users?id={id}` - Delete user
- `GET /api/health` - Health check

## Development Notes

- The project uses **in-memory storage** for simplicity
- All components are **client-side rendered** (`'use client'`)
- **Error handling** is implemented throughout the application
- **Responsive design** is achieved with Tailwind CSS
- **Spanish language** is used for user-facing text

# Little Logbook Setup Guide

## 🎯 Overview

Little Logbook is a private pregnancy and baby website built with Next.js 14, TypeScript, and Supabase. It features atomic design principles, mobile-first responsive design, and role-based authentication with invite codes.

## ✅ What's Been Built

### Foundation
- ✅ Next.js 14 with TypeScript and App Router
- ✅ Atomic design component structure (atoms/molecules/organisms)
- ✅ Soft pastel design system with CSS custom properties
- ✅ Mobile-first responsive design
- ✅ Complete TypeScript type definitions

### Authentication System
- ✅ Supabase integration with SSR support
- ✅ Invite code authentication system
- ✅ Role-based access control (admin/family/friend)
- ✅ Google OAuth integration
- ✅ Mobile-responsive login/signup forms

### Core Components
- ✅ **Atoms**: Button, Input, Avatar, Badge
- ✅ **Organisms**: LoginForm, SignupForm, Header, UserManagement
- ✅ Admin user management panel
- ✅ Mobile navigation with hamburger menu

## 🚀 Setup Instructions

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the SQL schema in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase-schema.sql
   ```

3. Update your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Set Up Admin Account

1. **First signup**: Go to `/join` and create an account with `jackmanuelmanning@gmail.com`
2. **Promote to admin**: Run the seeding script:
   ```bash
   npm run seed:admin
   ```

This will:
- Promote Jack to admin role
- Create initial test invite codes (ADMIN1, FAMILY, FRIEND)

### 5. Test the Authentication Flow

1. **Sign out** and try the invite code flow
2. **Visit**: `/join/FAMILY` or `/join/FRIEND` 
3. **Create accounts** with different roles
4. **Test admin panel** at `/admin` to manage users and generate codes

## 🏗️ Architecture

### Design System
- **CSS Custom Properties**: Consistent theming across all components
- **Atomic Design**: Reusable components built from atoms → molecules → organisms
- **Mobile-First**: Every component designed for mobile, enhanced for desktop
- **Role-Based Colors**: Visual differentiation for admin/family/friend content

### Authentication Flow
```
Invite Link (yourdomain.com/join/ABC123) 
    ↓
Code Validation 
    ↓
User Registration 
    ↓
Role Assignment (automatic based on code)
    ↓
Profile Creation
```

### File Structure
```
src/
├── app/                    # Next.js 14 App Router pages
├── components/
│   ├── atoms/              # Button, Input, Avatar, Badge
│   ├── molecules/          # (planned: SearchBar, MediaCard, etc.)
│   └── organisms/          # LoginForm, SignupForm, Header, UserManagement
├── lib/                    # Supabase clients, auth utilities, admin functions
├── styles/                 # Design system CSS
└── types/                  # TypeScript definitions
```

## 📱 Mobile-First Features

- **Touch-optimized interfaces** (44px+ touch targets)
- **Responsive navigation** with hamburger menu
- **Adaptive layouts** that work on all screen sizes
- **Mobile gestures** and interactions
- **Fast loading** on mobile networks

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Role-based permissions** enforced at database level
- **Invite code expiration** and usage tracking
- **Secure authentication** with Supabase Auth
- **Protected routes** with middleware

## 🎨 Design System

### Colors
```css
--bg-primary: #FEFEFE        /* Off-white background */
--accent-family: #E8F4FD     /* Light blue for family */
--accent-friend: #FFF2E8     /* Light peach for friend */
--accent-admin: #F0F8F0      /* Light green for admin */
--success: #48BB78           /* Actions and admin elements */
```

### Component Variants
- **Buttons**: primary, secondary, outline, ghost, danger
- **Badges**: Role-based colors matching user types
- **Avatars**: Initials fallback with role-based backgrounds
- **Inputs**: Validation states, icons, textarea support

## ⚡ Development Workflow

### Adding New Components

1. **Create atomic component** in appropriate folder
2. **Include CSS Module** with mobile-first design
3. **Add TypeScript props interface**
4. **Export from index.ts**
5. **Build molecules/organisms** using existing atoms

### Testing Authentication

1. **Generate invite codes** in admin panel
2. **Test different roles** (friend, family, admin)
3. **Verify permissions** on protected routes
4. **Test mobile responsive** design

## 🔄 Next Development Phases

### Phase 2: Core Features
- [ ] Media upload and gallery system
- [ ] Timeline events and organization
- [ ] Help coordination dashboard
- [ ] Memory vault submissions

### Phase 3: Advanced Features
- [ ] Real-time updates
- [ ] Push notifications
- [ ] Advanced media organization
- [ ] Comment system

### Phase 4: Polish
- [ ] Performance optimization
- [ ] Progressive Web App features
- [ ] Analytics and insights
- [ ] Advanced admin tools

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**: Check environment variables
2. **Authentication redirects**: Verify Supabase callback URLs
3. **Role permissions**: Ensure RLS policies are applied
4. **Mobile layout issues**: Test CSS custom property support

### Development Tips

1. **Use mobile-first approach** for all new components
2. **Test with real devices** not just browser dev tools
3. **Follow atomic design principles** - build small, compose up
4. **Maintain TypeScript strict mode** for better code quality

## 📞 Support

The authentication system, admin panel, and mobile navigation are now complete and ready for use. The foundation is solid for building out the remaining features like gallery, timeline, and help systems.

**Key Features Working:**
- ✅ Complete authentication with invite codes
- ✅ Role-based access control
- ✅ Admin user management
- ✅ Mobile-responsive design throughout
- ✅ Type-safe development experience
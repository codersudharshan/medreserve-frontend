# MedReserve Frontend

A modern, responsive React + TypeScript frontend for the MedReserve healthcare appointment booking system. Built with Vite, Tailwind CSS, and Framer Motion for smooth animations.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)

## 🎯 Project Overview

MedReserve Frontend provides a beautiful, user-friendly interface for patients to:
- Browse available doctors
- Search and filter doctors by name or specialization
- View available appointment slots
- Book appointments with real-time confirmation
- View booking tickets with QR codes

The admin dashboard allows administrators to:
- Create new doctors
- Create appointment slots
- View statistics and analytics

## 🛠 Tech Stack

- **Framework**: React 19.2
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 7.10
- **Animations**: Framer Motion 12.23
- **Icons**: Lucide React 0.560
- **State Management**: React Context API

## ✨ Features

### Patient Features

1. **Hero Section**
   - Welcome banner with feature highlights
   - Smooth scroll to booking area
   - Responsive design

2. **Doctor Browsing**
   - List all available doctors
   - Search by name or specialization
   - Filter by specialization dropdown
   - Doctor cards with avatars (Dicebear)
   - Specialization badges with icons

3. **Slot Selection**
   - View available slots for selected doctor
   - Modern card design with time display
   - Duration information
   - Availability badges
   - Hover animations

4. **Booking Flow**
   - Simple booking form
   - Patient name and email collection
   - Real-time validation
   - Success ticket with QR code
   - Calendar export (.ics file)
   - Toast notifications

5. **Loading States**
   - Skeleton loaders for doctors
   - Skeleton loaders for slots
   - Smooth transitions

### Admin Features

1. **Dashboard**
   - Analytics cards (doctors, specializations, recent)
   - Visual statistics with icons

2. **Doctor Management**
   - Create new doctors
   - Name and specialization fields
   - Form validation
   - Success/error feedback

3. **Slot Management**
   - Create appointment slots
   - Doctor selection dropdown
   - DateTime picker
   - Duration input
   - Form validation

4. **Doctor List**
   - View all existing doctors
   - Grid layout
   - Specialization badges

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [Backend README](../MedReserve/README.md))

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MedReserve-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_BASE_URL=http://localhost:4000/api" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:4000/api
```

### Production Environment

For production (Vercel), set:
```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

- Hot Module Replacement (HMR) enabled
- Fast refresh on file changes
- Source maps for debugging

### Production Build

```bash
npm run build
```

Creates optimized production build in `dist/`:
- Minified JavaScript
- Optimized CSS
- Tree-shaking
- Code splitting

### Linting

```bash
npm run lint
```

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Connect your GitHub repository
   - Vercel will auto-detect Vite configuration
   - Add environment variable: `VITE_API_BASE_URL`

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`

4. **Build Settings** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Vercel Configuration

Create `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables for Vercel

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | Production, Preview, Development |

## 📁 Project Structure

```
src/
├── api/
│   └── medreserveApi.ts      # API client functions
├── components/
│   ├── BookingTicket.tsx     # Booking success ticket
│   ├── DoctorList.tsx        # Doctor list component
│   ├── LoadingSkeleton.tsx   # Loading skeletons
│   ├── SlotList.tsx          # Slot list component
│   └── Toast.tsx             # Toast notifications
├── context/
│   ├── AppContext.tsx        # Global app state
│   ├── DarkModeContext.tsx   # Dark mode (unused)
│   └── ToastContext.tsx      # Toast notifications
├── pages/
│   ├── AdminDashboard.tsx    # Admin dashboard
│   ├── BookingPage.tsx       # Booking form page
│   └── UserHome.tsx          # Home page
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   └── contrastCheck.ts      # Accessibility utilities
├── App.tsx                   # Main app component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## 🔌 API Integration

### API Client

All API calls are centralized in `src/api/medreserveApi.ts`:

```typescript
// Get all doctors
getDoctors(): Promise<Doctor[]>

// Get doctor slots
getDoctorSlots(doctorId: number): Promise<AppointmentSlot[]>

// Book appointment
bookAppointment(slotId: number, patientData: { name: string; email?: string }): Promise<Booking>

// Admin: Create doctor
createAdminDoctor(payload: { name: string; specialization?: string }): Promise<Doctor>

// Admin: Create slot
createAdminSlot(payload: { doctor_id: number; start_time: string; duration_minutes: number }): Promise<AppointmentSlot>

// Admin: Get stats
getAdminStats(): Promise<{ totalDoctors: number; totalSlots: number; totalBookings: number }>
```

### API Base URL

Configured via environment variable:
- Development: `http://localhost:4000/api`
- Production: Set via `VITE_API_BASE_URL`

### Error Handling

All API calls include:
- Try-catch error handling
- Toast notifications for errors
- User-friendly error messages
- Network error handling

## 🎨 Styling

### Tailwind CSS

- Utility-first CSS framework
- Custom brand colors defined in `index.css`
- Responsive design with breakpoints
- Dark mode classes removed (light theme only)

### Custom Styles

- Brand color variables (`--brand-50`, `--brand-500`, etc.)
- Medical background gradient (`.bg-med-bg`)
- Hero card styling
- Fade-in animations

### Icons

- Lucide React icons throughout
- Consistent icon sizing
- Accessible icon usage

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels on icon buttons
- Keyboard navigation support
- High contrast text colors
- Screen reader friendly

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`
- Responsive grid layouts
- Touch-friendly buttons
- Adaptive navigation

## 🧪 Testing

### Manual Testing Checklist

- [ ] Browse doctors
- [ ] Search doctors
- [ ] Filter by specialization
- [ ] Select doctor and view slots
- [ ] Book appointment
- [ ] View booking ticket
- [ ] Admin: Create doctor
- [ ] Admin: Create slot
- [ ] Admin: View statistics

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐛 Troubleshooting

### Build Errors

1. **TypeScript errors**: Run `npm run build` to see detailed errors
2. **Missing dependencies**: Run `npm install`
3. **API connection**: Check `VITE_API_BASE_URL` environment variable

### Runtime Errors

1. **API calls failing**: Verify backend is running and CORS is configured
2. **Blank page**: Check browser console for errors
3. **Styling issues**: Clear browser cache

## 📝 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🔄 State Management

### Context API

- **AppContext**: Manages doctors list and loading states
- **ToastContext**: Manages toast notifications globally

### Local State

- Form inputs use `useState`
- Component-specific state managed locally
- No external state management library needed

## 🎯 Performance

- Code splitting with React Router
- Lazy loading for routes (if implemented)
- Optimized images (Dicebear avatars)
- CSS purging in production build
- Tree-shaking for unused code

## 📄 License

ISC

## 👤 Author

MedReserve Development Team

---

**Note**: Ensure the backend API is running and accessible before starting the frontend. The frontend requires the backend API to function properly.

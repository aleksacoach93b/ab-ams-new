# AB - Athlete Management System v1.0.0
## ✅ Production Ready - Fresh Deployment

A comprehensive athlete and sports management platform built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## Features

### 🏃‍♂️ Player Management
- Complete player profiles with personal and sports information
- Team assignments and position management
- Health status tracking
- Document and media uploads
- Wellness data collection and analytics

### 📅 Event & Schedule Management
- Training sessions, matches, meetings, and medical appointments
- Calendar integration with multiple views
- Recurring event support
- Attendance tracking
- Location management

### 👨‍🏫 Coach & Staff Management
- Role-based access control
- Permission management
- Report scheduling and delivery
- Team assignments

### 📊 Analytics & Reporting
- Player performance tracking
- Wellness trend analysis
- Attendance reports
- Custom report generation

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Coach, Player)
- Secure session management
- Email invitations for new users

### 📱 Modern UI/UX
- Responsive design for all devices
- Clean, modern interface inspired by Ultrax AI
- Dark red branding with professional styling
- Intuitive navigation and user experience

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Vercel Blob (configurable)
- **Email**: Resend API (configurable)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ultrax-wellness-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ultrax_wellness"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key-here"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Ultrax Wellness"
```

5. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
```

7. Seed the database with default accounts:
```bash
npm run db:seed
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding the database, you can log in with these default accounts:

### 👑 Admin Account
- **Email:** admin@ab-athletes.com
- **Password:** admin123

### 👨‍🏫 Coach Account
- **Email:** aleksacoach@gmail.com
- **Password:** Teodor2025

## Database Schema

The app uses a comprehensive database schema with the following main entities:

- **Users**: Authentication and basic user information
- **Players**: Detailed player profiles and sports information
- **Coaches**: Coach profiles with permissions and team assignments
- **Teams**: Team management and organization
- **Events**: Training sessions, matches, and other scheduled activities
- **Locations**: Venue and facility management
- **Documents & Media**: File storage for player documents and media
- **Notes**: System for adding notes to players, events, and coaches
- **Attendance**: Event attendance tracking
- **Notifications**: In-app notification system
- **Wellness Data**: Health and performance metrics

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Players
- `GET /api/players` - List all players
- `POST /api/players` - Create new player
- `GET /api/players/[id]` - Get player details
- `PUT /api/players/[id]` - Update player
- `DELETE /api/players/[id]` - Delete player

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### File Upload
- `POST /api/upload` - Upload files (documents, media)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   └── prisma.ts         # Database client
└── types/                # TypeScript type definitions
```

## Deployment

The app is designed to be deployed on Vercel with PostgreSQL and Vercel Blob storage:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Set up a PostgreSQL database (recommended: Supabase, PlanetScale, or Vercel Postgres)
5. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
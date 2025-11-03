# Medical Lab Online Booking SaaS

A modern SaaS application for booking medical tests online, similar to Orange Health. Users can select tests, find labs based on location, upload prescriptions, and book appointments.

## Features

- 🔍 Browse and search medical tests
- 📍 Location-based lab matching
- 📄 Prescription/document upload
- 📅 Online booking with time slots
- 👤 User dashboard for bookings
- 💳 Payment integration ready

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker Desktop (for MySQL database)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start MySQL with Docker:
```bash
docker-compose up -d
```
This will start MySQL in a Docker container. You can verify it's running with:
```bash
docker ps
```

4. Create `.env` file:
```bash
# Create .env file with MySQL connection string:
DATABASE_URL="mysql://medlabuser:medlabpass@localhost:3306/medical_lab_booking"
```

Alternatively, if you want to use root user:
```bash
DATABASE_URL="mysql://root:rootpassword@localhost:3306/medical_lab_booking"
```

5. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Seed the database (optional):
```bash
npm run seed
```

7. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Docker Commands

- **Start MySQL**: `docker-compose up -d`
- **Stop MySQL**: `docker-compose down`
- **View logs**: `docker-compose logs -f mysql`
- **Stop and remove volumes** (deletes data): `docker-compose down -v`

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/                # API routes
│   │   ├── (auth)/             # Auth pages
│   │   ├── booking/            # Booking pages
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable components
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript types
└── public/                     # Static files
```

## License

MIT

# AURORA Backend

## 🚀 Project Overview

AURORA is a cutting-edge backend application designed to provide robust authentication and wallet management services. Built with TypeScript, Express, and PostgreSQL, the project offers secure user registration, email verification, and blockchain wallet integration.

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Features

- 🔐 Secure User Authentication
- 📧 Email Verification System
- 🏦 Wallet Address Validation
- 🔒 JWT-based Authorization
- 💾 PostgreSQL Database Integration
- 🧪 Comprehensive Test Coverage

## 💻 Technologies

- **Language**: TypeScript
- **Backend Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, Bcrypt
- **Wallet Validation**: ethers.js
- **Testing**: Jest, Supertest

## 🛠 Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn
- Docker (optional)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/AURORALAOrg/AURORA-Backend.git
cd AURORA-Backend
```

2. Install dependencies:
```bash
npm install
```

## 📝 Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/aurora_db?schema=public"

# Authentication
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRATION=1d
BCRYPT_SALT_ROUNDS=10

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Application Settings
APP_PORT=3000
```

## 💾 Database Setup

### Option 1: Local PostgreSQL

1. Create the database:
```bash
createdb aurora_db
```

### Option 2: Docker (Recommended)

1. Start PostgreSQL container:
```bash
docker run --name aurora-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres
```

2. Create the database:
```bash
docker exec -it aurora-postgres psql -U postgres -c "CREATE DATABASE aurora_db;"
```

### Database Migrations

1. Generate Prisma Client:
```bash
npx prisma generate
```

2. Run Migrations:
```bash
npx prisma migrate dev --name init
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Email verification
- Wallet address validation
- Custom error handling middleware

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/AURORALAOrg/AURORA-Backend](https://github.com/AURORALAOrg/AURORA-Backend)

# AWS Cloud-Based Event & Ticket Booking System

A scalable event and ticket booking platform built on AWS cloud infrastructure, demonstrating cloud-native architecture with React frontend, Node.js/Express backend, PostgreSQL database, and full AWS deployment.

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React/Vite    │────▶│  Application     │────▶│  Amazon RDS     │
│   Frontend      │     │  Load Balancer   │     │  (PostgreSQL)   │
│   (S3/CloudFront)   │  (ALB)           │     │  Private Subnets│
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │ EC2 AZ-1 │ │ EC2 AZ-2 │ │  S3      │
             │ Backend  │ │ Backend  │ │ Assets   │
             └──────────┘ └──────────┘ └──────────┘
                    │            │
                    ▼            ▼
             ┌────────────────────────┐
             │    CloudWatch          │
             │  Logs & Metrics        │
             └────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with **Vite** for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router v6** for client-side routing
- **Axios** for API communication
- **Context API** for state management
- **Chart.js** for admin dashboard analytics
- **React Hot Toast** for notifications

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** with **PostgreSQL**
- **JWT** authentication with **bcrypt** password hashing
- **Helmet**, **CORS**, **express-rate-limit** for security
- **AWS SDK v3** for cloud services integration
- **Winston** for structured logging

### AWS Infrastructure
- **Amazon S3** - Frontend hosting + event images
- **Amazon EC2** - Two backend instances (Auto Scaling ready)
- **Application Load Balancer** - Traffic distribution
- **Amazon RDS** - Managed PostgreSQL (Multi-AZ)
- **Amazon VPC** - Public/Private subnets across 2 AZs
- **AWS IAM** - Least-privilege roles
- **Amazon CloudWatch** - Monitoring & logging

## 📁 Project Structure

```
Cloud_Project/
├── frontend/                 # React/Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app with routing
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed data
│   ├── package.json
│   └── .env.example
│
├── README.md
├── PROJECT_PROGRESS.md
└── AWS_DEPLOYMENT.md
```

## 🚀 Features

### User Authentication
- Registration & Login with JWT
- Password hashing with bcrypt
- Protected routes & role-based access (USER/ADMIN)
- Persistent sessions

### Event Management
- Browse, search, filter events (category, date)
- Event details with images, location, pricing
- Admin CRUD operations for events
- Real-time seat availability

### Ticket Booking
- Secure booking flow with seat validation
- PostgreSQL transactions prevent overbooking
- Unique booking references
- Booking history & cancellation

### Dashboards
- **User Dashboard**: Upcoming events, booking stats, quick actions
- **Admin Dashboard**: Platform metrics, revenue charts, booking management
- **Infrastructure Demo**: Live ALB load balancing visualization

### Infrastructure Demo
- `/api/instance` endpoint identifies handling EC2 instance
- Real-time load balancing test (20 requests)
- Request distribution visualization
- Health checks for both instances

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (paginated, filtered) |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create event (Admin) |
| PUT | `/api/events/:id` | Update event (Admin) |
| DELETE | `/api/events/:id` | Delete event (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | Get user bookings |
| GET | `/api/bookings/my/stats` | Get booking statistics |
| GET | `/api/bookings/:id` | Get booking details |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/dashboard/charts` | Chart data |
| GET | `/api/admin/bookings` | All bookings (paginated) |
| GET | `/api/admin/users` | All users (paginated) |
| GET | `/api/admin/events` | All events (paginated) |

### Infrastructure
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/instance` | Instance identification |

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## ☁️ AWS Deployment

See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for detailed deployment instructions covering:

1. **VPC Setup** - Public/Private subnets, NAT Gateway, IGW
2. **RDS PostgreSQL** - Multi-AZ, parameter groups, security groups
3. **EC2 Instances** - Launch templates, user data, IAM roles
4. **Application Load Balancer** - Target groups, health checks, HTTPS
5. **S3 + CloudFront** - Static hosting, custom domain, SSL
6. **CloudWatch** - Logs, metrics, alarms
7. **IAM Roles** - Least-privilege permissions

## 🔐 Security Features

- JWT with secure configuration (HttpOnly, SameSite)
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- CORS configuration
- Input validation & sanitization
- SQL injection prevention via Prisma
- Private RDS (no public access)
- IAM roles instead of access keys

## 📊 Monitoring

- **Health Checks**: `/api/health` endpoint for ALB
- **Application Logs**: Winston structured logging to CloudWatch
- **Metrics**: CPU, Memory, Request count, Latency
- **Alarms**: High CPU, Unhealthy targets, 5xx errors
- **Load Balancing Demo**: Real-time instance identification

## 🎯 Load Balancing Demonstration

The `/api/instance` endpoint returns:
```json
{
  "message": "Request handled successfully",
  "instanceId": "backend-instance-1",
  "hostname": "ip-10-0-1-10",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

The **Infrastructure Dashboard** (`/infrastructure`) shows:
- Current request handler
- Real-time health status
- Request distribution charts
- 20-request load balancing test
- Architecture visualization

## 📝 Development Phases

1. **Phase 1**: Project Initialization ✓
2. **Phase 2**: Database & Backend API ✓
3. **Phase 3**: Frontend Application ✓
4. **Phase 4**: Local Integration ✓
5. **Phase 5**: AWS Infrastructure
6. **Phase 6**: Frontend Deployment
7. **Phase 7**: Monitoring & Security
8. **Phase 8**: Final Testing & Documentation

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

This is a college project demonstrating AWS cloud architecture. For educational purposes.

---

**Built with ❤️ for Cloud Computing Education**
# TaskFlow - Full-Stack Task Management System

A comprehensive task management application built with React, Node.js/Express, and PostgreSQL. Features include user authentication, role-based access control, file uploads, and real-time task management.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: Admin and user roles with appropriate permissions
- **Task Management**: Full CRUD operations for tasks
- **File Upload System**: Attach up to 3 PDF documents per task
- **Advanced Filtering**: Filter and sort tasks by status, priority, assignee, and due date
- **Pagination**: Efficient data loading with pagination support
- **Responsive Design**: Mobile-first design that works on all devices

### Technical Features
- **Modern Tech Stack**: React 18, TypeScript, TailwindCSS, Node.js, Express, PostgreSQL
- **State Management**: Context API with useReducer for predictable state updates
- **Form Validation**: Zod schema validation with react-hook-form
- **File Storage**: Secure file upload and storage system
- **Security**: Input validation, rate limiting, helmet security headers
- **Testing**: Comprehensive test suite with Vitest and React Testing Library
- **Docker Support**: Full containerization with Docker Compose

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Hook Form** + **Zod** for form handling and validation
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Vite** for build tooling
- **Vitest** for testing

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Helmet** for security headers
- **Express Rate Limit** for API protection

### Development & Deployment
- **Docker & Docker Compose**
- **ESLint & TypeScript**
- **Vitest** for testing
- **GitHub Actions** ready

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (for local development)

### Option 1: Docker Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd taskflow

# Start all services with Docker Compose
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# PostgreSQL: localhost:5432
```

### Option 2: Local Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd taskflow

# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the development server
npm run dev
```

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations (see Database Schema section)
3. Set up environment variables in `.env`:
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🗄 Database Schema

### Core Tables
```sql
-- Users/Profiles table
profiles (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tasks table
tasks (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority VARCHAR CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Task documents table
task_documents (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  filename VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP
)
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage
The project includes comprehensive tests covering:
- Component rendering and interactions
- Context providers and hooks
- Form validation and submission
- Authentication flows
- API integration
- Error handling

Target: 80%+ test coverage

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/profile - Get user profile
```

### Task Endpoints
```
GET /api/tasks - Get tasks (with filtering, sorting, pagination)
POST /api/tasks - Create new task
GET /api/tasks/:id - Get specific task
PUT /api/tasks/:id - Update task
DELETE /api/tasks/:id - Delete task
POST /api/tasks/:id/documents - Upload task documents
GET /api/tasks/:id/documents/:docId - Download document
```

### User Management (Admin only)
```
GET /api/users - Get all users
PUT /api/users/:id - Update user role
DELETE /api/users/:id - Delete user
```

### Query Parameters
- `status`: Filter by task status (todo, in_progress, completed)
- `priority`: Filter by priority (low, medium, high)
- `assigned_to`: Filter by assigned user ID
- `search`: Search in title and description
- `sortBy`: Sort by field (due_date, created_at, priority, title)
- `sortOrder`: Sort direction (asc, desc)
- `page`: Page number for pagination
- `limit`: Items per page

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Password hashing using bcrypt
- Role-based access control (Admin/User)
- Protected routes on both frontend and backend
- Session management with automatic token refresh

### API Security
- Request rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- File upload restrictions (PDF only, size limits)
- SQL injection prevention

### Data Protection
- Encrypted password storage
- Secure file storage
- Data validation on all inputs
- Error handling without information leakage

## 🚀 Deployment

### Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend (.env)
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### Docker Deployment
```bash
# Build and deploy with Docker Compose
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Cloud Deployment Options
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Railway, Render, AWS ECS, DigitalOcean App Platform
- **Database**: Supabase, AWS RDS, DigitalOcean Managed PostgreSQL

## 📁 Project Structure

```
taskflow/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components
│   │   ├── layout/         # Layout components
│   │   ├── auth/           # Authentication components
│   │   ├── tasks/          # Task-related components
│   │   └── users/          # User management components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   └── test/               # Test files
├── backend/                # Backend API (Express.js)
├── database/               # Database migrations and schemas
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Frontend Docker configuration
└── README.md              # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main actions and links
- **Secondary**: Emerald (#10B981) - Success states
- **Accent**: Orange (#F59E0B) - Warnings and highlights
- **Error**: Red (#EF4444) - Error states
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter (system font stack)
- **Headings**: 700 weight, appropriate line heights
- **Body**: 400 weight, 1.5 line height for readability
- **Small Text**: 500 weight for emphasis

### Spacing System
- **Base Unit**: 8px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/taskflow/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Attach relevant logs or screenshots

---

**Built with ❤️ using modern web technologies**
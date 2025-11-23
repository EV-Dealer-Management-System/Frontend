# Electric Vehicle Management System (EVMS) - Frontend

A comprehensive web application for managing electric vehicle dealerships, inventory, bookings, and customer relationships. Built with React and modern web technologies.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Key Modules](#key-modules)
- [API Integration](#api-integration)
- [Build and Deployment](#build-and-deployment)
- [Development Guidelines](#development-guidelines)

## Overview

The Electric Vehicle Management System (EVMS) is a multi-role platform designed to streamline the entire lifecycle of electric vehicle sales and distribution. The system connects manufacturers, dealers, staff members, and customers through an integrated digital ecosystem.

### System Architecture

The application follows a role-based architecture with four distinct user types:

- EVM Admin: System administrators managing the entire platform
- EVM Staff: Company staff handling contracts and vehicle operations
- Dealer Manager: Dealership owners managing their business operations
- Dealer Staff: Dealership employees handling day-to-day sales activities

## Features

### Core Functionality

**Vehicle Management**

- Complete vehicle model and version catalog
- Inventory tracking and management
- Real-time availability status
- Vehicle specifications and pricing

**Booking and Orders**

- Online booking system for test drives
- Quote generation and management
- Order processing and tracking
- Electronic contract signing with digital signatures

**Customer Relationship Management**

- Customer profile management
- Booking history and preferences
- Feedback collection and management
- Communication tracking

**Dealer Operations**

- Dealer registration and contract management
- Multi-tier dealer classification system
- Performance dashboards and analytics
- Staff account management
- Appointment scheduling

**Financial Management**

- Deposit settings and configurations
- Payment integration (VNPay)
- Dealer debt tracking
- Transaction history
- AI-powered sales forecasting

**Inventory and Distribution**

- Company-wide inventory overview
- Dealer-specific inventory allocation
- Vehicle delivery tracking
- Stock level monitoring

**Marketing and Promotions**

- Promotional campaign management
- Discount and pricing rules
- Time-bound offers
- Customer-specific promotions

## Technology Stack

### Frontend Framework

- React 19.1.1
- React Router DOM 7.8.2 for routing
- Vite 7.1.2 for build tooling

### UI Framework

- Ant Design 5.27.1
- Ant Design Pro Components 2.8.10
- Ant Design Charts 2.6.5
- Tailwind CSS 4.1.12

### State Management and Data Handling

- Axios 1.11.0 for API communication
- JWT Decode for authentication
- SignalR 9.0.6 for real-time updates

### Document Processing

- PDF.js for PDF rendering
- PDF-lib for PDF manipulation
- React PDF for document display
- TinyMCE for rich text editing
- GrapesJS for template editing

### Additional Libraries

- Day.js and Moment.js for date handling
- Recharts for data visualization
- React Signature Canvas for digital signatures
- LRU Cache for performance optimization

## Project Structure

```
src/
├── api/                          # API configuration and helpers
│   ├── api.js                    # Axios instance with interceptors
│   ├── bank.js                   # Banking/payment APIs
│   └── helpers/                  # API helper functions
│
├── App/                          # Legacy application modules
│   ├── Admin/                    # Admin business logic
│   ├── DealerManager/            # Dealer manager logic
│   ├── DealerStaff/              # Dealer staff logic
│   ├── EVMStaff/                 # EVM staff logic
│   └── APIComponent/             # Shared API components
│
├── Components/                   # Shared UI components
│   ├── Admin/                    # Admin-specific components
│   ├── DealerManager/            # Dealer manager components
│   ├── DealerStaff/              # Dealer staff components
│   └── EVMStaff/                 # EVM staff components
│
├── Pages/                        # Page components by user role
│   ├── Admin/                    # Admin pages
│   ├── DealerManager/            # Dealer manager pages
│   ├── DealerStaff/              # Dealer staff pages
│   ├── EVMStaff/                 # EVM staff pages
│   ├── Home/                     # Public pages (login, register)
│   ├── Payment/                  # Payment processing pages
│   ├── PublicPage/               # Public contract viewing
│   └── ConfirmEcontractOrder/    # E-contract confirmation
│
├── Router/                       # Route protection and configuration
│   ├── AdminRoute.jsx            # Admin route guard
│   ├── DealerManagerRoute.jsx    # Dealer manager route guard
│   ├── DealerStaffRoute.jsx      # Dealer staff route guard
│   ├── EVMStaffRoute.jsx         # EVM staff route guard
│   └── PublicRoute.jsx           # Public route handler
│
├── utils/                        # Utility functions
│   └── auth.js                   # Authentication utilities
│
├── App.jsx                       # Main application component
├── main.jsx                      # Application entry point
└── polyfills.js                  # Browser polyfills
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd FrontEnd
```

2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
# Create .env file in the root directory
# See Environment Configuration section below
```

4. Start development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=<backend-api-base-url>

# External Services
VITE_ECONTRACT_API=<econtract-service-url>
VITE_VNPAY_URL=<vnpay-payment-gateway-url>

# Feature Flags (if applicable)
VITE_ENABLE_REALTIME=true
VITE_ENABLE_AI_FORECAST=true
```

## User Roles and Permissions

### EVM Admin

**Responsibilities:**

- System-wide configuration and settings
- Vehicle model and inventory management
- Dealer account creation and contract approval
- Staff account management
- Promotional campaign oversight
- Template editor for documents
- Deposit settings configuration
- Booking oversight and contract signing

**Access Level:** Full system access

### EVM Staff

**Responsibilities:**

- Dealer contract processing
- Vehicle delivery coordination
- Booking verification and assistance
- Inventory allocation
- Dealer feedback management
- Contract creation and management

**Access Level:** Operational management

### Dealer Manager

**Responsibilities:**

- Dealership profile and settings management
- Staff account creation and management
- Booking and order oversight
- Customer relationship management
- Inventory monitoring
- Financial tracking (debts, transactions)
- Performance analytics and AI forecasting
- Appointment scheduling configuration
- Deposit settings for their dealership

**Access Level:** Dealership-level management

### Dealer Staff

**Responsibilities:**

- Customer interaction and support
- Quote generation for potential buyers
- Test drive scheduling
- Order creation and processing
- Customer profile management
- Inventory availability checking
- Feedback submission

**Access Level:** Operational staff

## Key Modules

### Authentication and Authorization

- JWT-based authentication
- Role-based access control
- Route protection by user role
- Automatic token refresh
- Password reset functionality
- Email verification

### Vehicle Management

**Admin/EVM Staff:**

- Create and edit vehicle models
- Define vehicle versions and specifications
- Set pricing structures
- Manage vehicle images and documentation

**Dealer Staff:**

- View available vehicle inventory
- Access detailed vehicle specifications
- Check real-time pricing

### Booking System

**Customer-facing:**

- Test drive booking
- Appointment scheduling
- Online quote requests

**Staff-facing:**

- Booking approval workflow
- Schedule management
- Conflict resolution
- Customer communication

### E-Contract Management

- Digital signature integration
- PDF contract generation
- Template customization (GrapesJS)
- Contract status tracking
- Public contract viewing
- Multi-party signing workflow

### Payment Integration

- VNPay payment gateway integration
- Deposit payment processing
- Payment status tracking
- Transaction history
- Refund handling

### Dashboard and Analytics

**Admin Dashboard:**

- System-wide metrics
- Revenue tracking
- Dealer performance
- Booking statistics

**Dealer Manager Dashboard:**

- Dealership performance metrics
- Sales trends
- Staff performance
- Customer feedback summary
- AI-powered sales forecasting

**Staff Dashboard:**

- Personal task overview
- Pending actions
- Recent activities
- Quick access to common functions

### Inventory Management

**Company Level (Admin/EVM Staff):**

- Total inventory overview
- Allocation to dealers
- Stock forecasting
- Inventory value tracking

**Dealer Level:**

- Dealership-specific inventory
- Available vehicles for sale
- Pending deliveries
- Vehicle transfer requests

### Feedback System

- Customer feedback collection
- Staff feedback submission
- Feedback status tracking
- Response management
- Analytics and reporting

## API Integration

### Base Configuration

The application uses Axios for HTTP requests with the following features:

**Request Interceptor:**

- Automatic JWT token injection
- Request header configuration
- CORS handling

**Response Interceptor:**

- Global error handling
- 401 unauthorized redirect
- Response data transformation

### API Structure

```javascript
// Example API call structure
import api from "@/api/api";

// GET request
const response = await api.get("/endpoint");

// POST request
const response = await api.post("/endpoint", data);

// PUT request
const response = await api.put("/endpoint/:id", data);

// DELETE request
const response = await api.delete("/endpoint/:id");
```

### Real-time Communication

The system uses SignalR for real-time updates:

- Booking notifications
- Order status changes
- Inventory updates
- System announcements

## Build and Deployment

### Production Build

1. Create production build:

```bash
npm run build
```

2. The build output will be in the `dist/` directory

3. Build optimization includes:
   - Code splitting for better performance
   - Vendor chunk separation (React, Ant Design, utilities)
   - Tree shaking for unused code removal
   - CSS minification
   - Asset optimization

### Build Configuration

The Vite configuration includes:

**Performance Optimizations:**

- Manual chunk splitting for large dependencies
- Code splitting by route
- Lazy loading for heavy components

**Browser Compatibility:**

- Modern browser targets (ES modules)
- Polyfills for older browsers
- Optimized bundle size

### Deployment Options

**Static Hosting:**

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Container Deployment:**

- Docker containerization
- Kubernetes orchestration

**Traditional Hosting:**

- Nginx
- Apache

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-api-url;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Development Guidelines

### Code Style

- Follow React best practices and hooks guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Use PropTypes or TypeScript for type checking
- Follow ESLint configuration

### Component Structure

```javascript
// Recommended component structure
import React, { useState, useEffect } from "react";
import { ComponentProps } from "./types";
import "./styles.css";

const MyComponent = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render
  return <div>{/* Component JSX */}</div>;
};

export default MyComponent;
```

### State Management

- Use React hooks for local state
- Implement custom hooks for reusable logic
- Consider context for shared state
- Avoid prop drilling with composition

### API Calls

- Use async/await syntax
- Implement proper error handling
- Show loading states
- Cache requests when appropriate
- Handle request cancellation

### Testing Best Practices

- Write unit tests for utility functions
- Create integration tests for critical flows
- Test error scenarios
- Mock external dependencies
- Maintain high code coverage

### Performance Optimization

- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize re-renders with useMemo and useCallback
- Implement virtual scrolling for large lists
- Optimize images and assets

### Security Considerations

- Never store sensitive data in localStorage without encryption
- Validate user input on both client and server
- Implement CSRF protection
- Use HTTPS in production
- Sanitize user-generated content
- Keep dependencies updated

### Accessibility

- Use semantic HTML elements
- Implement keyboard navigation
- Add ARIA labels where appropriate
- Ensure sufficient color contrast
- Test with screen readers

### Git Workflow

- Use feature branches for development
- Write meaningful commit messages
- Create pull requests for code review
- Keep commits atomic and focused
- Update documentation with code changes

## Support and Contributing

### Reporting Issues

When reporting issues, please include:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console error messages

### Development Environment

- Use Node.js LTS version
- Install recommended VS Code extensions
- Configure ESLint and Prettier
- Use Git hooks for pre-commit checks

## License

This project is proprietary software. All rights reserved.

## Contact

For technical support or inquiries, please contact the development team.

# Buyer Lead CRM

A comprehensive real estate CRM application for managing buyer leads with advanced filtering, CSV import/export, and complete audit trails.

## Features

- **Lead Management**: Create, read, update, and delete buyer leads with comprehensive validation
- **Advanced Search & Filtering**: Real-time search with debounced input and URL-synced filters
- **CSV Import/Export**: Bulk import leads with validation and export filtered results
- **Authentication**: Secure JWT-based authentication with protected routes
- **Audit Trail**: Complete history tracking of all lead changes
- **Responsive Design**: Professional UI that works on all devices
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with secure HTTP-only cookies
- **Validation**: Zod for client and server-side validation
- **UI**: Tailwind CSS with shadcn/ui components
- **File Processing**: Papa Parse for CSV handling
- **TypeScript**: Full type safety throughout the application

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/buyer_lead_crm"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# Optional: For development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"
\`\`\`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd buyer-lead-crm
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up the database**
   
   Create a PostgreSQL database and update the `DATABASE_URL` in your `.env.local` file.

4. **Run database migrations**
   \`\`\`bash
   npm run db:generate
   npm run db:migrate
   \`\`\`

5. **Seed the database (optional)**
   
   The application includes sample data. You can run the seed script:
   \`\`\`bash
   # This will be executed automatically when you first run the app
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Email**: demo@example.com
- **Password**: password

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `password_hash` (String)
- `role` (String, default: 'user')
- `created_at`, `updated_at` (Timestamps)

### Buyers Table (Leads)
- `id` (UUID, Primary Key)
- `full_name` (String, 2-80 chars)
- `email` (String, optional)
- `phone` (String, 10-15 digits, required)
- `city` (Enum: Chandigarh|Mohali|Zirakpur|Panchkula|Other)
- `property_type` (Enum: Apartment|Villa|Plot|Office|Retail)
- `bhk` (Enum: 1|2|3|4|Studio, optional for non-residential)
- `purpose` (Enum: Buy|Rent)
- `budget_min`, `budget_max` (Integer, INR, optional)
- `timeline` (Enum: 0-3m|3-6m|>6m|Exploring)
- `source` (Enum: Website|Referral|Walk-in|Call|Other)
- `status` (Enum: New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
- `notes` (Text, ≤1000 chars, optional)
- `tags` (JSON Array, optional)
- `owner_id` (UUID, Foreign Key to users)
- `created_at`, `updated_at` (Timestamps)

### Buyer History Table
- `id` (UUID, Primary Key)
- `buyer_id` (UUID, Foreign Key)
- `changed_by` (UUID, Foreign Key to users)
- `changed_at` (Timestamp)
- `diff` (JSON, changed fields)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Buyers
- `GET /api/buyers/search` - Search and filter buyers
- `POST /api/buyers` - Create new buyer
- `PUT /api/buyers/[id]` - Update buyer
- `DELETE /api/buyers/[id]` - Delete buyer
- `POST /api/buyers/import` - Bulk import from CSV
- `GET /api/buyers/export` - Export to CSV

## Key Features Implementation

### Validation & Safety
- **Client & Server Validation**: Zod schemas ensure data integrity
- **Ownership Checks**: Users can only access their own leads
- **Rate Limiting**: 10 requests per minute per user for create/update operations
- **Concurrency Control**: Optimistic locking prevents data conflicts

### Search & Filtering
- **Real-time Search**: Debounced search across name, phone, and email
- **URL-synced Filters**: All filters are reflected in the URL for bookmarking
- **Server-side Pagination**: Efficient handling of large datasets
- **Sortable Columns**: Multiple sort options with URL persistence

### CSV Import/Export
- **Transactional Imports**: All-or-nothing imports with detailed error reporting
- **Template Download**: Pre-formatted CSV template with sample data
- **Filtered Exports**: Export respects current search and filter state
- **Validation**: Row-by-row validation with comprehensive error messages

### User Experience
- **Professional Design**: Clean, modern interface following real estate industry standards
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Error Boundaries**: Graceful error handling with recovery options
- **Empty States**: Helpful guidance when no data is available
- **Loading States**: Clear feedback during async operations

## Testing

The application includes unit tests for critical validation functions:

\`\`\`bash
# Run validation tests (example)
npm test
\`\`\`

Key test coverage:
- Budget range validation
- CSV row validation
- Form validation schemas

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   npm start
   \`\`\`

## Design Decisions

### Architecture
- **Server-Side Rendering**: Dashboard and lead list use SSR for better performance and SEO
- **Client-Side Interactivity**: Forms and filters use client components for responsive UX
- **API Routes**: RESTful API design with proper HTTP status codes and error handling

### Security
- **JWT Authentication**: Secure, stateless authentication with HTTP-only cookies
- **Input Validation**: All inputs validated on both client and server
- **SQL Injection Prevention**: Drizzle ORM provides built-in protection
- **Rate Limiting**: Prevents API abuse and ensures fair usage

### Performance
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Pagination**: Server-side pagination prevents memory issues with large datasets
- **Debounced Search**: Reduces API calls during user typing
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

## Future Enhancements

- **Email Notifications**: Automated follow-up reminders
- **Advanced Analytics**: Lead conversion tracking and reporting
- **Team Collaboration**: Multi-user workspaces with role-based permissions
- **Mobile App**: Native mobile application for field agents
- **Integration APIs**: Connect with popular real estate platforms

## Support

For issues or questions:
1. Check the error logs in the browser console
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Contact support at [support email]

## License

This project is licensed under the MIT License.

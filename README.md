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
   
   Open [http://localhost:3001](http://localhost:3001) in your browser.


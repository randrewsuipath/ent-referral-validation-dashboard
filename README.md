# ENT Referral Validation Dashboard

A professional enterprise Action Center application for validating ENT (Ear, Nose, Throat) medical referrals. Built with React, TypeScript, and the UiPath SDK for seamless integration with UiPath Orchestrator workflows.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/randrewsuipath/ent-referral-validation-dashboard)

## Overview

The ENT Referral Validation Dashboard provides a clean, information-dense interface designed for medical reviewers to efficiently validate and process ENT referrals. The application features a split-panel layout that displays comprehensive referral information alongside the actual referral form document, enabling quick and accurate validation decisions.

## Key Features

- **Split-Panel Interface**: Left panel shows referral summary with patient details, insurance information, diagnosis codes, and clinical notes; right panel displays the referral form document
- **Efficient Workflow**: Streamlined approval/denial process with clear action buttons and optional comment fields
- **Queue Management**: Main menu displays pending referrals with search, filter, and sorting capabilities
- **Real-time Integration**: Direct integration with UiPath Action Center for task management
- **HIPAA-Compliant Design**: Professional healthcare application standards with secure data presentation
- **Responsive Layout**: Optimized for desktop use with mobile-friendly fallbacks

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library

### UiPath Integration
- **@uipath/uipath-typescript** - Official UiPath SDK
- OAuth 2.0 authentication
- Action Center task management
- Process orchestration

### State Management & Utilities
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **date-fns** - Date formatting
- **Zod** - Schema validation

### Deployment
- **Cloudflare Pages** - Edge deployment platform
- Static site generation
- Global CDN distribution

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- UiPath Cloud account with appropriate permissions
- OAuth client credentials for UiPath SDK

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ent-referral-validator
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with your UiPath credentials:

```env
VITE_UIPATH_BASE_URL=https://api.uipath.com
VITE_UIPATH_ORG_NAME=your-org-name
VITE_UIPATH_TENANT_NAME=your-tenant-name
VITE_UIPATH_CLIENT_ID=your-client-id
VITE_UIPATH_REDIRECT_URI=http://localhost:3000
VITE_UIPATH_SCOPE=OR.Tasks OR.Tasks.Read OR.Tasks.Write OR.Execution.Read
```

**Required UiPath Scopes:**
- `OR.Tasks` or `OR.Tasks.Read` - Read Action Center tasks
- `OR.Tasks.Write` - Complete tasks (approve/deny)
- `OR.Execution.Read` - Read process execution data

## Development

### Start the development server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### Build for production

```bash
bun run build
```

### Preview production build

```bash
bun run preview
```

### Linting

```bash
bun run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
│   └── useAuth.tsx     # UiPath authentication
├── pages/              # Application pages
│   ├── QueuePage.tsx   # Referral queue view
│   └── ValidationPage.tsx # Referral validation view
├── lib/                # Utility functions
└── main.tsx           # Application entry point
```

## Usage

### Authentication

1. Click the login button on the landing page
2. You'll be redirected to UiPath Cloud for OAuth authentication
3. Grant the requested permissions
4. You'll be redirected back to the application

### Validating Referrals

1. **View Queue**: The main page displays all pending ENT referrals
2. **Select Referral**: Click on a referral row to open the validation view
3. **Review Information**: 
   - Left panel: Patient demographics, insurance, diagnosis codes, clinical notes
   - Right panel: Referral form document
4. **Make Decision**: 
   - Click "Approve" to accept the referral
   - Click "Deny" to reject the referral
   - Optionally add comments explaining your decision
5. **Submit**: Confirm your action in the modal dialog

### Queue Features

- **Search**: Filter referrals by patient name, ID, or physician
- **Sort**: Click column headers to sort by date, priority, or status
- **Filter**: Use dropdown filters for priority levels and date ranges
- **Pagination**: Navigate through multiple pages of referrals

## Deployment

### Deploy to Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/randrewsuipath/ent-referral-validation-dashboard)

#### Manual Deployment

1. **Build the application**

```bash
bun run build
```

2. **Install Wrangler CLI** (if not already installed)

```bash
bun add -g wrangler
```

3. **Login to Cloudflare**

```bash
wrangler login
```

4. **Deploy to Cloudflare Pages**

```bash
wrangler pages deploy dist
```

5. **Configure environment variables** in the Cloudflare dashboard:
   - Navigate to your Pages project
   - Go to Settings → Environment variables
   - Add all `VITE_*` variables from your `.env` file
   - Update `VITE_UIPATH_REDIRECT_URI` to your production URL

#### Automatic Deployment

Connect your repository to Cloudflare Pages for automatic deployments:

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create a project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Add environment variables
6. Click "Save and Deploy"

## Configuration

### UiPath Task Type

The application filters Action Center tasks by type. Ensure your UiPath process creates tasks with:

- **Task Type**: `TaskType.App`
- **External Tag**: `ent-referral` (optional, for additional filtering)

### Task Data Structure

Expected task data format:

```typescript
{
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  insuranceProvider: string;
  insuranceId: string;
  diagnosisCodes: string[];
  referringPhysician: string;
  clinicalNotes: string;
  referralFormUrl: string; // URL to the referral document
  priority: "Low" | "Medium" | "High" | "Critical";
}
```

## Security Considerations

- OAuth tokens are stored in `sessionStorage` and cleared on logout
- All API calls use the official UiPath SDK with automatic token refresh
- Referral data is never persisted locally
- HTTPS is enforced in production
- HIPAA compliance requires additional infrastructure controls (encryption at rest, audit logging, access controls)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### Authentication Issues

- Verify OAuth client ID and redirect URI match your UiPath Cloud configuration
- Ensure all required scopes are granted
- Check browser console for detailed error messages

### Task Loading Issues

- Confirm the UiPath process is creating tasks with the correct type
- Verify folder permissions in UiPath Orchestrator
- Check OData filter syntax in task queries

### Document Display Issues

- Ensure referral form URLs are accessible
- Check CORS configuration for external document sources
- Verify bucket permissions if using UiPath Storage Buckets

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue in the GitHub repository
- Contact UiPath support for SDK-related questions
- Review the [UiPath SDK documentation](https://docs.uipath.com/)

## Acknowledgments

- Built with the [UiPath TypeScript SDK](https://www.npmjs.com/package/@uipath/uipath-typescript)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
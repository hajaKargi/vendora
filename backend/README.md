# VendorOnboarding_API

A robust API for automating vendor onboarding, registration, and compliance workflows, integrated with Microsoft Dynamics 365 Finance & Operations (F&O). Built with [NestJS](https://nestjs.com/) for scalability and maintainability.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation (OpenAPI/Swagger)](#api-documentation-openapiswagger)
- [Business Logic & Workflows](#business-logic--workflows)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

## Overview

VendorOnboarding_API is the backend for the Leadway Vendor Management Portal.  
It streamlines vendor registration, approval workflows, and integration with F&O, ensuring compliance, data integrity, and operational efficiency.

**Main value:**

- Reduces vendor onboarding time
- Automates compliance checks and approvals
- Provides seamless integration with internal Finance & Operations

## Features

- **Vendor Registration**: Handles dynamic, type-specific registration flows for all vendor types (Agent, Broker, Foreign Vendor, etc).
- **Document Management**: Secure upload, validation, and preview of required documents.
- **Approval Workflow**: Automated status tracking, notifications, and multi-level approvals.
- **Integration with F&O**: Reads/writes company, tax, and vendor data from/to Microsoft Dynamics 365.
- **Dynamic Form Logic**: Renders forms and required fields dynamically based on vendor type.
- **Notifications**: Email notifications for invitations, submission, approval, or rejection.
- **Audit Trails & Compliance**: Ensures every action is logged and all data is validated for compliance.

## Architecture

- **Backend Framework**: [NestJS](https://nestjs.com/) (Node.js, TypeScript)
- **API Layer**: RESTful endpoints documented with OpenAPI (Swagger)
- **External Integrations**: Microsoft Dynamics 365 F&O, Email (for notifications)
- **Authentication**: OAuth2.0 via Azure AD (Bearer Token)
- **Modules**:
  - `auth/`: Authentication and token management
  - `vendors/`: Vendor registration, listing, approval
  - `taxes/`: Tax authorities, groups, and validation
  - `payments/`: Payment terms and methods
  - `location/`: Countries, states, cities, counties
  - `data-entities/`: Company and entity metadata

## Getting Started

### Prerequisites

- Node.js v16+ and npm
- Access to Microsoft Azure AD (for OAuth2 token)
- Microsoft Dynamics 365 F&O sandbox credentials

### Installation

````bash
# Clone the repository
git clone https://github.com/LeadwayGroup/VendorOnboarding_API.git
cd VendorOnboarding_API

# Install dependencies
npm install

### Environment Variables

```bash
cp .env.example .env

**.env example:**
```dotenv
Base_Url= # Dynamics 365 F&O Base URL
Token_Url= # Azure AD Token URL
Client_Id= # Azure client ID
Client_Secret= # Azure client secret
Tenant_Id= # Azure tenant ID
Resource= # F&O Resource URI
Scope=
Grant_Type=client_credentials
PORT=3000

## Running the Application

**Development:**
```bash
npm run start:dev

**Production:**

```bash
npm run start:prod

**Accessing the API:**

- By default, the server runs on `http://localhost:3000`

## API Documentation (OpenAPI/Swagger)

**Swagger UI:**
The API is fully documented using the OpenAPI (Swagger) standard.

- When running locally, access:

  - [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Business Logic & Workflows

### Vendor Onboarding Flow

1. **Initiation:**
   Vendor receives email invite → clicks link → lands on registration page.

2. **Identification:**

   - Selects company and vendor type (options: Agent, Broker, Co-Insurance, etc)
   - Fills in dynamic, type-specific form fields (company info, tax, bank, etc)
   - State & tax authorities are dynamically filtered

3. **Documentation:**

   - Uploads required files (CAC Certificate, Staff ID, etc)
   - Files validated for type (PDF/JPEG) and size (max 5MB)

4. **Preview & Submission:**

   - Vendor previews all data and documents
   - Edits if needed; submits final application

5. **Approval Workflow:**
   - Status changes to "Pending Review"
   - Procurement team notified
   - Vendor receives email on approval or rejection

**See [FRD](docs/FRD.md) for full functional requirements.**

## Example API Endpoints

### Authentication

```http
POST /oauth2/token
- Obtain bearer token using client credentials

### Companies

```http
GET /data/Companies

- List all companies

### Tax Authorities

```http
GET /data/TaxAuthorities?cross-company=true&$filter=dataAreaId eq '001'

- List tax authorities for a company

### Vendors

```http
GET /data/Vendors
POST /data/Vendors

- List or create vendors

### Locations

http
GET /data/AddressCountryRegionTranslations?$filter=LanguageId eq 'en-US'
GET /data/AddressStates?$filter=CountryRegionId eq 'NGA'
GET /data/AddressCounties?$filter=CountryRegionId eq 'NGA' and StateId eq 'Lagos'
```

- Get countries, states, counties (dynamic filtering)

**See full details in the [Postman Collection](docs/postman_collection.json) or [Swagger UI](#api-documentation-openapiswagger).**

## Testing

Run all tests:

```bash
npm run test


End-to-end tests:

```bash
npm run test:e2e


Test coverage:

```bash
npm run test:cov

## Deployment

1. **Production configuration:**
   - Set all env variables for prod environment
2. **Build and start:**
   ```bash
   npm run build
   npm run start:prod
   ```
3. **Cloud/Container:**
   - Optionally, containerize with Docker
   - Deploy to AWS, Azure, or your preferred platform

**See [NestJS deployment docs](https://docs.nestjs.com/deployment) for more details.**

## Contributing

- Fork the repo & clone locally
- Create a feature branch (`git checkout -b feature/my-feature`)
- Commit your changes (`git commit -m "feat: my new feature"`)
- Push to your fork & open a pull request

**Coding Standards:**

- Use TypeScript & NestJS best practices
- Write tests for new features
- Follow commit message conventions

## Troubleshooting

- **Auth errors:**
  - Double-check your Azure credentials and OAuth2 setup.
- **Dynamics 365 API errors:**
  - Ensure your token is valid and you have correct permissions.
- **Environment variables:**
  - Use `.env.example` as a template and verify all required fields.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contact

- **Author:** Popoola Michael Iyanuoluwapo
- **Organization:** Leadway Group
- **Support:** [NestJS Discord](https://discord.gg/G7Qnnhy)
- **Project Maintainer:** [Abtechh](https://github.com/Abtechh)
````

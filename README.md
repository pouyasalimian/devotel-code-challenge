# NestJS Application

## Getting Started

This guide will help you set up and run the NestJS application.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Recommended: LTS version)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (Optional, for database container)
- PostgreSQL database instance

---

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/pouyasalimian/devotel-code-challenge
   cd devotel-code-challenge
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

---

## Configuration

1. Create a `.env` file in the root directory and set the required environment variables:

   ```env
   # Application
   APP_HOST=127.0.0.1
   APP_PORT=3000
   APP_ENV=development

   # Database
   DATABASE_URL='postgres://username:password@127.0.0.1:5432/DbName'

   # Providers
   PROVIDER_BASE_URL='https://assignment.devotel.io'

   # Cron
   FETCH_JOB_OFFER_CRON='* * * * * *'
   ```

---

## Database Setup

Run the Prisma migration to apply database changes:

```sh
npx prisma migrate deploy
```

To generate the Prisma client:

```sh
npx prisma generate
```

---

## Running the Application

To start the application in development mode:

```sh
npm run start:dev
# or
yarn start:dev
# or
pnpm run start:dev
```

For production mode:

```sh
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
# or
pnpm build
pnpm start:prod
```

---

## API Documentation

By default, if Swagger is enabled, you can access API documentation at:

```
http://localhost:3000/api
```

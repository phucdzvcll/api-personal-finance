# How to Run the Project
## Personal Finance Management System

---

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **yarn**
- **Docker** and **Docker Compose** (for PostgreSQL database)
- **Git** (for cloning the repository)

### Verify Installation

```bash
node --version    # Should be v18 or higher
npm --version     # Should be 8 or higher
docker --version  # Docker should be installed
docker-compose --version  # Docker Compose should be installed
```

---

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- NestJS core packages
- TypeORM and PostgreSQL driver
- Authentication packages (JWT, Passport, bcrypt)
- Validation packages (class-validator, class-transformer)
- Swagger/OpenAPI

### Step 2: Set Up Environment Variables

Create your `.env` file from the development template:

```bash
# Option 1: Copy the template
cp env.dev.example .env

# Option 2: Use the setup script
npm run env:setup dev
```

**Important:** Update the `.env` file with your actual values, especially:
- `JWT_SECRET` - Use a strong, random secret key
- `DB_PASSWORD` - Change the default password
- Other database credentials if needed

### Step 3: Start PostgreSQL Database

Start the PostgreSQL database using Docker Compose:

```bash
# Start development database
npm run docker:dev:up

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

**Verify database is running:**
```bash
docker ps
# You should see a container named 'personal_finance_db_dev'
```

**Check database logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Step 4: Set Up TypeORM Database Connection

The project uses TypeORM. You need to configure the database connection in your `app.module.ts` or create a database module.

**Note:** Currently, TypeORM configuration needs to be added. You can add it to `app.module.ts`:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production', // Only for development!
      }),
      inject: [ConfigService],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Step 5: Run Database Migrations (if needed)

If you have migrations set up:

```bash
# Generate migration (if needed)
npm run typeorm migration:generate -- -n InitialMigration

# Run migrations
npm run typeorm migration:run
```

**For development**, you can use `synchronize: true` in TypeORM config (as shown above) to auto-create tables, but this is **NOT recommended for production**.

### Step 6: Start the Application

**Development mode (with hot reload):**
```bash
npm run start:dev
```

**Production mode:**
```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

**Debug mode:**
```bash
npm run start:debug
```

### Step 7: Verify Application is Running

You should see output like:
```
Application is running on: http://localhost:3000/api/v1
Swagger documentation: http://localhost:3000/api/v1/docs
```

---

## Accessing the Application

### API Base URL
```
http://localhost:3000/api/v1
```

### Swagger Documentation
```
http://localhost:3000/api/v1/docs
```

### Health Check Endpoint
```
GET http://localhost:3000/api/v1/
```

---

## Testing the Authentication

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "password123"
  }'
```

### 3. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## Using Swagger UI

1. Open your browser and navigate to: `http://localhost:3000/api/v1/docs`
2. You'll see all available endpoints
3. To test protected endpoints:
   - Click the **"Authorize"** button (top right)
   - Enter your JWT token: `Bearer <your_token>`
   - Click **"Authorize"**
   - Now you can test protected endpoints directly from Swagger

---

## Common Issues and Solutions

### Issue: Database Connection Error

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**
1. Verify Docker is running: `docker ps`
2. Check if PostgreSQL container is running: `docker ps | grep postgres`
3. Verify database credentials in `.env` file
4. Restart the database: `npm run docker:dev:down && npm run docker:dev:up`

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
1. Change the port in `.env`: `PORT=3001`
2. Or stop the process using port 3000:
   ```bash
   # On macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Issue: Module Not Found

**Error:** `Cannot find module '@nestjs/...'`

**Solution:**
```bash
npm install
```

### Issue: TypeORM Entity Not Found

**Error:** `Entity metadata for UserEntity was not found`

**Solution:**
1. Ensure entities are properly configured in TypeORM
2. Check that entity files are in the correct location
3. Verify `entities` path in TypeORM configuration

### Issue: JWT Secret Missing

**Error:** `JWT secret is required`

**Solution:**
1. Ensure `.env` file exists
2. Verify `JWT_SECRET` is set in `.env`
3. Restart the application after adding the secret

---

## Stopping the Application

### Stop the Application
Press `Ctrl + C` in the terminal where the app is running

### Stop the Database
```bash
npm run docker:dev:down

# Or manually:
docker-compose -f docker-compose.dev.yml down
```

### Stop and Remove Database (including data)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

---

## Development Workflow

### Typical Development Session

1. **Start database:**
   ```bash
   npm run docker:dev:up
   ```

2. **Start application in watch mode:**
   ```bash
   npm run start:dev
   ```

3. **Make code changes** - The application will automatically reload

4. **Test endpoints** using Swagger UI or curl

5. **Stop when done:**
   ```bash
   # Stop application: Ctrl + C
   # Stop database:
   npm run docker:dev:down
   ```

---

## Environment-Specific Commands

### Development
```bash
npm run env:setup dev
npm run docker:dev:up
npm run start:dev
```

### Staging
```bash
npm run env:setup stg
npm run docker:stg:up
npm run start:prod
```

### Production
```bash
npm run env:setup prod
npm run docker:prod:up
npm run build
npm run start:prod
```

---

## Additional Commands

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Running Tests
```bash
npm run test              # Unit tests
npm run test:watch       # Watch mode
npm run test:cov         # With coverage
npm run test:e2e         # End-to-end tests
```

---

## Next Steps

After successfully running the project:

1. **Explore Swagger UI** at `http://localhost:3000/api/v1/docs`
2. **Read the documentation:**
   - [Authentication Guide](./AUTHENTICATION.md)
   - [Project Structure](./PROJECT_STRUCTURE.md)
   - [Database Design](./DATABASE_DESIGN.md)
3. **Start building features** following the project architecture

---

## Getting Help

If you encounter issues:

1. Check the error logs in the terminal
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Check Docker containers are running
5. Review the documentation in the `documents/` folder

---

## Summary

Quick start commands:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp env.dev.example .env

# 3. Start database
npm run docker:dev:up

# 4. Start application
npm run start:dev

# 5. Access Swagger
# Open: http://localhost:3000/api/v1/docs
```

---

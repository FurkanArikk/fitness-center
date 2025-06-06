# Auth Service Database Schema

The Auth Service uses PostgreSQL as its database with GORM as the ORM layer. Below is the detailed schema for the tables used in this service.

## Database Configuration

- **Database Name**: `fitness_auth_db` (default)
- **Port**: 5434 (default for auth service)
- **Schema**: Uses GORM auto-migration
- **Connection**: PostgreSQL with SSL disabled for development

## Architecture

The service uses GORM for database operations with the following benefits:
- **Type Safety**: Compile-time type checking for database operations
- **Auto Migration**: Automatic schema migration support
- **Relationship Management**: Built-in support for foreign key relationships
- **Transaction Support**: Automatic transaction handling for authentication operations
- **Query Building**: Intuitive query building with method chaining

## GORM Model Definitions

All database models are defined in the `internal/model` package with embedded repository interfaces following the microservice pattern.

## Tables

### users

This table stores user authentication information for the fitness center system.

**GORM Model:** `internal/model/user.go`

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| id           | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| username     | VARCHAR(50)              | Unique username for login                     | `type:varchar(50);unique;not null`  |
| email        | VARCHAR(100)             | User email address (unique)                   | `type:varchar(100);unique;not null` |
| password     | VARCHAR(255)             | Hashed password using bcrypt                  | `type:varchar(255);not null`        |
| role         | VARCHAR(20)              | User role (admin, staff, member)              | `type:varchar(20);default:'member'` |
| status       | VARCHAR(20)              | Account status (active, inactive, suspended)  | `type:varchar(20);default:'active'` |
| last_login   | TIMESTAMP WITH TIME ZONE | Last login timestamp                          | `index`                             |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `id`
- UNIQUE constraint on `username`
- UNIQUE constraint on `email`
- Index on `role` for role-based queries
- Index on `status` for status-based filtering
- Index on `last_login` for activity tracking

**GORM Features:**
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Unique constraints on username and email
- Default values for role and status
- Password field for bcrypt hashed passwords

### refresh_tokens

This table stores refresh tokens for JWT token management.

**GORM Model:** `internal/model/refresh_token.go`

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| id           | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| user_id      | BIGINT                   | Reference to users table                      | `not null;index`                    |
| token        | TEXT                     | Encrypted refresh token                       | `type:text;not null;index`          |
| expires_at   | TIMESTAMP WITH TIME ZONE | Token expiration timestamp                    | `not null;index`                    |
| revoked      | BOOLEAN                  | Whether token is revoked                      | `default:false`                     |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` references `users(id)` ON DELETE CASCADE
- Index on `user_id` for user-based token queries
- Index on `expires_at` for cleanup of expired tokens
- Index on `token` for token validation (partial index)

**GORM Features:**
- Foreign key constraint with CASCADE delete behavior
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Default value for `revoked` flag
- Text field for encrypted token storage

### user_sessions

This table tracks active user sessions for security and monitoring.

**GORM Model:** `internal/model/user_session.go`

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| id           | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| user_id      | BIGINT                   | Reference to users table                      | `not null;index`                    |
| session_id   | VARCHAR(255)             | Unique session identifier                     | `type:varchar(255);unique;not null` |
| ip_address   | INET                     | Client IP address                             | `type:inet`                         |
| user_agent   | TEXT                     | Client user agent string                      | `type:text`                         |
| expires_at   | TIMESTAMP WITH TIME ZONE | Session expiration timestamp                  | `not null;index`                    |
| is_active    | BOOLEAN                  | Whether session is currently active           | `default:true;index`                |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` references `users(id)` ON DELETE CASCADE
- UNIQUE constraint on `session_id`
- Index on `user_id` for user session queries
- Index on `expires_at` for cleanup of expired sessions
- Index on `is_active` for active session filtering

**GORM Features:**
- Foreign key constraint with CASCADE delete behavior
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Unique constraint on session identifiers
- Default value for `is_active` flag
- INET type for IP address storage

## Relationships

### Primary Relationships

1. **Users → Refresh Tokens** (One-to-Many)
   - Each user can have multiple refresh tokens for different devices/sessions
   - CASCADE DELETE: When a user is deleted, all their tokens are removed
   - Tokens are linked via `user_id` foreign key

2. **Users → User Sessions** (One-to-Many)
   - Each user can have multiple active sessions for different devices
   - CASCADE DELETE: When a user is deleted, all their sessions are removed
   - Sessions are linked via `user_id` foreign key

### Cross-Service Relationships

3. **Auth Service → Other Services** (Authentication Provider)
   - Users authenticate for other services (member, staff, facility, class, payment)
   - No direct foreign key constraints (microservice architecture)
   - User roles determine service access permissions

## GORM Model Relationships

### User Model
```go
type User struct {
    ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    Username    string    `gorm:"type:varchar(50);unique;not null" json:"username"`
    Email       string    `gorm:"type:varchar(100);unique;not null" json:"email"`
    Password    string    `gorm:"type:varchar(255);not null" json:"-"` // Hidden in JSON
    Role        string    `gorm:"type:varchar(20);default:'member'" json:"role"`
    Status      string    `gorm:"type:varchar(20);default:'active'" json:"status"`
    LastLogin   *time.Time `gorm:"index" json:"last_login,omitempty"`
    CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    RefreshTokens []RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"refresh_tokens,omitempty"`
    Sessions      []UserSession  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`
}
```

### RefreshToken Model
```go
type RefreshToken struct {
    ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    UserID    uint      `gorm:"not null;index" json:"user_id"`
    Token     string    `gorm:"type:text;not null;index" json:"-"` // Hidden in JSON
    ExpiresAt time.Time `gorm:"not null;index" json:"expires_at"`
    Revoked   bool      `gorm:"default:false" json:"revoked"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}
```

### UserSession Model
```go
type UserSession struct {
    ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
    UserID    uint       `gorm:"not null;index" json:"user_id"`
    SessionID string     `gorm:"type:varchar(255);unique;not null" json:"session_id"`
    IPAddress *string    `gorm:"type:inet" json:"ip_address,omitempty"`
    UserAgent *string    `gorm:"type:text" json:"user_agent,omitempty"`
    ExpiresAt time.Time  `gorm:"not null;index" json:"expires_at"`
    IsActive  bool       `gorm:"default:true;index" json:"is_active"`
    CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}
```

## Entity-Relationship Diagram

```
                             AUTH SERVICE DATABASE SCHEMA
    
    ┌─────────────────────────────────────┐
    │                USERS                │
    │─────────────────────────────────────│
    │ PK id (BIGSERIAL)                   │
    │    username (VARCHAR(50)) [UNIQUE]  │
    │    email (VARCHAR(100)) [UNIQUE]    │
    │    password (VARCHAR(255))          │
    │    role (VARCHAR(20))               │
    │    status (VARCHAR(20))             │
    │    last_login (TIMESTAMPTZ)         │
    │    created_at (TIMESTAMPTZ)         │
    │    updated_at (TIMESTAMPTZ)         │
    └─────────────────────────────────────┘
                       │
                       │ 1:N                1:N │
                       ▼                        ▼
    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
    │          REFRESH_TOKENS             │    │           USER_SESSIONS             │
    │─────────────────────────────────────│    │─────────────────────────────────────│
    │ PK id (BIGSERIAL)                   │    │ PK id (BIGSERIAL)                   │
    │ FK user_id → users                  │    │ FK user_id → users                  │
    │    token (TEXT)                     │    │    session_id (VARCHAR(255)) [UQ]  │
    │    expires_at (TIMESTAMPTZ)         │    │    ip_address (INET)                │
    │    revoked (BOOLEAN)                │    │    user_agent (TEXT)                │
    │    created_at (TIMESTAMPTZ)         │    │    expires_at (TIMESTAMPTZ)         │
    │    updated_at (TIMESTAMPTZ)         │    │    is_active (BOOLEAN)              │
    └─────────────────────────────────────┘    │    created_at (TIMESTAMPTZ)         │
                                               │    updated_at (TIMESTAMPTZ)         │
                                               └─────────────────────────────────────┘
                                                              │
                                                              │ provides auth for
                                                              ▼
                         ┌──────────────────────────────────────────────────────────┐
                         │                   EXTERNAL SERVICES                      │
                         │──────────────────────────────────────────────────────────│
                         │ • Member Service    (member role access)                 │
                         │ • Staff Service     (staff/admin role access)           │
                         │ • Class Service     (member/staff role access)          │
                         │ • Facility Service  (member/staff role access)          │
                         │ • Payment Service   (member role access)                │
                         └──────────────────────────────────────────────────────────┘

    RELATIONSHIPS:
    • users 1:N refresh_tokens (CASCADE DELETE)
    • users 1:N user_sessions (CASCADE DELETE)  
    • auth service provides authentication for all other services
```

## Data Types and Constraints

### String Types
- **VARCHAR(20-255)**: Used for constrained text fields with length validation
- **TEXT**: Used for unlimited text content (tokens, user agents)
- **INET**: PostgreSQL native type for IP address storage (IPv4/IPv6)

### Numeric Types
- **BIGSERIAL**: Auto-incrementing 64-bit integers for primary keys
- **BIGINT**: 64-bit integers for foreign key references

### Date and Time Types
- **TIMESTAMPTZ**: For full timestamp with timezone (all timestamp fields)

### Boolean Types
- **BOOLEAN**: For binary flags (revoked, is_active)

### Constraints Summary
- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Properly defined with CASCADE delete behavior
- **Unique Constraints**: Username, email, session_id
- **NOT NULL**: Applied to essential fields
- **Default Values**: Role, status, boolean flags, timestamps

## Field Validation Rules

### User Validation
- **username**: Required, unique, 3-50 characters, alphanumeric with underscores
- **email**: Required, unique, valid email format, maximum 100 characters
- **password**: Required, minimum 8 characters, bcrypt hashed with cost factor 12
- **role**: Must be one of: 'admin', 'staff', 'member'
- **status**: Must be one of: 'active', 'inactive', 'suspended'

### Refresh Token Validation
- **user_id**: Required, must reference existing user
- **token**: Required, encrypted/hashed value, unique per user session
- **expires_at**: Required, must be in the future when created
- **revoked**: Boolean flag, defaults to false

### User Session Validation
- **user_id**: Required, must reference existing user
- **session_id**: Required, unique, UUID format recommended
- **ip_address**: Optional, valid IPv4 or IPv6 address
- **user_agent**: Optional, client browser/application identifier
- **expires_at**: Required, must be in the future when created
- **is_active**: Boolean flag, defaults to true

## Auto-Generated Fields

### Timestamps
- **created_at**: Automatically set on record creation using `autoCreateTime`
- **updated_at**: Automatically updated on record modification using `autoUpdateTime`

### Primary Keys
- **id**: Auto-incrementing BIGSERIAL starting from 1 for all tables

### Default Values
- **users.role**: Defaults to 'member'
- **users.status**: Defaults to 'active'
- **refresh_tokens.revoked**: Defaults to false
- **user_sessions.is_active**: Defaults to true

### Security Features
- **Password Hashing**: Bcrypt with cost factor 12
- **Token Encryption**: AES encryption for refresh tokens
- **Session Security**: Secure UUID generation for session IDs
- **IP Tracking**: For security audit and monitoring

## Migration Strategy

### Database Initialization
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';
```

### Migration Order
1. **users** (independent table)
2. **refresh_tokens** (depends on users)
3. **user_sessions** (depends on users)
4. **Create indexes and constraints**

### Index Creation Strategy
```sql
-- Performance indexes created after data migration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_username ON users(email, username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_user_expires ON refresh_tokens(user_id, expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_active ON user_sessions(user_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_active ON user_sessions(expires_at, is_active);
```

### Data Migration Considerations
- **User Import**: Validate email and username uniqueness during bulk import
- **Password Migration**: Ensure existing passwords are properly bcrypt hashed
- **Token Cleanup**: Remove expired tokens during migration
- **Session Management**: Clean up inactive sessions during migration
- **Role Assignment**: Ensure all users have valid roles assigned

### Rollback Strategy
- Maintain migration version tracking through GORM
- Keep backup copies of user data before major schema changes
- Test rollback procedures in staging environment
- Document authentication dependencies for proper rollback order

### Performance Optimization
- Regular `ANALYZE` on high-traffic tables (users, user_sessions)
- Monitor query performance with `EXPLAIN ANALYZE`
- Implement token cleanup jobs for expired tokens
- Connection pooling for high-concurrency authentication
- Consider read replicas for authentication verification queries

### Security Considerations
- **Password Storage**: Never store plain text passwords
- **Token Security**: Encrypt refresh tokens at rest
- **Session Management**: Regular cleanup of expired sessions
- **Audit Logging**: Track authentication events and failures
- **Rate Limiting**: Implement login attempt rate limiting

## Sample Data

### Default Users
```sql
-- Admin User (password: admin123)
INSERT INTO users (username, email, password, role, status) VALUES 
('admin', 'admin@fitness.com', '$2a$12$...', 'admin', 'active');

-- Staff User (password: staff123)  
INSERT INTO users (username, email, password, role, status) VALUES
('staff', 'staff@fitness.com', '$2a$12$...', 'staff', 'active');

-- Member User (password: member123)
INSERT INTO users (username, email, password, role, status) VALUES
('member', 'member@fitness.com', '$2a$12$...', 'member', 'active');
```

### Token Management Configuration
- **Refresh Token Expiration**: 7 days
- **Access Token Expiration**: 1 hour  
- **Session Token Expiration**: 24 hours
- **Token Cleanup Job**: Daily cleanup of expired tokens
- **Maximum Sessions per User**: 5 concurrent sessions

# MedReserve System Design Document

## 📋 Table of Contents

- [Overview](#overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Overview](#component-overview)
- [Database Schema](#database-schema)
- [Concurrency Strategy](#concurrency-strategy)
- [Booking Expiry Job Design](#booking-expiry-job-design)
- [Scaling Plan](#scaling-plan)
- [Security Considerations](#security-considerations)
- [Logging & Monitoring](#logging--monitoring)

## 🎯 Overview

MedReserve is a healthcare appointment booking system designed to handle concurrent booking requests safely while providing a smooth user experience. The system prevents double-booking through database-level constraints and transaction-based locking.

### Key Requirements

- **Concurrency Safety**: Prevent multiple users from booking the same slot
- **Automatic Expiry**: Release slots held by abandoned bookings
- **Scalability**: Handle increasing load with proper architecture
- **Reliability**: Ensure data consistency and availability

## 🏗 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Browser    │              │   Mobile     │            │
│  │  (React App) │              │   (Future)   │            │
│  └──────┬───────┘              └──────┬───────┘            │
└─────────┼─────────────────────────────┼────────────────────┘
          │                             │
          │  HTTPS                      │
          │                             │
┌─────────▼─────────────────────────────▼────────────────────┐
│                    API Gateway / Load Balancer             │
│                    (Render / Vercel)                        │
└─────────┬───────────────────────────────────────────────────┘
          │
          │ HTTP/REST
          │
┌─────────▼──────────────────────────────────────────────────┐
│                    Backend API Layer                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Express.js Server (Node.js)                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │  Routes  │  │Controllers│  │ Services │        │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │    │
│  │       │             │             │               │    │
│  │  ┌────▼─────────────▼─────────────▼─────┐        │    │
│  │  │      Background Jobs                  │        │    │
│  │  │  - Booking Expiry Job (30s interval)  │        │    │
│  │  └───────────────────────────────────────┘        │    │
│  └──────────────┬────────────────────────────────────┘    │
└─────────────────┼──────────────────────────────────────────┘
                  │
                  │ SQL Queries
                  │
┌─────────────────▼──────────────────────────────────────────┐
│                  Database Layer                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ doctors  │  │  slots   │  │ bookings │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘        │   │
│  │  ┌──────────────────────────────────────┐        │   │
│  │  │      booking_slots (junction)         │        │   │
│  │  │      UNIQUE constraint on slot_id    │        │   │
│  │  └──────────────────────────────────────┘        │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Architecture Components

1. **Client Layer**: React frontend deployed on Vercel
2. **API Gateway**: Render load balancer (or Vercel for frontend)
3. **Backend API**: Express.js server on Render
4. **Database**: PostgreSQL on Render
5. **Background Jobs**: Node.js cron-like jobs

## 🧩 Component Overview

### Frontend Components

```
Frontend (React + TypeScript)
├── Pages
│   ├── UserHome.tsx          # Patient booking interface
│   ├── BookingPage.tsx       # Booking form
│   └── AdminDashboard.tsx    # Admin management
├── Components
│   ├── DoctorList.tsx        # Doctor cards
│   ├── SlotList.tsx          # Slot cards
│   ├── BookingTicket.tsx     # Success ticket
│   └── Toast.tsx             # Notifications
├── Context
│   ├── AppContext.tsx        # Global state
│   └── ToastContext.tsx      # Toast state
└── API Client
    └── medreserveApi.ts      # API functions
```

### Backend Components

```
Backend (Node.js + Express)
├── Routes
│   ├── doctor.routes.js      # Public doctor endpoints
│   ├── admin.routes.js        # Admin endpoints
│   ├── slots.routes.js       # Slot booking
│   └── booking.routes.js     # Booking endpoints
├── Controllers
│   ├── doctorController.js   # Doctor logic
│   ├── slotController.js     # Slot logic
│   └── bookingController.js  # Booking logic
├── Services
│   ├── doctorService.js      # Doctor business logic
│   ├── slotService.js        # Slot business logic
│   └── bookingService.js     # Booking business logic
├── Jobs
│   └── bookingExpiryJob.js   # Expiry background job
└── Config
    └── database.js            # PostgreSQL pool
```

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   doctors   │         │    slots    │         │  bookings   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ id (PK)     │◄──┐     │ id (PK)     │
│ name        │   │     │ doctor_id   │   │     │ slot_id     │
│             │   │     │ start_time  │   │     │ patient_name│
│ specialization│   │     │ duration   │   │     │ status      │
│ created_at  │   │     │ created_at  │   │     │ expires_at  │
└─────────────┘   │     └─────────────┘   │     │ created_at  │
                  │                       │     │ updated_at  │
                  │                       │     └─────────────┘
                  │                       │            │
                  │                       │            │
                  └───────────────────────┼────────────┘
                                          │
                                  ┌───────▼──────────┐
                                  │ booking_slots    │
                                  ├──────────────────┤
                                  │ id (PK)          │
                                  │ booking_id (FK)  │
                                  │ slot_id (FK)     │
                                  │ UNIQUE(slot_id)  │ ◄── Prevents double booking
                                  │ created_at       │
                                  └──────────────────┘
```

### Schema Details

#### doctors
- **id**: SERIAL PRIMARY KEY
- **name**: TEXT NOT NULL
- **specialization**: TEXT (nullable)
- **created_at**: TIMESTAMPTZ DEFAULT NOW()

#### slots
- **id**: SERIAL PRIMARY KEY
- **doctor_id**: INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE
- **start_time**: TIMESTAMPTZ NOT NULL
- **duration_minutes**: INTEGER DEFAULT 15
- **created_at**: TIMESTAMPTZ DEFAULT NOW()

#### bookings
- **id**: SERIAL PRIMARY KEY
- **slot_id**: INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE
- **patient_name**: TEXT NOT NULL
- **patient_email**: TEXT (nullable, optional)
- **status**: TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED'))
- **expires_at**: TIMESTAMPTZ (nullable, set to NOW() + 2 minutes for PENDING)
- **created_at**: TIMESTAMPTZ DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ DEFAULT NOW()

#### booking_slots (Junction Table)
- **id**: SERIAL PRIMARY KEY
- **booking_id**: INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE
- **slot_id**: INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE
- **UNIQUE (slot_id)**: **Critical constraint preventing double-booking**
- **created_at**: TIMESTAMPTZ DEFAULT NOW()

### Indexes

```sql
-- Index for efficient expiry job queries
CREATE INDEX idx_bookings_status_expires 
ON bookings(status, expires_at) 
WHERE status = 'PENDING' AND expires_at IS NOT NULL;

-- Index for doctor slots queries
CREATE INDEX idx_slots_doctor_id ON slots(doctor_id);

-- Index for booking lookups
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
```

## 🔒 Concurrency Strategy

### Problem Statement

When multiple users attempt to book the same slot simultaneously, we must ensure:
1. Only one booking succeeds
2. No race conditions
3. Atomic operations
4. Clear error messages

### Solution: Multi-Layer Concurrency Control

#### Layer 1: Database Transaction with Row Locking

```javascript
// bookingController.js
async function bookSlot(req, res, next) {
  const client = await getClient();
  await client.query('BEGIN');
  
  try {
    // SELECT FOR UPDATE locks the row
    const slotResult = await client.query(
      'SELECT id FROM slots WHERE id = $1 FOR UPDATE',
      [slotId]
    );
    
    // Create booking
    const booking = await createBooking(client, slotId, patientName);
    
    // Try to insert into booking_slots
    // UNIQUE constraint will fail if slot already booked
    await client.query(
      'INSERT INTO booking_slots (booking_id, slot_id) VALUES ($1, $2)',
      [booking.id, slotId]
    );
    
    await client.query('COMMIT');
    return confirmedBooking;
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Slot already booked' });
    }
    throw error;
  }
}
```

**How it works:**
1. `BEGIN TRANSACTION`: Starts atomic operation
2. `SELECT ... FOR UPDATE`: Locks the slot row
3. Other transactions wait until lock is released
4. `UNIQUE constraint` on `booking_slots.slot_id` prevents double-booking
5. `COMMIT` or `ROLLBACK` releases lock

#### Layer 2: Unique Constraint

The `UNIQUE (slot_id)` constraint on `booking_slots` is the final safety net:
- Even if two transactions pass the `FOR UPDATE` check
- Only one can insert into `booking_slots`
- The second will get a unique violation error (23505)

#### Layer 3: Application-Level Status Management

- Bookings start as `PENDING`
- Only confirmed after successful `booking_slots` insert
- Expired PENDING bookings are marked as `FAILED`

### Concurrency Flow Diagram

```
User A Request              User B Request
     │                           │
     ├─ BEGIN TRANSACTION       │
     ├─ SELECT FOR UPDATE       │
     │  (locks slot row)        │
     │                           ├─ BEGIN TRANSACTION
     │                           ├─ SELECT FOR UPDATE
     │                           │  (waits for lock...)
     │                           │
     ├─ INSERT booking           │
     ├─ INSERT booking_slots    │
     │  (SUCCESS)                │
     ├─ UPDATE status=CONFIRMED │
     ├─ COMMIT                  │
     │  (releases lock)          │
     │                           ├─ SELECT FOR UPDATE
     │                           │  (gets lock)
     │                           ├─ INSERT booking
     │                           ├─ INSERT booking_slots
     │                           │  (ERROR: unique violation)
     │                           ├─ ROLLBACK
     │                           └─ Return 409 Conflict
```

### Benefits

1. **Database-Level Safety**: Constraints prevent data corruption
2. **Transaction Isolation**: Each booking is atomic
3. **Clear Error Messages**: Users get "Slot already booked" feedback
4. **No Lost Updates**: All concurrent requests are handled correctly

## ⏰ Booking Expiry Job Design

### Purpose

Release slots held by PENDING bookings that haven't been confirmed within 2 minutes.

### Design

```javascript
// bookingExpiryJob.js
function start(pool) {
  // Run immediately, then every 30 seconds
  runExpiryCheck(pool);
  setInterval(() => runExpiryCheck(pool), 30000);
}

async function runExpiryCheck(pool) {
  const result = await pool.query(
    `UPDATE bookings 
     SET status = 'FAILED', updated_at = NOW() 
     WHERE status = 'PENDING' 
       AND expires_at IS NOT NULL 
       AND expires_at <= NOW()`
  );
  
  if (result.rowCount > 0) {
    console.log(`Marked ${result.rowCount} expired booking(s) as FAILED`);
  }
}
```

### Flow

1. **Booking Creation**: When booking is created, `expires_at = NOW() + 2 minutes`
2. **Expiry Check**: Job runs every 30 seconds
3. **Query**: Finds PENDING bookings where `expires_at <= NOW()`
4. **Update**: Sets status to `FAILED`
5. **Cascade**: `booking_slots` row is deleted (ON DELETE CASCADE)
6. **Slot Release**: Slot becomes available again

### Timing Considerations

- **2-minute expiry**: Balances user experience with slot availability
- **30-second check interval**: Frequent enough to release slots quickly
- **Index usage**: `idx_bookings_status_expires` makes queries efficient

### Edge Cases Handled

- Job failure: Logs error but doesn't crash server
- Missing column: Checks for `expires_at` before querying
- High load: Uses indexed query for performance

## 📈 Scaling Plan

### Backend Scaling

#### Horizontal Scaling (Multiple Instances)

```
┌─────────────┐
│ Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│ API │ │ API │
│  1  │ │  2  │
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       │
┌──────▼──────┐
│  PostgreSQL │
│  (Primary)  │
└─────────────┘
```

**Considerations:**
- Stateless API: Each instance is independent
- Shared database: All instances connect to same PostgreSQL
- Session management: No sessions (stateless API)
- Load balancing: Round-robin or least-connections

#### Vertical Scaling (Larger Instances)

- Increase CPU/RAM on Render
- Upgrade PostgreSQL instance
- Increase connection pool size

### Database Scaling

#### Read Replicas

```
┌──────────────┐
│  PostgreSQL  │
│   (Primary)  │
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│Read │ │Read │
│Rep 1│ │Rep 2│
└─────┘ └─────┘
```

**Use Cases:**
- Read-heavy queries (GET /doctors, GET /slots)
- Analytics queries
- Reporting

**Implementation:**
- Use primary for writes (bookings)
- Use replicas for reads (doctor/slot listings)

#### Connection Pooling

```javascript
// config/database.js
const pool = new Pool({
  max: 20,  // Increase for more connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Tuning:**
- `max`: Number of concurrent connections
- Monitor connection usage
- Adjust based on load

### Caching Strategy

#### Redis Cache (Future)

```
┌──────────┐
│   API    │
└────┬─────┘
     │
┌────▼────┐    ┌──────────┐
│  Redis  │    │PostgreSQL│
│  Cache  │    │          │
└─────────┘    └──────────┘
```

**Cache Keys:**
- `doctors:all` → List of all doctors (TTL: 5 minutes)
- `doctor:{id}:slots` → Doctor's slots (TTL: 1 minute)
- `stats:admin` → Admin statistics (TTL: 30 seconds)

**Cache Invalidation:**
- On doctor creation: Invalidate `doctors:all`
- On slot creation: Invalidate `doctor:{id}:slots`
- On booking: Invalidate slot cache

### Queue System (Future)

For high-traffic scenarios:

```
┌──────────┐
│   API    │
└────┬─────┘
     │
┌────▼────┐
│  Queue  │
│ (BullMQ)│
└────┬────┘
     │
┌────▼────┐
│  Worker │
│ Process │
└────┬────┘
     │
┌────▼────┐
│PostgreSQL│
└─────────┘
```

**Use Cases:**
- Booking processing (async)
- Email notifications
- Analytics updates

### Frontend Scaling

#### CDN (Vercel)

- Static assets cached globally
- Edge network for fast delivery
- Automatic optimization

#### Code Splitting

- Route-based splitting
- Lazy loading components
- Reduced initial bundle size

## 🔐 Security Considerations

### Input Validation

- **Server-side validation**: All inputs validated in controllers
- **Type checking**: TypeScript on frontend, manual checks on backend
- **SQL injection prevention**: Parameterized queries only

### Database Security

- **Connection encryption**: Use SSL for PostgreSQL connections
- **Credential management**: Environment variables, never hardcoded
- **Least privilege**: Database user has minimal required permissions

### API Security

- **CORS**: Configured for specific frontend domain
- **Rate limiting**: Implement on production (e.g., express-rate-limit)
- **HTTPS**: Enforced on production (Render/Vercel)

### Data Protection

- **PII handling**: Patient names/emails stored securely
- **No sensitive data in logs**: Avoid logging patient information
- **GDPR compliance**: Consider data retention policies

## 📊 Logging & Monitoring

### Logging Strategy

#### Application Logs

```javascript
// Query logging
console.log('Executed query', { text, duration, rows: res.rowCount });

// Error logging
console.error('Query error', { text, error: error.message });

// Job logging
console.log(`[${new Date().toISOString()}] Booking expiry job: Marked ${count} expired booking(s) as FAILED`);
```

#### Log Levels

- **INFO**: Normal operations (queries, job runs)
- **WARN**: Non-critical issues (missing column)
- **ERROR**: Errors requiring attention

### Monitoring Metrics

#### Key Metrics to Track

1. **API Performance**
   - Response times per endpoint
   - Request rate
   - Error rate

2. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Slow queries

3. **Booking Metrics**
   - Booking success rate
   - Expired bookings count
   - Concurrent booking conflicts

4. **System Health**
   - Server uptime
   - Memory usage
   - CPU usage

### Monitoring Tools (Future)

- **Application Performance Monitoring (APM)**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Log Aggregation**: LogRocket, Papertrail
- **Database Monitoring**: pg_stat_statements

### Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

**Enhanced Health Check (Future):**
```javascript
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      database: 'disconnected'
    });
  }
});
```

## 🎯 Performance Optimization

### Database Optimization

1. **Indexes**: Already created for common queries
2. **Query optimization**: Use EXPLAIN ANALYZE
3. **Connection pooling**: Reuse connections
4. **Prepared statements**: Use parameterized queries

### API Optimization

1. **Response compression**: Enable gzip (Express compression middleware)
2. **Pagination**: For large result sets (future)
3. **Field selection**: Return only needed fields (future)

### Frontend Optimization

1. **Code splitting**: Route-based splitting
2. **Image optimization**: Dicebear avatars are lightweight
3. **Bundle size**: Tree-shaking, minification
4. **Caching**: Browser caching for static assets

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: MedReserve Development Team


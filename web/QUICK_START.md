# Production Analytics - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- PostgreSQL database running
- Node.js 18+ installed
- npm/yarn package manager

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

**Required Variables** (edit `.env`):

```dotenv
# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# OpenAI (Required for AI insights)
OPENAI_API_KEY=sk-your_openai_api_key

# Admin User (Required)
ADMIN_ID=your_admin_user_id
```

**Optional Variables**:

```dotenv
# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Kafka (for event streaming)
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=js-ashanti-analytics

# Better Auth (production)
BETTER_AUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 2. Database Migration

```bash
# Install dependencies
npm install

# Run migrations (creates all tables)
npx prisma migrate dev

# Verify schema
npx prisma studio
```

**Tables Created**:

- `Event` - Immutable event log
- `Batch` - Event batches (OPEN → SEALED → ANALYZED)
- `AnalysisJob` - Job queue with state machine
- `Insight` - AI-generated insights
- `DeadLetterJob` - Failed job forensics
- `KafkaOutbox` - Transactional outbox pattern
- `ArchivedBatch` - Cold storage

### 3. Start Production Workers

**Terminal 1** - Start workers:

```bash
node scripts/start-batch-processor.js
```

Expected output:

```
[Startup] Initializing production-grade analytics workers...
[Config] Worker poll interval: 5000 ms
[Config] Recovery interval: 60000 ms
✓ All workers started successfully
  [Worker] Job claiming every 5 seconds
  [Recovery] Stuck job detection every 60 seconds
  [Batch Sealer] Hybrid sealing (100 events OR 10 min)
  [Job Creator] PENDING jobs for SEALED batches
  [Circuit Breaker] Protects AI API (5 failures → 10 min cooldown)
```

**Terminal 2** - Start Next.js:

```bash
npm run dev
```

### 4. Access Admin Dashboard

Open browser: `http://localhost:3000/admin/analytics`

**Dashboard Tabs**:

1. **Overview** - Metrics, live events, insights
2. **Batches** - Batch management with manual triggers
3. **Jobs** - Job queue monitoring + DLQ viewer
4. **Insights** - AI-generated insights timeline

---

## 🧪 Testing the System

### Test 1: Send Events via Socket.IO

**Option A**: Use frontend hook (in your React component):

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent({
      eventType: 'button_click',
      metadata: { button: 'submit', page: 'checkout' }
    });
  };

  return <button onClick={handleClick}>Track Event</button>;
}
```

**Option B**: Use Socket.IO client directly:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api/socket",
});

socket.emit("user:event", {
  eventId: "evt_" + Date.now(),
  eventType: "page_view",
  userId: "user_123",
  sessionId: "session_abc",
  timestamp: new Date().toISOString(),
  metadata: { page: "/products", referrer: "/home" },
});

socket.on("event:ack", (data) => {
  console.log("Event acknowledged:", data);
});
```

### Test 2: Verify Event Storage

```bash
# Open Prisma Studio
npx prisma studio
```

Check:

- `Event` table - Should have new events
- `Batch` table - Should have OPEN batch with `event_count > 0`

### Test 3: Trigger Batch Sealing

**Option A**: Wait for automatic sealing (10 minutes OR 100 events)

**Option B**: Manually seal via Prisma Studio:

1. Open `Batch` table
2. Find OPEN batch
3. Update: `status = "SEALED"`, `sealed_at = now()`

**Option C**: Run batch sealer directly:

```bash
node -e "
const { sealExpiredBatches } = require('./src/lib/batch-processor.js');
sealExpiredBatches().then(() => console.log('Done'));
"
```

### Test 4: Verify Job Creation

After batch is SEALED, check:

1. **Admin Dashboard** → Jobs tab
2. Should see new job with status: `PENDING`
3. Worker will claim it within 5 seconds

### Test 5: Watch Job Processing

**Admin Dashboard** → Jobs tab:

1. Job status changes: `PENDING` → `RUNNING`
2. If successful: `RUNNING` → `SUCCESS`
3. Check analysis time (should be 2-5 seconds)

**Console logs** (worker terminal):

```
[Worker] Claimed job: job_abc123
[Worker] Processing batch: batch_xyz789 (85 events)
[AI] Analyzing batch...
[Worker] Job succeeded in 2450ms
[Worker] Created 1 insight
```

### Test 6: View Generated Insights

**Admin Dashboard** → Insights tab:

- Should display AI-generated summary
- Shows confidence score, patterns, recommendations
- Auto-refreshes every 30 seconds

**Or query via API**:

```bash
curl http://localhost:3000/api/insights
```

### Test 7: Manual Batch Trigger

1. **Admin Dashboard** → Batches tab
2. Find a `SEALED` batch
3. Click **Analyze** button
4. Toast notification: "Analysis triggered successfully"
5. Check Jobs tab - new job created

### Test 8: Circuit Breaker Activation

**Simulate AI API failures**:

1. Set invalid `OPENAI_API_KEY` in `.env`
2. Restart workers
3. Send 100+ events to create batch
4. Watch circuit breaker open after 5 failures

**Dashboard should show**:

- Circuit Breaker: **OPEN** (red indicator)
- Failure count: 5
- State change timestamp

**After 10 minutes**:

- Circuit transitions to **HALF_OPEN** (yellow)
- Test request sent
- If still failing → **OPEN** again
- If fixed → **CLOSED** (green)

### Test 9: Recovery Mechanism

**Simulate stuck job**:

1. Stop workers (`Ctrl+C`)
2. Create PENDING job (manual trigger)
3. Wait 16 minutes
4. Restart workers
5. Recovery loop detects stuck job
6. Job moved back to PENDING

**Console logs**:

```
[Recovery] Found 1 stuck jobs
[Recovery] Moving job job_abc123 back to PENDING
[Recovery] Attempt 2/5
```

### Test 10: Dead Letter Queue

**Simulate permanent failure**:

1. Set invalid `OPENAI_API_KEY`
2. Trigger batch analysis
3. Job will retry 5 times
4. After 5 attempts → moved to DLQ

**Admin Dashboard** → Jobs tab → Dead Letter Queue section:

- Shows failed job with error context
- Displays attempt count (5)
- Preserves error message for debugging

---

## 📊 Performance Verification

### Expected Metrics (Normal Operation)

| Metric                   | Expected Value | Notes                  |
| ------------------------ | -------------- | ---------------------- |
| Job claim latency        | < 100ms        | Database query time    |
| Analysis time (avg)      | 2-5 seconds    | Depends on OpenAI API  |
| Analysis time (P95)      | 5-10 seconds   | 95th percentile        |
| Batch sealing lag        | < 60 seconds   | Cron runs every minute |
| Event ingestion          | < 50ms         | Socket.IO write to DB  |
| Circuit breaker recovery | 10 minutes     | Configurable cooldown  |
| Stuck job detection      | 15 minutes     | Recovery loop interval |

### Load Testing (Optional)

```bash
# If K6 is installed
npm run load-test -- --scenario=burst --duration=5m
```

**Or send events in loop**:

```javascript
// flood-test.js
const io = require("socket.io-client");
const socket = io("http://localhost:3000", { path: "/api/socket" });

let count = 0;
setInterval(() => {
  socket.emit("user:event", {
    eventId: `evt_${count++}`,
    eventType: "load_test",
    userId: `user_${Math.floor(Math.random() * 100)}`,
    timestamp: new Date().toISOString(),
    metadata: { test: true },
  });

  if (count % 100 === 0) {
    console.log(`Sent ${count} events`);
  }
}, 10); // 100 events/second
```

**Monitor**:

- Dashboard → Overview → Job metrics
- Should see pending jobs increase
- Workers should process at ~12 jobs/minute (5s interval)
- Circuit breaker should remain CLOSED

---

## 🔍 Debugging

### Check Worker Status

```bash
# View all running workers
ps aux | grep "start-batch-processor"

# Check logs
tail -f worker.log  # if logging to file
```

### Inspect Database State

```sql
-- Check OPEN batches
SELECT batch_id, status, event_count, created_at
FROM "Batch"
WHERE status = 'OPEN';

-- Check pending jobs
SELECT job_id, batch_id, status, attempt_count, created_at
FROM "AnalysisJob"
WHERE status = 'PENDING'
ORDER BY created_at ASC;

-- Check stuck jobs
SELECT job_id, batch_id, status, updated_at,
       EXTRACT(EPOCH FROM (now() - updated_at)) as age_seconds
FROM "AnalysisJob"
WHERE status = 'RUNNING'
  AND updated_at < now() - interval '15 minutes';

-- Check DLQ
SELECT * FROM "DeadLetterJob" ORDER BY failed_at DESC LIMIT 10;

-- Check circuit breaker failures
SELECT job_id, last_error, created_at
FROM "AnalysisJob"
WHERE last_error LIKE '%circuit%'
  AND created_at > now() - interval '1 hour';
```

### Common Issues

**Issue**: Events not appearing in dashboard

- **Check**: Socket.IO connection (browser console)
- **Fix**: Verify `NEXT_PUBLIC_APP_URL` in `.env`

**Issue**: Jobs stuck in PENDING

- **Check**: Workers running (`ps aux | grep node`)
- **Fix**: Restart workers

**Issue**: Circuit breaker always OPEN

- **Check**: `OPENAI_API_KEY` valid
- **Fix**: Update key, wait 10 min for cooldown

**Issue**: No insights generated

- **Check**: Job status (should be SUCCESS)
- **Fix**: Check `last_error` in AnalysisJob table

---

## 📱 Production Deployment

### PM2 Configuration

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "run start",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "analytics-worker",
      script: "./scripts/start-batch-processor.js",
      instances: 1,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

**Start**:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Health Checks

```bash
# Check metrics endpoint
curl http://localhost:3000/api/admin/metrics

# Response should include:
# - jobs.pending, jobs.running
# - batches.open, batches.sealed
# - circuit_breaker.state
# - dead_letter_queue.total
```

### Monitoring Alerts

Set up alerts for:

- DLQ count > 10
- Circuit breaker OPEN > 30 min
- Pending jobs > 50
- Oldest pending job > 1 hour
- No events in last 5 min (if expecting traffic)

---

## 🎯 Success Criteria

✅ **System is working correctly if**:

1. Events appear in dashboard within 1 second
2. Batches seal automatically after 10 minutes OR 100 events
3. Jobs process within 30 seconds of batch sealing
4. Insights appear in dashboard after job SUCCESS
5. Circuit breaker stays CLOSED under normal load
6. Stuck jobs recover automatically within 16 minutes
7. Failed jobs move to DLQ after 5 attempts
8. Manual batch triggers work without errors
9. Dashboard refreshes show live metrics
10. No memory leaks after 24 hours

---

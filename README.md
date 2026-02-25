# JS Ashanti - E-commerce Platform

**SAMUEL OWUSU ASANTE - 10211100307**

A full-stack e-commerce application with web and mobile clients.

## Project Structure

```
├── web/          # Next.js web application (Frontend)
├── backend/      # Node.js Express API & Background Workers
├── mobile/       # React Native Expo mobile app
└── README.md
```

## Backend (Node.js Express)

The backend is located in the `backend/` folder and handles API requests, authentication, and background processing.

### Getting Started

```bash
cd backend
npm install
npm run dev
```

### Features
- **Unified Entry Point**: Starts both the Express API and background workers (Batch Processor, Job Worker, Recovery Loop) with a single command.
- **Database**: Prisma ORM with PostgreSQL.
- **Auth**: Better-Auth integrated for secure session management.
- **AI**: Background workers powered by Groq SDK.

## Web Application (Next.js)

The web app is located in the `web/` folder.

### Getting Started

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Tech Stack

- Next.js 14+ (App Router)
- Prisma ORM
- TailwindCSS
- Better Auth

## Mobile Application (React Native Expo)

The mobile app is located in the `js-ashanti/` folder.

### Getting Started

```bash
cd js-ashanti
npm install
npx expo start
```

### Running on devices

- **Android**: `npm run android` or scan QR with Expo Go
- **iOS**: `npm run ios` (macOS only) or scan QR with Expo Go
- **Web**: `npm run web`

### Tech Stack

- React Native with Expo
- TypeScript

## Links

- **Live Web App**: https://jsashanti.vercel.app/products
- **Admin Panel**: https://jsashanti.vercel.app/admin

## Notes

- The `.env` files in `web/` and `backend/` contain sensitive info - never commit them.
- Use `.env.example` in each directory as a template for your local setup.
- The backend must be running for both web and mobile clients to function correctly.

## Analytics Event Taxonomy

The platform now tracks both user events (frontend) and system events (backend) for commerce analytics and security monitoring.

### Core event groups

- **User behavior**
  - `PAGE_VIEW`
  - `PRODUCT_VIEW`
  - `ADD_TO_CART`
  - `REMOVE_FROM_CART`
  - `CHECKOUT_START`
  - `CHECKOUT_COMPLETE`
  - `checkout_success`
  - `checkout_failed`
- **Commerce lifecycle**
  - `PURCHASE_COMPLETED`
  - `DELIVERY_STATUS_CHANGED`
- **Operations**
  - `INVENTORY_UPDATED`

### Required payload fields (recommended standard)

- `eventType`: string
- `timestamp`: ISO datetime
- `userId`: user id, email, or `"system"` for backend-generated events
- `sessionId`: active session id or `"system"`
- `page` (optional): current route/page context
- `metadata` (optional object): event-specific attributes

### Suggested metadata keys by event

- **Product events**: `productId`, `slug`, `quantity`
- **Checkout/purchase**: `orderId`, `itemCount`, `totalAmount`
- **Payment/delivery**: `statusFrom`, `statusTo`, `paymentProvider`, `paymentRef`
- **Inventory**: `updateType`, `stock`, `discount`

### Security controls in place

- Client-side throttle and dedupe in analytics hook (reduces noisy repeats)
- Server-side websocket rate limits (per socket + per user)
- Server-side dedupe window for near-identical events
- Payload size and timestamp validation during ingestion

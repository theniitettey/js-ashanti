/**
 * Real-time Analytics Event Model
 * Shared contract between frontend and backend
 */

export interface UserEvent {
  eventId: string;
  eventType: string;
  userId: string;
  sessionId: string;
  page?: string;
  metadata?: Record<string, any>;
  timestamp: string; // ISO string
}

/**
 * Common event types
 */
export enum EventType {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  PAGE_VIEW = "PAGE_VIEW",
  PRODUCT_VIEW = "PRODUCT_VIEW",
  ADD_TO_CART = "ADD_TO_CART",
  REMOVE_FROM_CART = "REMOVE_FROM_CART",
  CHECKOUT_START = "CHECKOUT_START",
  CHECKOUT_COMPLETE = "CHECKOUT_COMPLETE",
  SEARCH = "SEARCH",
  SCROLL = "SCROLL",
  FILTER_APPLIED = "FILTER_APPLIED",
}

/**
 * AI-generated insight model
 */
export interface Insight {
  id: string;
  summary: string;
  confidence: number;
  patterns: string[];
  timeWindow: string;
  eventCount: number;
  createdAt: string;
}

/**
 * Batch of events sent to AI
 */
export interface EventBatch {
  timeWindow: string;
  events: UserEvent[];
  batchId: string;
}

/**
 * AI analysis response
 */
export interface AIAnalysis {
  summary: string;
  confidence: number;
  patterns: string[];
  timestamp: string;
}

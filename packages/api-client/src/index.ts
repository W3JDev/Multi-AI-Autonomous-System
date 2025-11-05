/**
 * API Client - tRPC SDK
 * Type-safe API client for all applications
 */

// Export all schemas
export * from "./schemas";

// Export routers
export { appRouter } from "./routers";
export type { AppRouter } from "./routers";

// Re-export client and server utilities
export { trpc } from "./client";
export { router, publicProcedure, protectedProcedure, createCallerFactory } from "./server/trpc";
export type { Context } from "./server/trpc";

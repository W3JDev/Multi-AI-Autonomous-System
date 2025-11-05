/**
 * Client-side exports for tRPC
 * Provides React hooks and vanilla client
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../routers";

/**
 * React hooks for tRPC
 * Usage in apps:
 * 
 * const employees = trpc.punchClock.getEmployees.useQuery({ orgId: '123' });
 * const createEmployee = trpc.punchClock.createEmployee.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();

// Re-export AppRouter type for client use
export type { AppRouter } from "../routers";

import { initTRPC } from "@trpc/server";
import superjson from "superjson";

/**
 * Context for tRPC procedures
 * Can be extended with auth, database, etc.
 */
export interface Context {
  userId?: string;
  organizationId?: string;
  role?: string;
}

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure builders
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error("Unauthorized: User not authenticated");
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be defined
    },
  });
});

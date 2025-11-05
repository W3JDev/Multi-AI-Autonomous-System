import { router, publicProcedure } from "../server/trpc";
import { healthCheckSchema } from "../schemas";
import { punchClockRouter } from "./punch-clock";
import { waiterAiRouter } from "./waiter-ai";
import { flairAiRouter } from "./flair-ai";
import { artisanAiRouter } from "./artisan-ai";
import { sereneAiRouter } from "./serene-ai";

/**
 * Main Application Router
 * Combines all app-specific routers
 */
export const appRouter = router({
  // Health check
  health: publicProcedure
    .input(healthCheckSchema)
    .query(({ input }) => {
      return {
        status: "healthy",
        service: input.service || "all",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    }),

  // App-specific routers
  punchClock: punchClockRouter,
  waiterAi: waiterAiRouter,
  flairAi: flairAiRouter,
  artisanAi: artisanAiRouter,
  sereneAi: sereneAiRouter,
});

/**
 * Export type definition of API
 */
export type AppRouter = typeof appRouter;

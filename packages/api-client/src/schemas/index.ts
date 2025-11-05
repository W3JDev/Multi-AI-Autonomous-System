import { z } from "zod";

/**
 * Common schemas used across applications
 */

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Organization schema
export const organizationIdSchema = z.object({
  orgId: z.string().uuid(),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Punch Clock Schemas
 */
export const punchClockSchemas = {
  getEmployees: organizationIdSchema.merge(paginationSchema.partial()),
  
  createEmployee: z.object({
    orgId: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "manager", "employee"]),
  }),
  
  clockIn: z.object({
    employeeId: z.string().uuid(),
    timestamp: z.string().datetime().optional(),
  }),
  
  clockOut: z.object({
    employeeId: z.string().uuid(),
    timestamp: z.string().datetime().optional(),
  }),
  
  getTimeSheet: z.object({
    employeeId: z.string().uuid(),
  }).merge(dateRangeSchema),
};

/**
 * Waiter AI Schemas
 */
export const waiterAiSchemas = {
  getOrders: organizationIdSchema.merge(paginationSchema.partial()),
  
  createOrder: z.object({
    orgId: z.string().uuid(),
    tableNumber: z.number().int().positive(),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })),
  }),
  
  updateOrderStatus: z.object({
    orderId: z.string().uuid(),
    status: z.enum(["pending", "preparing", "ready", "served", "paid"]),
  }),
  
  analyzeMenu: z.object({
    orgId: z.string().uuid(),
    menuData: z.array(z.object({
      itemId: z.string(),
      name: z.string(),
      price: z.number(),
      orders: z.number(),
      revenue: z.number(),
    })),
  }),
};

/**
 * Flair AI Schemas
 */
export const flairAiSchemas = {
  getResumes: organizationIdSchema.merge(paginationSchema.partial()),
  
  uploadResume: z.object({
    orgId: z.string().uuid(),
    candidateName: z.string(),
    email: z.string().email(),
    resumeUrl: z.string().url(),
    position: z.string(),
  }),
  
  scoreResume: z.object({
    resumeId: z.string().uuid(),
  }),
  
  getCandidates: z.object({
    orgId: z.string().uuid(),
    position: z.string().optional(),
    minScore: z.number().min(0).max(100).optional(),
  }).merge(paginationSchema.partial()),
};

/**
 * Artisan AI Schemas
 */
export const artisanAiSchemas = {
  getProjects: organizationIdSchema.merge(paginationSchema.partial()),
  
  createProject: z.object({
    orgId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string(),
    clientName: z.string(),
    budget: z.number().positive(),
  }),
  
  generateDesign: z.object({
    projectId: z.string().uuid(),
    prompt: z.string().min(10),
    style: z.enum(["modern", "classic", "minimalist", "rustic", "industrial"]),
  }),
};

/**
 * Serene AI Schemas
 */
export const sereneAiSchemas = {
  getBookings: organizationIdSchema.merge(paginationSchema.partial()),
  
  createBooking: z.object({
    orgId: z.string().uuid(),
    clientName: z.string(),
    serviceType: z.string(),
    scheduledTime: z.string().datetime(),
    duration: z.number().int().positive(),
  }),
  
  analyzeWellness: z.object({
    clientId: z.string().uuid(),
    metrics: z.array(z.object({
      date: z.string().datetime(),
      moodScore: z.number().min(1).max(10),
      stressLevel: z.number().min(1).max(10),
      sleepHours: z.number().min(0).max(24),
    })),
  }),
};

/**
 * Health Check Schema
 */
export const healthCheckSchema = z.object({
  service: z.string().optional(),
});

// frontend/src/types/api.ts
// Add general API related types here.

/**
 * Generic API Response Wrapper (adjust based on actual backend structure)
 */
export interface ApiResponse<T = any> {
  code?: number; // Optional status code
  message?: string; // Optional message
  data: T; // The actual data payload
}

/**
 * System Configuration Map Type
 */
export type SystemConfigMap = Record<string, any>;

// export {}; // No longer needed 
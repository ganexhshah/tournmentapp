// Simplified cache implementation without Redis for development
export const connectRedis = async () => {
  console.log('⚠️  Redis not available, running without cache');
  return null;
};

export const disconnectRedis = async () => {
  // No-op
};

// In-memory cache fallback for development
const memoryCache = new Map();

export const cache = {
  get: async (key: string) => {
    return memoryCache.get(key) || null;
  },

  set: async (key: string, value: any, ttl: number = 3600) => {
    memoryCache.set(key, value);
    // Simple TTL cleanup (not production ready)
    setTimeout(() => {
      memoryCache.delete(key);
    }, ttl * 1000);
    return true;
  },

  del: async (key: string) => {
    memoryCache.delete(key);
    return true;
  },

  exists: async (key: string) => {
    return memoryCache.has(key);
  },

  flush: async () => {
    memoryCache.clear();
    return true;
  }
};

export const redisClient = null;
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
    const value = memoryCache.get(key) || null;
    console.log(`🔍 Cache GET ${key}:`, value);
    return value;
  },

  set: async (key: string, value: any, ttl: number = 3600) => {
    memoryCache.set(key, value);
    console.log(`💾 Cache SET ${key}:`, value, `(TTL: ${ttl}s)`);
    // Simple TTL cleanup (not production ready)
    setTimeout(() => {
      console.log(`⏰ Cache TTL expired for ${key}`);
      memoryCache.delete(key);
    }, ttl * 1000);
    return true;
  },

  del: async (key: string) => {
    const deleted = memoryCache.delete(key);
    console.log(`🗑️ Cache DEL ${key}:`, deleted);
    return true;
  },

  exists: async (key: string) => {
    const exists = memoryCache.has(key);
    console.log(`❓ Cache EXISTS ${key}:`, exists);
    return exists;
  },

  flush: async () => {
    memoryCache.clear();
    console.log('🧹 Cache FLUSH: all keys cleared');
    return true;
  }
};

export const redisClient = null;
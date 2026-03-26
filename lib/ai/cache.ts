import { Redis } from "@upstash/redis";

export const redisCache = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedResponse(key: string): Promise<string | null> {
    try { return await redisCache.get<string>(key) } catch { return null }
}

export async function setCachedResponse(key: string, value: string, ttlSeconds: number = 3600) {
    try { await redisCache.setex(key, ttlSeconds, value) } catch (error) { console.error('Redis Cache Set Error:', error) }
}

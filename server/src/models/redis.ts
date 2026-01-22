import Redis from "ioredis";
import type {SessionData} from "@hono/session";

const SESSION_PREFIX = "sess:";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redis = new Redis(redisUrl);
    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
    redis.on("connect", () => {
      console.log("Connected to Redis");
    });
  }
  return redis;
}

export interface UserSessionData {
  userId: number;
  username: string;
  darkTheme: boolean;
}

export type AppSessionData = UserSessionData & SessionData;

export const sessionStorage = {
  async get(key: string): Promise<SessionData | null> {
    const client = getRedisClient();
    const data = await client.get(SESSION_PREFIX + key);
    if (!data) return null;
    return JSON.parse(data);
  },

  async set(key: string, value: SessionData): Promise<void> {
    const client = getRedisClient();
    await client.setex(
      SESSION_PREFIX + key,
      SESSION_TTL,
      JSON.stringify(value)
    );
  },

  async delete(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(SESSION_PREFIX + key);
  },
};

// Helper to check if Redis is available
export async function isRedisConnected(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

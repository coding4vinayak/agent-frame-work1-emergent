
import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../cache';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${identifier}`;
    
    try {
      const current = await cacheGet<number>(key);
      
      if (current && current >= config.maxRequests) {
        return res.status(429).json({
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
      }
      
      await cacheSet(key, (current || 0) + 1, config.windowMs / 1000);
      next();
    } catch (error) {
      // If rate limiting fails, allow the request
      console.error('Rate limit error:', error);
      next();
    }
  };
}

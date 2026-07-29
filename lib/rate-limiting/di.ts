import { PrismaRateLimitRepository } from "./repository";
import { RateLimiterImpl } from "./rate-limiter";
import { SystemClock } from "./clock";
import { createWithRateLimit } from "./middleware";
import { validateConfig, freezeConfig } from "./config";
import { startCleanup } from "./cleanup";

validateConfig();
freezeConfig();

const repository = new PrismaRateLimitRepository();
const clock = new SystemClock();
const rateLimiter = new RateLimiterImpl(repository, clock);
export { rateLimiter };

export const withRateLimit = createWithRateLimit(rateLimiter);

startCleanup();

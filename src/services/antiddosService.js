require("dotenv").config();

const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
// It is recommended to process Redis errors and setup some reconnection strategy
const redisClient = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
});

const opts = {
  storeClient: redisClient,
  points: 10, // Number of points
  duration: 1, // Per second(s)
};

const rateLimiterRedis = new RateLimiterRedis(opts);

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiterRedis
    .consume(req.connection?.remoteAddress)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        // Some Redis error
      } else {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set("Retry-After", String(secs));
        res.status(429).json({ error: true, message: "Too Many Requests" });
      }
    });
};

module.exports = { rateLimiterMiddleware };

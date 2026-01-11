# Redis Configuration Setup

## Production Redis URL

Add the following to your `.env` file in the `backend` directory:

```env
REDIS_URL=redis://default:pS9tpz7ys9eUU1VMANQ7wlAmVHzZ1E1f@redis-14041.c263.us-east-1-2.ec2.cloud.redislabs.com:14041
```

## Setup Instructions

1. Create a `.env` file in the `backend` directory (if it doesn't exist)
2. Add the `REDIS_URL` variable with the production Redis URL above
3. The application will automatically use this URL for:
   - Redis client connection (rate limiting, caching)
   - Bull queue (video processing queue)

## Environment Variables

The backend uses the following Redis-related environment variables:

- `REDIS_URL` - Complete Redis connection URL (required for production)

The code automatically parses the URL format: `redis://[username]:[password]@[host]:[port]`

## Testing the Connection

You can test the Redis connection using:

```bash
redis-cli -u redis://default:pS9tpz7ys9eUU1VMANQ7wlAmVHzZ1E1f@redis-14041.c263.us-east-1-2.ec2.cloud.redislabs.com:14041
```

## Notes

- The Redis URL is parsed automatically by the application
- Both the Redis client and Bull queue use the same `REDIS_URL` environment variable
- Make sure `.env` is in your `.gitignore` to keep credentials secure

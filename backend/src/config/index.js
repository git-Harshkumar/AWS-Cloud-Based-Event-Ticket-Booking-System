import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  instanceId: process.env.INSTANCE_ID || 'backend-instance-1',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET || '',
    cloudWatchLogGroup: process.env.CLOUDWATCH_LOG_GROUP || '',
    cloudWatchLogStream: process.env.CLOUDWATCH_LOG_STREAM || ''
  },
  database: {
    url: process.env.DATABASE_URL
  }
}
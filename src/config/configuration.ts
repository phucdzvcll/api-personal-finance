export default () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  api: {
    prefix: process.env.API_PREFIX || "api/v1",
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== "false",
    path: process.env.SWAGGER_PATH || "docs",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "personal_finance",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  logging: {
    level: process.env.LOG_LEVEL || "debug",
  },
});

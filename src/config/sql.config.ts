import { registerAs } from '@nestjs/config';

export default registerAs('sql', () => ({
  driver: process.env.SQL_DB_DRIVER || 'mysql',
  host: process.env.SQL_DB_HOST || 'localhost',
  port: parseInt(process.env.SQL_DB_PORT, 10) || 3306,
  username: process.env.SQL_DB_USERNAME || 'root',
  password: process.env.SQL_DB_PASSWORD,
  name: process.env.SQL_DB_NAME || 'backend',
  filename: process.env.SQL_DB_FILENAME || './backend.sqlite',
}));

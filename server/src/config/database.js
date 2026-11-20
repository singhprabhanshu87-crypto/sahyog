import './dns-bootstrap.js';
import mongoose from 'mongoose';
import config from './index.js';
import logger from '../common/lib/logger.js';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info({ db: config.MONGODB_DB_NAME }, 'MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  await mongoose.connect(config.MONGODB_URI, {
    dbName: config.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    family: 4,
  });

  isConnected = true;
  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

export function getConnectionState() {
  return mongoose.connection.readyState;
}

export default { connectDatabase, disconnectDatabase, getConnectionState };

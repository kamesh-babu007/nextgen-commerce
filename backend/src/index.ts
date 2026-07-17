import { onRequest } from 'firebase-functions/v2/https';
import app from './server';

// Wrap the Express app with Firebase Functions v2
export const api = onRequest(app);

import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI

// Cache the connection across hot reloads (dev) and serverless invocations (prod)
// to avoid opening a new connection on every request / module re-eval.
let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment')
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { bufferCommands: false })
      .then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}

export default connectDB

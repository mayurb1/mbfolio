import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple health check that verifies the database connection.
export async function GET() {
  try {
    const conn = await connectDB()
    return NextResponse.json({
      data: {
        db: 'connected',
        host: conn.connection.host,
        readyState: conn.connection.readyState,
      },
      message: 'OK',
      status: 200,
    })
  } catch (err) {
    return NextResponse.json(
      { message: err.message, status: 500 },
      { status: 500 }
    )
  }
}

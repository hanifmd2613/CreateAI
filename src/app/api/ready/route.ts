import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;

  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
      dbLatencyMs = Date.now() - startTime;
    } else {
      dbStatus = 'degraded_in_memory';
    }
  } catch (err: any) {
    dbStatus = 'error: ' + (err.message || String(err));
  }

  const groqConfigured = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
  const geminiConfigured = !!(process.env.GOOGLE_GEMINI_API_KEY && process.env.GOOGLE_GEMINI_API_KEY.trim() !== '');

  const isReady = dbStatus === 'connected' || dbStatus === 'degraded_in_memory';

  return NextResponse.json({
    status: isReady ? 'ready' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'mongodb',
      status: dbStatus,
      latencyMs: dbLatencyMs,
      readyState: mongoose.connection.readyState,
    },
    aiProviders: {
      groq: { configured: groqConfigured, model: 'llama-3.3-70b-versatile' },
      gemini: { configured: geminiConfigured, model: 'gemini-1.5-flash' },
      localNeuralEngine: { configured: true, model: 'deterministic-multimodal-synthesizer' },
    },
  }, { status: isReady ? 200 : 503 });
}

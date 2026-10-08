import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { BriefModel } from '../../../lib/models/Brief';
import { INITIAL_BRIEFS } from '../../../data/mockData';
import { Brief } from '../../../types';

let memoryCache: Brief[] = [...INITIAL_BRIEFS];

export async function GET(req: NextRequest) {
  try {
    const conn = await connectToDatabase();
    let results: Brief[] = [];

    if (conn) {
      try {
        const dbBriefs = await BriefModel.find({}).sort({ createdAt: -1 }).lean();
        if (dbBriefs && dbBriefs.length > 0) {
          results = dbBriefs as any[];
        }
      } catch (dbErr) {
        console.warn('MongoDB brief query error, using fallback dataset:', dbErr);
      }
    }

    if (results.length === 0) {
      results = [...memoryCache];
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      briefs: results,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Failed to fetch briefs.'
      }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newBrief: Brief = await req.json();

    // Input Validation
    if (!newBrief.title || typeof newBrief.title !== 'string' || newBrief.title.trim() === '') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief campaign title is required.' }
      }, { status: 400 });
    }

    if (!newBrief.description || typeof newBrief.description !== 'string' || newBrief.description.trim() === '') {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brief creative description is required.' }
      }, { status: 400 });
    }

    const briefId = newBrief.id || `brief-${Date.now()}`;
    const briefToSave: Brief = {
      ...newBrief,
      id: briefId,
      title: newBrief.title.trim(),
      description: newBrief.description.trim(),
      brandName: newBrief.brandName || 'Kaveri Creative Studios',
      brandAvatar: newBrief.brandAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=KaveriStudios',
      contentType: newBrief.contentType || 'AI Commercial Video',
      style: newBrief.style || 'Cinematic Hyperrealism',
      aspectRatio: newBrief.aspectRatio || '16:9',
      commercialUse: newBrief.commercialUse || 'Full Buyout',
      budget: newBrief.budget || '₹3,50,000 - ₹7,00,000',
      deadline: newBrief.deadline || '3-5 Days',
      requiredTools: Array.isArray(newBrief.requiredTools) && newBrief.requiredTools.length > 0
        ? newBrief.requiredTools
        : ['Veo', 'Kling'],
      deliverables: Array.isArray(newBrief.deliverables) ? newBrief.deliverables : ['Master 4K Video', 'Seed Manifest'],
      status: 'Open',
      createdAt: 'Just now',
      applicantsCount: 0,
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await BriefModel.create(briefToSave);
      } catch (dbErr) {
        console.warn('MongoDB brief save warning:', dbErr);
      }
    }

    memoryCache = [briefToSave, ...memoryCache];

    return NextResponse.json({
      success: true,
      brief: briefToSave,
      message: 'Campaign brief published successfully.',
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create campaign brief.' }
    }, { status: 500 });
  }
}

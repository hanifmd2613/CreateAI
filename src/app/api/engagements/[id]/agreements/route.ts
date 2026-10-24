import { NextRequest, NextResponse } from 'next/server';
import { getEngagementById, updateEngagement, recordAudit } from '@/lib/engagementStore';
import { AgreedEngagementTerms } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const engagement = await getEngagementById(id);
    if (!engagement) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Engagement with ID "${id}" was not found.` }
      }, { status: 404 });
    }

    // Check licensing conflicts
    if (engagement.licensingStatus === 'MISMATCH' && !body.overrideHumanReview) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'LICENSING_MISMATCH_BLOCKER',
          message: 'Cannot confirm agreement while licensing status is MISMATCH. Unresolved territory, duration, or commercial use conflicts exist.',
        }
      }, { status: 409 });
    }

    const agreedTerms: AgreedEngagementTerms = {
      confirmedBudget: body.confirmedBudget || engagement.proposedBudget,
      confirmedDeadline: body.confirmedDeadline || '72 Hours',
      maxRevisionRounds: body.maxRevisionRounds || engagement.maxRevisions || 2,
      licensingTerms: body.licensingTerms || {
        commercialScope: 'Full Buyout',
        territory: 'Worldwide',
        durationMonths: 12,
        channels: ['Paid Advertising', 'Organic Social', 'Digital / Web'],
        exclusivity: 'Category Exclusive',
        derivativeRights: true,
      },
      scopeSummary: body.scopeSummary || `Commission agreement for "${engagement.projectTitle}"`,
      confirmedByBrandAt: new Date().toISOString(),
      confirmedByCreatorAt: new Date().toISOString(),
    };

    const updated = await updateEngagement(id, {
      agreedTerms,
      licensingStatus: 'COMPATIBLE',
      status: 'AGREEMENT_CONFIRMED',
      proposedBudget: agreedTerms.confirmedBudget,
    });

    // Auto-advance to IN_PRODUCTION once agreement is confirmed
    const inProduction = await updateEngagement(id, {
      status: 'IN_PRODUCTION',
    });

    await recordAudit(
      'AGREEMENT_CONFIRMED',
      body.actorId || engagement.brandId,
      body.actorName || engagement.brandName,
      body.actorRole || 'brand',
      {
        confirmedBudget: agreedTerms.confirmedBudget,
        confirmedDeadline: agreedTerms.confirmedDeadline,
        maxRevisionRounds: agreedTerms.maxRevisionRounds,
        licensingTerms: agreedTerms.licensingTerms,
      },
      id,
      engagement.briefId
    );

    return NextResponse.json({
      success: true,
      engagement: inProduction,
      message: 'Scope and licensing terms successfully confirmed. Engagement is now IN_PRODUCTION.',
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    }, { status: 500 });
  }
}

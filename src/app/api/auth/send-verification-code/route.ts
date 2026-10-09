import { NextRequest, NextResponse } from 'next/server';
import { createVerificationChallenge, normalizeEmail } from '@/lib/verificationStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose = 'signup' } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const normEmail = normalizeEmail(email);

    // Create cryptographic challenge
    const result = createVerificationChallenge(normEmail, purpose);

    if (!result.success) {
      return NextResponse.json({ error: result.message, cooldownLeft: result.cooldownLeft }, { status: 429 });
    }

    const code = result.code;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.VERIFICATION_FROM_EMAIL || 'GenCraft Verification <no-reply@gencraft.ai>';

    let emailDelivered = false;

    // Send email via Resend API if API Key is configured
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [normEmail],
            subject: 'GenCraft Account Verification Code',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #27272a; background: #09090b; color: #f4f4f5; border-radius: 12px;">
                <h2 style="color: #10b981; margin-bottom: 8px;">GenCraft Verification Code</h2>
                <p style="font-size: 14px; color: #a1a1aa;">Use the following 6-digit code to complete your GenCraft account verification:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px; background: #18181b; border: 1px solid #3f3f46; text-align: center; border-radius: 8px; color: #ffffff; margin: 20px 0;">
                  ${code}
                </div>
                <p style="font-size: 12px; color: #71717a;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
              </div>
            `,
          }),
        });

        if (resendRes.ok) {
          emailDelivered = true;
        } else {
          console.warn('Resend API returned error:', await resendRes.text());
        }
      } catch (emailErr) {
        console.warn('Failed to send verification email via Resend:', emailErr);
      }
    }

    // Console logging for server logs & fallback
    console.log(`[AUTH] Verification code generated for ${normEmail}: [${code}] (Delivered via API: ${emailDelivered})`);

    return NextResponse.json({
      success: true,
      message: emailDelivered 
        ? `Verification code delivered to ${normEmail}.`
        : `Verification code sent to ${normEmail}.`,
      emailDelivered,
      // For local development fallback when no mailer is configured:
      devCode: process.env.NODE_ENV !== 'production' && !resendApiKey ? code : undefined,
    });
  } catch (err: any) {
    console.error('Error in send-verification-code API:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const adminDb = getAdminDb();

    // 1. Save inquiry to Firestore
    const inquiryRef = await adminDb.collection('contact_inquiries').add({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      createdAt: timestamp,
      status: 'NEW',
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FinFlow AI <onboarding@resend.dev>';
    const adminNotificationEmail = process.env.ADMIN_SUPPORT_EMAIL || 'support@finflow.ai';

    // 2. Dispatch emails via Resend if API key is present
    if (resendApiKey) {
      // Email A: Notification to Support / Admin Team
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminNotificationEmail],
            reply_to: email,
            subject: `[Support Inquiry] ${subject || 'New Message'}: from ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
                <h2 style="color: #a855f7; margin-top: 0;">New Contact Form Inquiry</h2>
                <div style="background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 16px;">
                  <p><strong>From:</strong> ${name} (&lt;<a href="mailto:${email}" style="color: #c084fc;">${email}</a>&gt;)</p>
                  <p><strong>Category / Subject:</strong> ${subject}</p>
                  <p><strong>Received At:</strong> ${new Date(timestamp).toLocaleString()}</p>
                  <p><strong>Inquiry ID:</strong> ${inquiryRef.id}</p>
                </div>
                <div style="background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
                  <h3 style="margin-top: 0; color: #cbd5e1; font-size: 14px; text-transform: uppercase;">Message:</h3>
                  <p style="white-space: pre-wrap; line-height: 1.6; color: #e2e8f0;">${message}</p>
                </div>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.warn('[Contact API] Failed to dispatch admin notification email:', err);
      }

      // Email B: Auto-Confirmation Receipt to User
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: `We've received your message - FinFlow AI Support`,
            html: `
              <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 32px 20px;">
                <div style="max-width: 560px; margin: 0 auto; background: #1e293b; padding: 28px; border-radius: 12px; border: 1px solid #334155;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #a855f7; font-size: 22px; margin: 0;">FinFlow AI Support</h1>
                  </div>
                  <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                    Thank you for reaching out to FinFlow AI. We have received your inquiry regarding <strong>${subject}</strong> and our team is reviewing it.
                  </p>
                  <div style="background: #0f172a; border-left: 3px solid #a855f7; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 13px; color: #94a3b8; font-style: italic;">
                      "${message.length > 150 ? message.substring(0, 150) + '...' : message}"
                    </p>
                  </div>
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                    Our typical response SLA is within <strong>24 to 48 business hours</strong>. If you have additional details to add, simply reply directly to this email.
                  </p>
                  <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
                    © ${new Date().getFullYear()} FinFlow AI Technologies Private Limited.<br/>
                    Support Desk: support@finflowai.com
                  </p>
                </div>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.warn('[Contact API] Failed to dispatch user confirmation email:', err);
      }
    }

    return NextResponse.json({
      success: true,
      inquiryId: inquiryRef.id,
      message: 'Inquiry received successfully.',
    });
  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process inquiry.' },
      { status: 500 }
    );
  }
}

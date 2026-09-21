import { getAdminDb } from './firebaseAdmin';

export interface PaymentReceiptPayload {
  userId: string;
  userEmail?: string;
  paymentId: string;
  orderOrSubscriptionId?: string;
  type: 'subscription' | 'topup';
  itemName: string;
  creditsAdded: number;
  amountINR: number;
  timestamp?: string;
}

/**
 * Generates an official, bank-defensible Digital Goods Fulfillment Receipt HTML string.
 */
export function generateDeliveryReceiptHTML(payload: PaymentReceiptPayload): string {
  const dateStr = payload.timestamp
    ? new Date(payload.timestamp).toUTCString()
    : new Date().toUTCString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Fulfillment Receipt - FinFlow AI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #10b981; text-decoration: none; }
        .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 12px; }
        .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; }
        .details-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .row { display: flex; justify-between; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #1e293b; }
        .row:last-child { border-bottom: none; }
        .label { color: #94a3b8; }
        .value { color: #f1f5f9; font-weight: 600; text-align: right; }
        .total-row { font-size: 18px; color: #10b981; font-weight: bold; padding-top: 12px; }
        .legal-notice { font-size: 12px; color: #94a3b8; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin-top: 24px; line-height: 1.5; }
        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FinFlow AI</div>
          <div class="title">Official Delivery Proof & Payment Receipt</div>
          <div class="badge">Instant Digital Fulfillment Confirmed</div>
        </div>

        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Thank you for your purchase. This email confirms that <strong>${payload.creditsAdded.toLocaleString()} digital AI API credits</strong> have been immediately provisioned and delivered to your FinFlow AI account (<strong>${payload.userEmail || payload.userId}</strong>).
        </p>

        <div class="details-box">
          <div class="row">
            <span class="label">Payment ID:</span>
            <span class="value">${payload.paymentId}</span>
          </div>
          <div class="row">
            <span class="label">Order / Subscription Ref:</span>
            <span class="value">${payload.orderOrSubscriptionId || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Item Purchased:</span>
            <span class="value">${payload.itemName}</span>
          </div>
          <div class="row">
            <span class="label">Credits Provisioned:</span>
            <span class="value">${payload.creditsAdded.toLocaleString()} Credits</span>
          </div>
          <div class="row">
            <span class="label">Fulfillment Timestamp:</span>
            <span class="value">${dateStr}</span>
          </div>
          <div class="row total-row">
            <span class="label" style="color:#10b981">Amount Paid:</span>
            <span class="value">₹${payload.amountINR.toLocaleString('en-IN')} INR</span>
          </div>
        </div>

        <div class="legal-notice">
          <strong>Digital Goods Non-Refundability Acknowledgment:</strong><br>
          As acknowledged prior to payment checkout, purchased AI API credits represent instant digital compute allocations. Once provisioned or used for document processing, compute power is non-refundable. Please keep this receipt for your financial records.
        </div>

        <div class="footer">
          © FinFlow AI Technologies Private Limited | Support: support@finflow.ai<br>
          Tech Park Tower, Sector 62, Noida, UP 201309, India
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends and logs an instant digital delivery proof receipt upon successful Razorpay payment verification.
 */
export async function sendDeliveryReceiptEmail(payload: PaymentReceiptPayload): Promise<boolean> {
  const timestamp = payload.timestamp || new Date().toISOString();
  const receiptHtml = generateDeliveryReceiptHTML({ ...payload, timestamp });

  try {
    const adminDb = getAdminDb();

    // 1. Record receipt audit log in Firestore
    const receiptDocData = {
      ...payload,
      timestamp,
      status: 'FULFILLED_AND_DELIVERED',
      receiptHtml,
      chargebackEvidentiaryProof: true,
    };

    const userReceiptRef = adminDb
      .collection('users')
      .doc(payload.userId)
      .collection('payment_receipts')
      .doc(payload.paymentId || `rcpt_${Date.now()}`);

    await userReceiptRef.set(receiptDocData, { merge: true });

    // Also mirror to global payment_receipts collection for dispute export
    await adminDb.collection('payment_receipts').doc(userReceiptRef.id).set(receiptDocData, { merge: true });

    console.log(`[Delivery Proof Email] Logged & generated delivery receipt for user ${payload.userId} (Payment ID: ${payload.paymentId}, Credits: +${payload.creditsAdded})`);

    // 2. Dispatch email via RESEND_API_KEY if configured in environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && payload.userEmail) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_RECEIPTS_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'FinFlow AI Receipts <onboarding@resend.dev>',
            to: [payload.userEmail],
            subject: `[Receipt] ${payload.creditsAdded} AI Credits Provisioned - FinFlow AI`,
            html: receiptHtml,
          }),
        });

        if (res.ok) {
          console.log(`[Delivery Proof Email] Dispatched email receipt to ${payload.userEmail}`);
        } else {
          console.warn(`[Delivery Proof Email] Resend API status ${res.status}`);
        }
      } catch (emailErr) {
        console.warn(`[Delivery Proof Email] Could not send via Resend API:`, emailErr);
      }
    }

    return true;
  } catch (error) {
    console.error('[Delivery Proof Email Error]:', error);
    return false;
  }
}

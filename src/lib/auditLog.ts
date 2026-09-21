import { getAdminDb } from './firebaseAdmin';
import crypto from 'crypto';

export interface ComputeAuditLogPayload {
  userId: string;
  batchJobId: string;
  fileName: string;
  pagesProcessed: number;
  creditsDeducted: number;
  creditsBefore?: number;
  creditsAfter?: number;
  status?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Records an immutable compute audit log entry in Firestore.
 * Provides verifiable evidence of AI compute consumption for chargeback dispute defense.
 */
export async function recordComputeAuditLog(payload: ComputeAuditLogPayload): Promise<string> {
  try {
    const adminDb = getAdminDb();
    const timestamp = new Date().toISOString();
    
    // Create SHA-256 cryptographic digest for tamper verification
    const rawDigest = `${payload.userId}:${payload.batchJobId}:${payload.fileName}:${payload.creditsDeducted}:${timestamp}`;
    const digestHash = crypto.createHash('sha256').update(rawDigest).digest('hex');

    const logData = {
      timestamp,
      userId: payload.userId,
      batchJobId: payload.batchJobId,
      fileName: payload.fileName,
      pagesProcessed: payload.pagesProcessed || 1,
      creditsDeducted: payload.creditsDeducted,
      creditsBefore: payload.creditsBefore ?? null,
      creditsAfter: payload.creditsAfter ?? null,
      status: payload.status || 'COMPLETED',
      ipAddress: payload.ipAddress || 'system-inngest-worker',
      userAgent: payload.userAgent || 'FinFlow-AI-ComputeWorker/1.0',
      digestHash,
      chargebackDefensible: true,
      serviceType: 'AI_DOCUMENT_EXTRACTION_COMPUTE',
    };

    // 1. Log under user subcollection: users/{uid}/audit_logs/{logId}
    const userLogRef = adminDb.collection('users').doc(payload.userId).collection('audit_logs').doc();
    await userLogRef.set(logData);

    // 2. Log under root collection: audit_logs/{logId} for centralized dispute export
    const rootLogRef = adminDb.collection('audit_logs').doc(userLogRef.id);
    await rootLogRef.set(logData);

    console.log(`[Compute Audit Log] Recorded immutable log ${userLogRef.id} for user ${payload.userId} (Deducted: ${payload.creditsDeducted} credits, Hash: ${digestHash.substring(0, 8)}...)`);
    return userLogRef.id;
  } catch (error) {
    console.error('[Compute Audit Log Error]: Failed to write immutable log:', error);
    return '';
  }
}

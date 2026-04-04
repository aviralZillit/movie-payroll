/**
 * Document Signing Service.
 * Abstract interface for DocuSign/HelloSign integration.
 * In production, replace stub implementations with actual API calls.
 */

/**
 * Standard production signing documents.
 */
export const STANDARD_DOCUMENTS = [
  { filename: 'NDA_Confidentiality_Agreement.pdf', description: 'Non-Disclosure Agreement — confidentiality of production, cast & story', requiresSignature: true, isProductionContract: true },
  { filename: 'Anti_Harassment_Bullying_Policy.pdf', description: 'Anti-Harassment & Bullying Policy', requiresSignature: true },
  { filename: 'Health_Safety_Policy.pdf', description: 'Health & Safety Policy', requiresSignature: true },
  { filename: 'Code_of_Conduct.pdf', description: 'Code of Conduct', requiresSignature: true },
  { filename: 'GDPR_Data_Protection_Notice.pdf', description: 'GDPR Data Protection Notice', requiresSignature: false },
];

/**
 * Create a signing envelope with documents.
 * @param {Object} dealMemo - The deal memo to sign
 * @param {Array} documents - Documents to include
 * @returns {Object} Envelope details
 */
export async function createSigningEnvelope(dealMemo, documents) {
  // In production, this would call DocuSign/HelloSign API
  const envelopeId = `ENV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    envelopeId,
    status: 'sent',
    createdAt: new Date(),
    recipientEmail: dealMemo.personId?.email || 'crew@production.com',
    documents: documents.map((doc, i) => ({
      ...doc,
      order: i + 1,
      status: 'pending',
    })),
  };
}

/**
 * Check envelope status.
 */
export async function getEnvelopeStatus(envelopeId) {
  // Stub — in production, call DocuSign API
  return {
    envelopeId,
    status: 'pending',
    lastChecked: new Date(),
  };
}

/**
 * Handle webhook callback when document is signed.
 */
export async function handleSigningWebhook(payload) {
  const { envelopeId, status, signedAt } = payload;

  if (status === 'completed') {
    return {
      envelopeId,
      status: 'completed',
      signedAt: signedAt || new Date(),
      allDocumentsSigned: true,
    };
  }

  return { envelopeId, status };
}

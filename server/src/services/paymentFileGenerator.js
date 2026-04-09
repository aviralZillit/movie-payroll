/**
 * Universal Payment File Generator.
 * Generates territory-specific payment files from payroll data.
 *
 * Supported formats:
 * - UK: BACS Standard 18
 * - US: ACH / NACHA
 * - AU: ABA (Direct Entry)
 * - EU: SEPA XML (ISO 20022)
 */

/**
 * Generate a BACS Standard 18 file (UK).
 */
export function generateBACS18(records, options = {}) {
  const {
    paymentDate = new Date(),
    originator = '000000',
    fileRef = 'PAYROLL',
    productionName = 'Production',
  } = options;

  const dateStr = paymentDate.toISOString().split('T')[0].replace(/-/g, '');
  const header = [
    `VOL1${fileRef.padEnd(6).substring(0, 6)}`,
    `HDR1${fileRef.padEnd(17).substring(0, 17)}${originator.padStart(6, '0')}${dateStr}`,
    `UHL1 ${dateStr}${String(records.length).padStart(6, '0')}DAILY  001`,
  ].join('\n');

  const lines = records.map((r, i) => {
    const sortCode = (r.sortCode || '').replace(/[-\s]/g, '').padStart(6, '0');
    const account = (r.accountNumber || '').padStart(8, '0');
    const amountPence = String(Math.round((r.amount || 0) * 100)).padStart(11, '0');
    const name = (r.name || '').substring(0, 18).padEnd(18);
    const ref = (r.reference || `${fileRef}-${String(i + 1).padStart(3, '0')}`).substring(0, 18).padEnd(18);

    return `0${sortCode}${account}0${amountPence}${name}${ref}${originator.padStart(6, '0')}${name}`;
  });

  const totalPence = String(records.reduce((s, r) => s + Math.round((r.amount || 0) * 100), 0)).padStart(11, '0');
  const trailer = `EOF1${String(records.length).padStart(6, '0')}${totalPence}`;

  return {
    content: [header, ...lines, trailer].join('\n'),
    filename: `BACS_${fileRef}_${dateStr}.txt`,
    recordCount: records.length,
    totalAmount: records.reduce((s, r) => s + (r.amount || 0), 0),
    format: 'BACS_STD18',
  };
}

/**
 * Generate a NACHA/ACH file (US).
 */
export function generateNACHA(records, options = {}) {
  const {
    paymentDate = new Date(),
    originatorId = '0000000000',
    companyName = 'PRODUCTION CO',
    bankRoutingNumber = '000000000',
  } = options;

  const dateStr = paymentDate.toISOString().split('T')[0].replace(/-/g, '').substring(2);

  // File Header
  const fileHeader = `101 ${bankRoutingNumber}${originatorId}${dateStr}0000A094101${companyName.padEnd(23).substring(0, 23)}PAYROLL`;

  // Batch Header
  const batchHeader = `5200${companyName.padEnd(16).substring(0, 16)}                    ${originatorId}PPD PAYROLL ${dateStr}   1${bankRoutingNumber}0000001`;

  // Entry records
  const entries = records.map((r, i) => {
    const routing = (r.routingNumber || '').padStart(9, '0');
    const account = (r.accountNumber || '').padEnd(17).substring(0, 17);
    const amount = String(Math.round((r.amount || 0) * 100)).padStart(10, '0');
    const name = (r.name || '').padEnd(22).substring(0, 22);
    const traceNum = String(i + 1).padStart(7, '0');
    return `622${routing}${account}${amount}${r.employeeId || ''}${name}0${bankRoutingNumber}${traceNum}`;
  });

  const totalAmount = records.reduce((s, r) => s + (r.amount || 0), 0);
  const batchTrailer = `8200${String(records.length).padStart(6, '0')}${String(Math.round(totalAmount * 100)).padStart(12, '0')}${'0'.repeat(12)}${originatorId}`;
  const fileTrailer = `9${String(1).padStart(6, '0')}${String(1).padStart(6, '0')}${String(records.length).padStart(8, '0')}`;

  return {
    content: [fileHeader, batchHeader, ...entries, batchTrailer, fileTrailer].join('\n'),
    filename: `ACH_PAYROLL_${dateStr}.ach`,
    recordCount: records.length,
    totalAmount,
    format: 'NACHA',
  };
}

/**
 * Generate an ABA file (Australia Direct Entry).
 */
export function generateABA(records, options = {}) {
  const {
    bankName = 'ANZ',
    userIdNumber = '000000',
    description = 'PAYROLL',
    paymentDate = new Date(),
  } = options;

  const dateStr = paymentDate.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '');

  const header = `0                 01${bankName.padEnd(3).substring(0, 3)}       ${userIdNumber.padEnd(6).substring(0, 6)}${description.padEnd(12).substring(0, 12)}${dateStr}`;

  const entries = records.map(r => {
    const bsb = (r.bsb || '').replace(/-/g, '').padStart(7, '0');
    const account = (r.accountNumber || '').padEnd(9).substring(0, 9);
    const amount = String(Math.round((r.amount || 0) * 100)).padStart(10, '0');
    const name = (r.name || '').padEnd(32).substring(0, 32);
    return `1${bsb}${account} 530${amount}${name}${description.padEnd(18).substring(0, 18)}${bsb}${account}`;
  });

  const totalAmount = records.reduce((s, r) => s + (r.amount || 0), 0);
  const trailer = `7999-999            ${String(Math.round(totalAmount * 100)).padStart(10, '0')}${String(Math.round(totalAmount * 100)).padStart(10, '0')}                        ${String(records.length).padStart(6, '0')}`;

  return {
    content: [header, ...entries, trailer].join('\n'),
    filename: `ABA_PAYROLL_${dateStr}.aba`,
    recordCount: records.length,
    totalAmount,
    format: 'ABA',
  };
}

/**
 * Generate a SEPA XML file (EU).
 */
export function generateSEPA(records, options = {}) {
  const {
    initiatorName = 'Production Company',
    iban: debtorIBAN = '',
    bic: debtorBIC = '',
    paymentDate = new Date(),
    messageId = `SEPA-${Date.now()}`,
  } = options;

  const dateStr = paymentDate.toISOString().split('T')[0];
  const totalAmount = records.reduce((s, r) => s + (r.amount || 0), 0);

  const transactions = records.map((r, i) => `
    <CdtTrfTxInf>
      <PmtId><EndToEndId>PAY-${String(i + 1).padStart(4, '0')}</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="EUR">${(r.amount || 0).toFixed(2)}</InstdAmt></Amt>
      <CdtrAgt><FinInstnId><BIC>${r.bic || ''}</BIC></FinInstnId></CdtrAgt>
      <Cdtr><Nm>${r.name || ''}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${r.iban || ''}</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>Payroll ${dateStr}</Ustrd></RmtInf>
    </CdtTrfTxInf>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${messageId}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${records.length}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <InitgPty><Nm>${initiatorName}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PAY-${dateStr}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${records.length}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <ReqdExctnDt>${dateStr}</ReqdExctnDt>
      <Dbtr><Nm>${initiatorName}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${debtorIBAN}</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BIC>${debtorBIC}</BIC></FinInstnId></DbtrAgt>
      ${transactions}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

  return {
    content: xml,
    filename: `SEPA_PAYROLL_${dateStr}.xml`,
    recordCount: records.length,
    totalAmount,
    format: 'SEPA_XML',
  };
}

/**
 * Generate payment file based on territory.
 */
export function generatePaymentFile(territory, records, options = {}) {
  switch (territory) {
    case 'US': return generateNACHA(records, options);
    case 'AU': return generateABA(records, options);
    case 'DE':
    case 'FR':
    case 'ES':
    case 'IE': return generateSEPA(records, options);
    default: return generateBACS18(records, options); // UK + fallback
  }
}

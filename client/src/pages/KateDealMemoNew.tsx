// ============================================================
// Kate's Deal Memo Wizard — wrapper page for movie-payroll
// Renders the 10-step Kate wizard and maps output to
// movie-payroll's DealMemo.js schema on save.
// ============================================================

import KateWizard from '../components/kate-wizard/DealMemoWizard';

export default function KateDealMemoNew() {
  return <KateWizard />;
}

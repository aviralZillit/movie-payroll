// Kate's deal memo API - routes through movie-payroll's existing endpoints
import { get, post } from './kateClient';

export type DealMemoStatus =
  | 'draft' | 'issued' | 'in_negotiation' | 'finalized'
  | 'signed' | 'activated' | 'cancelled';

export interface DealMemoComment {
  _id?: string;
  authorId: string;
  authorRole: string;
  authorName: string;
  text: string;
  kind: 'comment' | 'request_changes' | 'system';
  fieldKey?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface DealMemoSignature {
  signedByUserId?: string;
  typedName?: string;
  signedAt?: string;
  ipAddress?: string;
}

export async function listDealMemos(productionId?: string) {
  const res = await get<any[]>('/api/deal-memos', { params: productionId ? { productionId } : {} });
  return res.data;
}

export async function getDealMemo(id: string) {
  const res = await get<any>(`/api/deal-memos/${id}`);
  return res.data;
}

export async function listUsers(_role?: string, _productionId?: string) {
  // Movie-payroll doesn't have a /api/users?role= endpoint.
  // Return empty array — crew picker will show "no users" and admin
  // can type the person name manually or use movie-payroll's own user management.
  return [] as any[];
}

export async function inviteCrewUser(args: { email: string; name: string; productionId?: string }) {
  // Stub — movie-payroll has its own user creation flow
  return { user: { _id: '', email: args.email, name: args.name }, tempPassword: '', created: false };
}

export async function changePassword(_currentPassword: string, _newPassword: string) {
  return { message: 'Not implemented in movie-payroll' };
}

// Lifecycle transitions (mapped to movie-payroll's deal memo status flow)
export async function issueDealMemo(id: string) {
  return (await post(`/api/deal-memos/${id}/approve`, { status: 'active' })).data;
}

export async function postComment(id: string, args: { text: string }) {
  // Stub — movie-payroll doesn't have deal memo comments yet
  console.log('[Kate DM] Comment on', id, ':', args.text);
  return {};
}

export async function requestChanges(id: string, reason: string) {
  console.log('[Kate DM] Request changes on', id, ':', reason);
  return {};
}

export async function updateCrewFields(id: string, fields: Record<string, unknown>) {
  return (await post(`/api/deal-memos/${id}`, fields)).data;
}

// Display helpers
export const STATUS_LABELS: Record<DealMemoStatus, string> = {
  draft: 'Draft', issued: 'Issued', in_negotiation: 'In Negotiation',
  finalized: 'Finalized', signed: 'Signed', activated: 'Active', cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<DealMemoStatus, { fg: string; bg: string; border: string }> = {
  draft:          { fg: 'text-text-3',      bg: 'bg-bg-elevated',   border: 'border-border' },
  issued:         { fg: 'text-blue-400',    bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  in_negotiation: { fg: 'text-orange-400',  bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  finalized:      { fg: 'text-purple-400',  bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  signed:         { fg: 'text-gold',        bg: 'bg-gold/10',       border: 'border-gold/30' },
  activated:      { fg: 'text-green-400',   bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  cancelled:      { fg: 'text-red-400',     bg: 'bg-red-400/10',    border: 'border-red-400/30' },
};

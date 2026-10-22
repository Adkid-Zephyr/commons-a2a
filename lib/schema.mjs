import { z } from 'zod';

export const Evidence = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  url: z.string().url().refine(u => /^https:\/\//.test(u), 'HTTPS evidence link required'),
  summary: z.string().min(1).max(1000),
  kind: z.enum(['member_provided', 'synthetic']).default('member_provided'),
});
export const MemberInput = z.object({
  name: z.string().trim().min(1).max(60),
  role: z.string().trim().min(1).max(100),
  context: z.string().trim().min(1).max(4000),
  goals: z.string().trim().min(1).max(1200),
  skills: z.array(z.string().trim().min(1).max(50)).min(1).max(15),
  availability: z.enum(['available', 'unavailable', 'unknown']),
  participation: z.enum(['connect', 'information_only']),
  evidence: z.array(Evidence).max(10).refine(v => new Set(v.map(e=>e.id)).size === v.length, 'Duplicate evidence IDs'),
  privateNote: z.string().max(2000).default(''),
  consent: z.literal(true),
});
export const RequestInput = z.object({
  ownerId: z.string().min(1),
  kind: z.enum(['speaker', 'collaborator']),
  title: z.string().trim().min(4).max(160),
  details: z.string().trim().min(10).max(3000),
  topics: z.array(z.string().trim().min(1).max(50)).min(1).max(10),
  mode: z.enum(['rehearsal', 'live']),
  idempotencyKey: z.string().min(8).max(100),
  sourceUrl: z.union([z.literal(''), z.string().url().refine(u=>u.startsWith('https://'),'HTTPS source required')]).default(''),
  authorized: z.literal(true),
});
export const AgentReply = z.object({
  action: z.enum(['inquiry', 'reply', 'clarification', 'decline', 'proposal', 'needs_info']),
  message: z.string().min(1).max(1800),
  reason: z.string().min(1).max(500),
  evidenceIds: z.array(z.string()).max(10),
});

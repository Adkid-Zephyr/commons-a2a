import { z } from 'zod';
import { MemberInput } from './schema.mjs';

// Operator-authorized offline processing is NOT member representation consent.
export const ReplayBundle = z.object({
 dataset:z.enum(['discord-replay','organizer-replay']),label:z.string().min(1).max(160),
 capturedAt:z.string().datetime(),sourceKind:z.enum(['discord_readonly','organizer_synthetic','organizer_authorized']),
 sourceDigest:z.string().regex(/^[a-f0-9]{64}$/),operatorAuthorized:z.literal(true),
 members:z.array(MemberInput.extend({id:z.string().regex(/^replay-[a-z0-9-]+$/),sourceRef:z.string().min(1).max(150)})).min(2).max(100).refine(v=>new Set(v.map(m=>m.id)).size===v.length,'Duplicate member IDs'),
 requests:z.array(z.object({ownerId:z.string(),kind:z.enum(['speaker','collaborator']),title:z.string().min(4).max(160),details:z.string().min(10).max(3000),topics:z.array(z.string()).min(1),sourceRef:z.string().min(1)})).max(20),
});
export function validateReplay(raw){
 const bundle=ReplayBundle.parse(raw);
 for(const r of bundle.requests)if(!bundle.members.some(m=>m.id===r.ownerId))throw new Error('Unknown replay request owner');
 if(bundle.dataset==='discord-replay'&&bundle.sourceKind!=='discord_readonly')throw new Error('Discord replay must be a read-only source');
 return {...bundle,members:bundle.members.map(m=>({...m,availability:'unknown',synthetic:bundle.sourceKind==='organizer_synthetic',representation:'source_replay',ownerConsent:false}))};
}

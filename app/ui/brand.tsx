export function CommonsMark({className=''}:{className?:string}) {
 return <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M26 23L55 28L40 58Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/><circle cx="26" cy="23" r="13" fill="currentColor"/><circle cx="55" cy="28" r="13" fill="currentColor"/><circle cx="40" cy="58" r="13" fill="currentColor"/><circle cx="26" cy="23" r="3" fill="var(--bg)"/><circle cx="55" cy="28" r="3" fill="var(--bg)"/><circle cx="40" cy="58" r="3" fill="var(--bg)"/></svg>;
}
export function AgentMark({index=0,small=false}:{index?:number;small?:boolean}) {
 return <span aria-hidden="true" className={`agent-mark shape-${index%5} ${small?'small':''}`}><i/><i/></span>;
}
export function PersonGlyph(){return <g fill="none" stroke="currentColor" strokeWidth="1.5"><circle cy="-6" r="5" fill="currentColor" stroke="none"/><path d="M-10 11C-9-1 9-1 10 11" strokeLinecap="round"/></g>}

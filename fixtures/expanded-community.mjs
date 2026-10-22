import {MemberInput} from '../lib/schema.mjs';
// Wholly fictional profiles. No real Discord messages or identities are used.
const clusters=[
 ['climate','Climate data',['Nora','Elias','Sana','Theo','Iris'],'an open energy-use dashboard','data visualization'],
 ['accessibility','Accessible interfaces',['Luca','Mei','Amir','Zoe','Ben'],'a keyboard-first community directory','accessible UI'],
 ['privacy','Private AI',['Ada','Ravi','Lina','Hugo','Eva'],'a local document assistant','private inference'],
 ['robotics','Robotics',['Omar','Tessa','Noah','Yuna','Finn'],'a tabletop robot simulator','simulation'],
 ['education','Learning tools',['Aria','Milo','Priya','Leon','Ruby'],'a peer-learning planner','learning design'],
 ['data-tools','Data tooling',['Jules','Nia','Kai','Esme','Dara'],'an event-data quality checker','data pipelines'],
 ['community-ops','Community operations',['Anya','Remy','Sofia','Ezra','Cleo'],'an accessible event run-sheet','event operations'],
];
const availability=['available','available','unavailable','unknown','unknown'];
export const extraMembers=clusters.flatMap(([topic,area,names,project,skill])=>names.map((name,i)=>{
 const id=`fixture-${topic}-${i+1}`;
 const profile=MemberInput.parse({name,role:[`${area} organiser`,`${area} builder`,`${area} researcher`,`${area} newcomer`,`${area} learner`][i],
 context:`Fictional demonstration profile. ${i===4?'Follows resources about':i===3?'Is learning to build':i===0?'Organises small sessions about':'Has worked on a synthetic example of'} ${project}. ${i===2?'Not available for new meetings this week.':i===3?'Experience and current availability require clarification.':'No real project or real person is represented.'}`,
 goals:[`Find a collaborator to demonstrate ${project}.`,`Help with ${skill} for up to two hours.`,`Share a reading list; decline new meetings this week.`,`Ask about a beginner-sized contribution before committing.`,`Receive relevant resources without introductions or meetings.`][i],skills:[topic,skill,...(i===4?['learning']:['collaboration'])],availability:availability[i],participation:i===4?'information_only':'connect',privateNote:'',consent:true,
 evidence:i===1||i===2?[{id:`${id}-example`,title:`${area} prototype — fictional fixture`,url:`https://example.com/commons-fixtures/${id}`,summary:`Synthetic ${project} example for workflow testing. No externally verified achievement.`,kind:'synthetic'}]:[]});
 return {id,...profile,synthetic:true};
}));
export const demoScenarios=clusters.flatMap(([topic,area,names,project,skill])=>[
 {key:`expanded-v1-${topic}-collaborator`,ownerId:`fixture-${topic}-1`,kind:'collaborator',title:`Simulation: collaborate on ${project}`,details:`Fictional scenario: a two-hour session to improve ${project}, focusing on ${skill}. Ask about fit and boundaries; no date or participation is confirmed. No external messages.`,topics:[topic]},
 {key:`expanded-v1-${topic}-speaker`,ownerId:'maya',kind:'speaker',title:`Simulation: a practical ${area.toLowerCase()} speaker`,details:`Fictional scenario: a 15-minute walkthrough of ${project} plus five minutes of questions. Experience, dates and willingness must be checked; no real event or invitation is created.`,topics:[topic]},
]);

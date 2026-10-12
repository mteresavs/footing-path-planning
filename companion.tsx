import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@helix/button';
import { Badge } from '@helix/badge';
import { ChatContentCard as CardSource, ChatContentCardHeader as Header, ChatContentCardTitle as Title, ChatContentCardBody as Body, ChatContentCardFooter as Footer } from '@helix/chat-card';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Flag, Home, Info, MessageCircle, RotateCcw, Sparkles, Target } from 'lucide-react';

const Card = (props: ComponentProps<typeof CardSource>) => <CardSource {...props} initial={false}/>;
const goal = 'Create a clear plan for my team’s next month';
const skills = [
  {name:'Team Direction',scope:'Set team goals and define what success looks like.',question:'Set clear team goals, roles, and success measures'},
  {name:'Work Coordination',scope:'Organize the work so people know what needs to happen.',question:'Organize and coordinate the team’s work'},
  {name:'Team Collaboration',scope:'Agree how the team will work together.',question:'Help the team work effectively together'},
];
const levels = ['Foundational','Developing','Proficient','Advanced'];
const meanings = ['With support and a worked example','Unaided, with deliberate effort','Reliably on a real task','In unfamiliar situations or a new domain'];
const legacy = ['I’m not sure','Beginner','Intermediate','Advanced'];
const existingLevels = ['Developing','Foundational','Proficient'];
const steps = ['Review Goal','Preview path','Learning','End of path'];

function App() {
  const [version,setVersion] = useState('idea');
  const [scenario,setScenario] = useState('existing');
  const [step,setStep] = useState(0);
  const [open,setOpen] = useState(false);
  const [notes,setNotes] = useState(true);
  const [answers,setAnswers] = useState<Record<number,string>>({});
  const [ending,setEnding] = useState<Record<number,string>>({});
  const [saved,setSaved] = useState(false);
  const [reflect,setReflect] = useState(false);
  const [claims,setClaims] = useState<number[]>([]);
  const [expertIntent,setExpertIntent] = useState<Record<number,string>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const idea = version === 'idea', assigned = scenario === 'assigned';
  const covered = (i:number) => assigned || scenario === 'existing' || (scenario === 'mixed' && i === 0);
  const visible = skills.map((s,i)=>({...s,i}));
  const learning = visible.filter(s=>!idea || assigned || !(answers[s.i]==='Expert'&&expertIntent[s.i]==='skip'));
  const answered = Object.values(answers).some(Boolean);

  function reset(nextVersion=version,nextScenario=scenario) {
    setVersion(nextVersion);setScenario(nextScenario);setStep(0);setOpen(false);
    setAnswers({});setEnding({});setSaved(false);setReflect(false);setClaims([]);setExpertIntent({});
  }
  function submitStarting() { setClaims(visible.filter(s=>answers[s.i]==='Expert').map(s=>s.i)); setOpen(false); }
  function go(n:number) {if(n===1&&idea)submitStarting();setStep(n);setOpen(false);setReflect(false);}
  useEffect(()=>{heading.current?.focus();document.querySelector('.stage')?.scrollTo(0,0);},[step]);
  const startText = (i:number) => answers[i]
    ? `Your self-report · today: ${answers[i]}`
    : covered(i) && !assigned ? `Existing level · Oct 1: ${existingLevels[i]}`
    : 'No starting self-report';
  function picker(i:number,end=false) {
    const values=end?ending:answers;
    return <label className="level-label">{end?'Your answer now':'Your starting point'}
      <select aria-label={`${end?'Ending':'Starting'} level: ${skills[i].name}`} value={values[i]||''} onChange={e=>{
        if(end){setEnding({...ending,[i]:e.target.value});setSaved(false);}
        else {setAnswers({...answers,[i]:e.target.value});setClaims(claims.filter(n=>n!==i));setExpertIntent({...expertIntent,[i]:''});}
      }}>
        <option value="">Choose an answer (optional)</option>
        {(idea?['I’m not sure',...levels,...(end?[]:['Expert'])]:legacy).map(l=><option key={l} value={l}>{l==='Expert'?'Expert — I already know this; record as self-attested':l}{idea&&levels.includes(l)?` — ${meanings[levels.indexOf(l)]}`:''}</option>)}
      </select>
    </label>;
  }
  const noteTitle = ['Starting information is not always a self-report','The planner needs the differences','LEX receives context, not a progress score','A reflection is not Goal completion'][step];
  const noteText = [
    idea ? 'Proposed change: explain what is already known and let the learner review it. Keep the skip. A new answer remains a self-report, separate from the stored record. No target proficiency setup for static paths in Alpha. An explicit Expert answer is a self-attested claim; ordinary level answers are not silently mapped to Expert.' : 'Local code: “Use this goal” bypasses the form. With complete Wallet coverage, “Edit skill levels” is hidden. With partial coverage, the form normally asks only about missing areas.',
    'Pass the confirmed Goal scope, starting information for each Subskill with its source, any learner preferences, and its provenance. The static-path LEX PRD assigns construction to PSW / Planner and fixes the path after acceptance. Resolve the earlier LEX-exclusion thread against that boundary; no in-path exclusions. Do not convert existing information into a fresh self-report or treat a skipped answer as evidence of low proficiency.',
    'After Start learning, LEX shows the accepted, fixed path and tracks selected-item completion. Learners can navigate freely. Quiz completion does not produce platform-observed skill signals in the supplied Alpha PRD, or platform-attested proficiency.',
    'An ending self-report stands on its own when there is no matching starting self-report. Where there is one, show two dated answers—not a growth score. The end-of-path Skill Check and its platform-attested claims are P1, not this Alpha experience.',
  ][step];
  return <>
    <div className="demo-bar">
      <a href="./index.html" className="back-link"><ArrowLeft size={15}/> Goal artifact</a>
      <div className="version-switch" role="group" aria-label="Experience version">
        <Button size="sm" variant={!idea?'default':'ghost'} aria-pressed={!idea} onPress={()=>reset('now')}>How it works now</Button>
        <Button size="sm" variant={idea?'default':'ghost'} aria-pressed={idea} onPress={()=>reset('idea')}>Alpha idea</Button>
      </div>
      <label className="scenario-label">Try a learner<select id="scenario" value={scenario} onChange={e=>reset(version,e.target.value)}>
        <option value="existing">Existing information for all areas</option><option value="mixed">Some existing information</option><option value="new">No existing information</option><option value="assigned">Admin-assigned path</option>
      </select></label>
      <Button variant="ghost" size="sm" onPress={()=>setNotes(!notes)} aria-pressed={notes}><Info size={15}/>Design notes</Button>
      <Button variant="ghost" size="icon-sm" aria-label="Restart example" onPress={()=>reset()}><RotateCcw size={16}/></Button>
    </div>
    <div className="demo-caption">{idea?'Proposed Alpha experience · not an agreed design':'Current Goal flow + specified LEX Alpha ending · not a production recording'} · Fictional learner and learning data. No account or Wallet changes.</div>
    <div className="workspace">
      <aside className="sidebar" aria-label="Prototype navigation">
        <div className="brand"><span className="brand-mark">h</span><span>Helix</span></div>
        <div className="nav-item muted"><Home size={17}/>Home <small>Outside demo</small></div>
        <div className="nav-item active"><MessageCircle size={17}/>Your learning</div>
        <p className="nav-caption">YOUR PATHS</p>
        <button className="path-nav" onClick={()=>go(step===0?0:1)}><Flag size={16}/><span>My monthly team plan</span></button>
        <div className="user"><span className="avatar">OR</span><div>Omar Rivera<small>Demo learner</small></div></div>
      </aside>
      <div className="surface">
        <header className="flow-header"><span><Flag size={16}/> My monthly team plan</span><Badge variant="outline">{assigned?'Assigned Goal':'Personal Goal'}</Badge></header>
        <div className="stage" key={`${version}-${scenario}`}>
          <div className="journey" aria-label="Demo scenes">{steps.map((s,i)=><button key={s} className={step===i?'selected':''} aria-current={step===i?'step':undefined} onClick={()=>go(i)}><span>{i+1}</span>{s}</button>)}</div>
          <div className="scene-content">
            {step===0 && <>
              <div className="user-message">{assigned?'I’d like to see the learning my manager assigned.':'I’m leading a team next month. Help me make a clear plan for our work.'}</div>
              <div className="assistant-intro"><Sparkles size={20}/><p>{assigned?'Your manager has set the Goal and learning path.':idea?'Let’s focus on an outcome you can use at work. You can review the starting information before we plan your learning.':'Here’s a Goal to help you get started. Review the skills below, then use this Goal to create your path.'}</p></div>
              <h1 ref={heading} tabIndex={-1} className="sr-only">Review your Goal</h1>
              <Card><Header><p className="eyebrow"><Flag size={16}/> GOAL</p><Title className="goal-heading">{goal}</Title><p className="muted">A focused learning plan—not a promise to master team management.</p></Header>
                <Body><p className="section-label">Skills related to this Goal</p><div className="chips">{visible.map(s=><Badge key={s.name} variant="info" className="h-auto whitespace-normal px-3 py-1">{s.name}</Badge>)}</div>
                  {idea&&<><p className="scope-caption">This path focuses on these parts of each area:</p>{visible.map(s=><div className="scope-row" key={s.name}><strong>{s.name}</strong><p>{s.scope}</p></div>)}
                    <div className="info-box"><Info size={17}/><p>{assigned?'This path uses the Goal and learning assigned by your manager. Your confidence does not waive required learning.':scenario==='existing'?'We already have starting information for these areas. You don’t need to answer again.':scenario==='mixed'?'We have starting information for Team Direction. You can tell us about the other areas, or continue without answering.':'You can tell us where you’re starting, or continue without answering.'}</p></div>
                    {answered&&<p className="saved-note"><Check size={15}/> Your answers will help shape the learning. They are not assessed levels.</p>}
                    <p className="quiet">Finishing this path does not confirm that you’ve achieved the Goal. Goal achievement checking is not available in Alpha.</p>
                  </>}
                </Body><Footer className="flex-wrap justify-end border-t-0">
                  {!assigned&&(idea||scenario!=='existing')&&<Button variant="ghost" onPress={()=>setOpen(!open)} aria-expanded={open}>{idea?'Review starting point (optional)':'Edit skill levels'}</Button>}
                  <Button onPress={()=>go(1)} >{assigned?'View assigned path':'Use this goal'}<ArrowRight size={15}/></Button>
                </Footer>
              </Card>
              {open&&!assigned&&<Card><Header><Title>{idea?'Where are you starting? (optional)':'Skill experience'}</Title><p className="muted">{idea?'Answer only if it helps us choose your learning. You can skip every question and start.':'Tell us how familiar you are with these skills.'}</p></Header><Body>
                {skills.map((s,i)=>!idea&&covered(i)?null:<div className="skill-block" key={s.name}>
                  <h2>{s.name}</h2><p className="muted">{s.question}.</p>
                  {idea&&covered(i)&&<div className="source-record">Existing information · sample record, Oct 1<br/><strong>{existingLevels[i]}</strong><p>This record is separate from any answer you give below.</p></div>}
                  <>
                    {picker(i)}
                    {idea&&answers[i]==='Expert'&&<div className="advanced-intent"><h3>What would help you here? (optional)</h3><p>Should we skip what you already know, or help you learn something different or deeper?</p><div className="flex flex-wrap gap-2"><Button variant={expertIntent[i]==="skip"?"secondary":"outline"} aria-pressed={expertIntent[i]==="skip"} onPress={()=>setExpertIntent({...expertIntent,[i]:"skip"})}>Skip what I know</Button><Button variant={expertIntent[i]==="deeper"?"secondary":"outline"} aria-pressed={expertIntent[i]==="deeper"} onPress={()=>setExpertIntent({...expertIntent,[i]:"deeper"})}>Something different or deeper</Button><Button variant="ghost" onPress={()=>setExpertIntent({...expertIntent,[i]:""})}>No preference</Button></div><small>{expertIntent[i]==="skip"?"During construction, the Planner can leave learning for this area out of the personal path; the Goal itself stays unchanged.":expertIntent[i]==="deeper"?"We’ll carry this preference forward. Finding a more advanced version is not supported reliably yet; we may need to refine your Goal.":"Continue without choosing. We’ll pass your footing to planning without assuming you want content excluded."}</small><small>When you submit the Expert answer, it will be recorded as self-attested in your Wallet—not assessed or verified. That claim is separate from your learning preference.</small></div>}
                  </>
                </div>)}
                {idea&&<p className="quiet">These descriptions are adapted from the Skills measurement brief. Their use as self-report questions needs validation. Expert is a separate explicit claim, not a fifth proficiency level or a synonym for Advanced. Only the Expert write is agreed in the supplied thread; other answer-to-Wallet rules remain open.</p>}
              </Body><Footer className="flex-wrap justify-end"><Button variant="ghost" onPress={()=>{setAnswers({});setClaims([]);setExpertIntent({});setOpen(false);}}>Skip for now</Button><Button onPress={submitStarting}>{idea?'Use these choices':'Update'}</Button></Footer></Card>}
            </>}
            {step===1&&<>
              <h1 ref={heading} tabIndex={-1}>A path for your monthly team plan</h1><p className="intro">{assigned?'Your manager’s approved learning sequence.':'Build a useful plan, one step at a time.'}</p>
              {idea&&!assigned&&<div className="info-box"><Sparkles size={18}/><p>{answered?'We’ll use your answers to choose a suitable starting point and balance foundations with application.':scenario==='existing'?'We’ll use your existing starting information. You haven’t given a new self-report for this Goal.':scenario==='mixed'?'We’ll use the existing information for Team Direction and avoid assuming experience in the unanswered areas.':'With no starting answers, we won’t assume prior knowledge. You can review the starting point before beginning.'}</p></div>}
              <Card><Header><Title>{goal}</Title><div className="chips">{visible.map(s=><Badge key={s.name} variant="info">{s.name}</Badge>)}</div></Header><Body>
                {learning.map((s,index)=><div className="plan-item" key={s.name}><span className="item-number">{index+1}</span><div><h2>{s.scope}</h2><p>{idea&&!assigned?(answers[s.i]==='Foundational'?'Foundations first, followed by a worked example.':answers[s.i]==='Expert'?(expertIntent[s.i]==='deeper'?'Preference passed to planning: different or deeper learning. Availability is not guaranteed.':'Expert footing passed to planning. No exclusion preference supplied; this example keeps the area.'):answers[s.i]==='Advanced'?'The Planner must check content eligibility; a more advanced version is not guaranteed.':answers[s.i]?'Use relevant examples and application for your reported starting point.':'Use available context; do not assume proficiency where information is missing.'):'Illustrative learning section'}</p><small>Focus: {s.name} · Sample content</small></div></div>)}
                {idea&&!assigned&&learning.length<visible.length&&<div className="info-box"><Info size={17}/><p>{learning.length===0?"You reported that you already know every area. There’s no remaining learning in this example. This does not mean your Goal is achieved.":"Based on what you told us, this example leaves out areas you already know. The Goal itself has not been rewritten."} <button className="underline" onClick={()=>{go(0);setOpen(true);}}>Review the starting information</button>.</p></div>}
                {idea&&!assigned&&(learning.length<=1||Object.values(expertIntent).includes("deeper"))&&<div className="coming-soon"><h2>Would a more specific Goal be useful?</h2><p>Goal refinement is a proposed PSW handoff. Keep your context and clarify what you want to be able to do next; don’t invent an empty or “advanced” path.</p><Button variant="outline" onPress={()=>{go(0);setOpen(true);}}>Revisit my Goal context</Button></div>}
              </Body><Footer className="flex-wrap justify-end"><Button variant="ghost" onPress={()=>go(0)}>Back to Goal</Button><Button isDisabled={learning.length===0} onPress={()=>go(2)}>Start learning<ArrowRight size={15}/></Button></Footer></Card>
              {claims.length>0&&<p className="saved-note">Demo event: self-attested Wallet claim for {claims.map(i=>skills[i].name).join(", ")}. No real Profile write.</p>}
              <p className="quiet">Prototype content only. Changing a level illustrates planning intent; it does not generate or retrieve a real path.</p>
            </>}
            {step===2&&learning.length>0&&<>
              <p className="quiet">Accepted path · fixed selected content. Item order is suggested; you can navigate freely.</p><div className="lesson-top"><BookOpen size={18}/> YOUR LEARNING <Badge variant="outline">Example item</Badge></div>
              <h1 ref={heading} tabIndex={-1}>{learning[0]?.scope||'Review your Goal’s scope'}</h1><p className="intro">Working toward: {goal}</p>
              <Card><Header><Title>Connect the learning to your Goal</Title></Header><Body><div className="lesson-placeholder"><BookOpen size={32}/><h2>Learning content appears here</h2><p>This companion focuses on the Goal and reflection flow, not the lesson player.</p></div><div className="chips">{learning.map(s=><Badge key={s.name} variant="info">Working on: {s.name}</Badge>)}</div><p className="quiet">These labels describe the learning focus. They do not show progress in proficiency.</p></Body></Card>
              <div className="demo-action"><span>Demo control · simulate finishing the learning</span><Button variant="outline" onPress={()=>go(3)}>Go to the path ending<ArrowRight size={15}/></Button></div>
            </>}
            {step===3&&learning.length>0&&<>
              <h1 ref={heading} tabIndex={-1}>{idea?'You’ve finished the learning in this path':'You’ve finished the learning in this path'}</h1>
              {!idea?<Card><Header><Title>Learning complete</Title></Header><Body><div className="ending-status"><span><Check size={18}/>All selected learning items finished</span><span><Target size={18}/>Goal achievement not checked</span></div><div className="coming-soon"><Badge variant="outline">Coming soon</Badge><h2>Skills assessment</h2><p>Your learning is complete. The skills assessment is not available yet.</p></div><p className="quiet">No course certificate, proficiency claim, or Goal completion. This is the supplied LEX Alpha requirement—not a claim that it is live.</p><p className="quiet">Optional self-report is a separate idea. Earlier familiarity answers use a different scale and will not be used as a comparison baseline.</p><Button onPress={()=>{setVersion('idea');setAnswers({});setReflect(false);setEnding({});setSaved(false);}}>Explore the Alpha ending</Button></Body></Card>:<>
                <div className="note-rule"><Badge variant="outline">Additional idea · not in committed LEX Alpha scope</Badge></div><p className="intro">Take a moment to reflect on what feels different. This is separate from proving what you can do.</p>
                <Card><Header><Title>{goal}</Title></Header><Body><div className="ending-status"><span><Check size={18}/>Learning items finished</span><span><Target size={18}/>Goal achievement not checked</span></div><p className="quiet">Goal completion is not available in Alpha.</p><div className="coming-soon"><Badge variant="outline">Coming soon</Badge><h2>Put your learning to the test</h2><p>End-of-path assessment isn’t available yet. Your course activity or a confidence rating can’t replace it.</p></div>
                  <p className="quiet">This Alpha path ending creates no platform-attested proficiency claim.</p>
                </Body><Footer className="flex-wrap justify-end"><Button variant="ghost" onPress={()=>{setReflect(false);setSaved(false);setEnding({});}}>Skip reflection</Button><Button onPress={()=>setReflect(true)}>Reflect on where I am now<ArrowRight size={15}/></Button></Footer></Card>
                {reflect&&<Card><Header><Title>Where would you place yourself today?</Title><p className="muted">Optional. Choose what best describes you—not what you think you should answer.</p></Header><Body>{visible.map(s=><div className="skill-block" key={s.name}><h2>{s.name}</h2><p className="muted">{s.question}.</p>{picker(s.i,true)}</div>)}<p className="quiet">Your answers help you reflect. They are not assessed proficiency and won’t automatically become Skills Wallet claims.</p></Body><Footer className="justify-end"><Button isDisabled={!Object.values(ending).some(Boolean)} onPress={()=>setSaved(true)}>Review my reflection</Button></Footer></Card>}
                {reflect&&saved&&<Card><Header><Title>Your reflection</Title><p className="muted">Self-reported answers, not measured skill progress</p></Header><Body><div id="reflection-result">{visible.filter(s=>ending[s.i]).map(s=><div className="reflection-row" key={s.name}><h2>{s.name}</h2>{answers[s.i]&&levels.includes(answers[s.i])&&levels.includes(ending[s.i])?<><div className="answer-pair"><div><small>YOU REPORTED · START</small><strong>{answers[s.i]}</strong></div><div><small>YOU REPORT · NOW</small><strong>{ending[s.i]}</strong></div></div><p>Two answers to the same question. A change in your answer is not proof of a change in proficiency.</p></>:<><strong>You report now: {ending[s.i]}</strong><p>{answers[s.i]&&!levels.includes(answers[s.i])?'Your earlier answer does not provide a comparable proficiency baseline.':ending[s.i]==='I’m not sure'?'It’s okay to be unsure. No change in proficiency can be inferred.':'No matching starting self-report was collected. This answer stands on its own.'}</p>{covered(s.i)&&!assigned&&<p className="quiet">Existing information used for planning is a separate source—not “what you said before.”</p>}</>}</div>)}</div><p className="quiet">Demo only: nothing has been saved to a profile or shared with an admin.</p></Body></Card>}
              </>}
            </>}
            {step>=2&&learning.length===0&&<Card><Body><h1 ref={heading} tabIndex={-1}>No remaining learning in this example</h1><p>Revisit the Goal and your starting information. This is not a finished path or an achieved Goal.</p><Button onPress={()=>{go(0);setOpen(true);}}>Review Goal context</Button></Body></Card>}
          </div>
        </div>
      </div>
      {notes&&<aside className="design-notes"><span className="eyebrow">TEAM NOTES · NOT LEARNER UI</span><h2>{noteTitle}</h2><p>{noteText}</p>
        <div className="note-rule"><h3>{idea?'What changes in the UI':'Current behavior to preserve'}</h3><p>{step===0?(idea?'Visible source labels, optional review, and plain-language levels. No learner or admin target-proficiency setup for static paths in Alpha. Keep required assigned learning intact.':'Use the Goal directly, or open Skill experience when available. Do not require answers to continue.') : step===3?'LEX owns path completion and the P0 assessment placeholder. Self-report is an additional proposal, not committed LEX Alpha scope. No proficiency or Goal-completion claim.':'Carry the Goal’s purpose and confirmed areas into the next screen. Don’t present content completion as capability gained.'}</p></div>
        {step===1&&<div className="note-rule"><h3>Planning context in this example</h3>{visible.map(s=><p key={s.name}><strong>{s.name}</strong><br/>{startText(s.i)}<br/>{answers[s.i]==='Expert'&&!assigned?`Expert follow-up: ${expertIntent[s.i]||'not answered'} · Goal scope retained`:'No target proficiency in Alpha'}</p>)}<small>Example values, not a live planner payload.</small></div>}
<div className="note-rule"><h3>Why this is optional</h3><p>The horizon PRDs prioritize useful action without extensive setup. Do not add a starting questionnaire just to manufacture an ending comparison. Ending self-report is an Alpha feedback idea, not a substitute for the P1 Skill Check.</p></div>
        <details><summary>Source & open decisions</summary><p>Real Helix Button, Badge, and ChatContentCard components and design tokens. Shell and Goal composition follow the end-to-end prototype; backend calls are not connected.</p><p>Goal behavior checked at local revision c805b138c0 (GoalReviewCard, SkillFamiliarityStep, useWalletCoverage). The supplied static-path LEX PRD defines the Alpha ending and fixed-path boundary. No production-status claim.</p><p>Team Management Subskills and the Team Direction objective come from the <a href="https://docs.google.com/document/d/1jS3ahKZrFTCPGWuWvCuCabw9u7vJa8mAWYZtAoYt0As/edit">Skills Definition Framework</a>. The four proposed levels come from the separate <a href="https://docs.google.com/document/d/12o4OFNM0XOUTgC1MVASEss0sTX7nu6P6uD42L1w2iJw/edit">measurement brief</a>. Questions, Goal scope, and content are illustrative.</p><p>Agree with Skills: understandable level descriptions, how to use ending self-reports, and which of those answers should write to the Wallet. The supplied thread agrees an explicit starting Expert answer should create a self-attested claim. End-of-path claim rules are not settled. Team Connect’s three hypotheses require live Goal mapping, coherent generation, and reliable skill signals. This mock experience tests usability and usefulness only; self-report cannot prove the signal loop. The current legacy scale must not be silently converted into the new scale for comparison.</p></details>
      </aside>}
    </div>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);

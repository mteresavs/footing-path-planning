import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@helix/button';
import { Badge } from '@helix/badge';
import { ChatContentCard as CardSource, ChatContentCardHeader as Header, ChatContentCardTitle as Title, ChatContentCardBody as Body, ChatContentCardFooter as Footer } from '@helix/chat-card';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Compass, EyeOff, Flag, Home, Info, MessageCircle, Plus, RotateCcw, Sparkles, Target, X } from 'lucide-react';

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
const params = new URLSearchParams(location.search);
const embedded = params.has('embed');
const initialStep = Math.max(0,Math.min(3,Number(params.get('step'))||0));

function App() {
  const [version,setVersion] = useState(params.get('version')==='now'?'now':'idea');
  const [scenario,setScenario] = useState('existing');
  const [step,setStep] = useState(initialStep);
  const [open,setOpen] = useState(false);
  const [notes,setNotes] = useState(false);
  const [controls,setControls] = useState(false);
  const [toolbar,setToolbar] = useState(true);
  const [narrow,setNarrow] = useState(params.get('scene')==='narrow');
  const [selected,setSelected] = useState([0,1,2]);
  const [adding,setAdding] = useState(false);
  const [targetOpen,setTargetOpen] = useState(false);
  const [desired,setDesired] = useState<Record<number,string>>({});
  const switcher = useRef<HTMLButtonElement>(null);
  const [answers,setAnswers] = useState<Record<number,string>>({});
  const [ending,setEnding] = useState<Record<number,string>>({});
  const [saved,setSaved] = useState(false);
  const [reflect,setReflect] = useState(false);
  const [claims,setClaims] = useState<number[]>([]);
  const [expertIntent,setExpertIntent] = useState<Record<number,string>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const idea = version === 'idea', assigned = scenario === 'assigned';
  const covered = (i:number) => assigned || scenario === 'existing' || (scenario === 'mixed' && i === 0);
  const visible = skills.map((s,i)=>({...s,i})).filter(s=>selected.includes(s.i));
  const learning = visible.filter(s=>!idea || assigned || !(answers[s.i]==='Expert'&&expertIntent[s.i]==='skip'));
  const answered = Object.values(answers).some(Boolean);

  function reset(nextVersion=version,nextScenario=scenario) {
    setVersion(nextVersion);setScenario(nextScenario);setStep(0);setOpen(false);
    setAnswers({});setEnding({});setSaved(false);setReflect(false);setClaims([]);setExpertIntent({});
    setSelected([0,1,2]);setAdding(false);setDesired({});setTargetOpen(false);setNarrow(false);
  }
  function submitStarting() { setClaims(visible.filter(s=>answers[s.i]==='Expert').map(s=>s.i)); setOpen(false); }
  function go(n:number) {if(n===1&&idea)submitStarting();setStep(n);setOpen(false);setReflect(false);}
  useEffect(()=>{heading.current?.focus();document.querySelector('.stage')?.scrollTo(0,0);},[step]);
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setControls(false);setNotes(false);switcher.current?.focus();}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
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
    idea ? 'Proposed change: explain what is already known and let the learner review it. Keep the skip. A new answer remains a self-report, separate from the stored record. No assessed target proficiency in Alpha. The optional desired-capability idea describes an aspiration; it is not an enforced target and must be agreed with Skills. An explicit Expert answer is a self-attested claim; ordinary level answers are not silently mapped to Expert.' : 'Local code: “Use this goal” bypasses the form. With complete Wallet coverage, “Edit skill levels” is hidden. With partial coverage, the form normally asks only about missing areas.',
    'Pass the confirmed Goal scope, starting information for each Subskill with its source, any learner preferences, and its provenance. The static-path LEX PRD assigns construction to PSW / Planner and fixes the path after acceptance. Resolve the earlier LEX-exclusion thread against that boundary; no in-path exclusions. Do not convert existing information into a fresh self-report or treat a skipped answer as evidence of low proficiency.',
    'After Start learning, LEX shows the accepted, fixed path and tracks selected-item completion. Learners can navigate freely. Quiz completion does not produce platform-observed skill signals in the supplied Alpha PRD, or platform-attested proficiency.',
    'An ending self-report stands on its own when there is no matching starting self-report. Where there is one, show two dated answers—not a growth score. The end-of-path Skill Check and its platform-attested claims are P1, not this Alpha experience.',
  ][step];
  return <>
    <div className={`workspace ${embedded?'embedded':''}`}>
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
          <div className="scene-content">
            {step===0&&narrow&&<>
              <div className="user-message">I want to become a better team manager.</div>
              <div className="assistant-intro"><Sparkles size={20}/><p>That’s a broad ambition. Let’s start with something you can use soon.</p></div>
              <Card><Header><p className="eyebrow">SHAPE YOUR GOAL</p><Title>What would make the biggest difference right now?</Title></Header><Body><button className="narrow-option" onClick={()=>setNarrow(false)}><span><strong>Make a clear plan for next month</strong><small>Set priorities, organize the work, and agree how the team will work together.</small></span><ChevronRight size={18}/></button><p className="quiet">We’ll focus on this first—not treat it as all of team management.</p></Body><Footer><Button variant="ghost" onPress={()=>setNarrow(false)}>Use this example<ArrowRight size={15}/></Button></Footer></Card>
            </>}
            {step===0&&!narrow && <>
              <div className="user-message">{assigned?'I’d like to see the learning my manager assigned.':'I’m leading a team next month. Help me make a clear plan for our work.'}</div>
              <div className="assistant-intro"><Sparkles size={20}/><p>{assigned?'Your manager has set the Goal and learning path.':idea?'Let’s turn that into a focused Goal. Does this capture what you want to work on?':'Here’s a Goal to help you get started. Review the skills below, then use this Goal to create your path.'}</p></div>
              <h1 ref={heading} tabIndex={-1} className="sr-only">Review your Goal</h1>
              <Card><Header><p className="eyebrow"><Flag size={16}/> GOAL</p><Title className="goal-heading">{goal}</Title><p className="muted">Set priorities, organize the work, and agree how your team will work together.</p></Header>
                <Body><p className="section-label">Skills related to this Goal</p><div className="chips">{visible.map(s=><Badge key={s.name} variant="info" className="h-auto whitespace-normal px-3 py-1">{s.name}{!assigned&&<button aria-label={`Remove ${s.name}`} onClick={()=>setSelected(selected.filter(i=>i!==s.i))}><X size={13}/></button>}</Badge>)}{!assigned&&<Button variant="outline" size="sm" onPress={()=>setAdding(!adding)} aria-expanded={adding}><Plus size={13}/>Add skill</Button>}</div>
                  {adding&&<div className="sample-search"><p className="quiet">Sample Blueprint areas · this demo does not search the catalog.</p>{skills.map((s,i)=>!selected.includes(i)&&<Button key={s.name} variant="outline" onPress={()=>{setSelected([...selected,i]);setAdding(false);}}>Add {s.name}</Button>)}{selected.length===3&&<p>All three example areas are selected.</p>}</div>}
                  {selected.length===0&&<p className="quiet">Add an area before continuing, or revisit what you want to work on.</p>}
                  {idea&&<><p className="scope-caption">This path focuses on these parts of each area:</p>{visible.map(s=><div className="scope-row" key={s.name}><strong>{s.name}</strong><p>{s.scope}</p></div>)}
                    <div className="info-box"><Info size={17}/><p>{assigned?'This path uses the Goal and learning assigned by your manager. Your confidence does not waive required learning.':scenario==='existing'?'We already have starting information for these areas. You don’t need to answer again.':scenario==='mixed'?'We have starting information for Team Direction. You can tell us about the other areas, or continue without answering.':'You can tell us where you’re starting, or continue without answering.'}</p></div>
                    {answered&&<p className="saved-note"><Check size={15}/> Your answers will help shape the learning. They are not assessed levels.</p>}
                    {!assigned&&<><Button variant="ghost" className="mt-3" onPress={()=>setTargetOpen(!targetOpen)} aria-expanded={targetOpen}>Describe where I want to get to (optional)</Button>{targetOpen&&<div className="target-summary"><p><strong>What would you like to be able to do?</strong></p><p>This is your aspiration, not an assessed target or a promise about this path.</p>{visible.map(s=><label className="level-label" key={s.name}>{s.question}<select aria-label={`Desired capability: ${s.name}`} value={desired[s.i]||''} onChange={e=>setDesired({...desired,[s.i]:e.target.value})}><option value="">Leave open</option>{levels.map((l,i)=><option key={l} value={l}>{meanings[i]}</option>)}</select></label>)}</div>}</>}
                  </>}
                </Body><Footer className="flex-wrap justify-end border-t-0">
                  {!assigned&&(idea||scenario!=='existing')&&<Button variant="ghost" onPress={()=>setOpen(!open)} aria-expanded={open}>{idea?'Review starting point (optional)':'Edit skill levels'}</Button>}
                  <Button isDisabled={visible.length===0} onPress={()=>go(1)} >{assigned?'View assigned path':'Use this goal'}<ArrowRight size={15}/></Button>
                </Footer>
              </Card>
              {open&&!assigned&&<Card><Header><Title>{idea?'Where are you starting? (optional)':'Skill experience'}</Title><p className="muted">{idea?'Answer only if it helps us choose your learning. You can skip every question and start.':'Tell us how familiar you are with these skills.'}</p></Header><Body>
                {visible.map(({i,...s})=>!idea&&covered(i)?null:<div className="skill-block" key={s.name}>
                  <h2>{s.name}</h2><p className="muted">{s.question}.</p>
                  {idea&&covered(i)&&<div className="source-record">Existing information · sample record, Oct 1<br/><strong>{existingLevels[i]}</strong><p>This record is separate from any answer you give below.</p></div>}
                  <>
                    {picker(i)}
                    {idea&&answers[i]==='Expert'&&<div className="advanced-intent"><h3>What would help you here? (optional)</h3><p>Should we skip what you already know, or help you learn something different or deeper?</p><div className="flex flex-wrap gap-2"><Button variant={expertIntent[i]==="skip"?"secondary":"outline"} aria-pressed={expertIntent[i]==="skip"} onPress={()=>setExpertIntent({...expertIntent,[i]:"skip"})}>Skip what I know</Button><Button variant={expertIntent[i]==="deeper"?"secondary":"outline"} aria-pressed={expertIntent[i]==="deeper"} onPress={()=>setExpertIntent({...expertIntent,[i]:"deeper"})}>Something different or deeper</Button><Button variant="ghost" onPress={()=>setExpertIntent({...expertIntent,[i]:""})}>No preference</Button></div><small>{expertIntent[i]==="skip"?"We can leave this area out when proposing your learning. It stays part of your Goal.":expertIntent[i]==="deeper"?"We’ll carry this preference forward. Finding a more advanced version is not supported reliably yet; we may need to refine your Goal.":"You can continue without choosing. We won’t assume you want to skip this area."}</small><small>When you submit the Expert answer, it will be recorded as self-attested in your Wallet—not assessed or verified. That claim is separate from your learning preference.</small></div>}
                  </>
                </div>)}
                {idea&&<p className="quiet">These answers describe your own view, not an assessment. You can leave any question unanswered.</p>}
              </Body><Footer className="flex-wrap justify-end"><Button variant="ghost" onPress={()=>{setAnswers({});setClaims([]);setExpertIntent({});setOpen(false);}}>Skip for now</Button><Button onPress={submitStarting}>{idea?'Use these choices':'Update'}</Button></Footer></Card>}
            </>}
            {step===1&&<>
              <h1 ref={heading} tabIndex={-1}>A path for your monthly team plan</h1><p className="intro">{assigned?'Your manager’s approved learning sequence.':'Build a useful plan, one step at a time.'}</p>
              {idea&&!assigned&&<div className="info-box"><Sparkles size={18}/><p>{answered?'We’ll use your answers to choose a suitable starting point and balance foundations with application.':scenario==='existing'?'We’ll use your existing starting information. You haven’t given a new self-report for this Goal.':scenario==='mixed'?'We’ll use the existing information for Team Direction and avoid assuming experience in the unanswered areas.':'With no starting answers, we won’t assume prior knowledge. You can review the starting point before beginning.'}</p></div>}
              <Card><Header><Title>{goal}</Title><div className="chips">{visible.map(s=><Badge key={s.name} variant="info">{s.name}</Badge>)}</div></Header><Body>
                {learning.map((s,index)=><div className="plan-item" key={s.name}><span className="item-number">{index+1}</span><div><h2>{s.scope}</h2><p>{idea&&!assigned?(answers[s.i]==='Foundational'?'Foundations first, followed by a worked example.':answers[s.i]==='Expert'?(expertIntent[s.i]==='deeper'?'Preference passed to planning: different or deeper learning. Availability is not guaranteed.':'Expert footing passed to planning. No exclusion preference supplied; this example keeps the area.'):answers[s.i]==='Advanced'?'The Planner must check content eligibility; a more advanced version is not guaranteed.':answers[s.i]?'Use relevant examples and application for your reported starting point.':'Use available context; do not assume proficiency where information is missing.'):'Illustrative learning section'}</p><small>Focus: {s.name} · Sample content</small></div></div>)}
                {idea&&!assigned&&learning.length<visible.length&&<div className="info-box"><Info size={17}/><p>{learning.length===0?"You reported that you already know every area. There’s no remaining learning in this example. This does not mean your Goal is achieved.":"Based on what you told us, this example leaves out areas you already know. The Goal itself has not been rewritten."} <button className="underline" onClick={()=>{go(0);setOpen(true);}}>Review the starting information</button>.</p></div>}
                {idea&&!assigned&&(learning.length<=1||Object.values(expertIntent).includes("deeper"))&&<div className="coming-soon"><h2>Would a more specific Goal be useful?</h2><p>Let’s revisit what you want to be able to do next. We’ll keep what you’ve already told us.</p><Button variant="outline" onPress={()=>{go(0);setOpen(true);}}>Revisit my Goal context</Button></div>}
              </Body><Footer className="flex-wrap justify-end"><Button variant="ghost" onPress={()=>go(0)}>Back to Goal</Button><Button isDisabled={learning.length===0} onPress={()=>go(2)}>Start learning<ArrowRight size={15}/></Button></Footer></Card>
              {claims.length>0&&<p className="saved-note">Demo event: self-attested Wallet claim for {claims.map(i=>skills[i].name).join(", ")}. No real Profile write.</p>}
              <p className="quiet">Prototype content only. Changing a level illustrates planning intent; it does not generate or retrieve a real path.</p>
            </>}
            {step===2&&learning.length>0&&<>
              <p className="quiet">Accepted path · fixed selected content. Item order is suggested; you can navigate freely.</p><div className="lesson-top"><BookOpen size={18}/> YOUR LEARNING <Badge variant="outline">Example item</Badge></div>
              <h1 ref={heading} tabIndex={-1}>{learning[0]?.scope||'Review your Goal’s scope'}</h1><p className="intro">Working toward: {goal}</p>
              <Card><Header><Title>Connect the learning to your Goal</Title></Header><Body><article className="reading"><p className="eyebrow">SAMPLE READING · 4 MIN</p><h2>Start with the result, not the task list</h2><p>“Run more team meetings” is an activity. “Everyone knows the month’s priorities and who owns each decision” describes a result.</p><p>Choose one priority for your team. Write down what should be different by the end of the month, how you would recognize success, and who will own the work.</p><blockquote>By the end of the month, every project has a named owner, an agreed next step, and a clear success measure.</blockquote><p>Try rewriting one item on your current task list as an outcome.</p></article><div className="chips">{learning.map(s=><Badge key={s.name} variant="info">Working on: {s.name}</Badge>)}</div><p className="quiet">These labels describe the learning focus. They do not show progress in proficiency.</p></Body></Card>
              <div className="demo-action"><span>Demo control · simulate finishing the learning</span><Button variant="outline" onPress={()=>go(3)}>Go to the path ending<ArrowRight size={15}/></Button></div>
            </>}
            {step===3&&learning.length>0&&<>
              <h1 ref={heading} tabIndex={-1}>{idea?'You’ve finished the learning in this path':'You’ve finished the learning in this path'}</h1>
              {!idea?<Card><Header><Title>Learning complete</Title></Header><Body><div className="ending-status"><span><Check size={18}/>All selected learning items finished</span><span><Target size={18}/>Goal achievement not checked</span></div><div className="coming-soon"><Badge variant="outline">Coming soon</Badge><h2>Skills assessment</h2><p>Your learning is complete. The skills assessment is not available yet.</p></div><p className="quiet">No course certificate, proficiency claim, or Goal completion. This is the supplied LEX Alpha requirement—not a claim that it is live.</p><p className="quiet">Optional self-report is a separate idea. Earlier familiarity answers use a different scale and will not be used as a comparison baseline.</p><Button onPress={()=>{setVersion('idea');setAnswers({});setReflect(false);setEnding({});setSaved(false);}}>Explore the Alpha ending</Button></Body></Card>:<>
                <p className="intro">Take a moment to reflect on what feels different. This is separate from proving what you can do.</p>
                <Card><Header><Title>{goal}</Title></Header><Body><div className="ending-status"><span><Check size={18}/>Learning items finished</span><span><Target size={18}/>Goal achievement not checked</span></div><p className="quiet">You’ve finished the path. We haven’t checked whether you’ve reached your Goal.</p><div className="coming-soon"><Badge variant="outline">Coming soon</Badge><h2>Put your learning to the test</h2><p>End-of-path assessment isn’t available yet. Your course activity or a confidence rating can’t replace it.</p></div>
                </Body><Footer className="flex-wrap justify-end"><Button variant="ghost" onPress={()=>{setReflect(false);setSaved(false);setEnding({});}}>Skip reflection</Button><Button onPress={()=>setReflect(true)}>Reflect on where I am now<ArrowRight size={15}/></Button></Footer></Card>
                {reflect&&<Card><Header><Title>Where would you place yourself today?</Title><p className="muted">Optional. Choose what best describes you—not what you think you should answer.</p></Header><Body>{visible.map(s=><div className="skill-block" key={s.name}><h2>{s.name}</h2><p className="muted">{s.question}.</p>{desired[s.i]&&<p className="aspiration">Your aspiration: {meanings[levels.indexOf(desired[s.i])]}. Not an assessed target.</p>}{picker(s.i,true)}</div>)}<p className="quiet">Your answers help you reflect. They are not assessed proficiency and won’t automatically become Skills Wallet claims.</p></Body><Footer className="justify-end"><Button isDisabled={!Object.values(ending).some(Boolean)} onPress={()=>setSaved(true)}>Review my reflection</Button></Footer></Card>}
                {reflect&&saved&&<Card><Header><Title>Your reflection</Title><p className="muted">Self-reported answers, not measured skill progress</p></Header><Body><div id="reflection-result">{visible.filter(s=>ending[s.i]).map(s=><div className="reflection-row" key={s.name}><h2>{s.name}</h2>{desired[s.i]&&<p>Your aspiration: {meanings[levels.indexOf(desired[s.i])]}. Repeating this level in your answer would not confirm achievement.</p>}{answers[s.i]&&levels.includes(answers[s.i])&&levels.includes(ending[s.i])?<><div className="answer-pair"><div><small>YOU REPORTED · START</small><strong>{answers[s.i]}</strong></div><div><small>YOU REPORT · NOW</small><strong>{ending[s.i]}</strong></div></div><p>Two answers to the same question. A change in your answer is not proof of a change in proficiency.</p></>:<><strong>You report now: {ending[s.i]}</strong><p>{answers[s.i]&&!levels.includes(answers[s.i])?'Your earlier answer does not provide a comparable proficiency baseline.':ending[s.i]==='I’m not sure'?'It’s okay to be unsure. No change in proficiency can be inferred.':'No matching starting self-report was collected. This answer stands on its own.'}</p>{covered(s.i)&&!assigned&&<p className="quiet">Existing information used for planning is a separate source—not “what you said before.”</p>}</>}</div>)}</div><p className="quiet">Demo only: nothing has been saved to a profile or shared with an admin.</p></Body></Card>}
              </>}
            </>}
            {step>=2&&learning.length===0&&<Card><Body><h1 ref={heading} tabIndex={-1}>No remaining learning in this example</h1><p>Revisit the Goal and your starting information. This is not a finished path or an achieved Goal.</p><Button onPress={()=>{go(0);setOpen(true);}}>Review Goal context</Button></Body></Card>}
          </div>
        </div>
      </div>
    </div>
    {!embedded&&toolbar&&<div className="demo-dock">
      {controls&&<section className="dock-panel" aria-label="Demo controls">
        <div className="panel-heading"><strong>Goal journey</strong><Button variant="ghost" size="icon-sm" aria-label="Close demo controls" onPress={()=>{setControls(false);switcher.current?.focus();}}><X size={16}/></Button></div>
        <div className="version-switch" role="group" aria-label="Experience version"><Button size="sm" variant={!idea?'default':'ghost'} aria-pressed={!idea} onPress={()=>reset('now')}>How it works now</Button><Button size="sm" variant={idea?'default':'ghost'} aria-pressed={idea} onPress={()=>reset('idea')}>Alpha idea</Button></div>
        <div className="journey"><button onClick={()=>{go(0);setNarrow(true);setControls(false);}}>Shape a broad ambition <small>Illustrative conversation</small></button>{steps.map((s,i)=><button key={s} aria-current={step===i&&!narrow?'step':undefined} onClick={()=>{go(i);setNarrow(false);setControls(false);}}><span>{i+1}</span>{s}{step===i&&!narrow&&<Check size={14}/>}</button>)}</div>
        {idea&&!assigned&&<div className="quick-scenes"><p className="eyebrow">OPTIONAL MOMENTS</p><Button variant="ghost" size="sm" onPress={()=>{go(0);setNarrow(false);setOpen(true);setControls(false);}}>Starting point</Button><Button variant="ghost" size="sm" onPress={()=>{go(0);setNarrow(false);setTargetOpen(true);setControls(false);}}>Desired capability</Button><Button variant="ghost" size="sm" onPress={()=>{go(3);setReflect(true);setControls(false);}}>Ending self-report</Button></div>}
        <label className="scenario-label">Learner context<select id="scenario" value={scenario} onChange={e=>reset(version,e.target.value)}><option value="existing">Existing information for all areas</option><option value="mixed">Some existing information</option><option value="new">No existing information</option><option value="assigned">Admin-assigned path</option></select></label>
        <p className="quiet">{idea?'Proposed Alpha improvements—not agreed scope.':'Goal widget behavior from local origin/main; ending from the supplied LEX Alpha PRD.'} Sample data; no real writes.</p>
        <div className="panel-heading"><a href="./index.html" className="back-link"><ArrowLeft size={14}/>Goal artifact</a><Button variant="ghost" size="icon-sm" aria-label="Restart example" onPress={()=>reset()}><RotateCcw size={16}/></Button></div>
      </section>}
      {notes&&<aside className="design-notes dock-panel"><div className="panel-heading"><span className="eyebrow">STORY · NOT LEARNER UI</span><Button variant="ghost" size="icon-sm" aria-label="Close story" onPress={()=>setNotes(false)}><X size={16}/></Button></div><h2>{noteTitle}</h2><p>{noteText}</p>
        <div className="note-rule"><h3>{idea?'What changes in the UI':'Current behavior to preserve'}</h3><p>{step===0?(idea?'Visible source labels, optional review, and plain-language levels. Optional desired-capability wording is a proposal, not shipped target-proficiency setup. No assessed targets or admin proficiency tracking in Alpha. Keep required assigned learning intact.':'Use the Goal directly, or open Skill experience when available. Do not require answers to continue.') : step===3?'LEX owns path completion and the P0 assessment placeholder. Self-report is an additional proposal, not committed LEX Alpha scope. No proficiency or Goal-completion claim.':'Carry the Goal’s purpose and confirmed areas into the next screen. Don’t present content completion as capability gained.'}</p></div>
        {step===1&&<div className="note-rule"><h3>Planning context in this example</h3>{visible.map(s=><p key={s.name}><strong>{s.name}</strong><br/>{startText(s.i)}<br/>{answers[s.i]==='Expert'&&!assigned?`Expert follow-up: ${expertIntent[s.i]||'not answered'} · Goal scope retained`:'No target proficiency in Alpha'}</p>)}<small>Example values, not a live planner payload.</small></div>}
<div className="note-rule"><h3>Why this is optional</h3><p>The horizon PRDs prioritize useful action without extensive setup. Do not add a starting questionnaire just to manufacture an ending comparison. Ending self-report is an Alpha feedback idea, not a substitute for the P1 Skill Check.</p></div>
        <details><summary>Source & open decisions</summary><p>Real Helix Button, Badge, and ChatContentCard components and design tokens. Shell and Goal composition follow the end-to-end prototype; backend calls are not connected.</p><p>Goal behavior checked at local revision c805b138c0 (GoalReviewCard, SkillFamiliarityStep, useWalletCoverage). The supplied static-path LEX PRD defines the Alpha ending and fixed-path boundary. No production-status claim.</p><p>Team Management Subskills and the Team Direction objective come from the <a href="https://docs.google.com/document/d/1jS3ahKZrFTCPGWuWvCuCabw9u7vJa8mAWYZtAoYt0As/edit">Skills Definition Framework</a>. The four proposed levels come from the separate <a href="https://docs.google.com/document/d/12o4OFNM0XOUTgC1MVASEss0sTX7nu6P6uD42L1w2iJw/edit">measurement brief</a>. Questions, Goal scope, and content are illustrative.</p><p>Agree with Skills: understandable level descriptions, how to use ending self-reports, and which of those answers should write to the Wallet. The supplied thread agrees an explicit starting Expert answer should create a self-attested claim. End-of-path claim rules are not settled. Team Connect’s three hypotheses require live Goal mapping, coherent generation, and reliable skill signals. This mock experience tests usability and usefulness only; self-report cannot prove the signal loop. The current legacy scale must not be silently converted into the new scale for comparison.</p></details>
      </aside>}
      <div className="dock-pill"><Badge variant="outline">{idea?'ALPHA IDEA':'CURRENT'}</Badge><Button ref={switcher} variant="ghost" size="sm" aria-label="Switch screens" aria-expanded={controls} onPress={()=>{setControls(!controls);setNotes(false);}}><span>{narrow?'Shape the Goal':steps[step]}</span><ChevronDown size={14}/></Button><Button variant="ghost" size="icon-sm" aria-label="Story" aria-pressed={notes} onPress={()=>{setNotes(!notes);setControls(false);}}><BookOpen size={16}/></Button><span className="screen-count">{step+1}/4</span><Button variant="ghost" size="icon-sm" aria-label="Previous screen" isDisabled={step===0&&!narrow} onPress={()=>{go(Math.max(0,step-1));setNarrow(false);}}><ArrowLeft size={15}/></Button><Button variant="ghost" size="icon-sm" aria-label="Next screen" isDisabled={step===3} onPress={()=>{go(narrow?0:step+1);setNarrow(false);}}><ArrowRight size={15}/></Button><Button variant="ghost" size="icon-sm" aria-label="Hide demo controls" onPress={()=>setToolbar(false)}><EyeOff size={15}/></Button></div>
    </div>}
    {!embedded&&!toolbar&&<Button className="restore-dock" variant="outline" size="icon" aria-label="Show demo controls" onPress={()=>setToolbar(true)}><Compass size={20}/></Button>}
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);

import { useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoalReviewCard } from '@source/goal-review';
import { type SkillFamiliarityValues, FAMILIARITY_LEVEL_ORDER } from '@source/footing';
import { FamiliarityLevelSlider } from '@source/familiarity-slider';
import { Button } from '@agentic-platform/ui-core';
import { ChatContentCard, ChatContentCardHeader, ChatContentCardTitle, ChatContentCardMeta, ChatContentCardRows, ChatContentCardRow, ChatContentCardFooter } from '@agentic-platform/ui-core-alpha';

const skills = [
  { skillId: 'team-management', subSkillId: 'direction', name: 'Team Direction' },
  { skillId: 'team-management', subSkillId: 'coordination', name: 'Work Coordination' },
  { skillId: 'team-management', subSkillId: 'collaboration', name: 'Team Collaboration' },
];
const goal = 'Create a clear plan for my team’s next month';
const labels = {'not-sure': 'I’m not sure', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced'};
type Intent = 'remove' | 'deeper';
type Intents = Record<string, Intent>;
function InteractiveFooting({ selected, answers, intents, onChange, onIntent, actions }: {
  selected: typeof skills; answers: SkillFamiliarityValues; intents: Intents;
  onChange: (value: SkillFamiliarityValues) => void;
  onIntent: (id: string, intent?: Intent) => void; actions?: ReactNode;
}) {
  const remaining = selected.filter(skill => intents[skill.subSkillId] !== 'remove');
  return <ChatContentCard initial={false}>
    <ChatContentCardHeader>
      <ChatContentCardTitle>How familiar are you with these skills?</ChatContentCardTitle>
      <ChatContentCardMeta>Optional. Help us find a useful starting point for your learning.</ChatContentCardMeta>
    </ChatContentCardHeader>
    <ChatContentCardRows>
      {selected.map(skill => {
        const id = skill.subSkillId;
        const level = answers[id];
        const intent = intents[id];
        const clear = () => {const next = {...answers}; delete next[id]; onChange(next); onIntent(id);};
        return <ChatContentCardRow key={id} className="flex-col gap-4 min-inline-0">
          <h4 className="type-subtitle-sm text-foreground">{skill.name}</h4>
          {intent === 'remove' ? <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="type-body-sm">Removed from this example Goal.</p>
            <Button variant="link" onPress={() => onIntent(id)}>Undo removal of {skill.name}</Button>
          </div> : <>
            <FamiliarityLevelSlider skillName={skill.name}
              levelIndex={level === undefined ? 0 : FAMILIARITY_LEVEL_ORDER.indexOf(level)}
              selectedLevelLabel={level === undefined ? 'Not answered' : labels[level]}
              isAnswered={level !== undefined} isDisabled={false}
              onSelectLevel={next => {
                if(next !== level) {onIntent(id); onChange({...answers, [id]: next});}
              }}/>
            {level !== undefined && <div className="flex justify-end">
              <Button variant="link" size="xs" aria-label={'Clear answer for ' + skill.name} onPress={clear}>Clear answer</Button>
            </div>}
            {level === 'advanced' && <div aria-live="polite" className="flex flex-col items-start gap-3">
              {!intent ? <>
                <p className="type-body-sm font-medium">You selected Advanced for {skill.name}. What would you like to focus on?</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onPress={() => onIntent(id, 'remove')}>Remove from this Goal</Button>
                  <Button variant="outline" onPress={() => onIntent(id, 'deeper')}>Teach me advanced applications</Button>
                </div>
              </> : <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="type-body-sm">Keep this Subskill and look for more advanced applications.</p>
                <Button variant="link" onPress={() => onIntent(id)}>Change choice for {skill.name}</Button>
              </div>}
            </div>}
          </>}
        </ChatContentCardRow>;
      })}
    </ChatContentCardRows>
    <ChatContentCardFooter className="flex-col items-stretch gap-3">
      <div aria-live="polite">
        <p className="type-body-sm"><strong>Goal scope:</strong> {remaining.length ? remaining.map(skill => skill.name).join(', ') : 'No Subskills selected.'}</p>
        {!remaining.length && <p className="type-body-sm">Add a Subskill back or refine your Goal before planning.</p>}
      </div>
      <div className="flex flex-wrap justify-end gap-2">{actions}</div>
    </ChatContentCardFooter>
  </ChatContentCard>;
}

function App() {
  const view = new URLSearchParams(location.search).get('view');
  const [answers, setAnswers] = useState<SkillFamiliarityValues>({});
  const [intents, setIntents] = useState<Intents>({});
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(skills);
  const [message, setMessage] = useState('');
  const remaining = selected.filter(skill => intents[skill.subSkillId] !== 'remove');
  const setIntent = (id: string, intent?: Intent) => setIntents(previous => {
    const next = {...previous}; if(intent) next[id] = intent; else delete next[id]; return next;
  });
  useEffect(() => {
    const notify = () => parent.postMessage({type:'helix-widget-height', height:document.getElementById('root')!.getBoundingClientRect().height}, '*');
    const observer = new ResizeObserver(notify);
    observer.observe(document.getElementById('root')!);
    notify();
    return () => observer.disconnect();
  }, []);
  if (view === 'intent' || view === 'footing' || editing) return <>
    {editing && <Button variant="ghost" onPress={() => setEditing(false)}>Back to Goal</Button>}
    <InteractiveFooting selected={selected} answers={answers} intents={intents} onIntent={setIntent} onChange={next => {setAnswers(next); setMessage('');}} actions={<>
      <Button variant="outline" onPress={() => {setAnswers({}); setMessage('Footing skipped. Your Goal scope is unchanged.'); if(editing) setEditing(false);}}>Skip footing</Button>
      <Button isDisabled={!remaining.length} onPress={() => {setMessage('Example updated. No app or Wallet data was saved.'); if(editing) setEditing(false);}}>Update</Button>
    </>}/>
    {message && <p className="fixture-note" role="status">{message}</p>}
  </>;
  return <>
    <GoalReviewCard draftKey="artifact-local" goalText={goal} description="Set priorities, coordinate the work, and agree how the team will work together." subSkills={remaining} onSubmit={async (outcome) => {
      setSelected([...outcome.subSkills, ...selected.filter(skill => intents[skill.subSkillId] === 'remove' && !outcome.subSkills.some(candidate => candidate.subSkillId === skill.subSkillId))]);
      if(outcome.action === 'editLevels') setEditing(true);
      else setMessage('Goal confirmed for this example only. No path is generated.');
    }}/>
    {message && <p className="fixture-note" role="status">{message}</p>}
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);

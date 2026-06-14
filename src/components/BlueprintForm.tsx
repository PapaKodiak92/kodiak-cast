import type { PodcastInputs } from '../types';
import '../stageFlow.css';

interface BlueprintFormProps {
  inputs: PodcastInputs;
  onChange: (inputs: PodcastInputs) => void;
  onGenerate: () => void;
}

type RequiredQuestion = {
  field: keyof PodcastInputs;
  label: string;
};

const requiredQuestions: RequiredQuestion[] = [
  { field: 'showName', label: 'Show name' },
  { field: 'niche', label: 'Niche / topic' },
  { field: 'audience', label: 'Target listener' },
  { field: 'tone', label: 'Tone' },
  { field: 'format', label: 'Format' },
  { field: 'cadence', label: 'Cadence' },
  { field: 'goal', label: 'Main goal' }
];

function isAnswered(value: string) {
  return value.trim().length > 0;
}

export function BlueprintForm({ inputs, onChange, onGenerate }: BlueprintFormProps) {
  const setField = (field: keyof PodcastInputs, value: string) => {
    onChange({ ...inputs, [field]: value });
  };

  const answeredCount = requiredQuestions.filter((question) => isAnswered(inputs[question.field])).length;
  const canGenerate = answeredCount === requiredQuestions.length;

  return (
    <section className="panel form-panel staged-panel">
      <div className="stage-kicker-row">
        <span className="stage-pill">Stage 1 of 5</span>
        <span className={canGenerate ? 'stage-ready' : 'stage-waiting'}>
          {answeredCount}/{requiredQuestions.length} questions answered
        </span>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Setup Wizard</p>
        <h2>Answer the core questions first.</h2>
        <p>
          Kodiak Cast should feel guided, not overwhelming. Fill the setup questions, then generate the full starter kit after the foundation is ready.
        </p>
      </div>

      <div className="stage-question-grid" aria-label="Setup progress">
        {requiredQuestions.map((question) => (
          <span className={isAnswered(inputs[question.field]) ? 'question-chip complete' : 'question-chip'} key={question.field}>
            {isAnswered(inputs[question.field]) ? '✓' : '○'} {question.label}
          </span>
        ))}
      </div>

      <div className="form-grid">
        <label>
          Show name
          <input value={inputs.showName} onChange={(event) => setField('showName', event.target.value)} />
        </label>
        <label>
          Niche / topic
          <input value={inputs.niche} onChange={(event) => setField('niche', event.target.value)} />
        </label>
        <label>
          Target listener
          <input value={inputs.audience} onChange={(event) => setField('audience', event.target.value)} />
        </label>
        <label>
          Tone
          <input value={inputs.tone} onChange={(event) => setField('tone', event.target.value)} />
        </label>
        <label>
          Format
          <input value={inputs.format} onChange={(event) => setField('format', event.target.value)} />
        </label>
        <label>
          Cadence
          <input value={inputs.cadence} onChange={(event) => setField('cadence', event.target.value)} />
        </label>
      </div>

      <label className="wide-label">
        Main goal
        <textarea value={inputs.goal} onChange={(event) => setField('goal', event.target.value)} rows={4} />
      </label>

      <div className="stage-action-row">
        <button className="primary-button" disabled={!canGenerate} onClick={onGenerate} type="button">
          Generate Starter Kit
        </button>
        <p>
          {canGenerate
            ? 'All core answers are in. Generate the AI starter kit, then review one stage at a time.'
            : 'Finish the required questions before asking AI to generate the workspace.'}
        </p>
      </div>
    </section>
  );
}

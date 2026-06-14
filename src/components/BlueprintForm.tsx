import type { PodcastInputs } from '../types';

interface BlueprintFormProps {
  inputs: PodcastInputs;
  onChange: (inputs: PodcastInputs) => void;
  onGenerate: () => void;
}

export function BlueprintForm({ inputs, onChange, onGenerate }: BlueprintFormProps) {
  const setField = (field: keyof PodcastInputs, value: string) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <section className="panel form-panel">
      <div className="section-heading">
        <p className="eyebrow">Setup Wizard</p>
        <h2>Generate the podcast starter kit</h2>
        <p>
          Answer the core questions. Kodiak Cast will create the blueprint, first episodes, guest angles,
          launch checklist, trailer copy, launch posts, and production rhythm for this project.
        </p>
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

      <button className="primary-button" onClick={onGenerate} type="button">
        Generate Starter Kit
      </button>
    </section>
  );
}

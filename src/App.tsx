import { useMemo, useState } from 'react';
import { BlueprintForm } from './components/BlueprintForm';
import {
  EditableBlueprint,
  type BlueprintListField,
  type BlueprintTextField
} from './components/EditableBlueprint';
import { EpisodeCard } from './components/EpisodeCard';
import { GuestCard } from './components/GuestCard';
import { MetricCard } from './components/MetricCard';
import { Sidebar } from './components/Sidebar';
import { starterEpisodes, starterGuests } from './data/starterData';
import { generateBlueprint } from './lib/blueprint';
import type { PodcastInputs } from './types';
import './styles.css';
import './blueprintEditor.css';

const defaultInputs: PodcastInputs = {
  showName: 'Kodiak Cast',
  niche: 'building podcasts, personal discipline, creative momentum, and turning ideas into products',
  audience: 'people who want to start a real podcast but need structure and accountability',
  tone: 'honest, practical, focused, and motivational',
  format: 'solo episodes, guest interviews, and weekly build-in-public updates',
  cadence: 'weekly',
  goal: 'prove the system by using it to launch and maintain the show ourselves'
};

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [inputs, setInputs] = useState(defaultInputs);
  const [blueprint, setBlueprint] = useState(() => generateBlueprint(defaultInputs));
  const [launchItems, setLaunchItems] = useState(blueprint.launchChecklist);

  const allEpisodes = useMemo(
    () => [...blueprint.firstEpisodes, ...starterEpisodes],
    [blueprint.firstEpisodes]
  );

  const completedLaunchItems = launchItems.filter((item) => item.done).length;

  const handleGenerate = () => {
    const nextBlueprint = generateBlueprint(inputs);
    setBlueprint(nextBlueprint);
    setLaunchItems(nextBlueprint.launchChecklist);
    setActiveSection('blueprint');
  };

  const updateBlueprintText = (field: BlueprintTextField, value: string) => {
    setBlueprint((currentBlueprint) => ({
      ...currentBlueprint,
      [field]: value
    }));
  };

  const updateBlueprintListItem = (field: BlueprintListField, index: number, value: string) => {
    setBlueprint((currentBlueprint) => ({
      ...currentBlueprint,
      [field]: currentBlueprint[field].map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  };

  const addBlueprintListItem = (field: BlueprintListField) => {
    setBlueprint((currentBlueprint) => ({
      ...currentBlueprint,
      [field]: [...currentBlueprint[field], 'New item to shape']
    }));
  };

  const removeBlueprintListItem = (field: BlueprintListField, index: number) => {
    setBlueprint((currentBlueprint) => {
      const nextItems = currentBlueprint[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...currentBlueprint,
        [field]: nextItems.length > 0 ? nextItems : ['']
      };
    });
  };

  const toggleLaunchItem = (id: string) => {
    setLaunchItems((items) =>
      items.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="main-content">
        <header className="hero">
          <div>
            <p className="eyebrow">Podcast operating system</p>
            <h2>Plan, launch, and maintain your podcast.</h2>
            <p>
              Kodiak Cast starts as our own podcast launch planner. If it helps us stay consistent,
              we have proof it can help other creators too.
            </p>
          </div>
          <button className="primary-button" onClick={() => setActiveSection('blueprint')} type="button">
            Start Blueprint
          </button>
        </header>

        {activeSection === 'dashboard' && (
          <section className="content-stack">
            <div className="metric-grid">
              <MetricCard label="Podcast" value={blueprint.name} note="Current project" />
              <MetricCard label="Episodes" value={String(allEpisodes.length)} note="Ideas ready to shape" />
              <MetricCard label="Guests" value={String(starterGuests.length)} note="Starter leads" />
              <MetricCard label="Launch" value={`${completedLaunchItems}/${launchItems.length}`} note="Checklist complete" />
            </div>

            <section className="panel two-column-panel">
              <div>
                <p className="eyebrow">Next Action</p>
                <h2>Record the trailer episode.</h2>
                <p>
                  The trailer proves the show is real. Keep it short: why the show exists, who it is for,
                  what listeners get, and when episodes drop.
                </p>
              </div>
              <div className="action-list">
                <span>Lock first-season theme</span>
                <span>Write intro and outro</span>
                <span>Outline episode one</span>
                <span>Pick first guest target</span>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <p className="eyebrow">This Week</p>
                <h2>Suggested episode focus</h2>
              </div>
              <EpisodeCard episode={allEpisodes[0]} />
            </section>
          </section>
        )}

        {activeSection === 'blueprint' && (
          <section className="content-stack">
            <BlueprintForm inputs={inputs} onChange={setInputs} onGenerate={handleGenerate} />

            <EditableBlueprint
              blueprint={blueprint}
              onAddListItem={addBlueprintListItem}
              onListItemChange={updateBlueprintListItem}
              onRemoveListItem={removeBlueprintListItem}
              onTextChange={updateBlueprintText}
            />
          </section>
        )}

        {activeSection === 'episodes' && (
          <section className="content-stack">
            <section className="section-heading outside-heading">
              <p className="eyebrow">Episode Pipeline</p>
              <h2>Ideas become outlines. Outlines become recordings.</h2>
            </section>
            <div className="episode-grid">
              {allEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </section>
        )}

        {activeSection === 'guests' && (
          <section className="content-stack">
            <section className="section-heading outside-heading">
              <p className="eyebrow">Guest CRM</p>
              <h2>Track who fits the show and why they should say yes.</h2>
            </section>
            <div className="guest-grid">
              {starterGuests.map((guest) => (
                <GuestCard key={guest.id} guest={guest} />
              ))}
            </div>
            <section className="panel">
              <p className="eyebrow">Outreach Draft</p>
              <h2>Starter guest pitch</h2>
              <p className="pitch-copy">
                Hey [Name], I am launching Kodiak Cast, a show about building momentum, creating useful systems,
                and turning messy starts into real progress. I think your story around [specific angle] would give
                listeners something practical and honest. Would you be open to joining me for a focused conversation?
              </p>
            </section>
          </section>
        )}

        {activeSection === 'launch' && (
          <section className="content-stack">
            <section className="panel">
              <div className="section-heading">
                <p className="eyebrow">Launch Checklist</p>
                <h2>Keep the show moving.</h2>
                <p>Click items as they are completed. Later this becomes persistent per user and per podcast.</p>
              </div>

              <div className="checklist">
                {launchItems.map((item) => (
                  <label key={item.id} className={item.done ? 'checked' : ''}>
                    <input
                      checked={item.done}
                      onChange={() => toggleLaunchItem(item.id)}
                      type="checkbox"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'episodes', label: 'Episodes' },
  { id: 'guests', label: 'Guests' },
  { id: 'launch', label: 'Launch' }
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-mark">KC</div>
      <div>
        <p className="eyebrow">Kodiak Holdings</p>
        <h1>Kodiak Cast</h1>
        <p className="sidebar-copy">Your command center for planning and maintaining a podcast that lasts.</p>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            className={activeSection === section.id ? 'active' : ''}
            onClick={() => onSectionChange(section.id)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

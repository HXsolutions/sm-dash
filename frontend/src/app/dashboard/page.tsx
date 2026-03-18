export default function DashboardPage() {
  return (
    <div>
      <h1 className="heading" style={{ fontSize: '2rem' }}>Welcome to AutoMedia</h1>
      <p style={{ color: '#888' }}>Phase 1 - Dashboard Setup and Media</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card glass-panel">
          <h3>Total Assets</h3>
          <p style={{ fontSize: '2rem', marginTop: '1rem', color: 'var(--primary)' }}>0</p>
        </div>
        <div className="card glass-panel">
          <h3>Scheduled Posts</h3>
          <p style={{ fontSize: '2rem', marginTop: '1rem', color: 'var(--primary)' }}>0</p>
        </div>
        <div className="card glass-panel">
          <h3>Drafts</h3>
          <p style={{ fontSize: '2rem', marginTop: '1rem', color: 'var(--primary)' }}>0</p>
        </div>
      </div>
    </div>
  );
}

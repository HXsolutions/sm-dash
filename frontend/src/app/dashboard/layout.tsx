'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Image as ImageIcon, CheckSquare, Calendar, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: Home },
    { name: 'Media Library', path: '/dashboard/media', icon: ImageIcon },
    { name: 'Content Workflow', path: '/dashboard/workflow', icon: CheckSquare },
    { name: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem 1rem', position: 'relative' }}>
        <h2 style={{ paddingLeft: '1rem', color: '#fff', marginBottom: '2rem' }}>Haxxcel Dash</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => {
            const active = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--foreground)'
              }}>
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div style={{ position: 'absolute', bottom: '2rem', width: '218px' }}>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

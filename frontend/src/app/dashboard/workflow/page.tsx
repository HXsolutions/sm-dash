'use client';
import { useState, useEffect } from 'react';
import { Loader, CalendarCheck, CheckSquare, Square } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DraftSchedulerPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  
  const [platforms, setPlatforms] = useState<string[]>(['LinkedIn']);
  const [scheduleMode, setScheduleMode] = useState('daily');
  const [postsPerDay, setPostsPerDay] = useState(1);
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await api.get('/posts');
      // Only show drafts (auto-generated posts that are unscheduled)
      const unscheduled = res.data.filter((p: any) => p.status === 'draft');
      setDrafts(unscheduled);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  const togglePost = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter(p => p !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(x => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const toggleDay = (day: number) => {
    if (specificDays.includes(day)) {
       setSpecificDays(specificDays.filter(d => d !== day));
    } else {
       setSpecificDays([...specificDays, day]);
    }
  };

  const handleBulkSchedule = async () => {
    if (selectedPosts.length === 0) return alert('Select at least one draft to schedule');
    if (platforms.length === 0) return alert('Select at least one platform');

    try {
      setScheduling(true);
      await api.post('/posts/bulk-schedule', {
        postIds: selectedPosts,
        platforms,
        postsPerDay: scheduleMode === 'daily' ? postsPerDay : 1,
        specificDays: scheduleMode === 'specific_days' ? specificDays : null
      });
      alert(`Success! Scheduled ${selectedPosts.length} auto-generated posts.`);
      router.push('/dashboard/schedule');
    } catch (err: any) {
      console.error(err);
      alert('Error scheduling posts.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading" style={{ margin: 0 }}>Unscheduled Drafts (Auto-Generated)</h1>
          <p style={{ color: '#888', marginTop: '0.25rem' }}>Review content instantly generated upon upload, and assign them a dynamic posting schedule.</p>
        </div>
        <button 
          className="btn" 
          onClick={handleBulkSchedule} 
          disabled={scheduling || selectedPosts.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: 600 }}
        >
          {scheduling ? <Loader size={20} className="spin" /> : <CalendarCheck size={20} />} 
          {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
        {/* Settings Box */}
        <div className="card glass-panel" style={{ height: 'fit-content' }}>
           <h2 className="heading" style={{ fontSize: '1.25rem' }}>Schedule Settings</h2>
           
           <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', marginBottom: '1rem' }}>Platforms to Hit</label>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {['LinkedIn'].map(p => (
                 <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => togglePlatform(p)}>
                   {platforms.includes(p) ? <CheckSquare size={20} color="var(--primary)" /> : <Square size={20} color="#666" />}
                   <span style={{ fontSize: '0.95rem' }}>{p}</span>
                 </div>
               ))}
             </div>
           </div>
           
           <div style={{ marginBottom: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
             <h3 className="heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Smart Rules</h3>
             <label style={{ display: 'block', marginBottom: '0.5rem' }}>Schedule Rule</label>
             <select className="input-field" value={scheduleMode} onChange={e => setScheduleMode(e.target.value)} style={{ marginBottom: '1rem' }}>
               <option value="daily">Daily Posts</option>
               <option value="specific_days">Specific Days Only</option>
             </select>
             
             {scheduleMode === 'daily' && (
               <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Posts per Day</label>
                 <select className="input-field" value={postsPerDay} onChange={e => setPostsPerDay(parseInt(e.target.value))}>
                    <option value="1">1 Post per day</option>
                    <option value="2">2 Posts per day</option>
                    <option value="3">3 Posts per day</option>
                    <option value="5">5 Posts per day</option>
                 </select>
                 <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Posts will be staggered by 2 hours automatically.</p>
               </div>
             )}
             
             {scheduleMode === 'specific_days' && (
               <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Select Days to Publish</label>
                 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                   {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                     <div 
                       key={d} 
                       onClick={() => toggleDay(i)}
                       style={{ 
                         padding: '0.4rem 0.6rem', 
                         borderRadius: '6px', 
                         cursor: 'pointer',
                         fontSize: '0.8rem',
                         fontWeight: 600,
                         transition: 'all 0.2s',
                         border: specificDays.includes(i) ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                         background: specificDays.includes(i) ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-hover)'
                       }}
                     >{d}</div>
                   ))}
                 </div>
                 <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Defaults to 1 post per selected day.</p>
               </div>
             )}
           </div>
        </div>

        {/* Dynamic Draft Selection Grid */}
        <div>
          <h2 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
             Select Prepared Drafts ({selectedPosts.length} / {drafts.length} selected)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {drafts.map((post) => {
              const isSelected = selectedPosts.includes(post.id);
              return (
                <div 
                  key={post.id} 
                  className={`card ${isSelected ? '' : 'glass-panel'}`} 
                  style={{ 
                    padding: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                    border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
                    display: 'flex', gap: '1.5rem', alignItems: 'flex-start'
                  }}
                  onClick={() => togglePost(post.id)}
                >
                   <div style={{ flexShrink: 0, width: '120px', aspectRatio: '1/1', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${post.mediaUrl}`} alt="Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   </div>
                   
                   <div style={{ flex: 1 }}>
                     <p style={{ fontSize: '0.95rem', color: '#e2e8f0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem' }}>
                       {post.caption}
                     </p>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                       {post.hashtags.map((h: string, idx: number) => (
                         <span key={idx} style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                           {h}
                         </span>
                       ))}
                     </div>
                   </div>

                   <div style={{ alignSelf: 'center', padding: '0 1rem' }}>
                      {isSelected ? <CheckSquare size={28} color="var(--primary)" /> : <Square size={28} color="#666" />}
                   </div>
                </div>
              );
            })}
            
            {drafts.length === 0 && (
              <p style={{ color: '#888', padding: '2rem 0' }}>No unscheduled drafts. Upload new assets to the Media Library to auto-generate content.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

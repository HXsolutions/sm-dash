'use client';
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function SchedulePage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading" style={{ margin: 0 }}>Content Schedule</h1>
        <p style={{ color: '#888', marginTop: '0.25rem' }}>View your scheduled and drafted posts</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {posts.map((post) => (
          <div key={post.id} className="card glass-panel" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#222', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${post.mediaUrl}`} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ 
                  background: post.status === 'scheduled' ? 'var(--primary)' : post.status === 'posted' ? 'var(--success)' : '#444', 
                  color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' 
                }}>
                  {post.status}
                </span>
                
                <span style={{ color: '#aaa', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {post.status === 'posted' ? <CheckCircle size={14} /> : <Clock size={14} />} 
                  {post.scheduledTime ? new Date(post.scheduledTime).toLocaleString() : 'No time set'}
                </span>
              </div>
              
              <p style={{ fontSize: '0.95rem', color: '#e2e8f0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.caption}
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {post.platforms.map((p: string) => (
                  <span key={p} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ paddingRight: '1rem' }}>
               <button className="btn" style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => {
                  navigator.clipboard.writeText(`${post.caption}\n\n${post.hashtags.join(' ')}`);
                  alert('Copied to clipboard!');
               }}>Copy</button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
            <Calendar size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No content scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

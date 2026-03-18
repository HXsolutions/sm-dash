'use client';
import { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, Trash, Loader } from 'lucide-react';
import api from '@/lib/api';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get('/media');
      setMedia(res.data);
    } catch (err) {
      console.error('Failed to fetch media');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchMedia();
    } catch (err) {
      console.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading" style={{ margin: 0 }}>Media Library</h1>
          <p style={{ color: '#888', marginTop: '0.25rem' }}>Upload and manage your assets</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*,video/*"
          />
          <button 
            className="btn" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {uploading ? <Loader size={20} className="spin" /> : <UploadCloud size={20} />} 
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {media.map((item) => (
          <div key={item.id} className="card glass-panel" style={{ padding: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#111', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
               {item.type.startsWith('video') ? (
                 <video src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${item.url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
               ) : (
                 <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${item.url}`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               )}
            </div>
            <div style={{ padding: '0.5rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.filename}>
                {item.filename}
              </p>
            </div>
          </div>
        ))}
        {media.length === 0 && !uploading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: '#888' }}>
            <File size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No media files uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

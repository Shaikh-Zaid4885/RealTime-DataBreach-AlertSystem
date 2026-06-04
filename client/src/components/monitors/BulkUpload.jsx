import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import Button from '../common/Button';

export default function BulkUpload({ onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').filter(Boolean).slice(0, 5);
      setPreview(lines.map((line) => {
        const [type, identifier] = line.split(',').map((s) => s.trim());
        return { type: type || 'email', identifier: identifier || type };
      }));
    };
    reader.readAsText(f);
  };

  const handleSubmit = () => {
    if (file && onUpload) onUpload(file);
  };

  return (
    <div>

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px', padding: 'var(--space-6)', border: `2px dashed ${dragOver ? 'var(--accent-purple)' : 'var(--bg-modifier-border)'}`, borderRadius: 'var(--radius-md)', background: dragOver ? 'rgba(157, 78, 221, 0.05)' : 'transparent', transition: 'all 0.2s', cursor: 'pointer' }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="upload-zone-icon" style={{ color: dragOver ? 'var(--accent-purple)' : 'var(--text-muted)' }}><Upload size={32} /></div>
        <div className="upload-zone-text" style={{ marginTop: 'var(--space-3)', fontWeight: 600 }}>
          {file ? file.name : 'Drop CSV file here or click to browse'}
        </div>
        <div className="upload-zone-hint" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Format: type,identifier (one per line)</div>
        <input ref={inputRef} type="file" accept=".csv,.txt" hidden onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {preview.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Preview:</div>
          {preview.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-2) 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <FileText size={14} />
              <span className="data-type-tag">{p.type}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{p.identifier}</span>
            </div>
          ))}
          <Button variant="success" className="w-full mt-4" onClick={handleSubmit} icon={Upload}>
            Upload {preview.length}+ Identifiers
          </Button>
        </div>
      )}
    </div>
  );
}

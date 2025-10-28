import { useState } from 'react';
import { formatFileSize } from '../utils/helpers';

const ImportModal = ({ isOpen, onClose, onImport, existingMemoriesCount }) => {
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState(null);
  const [importMode, setImportMode] = useState('merge'); // 'merge' or 'replace'
  const [conflictStrategy, setConflictStrategy] = useState('skip'); // 'skip' or 'overwrite'
  const [step, setStep] = useState('select'); // 'select', 'preview', 'importing', 'complete'
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate import file format
      if (!data.memories || !Array.isArray(data.memories)) {
        alert('Invalid import file format. Expected a Memoria Vault export file.');
        return;
      }

      setImportFile(file);
      setImportData(data);
      setStep('preview');
    } catch (error) {
      console.error('Error reading import file:', error);
      alert('Failed to read import file. Please ensure it\'s a valid JSON file.');
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setStep('importing');
    const memoriesToImport = importData.memories;
    const total = memoriesToImport.length;
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    try {
      for (let i = 0; i < memoriesToImport.length; i++) {
        const memory = memoriesToImport[i];
        
        setImportProgress({ current: i + 1, total });

        try {
          await onImport(memory, importMode, conflictStrategy);
          imported++;
        } catch (error) {
          if (error.message === 'DUPLICATE_SKIPPED') {
            skipped++;
          } else {
            console.error('Error importing memory:', error);
            errors++;
          }
        }
      }

      setImportResults({
        total,
        imported,
        skipped,
        errors,
        success: errors === 0
      });

      setStep('complete');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import process failed. Please try again.');
      setStep('preview');
    }
  };

  const handleClose = () => {
    setImportFile(null);
    setImportData(null);
    setImportMode('merge');
    setConflictStrategy('skip');
    setStep('select');
    setImportProgress({ current: 0, total: 0 });
    setImportResults(null);
    onClose();
  };

  const calculateStats = () => {
    if (!importData) return null;

    const memories = importData.memories;
    const categories = memories.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});

    const totalSize = memories.reduce((sum, m) => sum + (m.fileSize || 0), 0);

    return {
      total: memories.length,
      categories,
      totalSize,
      exportDate: importData.exportDate,
      version: importData.version
    };
  };

  if (!isOpen) return null;

  const stats = calculateStats();

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-backdrop"></div>
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <h2>Import Memories</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Step 1: Select File */}
          {step === 'select' && (
            <div className="import-select">
              <div className="upload-area" style={{ cursor: 'pointer' }}
                   onClick={() => document.getElementById('importFileInput').click()}>
                <div className="upload-content">
                  <div className="upload-icon">📥</div>
                  <h3>Select Import File</h3>
                  <p>Choose a Memoria Vault export file (.json)</p>
                </div>
                <input
                  type="file"
                  id="importFileInput"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
              {existingMemoriesCount > 0 && (
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--color-bg-8)', borderRadius: 'var(--radius-base)', border: '1px solid var(--color-border)' }}>
                  <strong>⚠️ Note:</strong> You currently have {existingMemoriesCount} memories. 
                  You'll be able to choose whether to merge or replace them.
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview & Configure */}
          {step === 'preview' && stats && (
            <div className="import-preview">
              <div style={{ marginBottom: '24px' }}>
                <h3>Import Preview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {stats.total}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Memories to Import
                    </div>
                  </div>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                      {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Total Size
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div style={{ marginTop: '20px' }}>
                  <strong>Categories:</strong>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {Object.entries(stats.categories).map(([category, count]) => (
                      <span key={category} className="memory-tag" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {category}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Export Info */}
                {stats.exportDate && (
                  <div style={{ marginTop: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Exported on: {new Date(stats.exportDate).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Import Mode */}
              <div className="form-group">
                <label className="form-label">Import Mode</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className={`btn ${importMode === 'merge' ? 'btn--primary' : 'btn--outline'}`}
                    onClick={() => setImportMode('merge')}
                  >
                    📂 Merge ({existingMemoriesCount} + {stats.total})
                  </button>
                  <button
                    className={`btn ${importMode === 'replace' ? 'btn--primary' : 'btn--outline'}`}
                    onClick={() => setImportMode('replace')}
                  >
                    🔄 Replace (Delete {existingMemoriesCount}, Import {stats.total})
                  </button>
                </div>
                <p className="setting-description" style={{ marginTop: '8px' }}>
                  {importMode === 'merge' 
                    ? 'Add imported memories to your existing collection' 
                    : '⚠️ This will delete all existing memories and replace with imported data'}
                </p>
              </div>

              {/* Conflict Strategy (only for merge mode) */}
              {importMode === 'merge' && (
                <div className="form-group">
                  <label className="form-label">Duplicate Handling</label>
                  <select
                    className="form-control"
                    value={conflictStrategy}
                    onChange={(e) => setConflictStrategy(e.target.value)}
                  >
                    <option value="skip">Skip duplicates (keep existing)</option>
                    <option value="overwrite">Overwrite duplicates (replace with imported)</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="form-actions">
                <button className="btn btn--outline" onClick={() => setStep('select')}>
                  ← Back
                </button>
                <button 
                  className="btn btn--primary" 
                  onClick={handleImport}
                >
                  {importMode === 'replace' ? '⚠️ Replace All Data' : `Import ${stats.total} Memories`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Importing Progress */}
          {step === 'importing' && (
            <div className="import-progress">
              <h3>Importing Memories...</h3>
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Progress</span>
                  <span>{importProgress.current} / {importProgress.total}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: 'var(--color-secondary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(importProgress.current / importProgress.total) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <p style={{ marginTop: '16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  Please wait while we import your memories...
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && importResults && (
            <div className="import-complete">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                  {importResults.success ? '✅' : '⚠️'}
                </div>
                <h3>Import {importResults.success ? 'Complete' : 'Completed with Warnings'}</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-3)', borderRadius: 'var(--radius-base)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                    {importResults.imported}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Imported
                  </div>
                </div>
                {importResults.skipped > 0 && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-2)', borderRadius: 'var(--radius-base)', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                      {importResults.skipped}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Skipped
                    </div>
                  </div>
                )}
                {importResults.errors > 0 && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-4)', borderRadius: 'var(--radius-base)', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-error)' }}>
                      {importResults.errors}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Errors
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button className="btn btn--primary btn--full-width" onClick={handleClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;

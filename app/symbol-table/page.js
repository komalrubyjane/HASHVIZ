'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBg from '../components/ParticleBg';
import { ToastProvider, useToast } from '../components/Toast';

/* ==============================
   HASH FUNCTION (for internal bucket mapping)
   ============================== */
function hashSymbol(name, size) {
  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % size;
}

/* ==============================
   RANDOM MEMORY ADDRESS
   ============================== */
function randomAddr() {
  return '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
}

/* ==============================
   SAMPLE SYMBOLS (pre-built code snippets)
   ============================== */
const SAMPLE_PROGRAMS = {
  'C Variables': [
    { name: 'count', type: 'int', scope: 'global', value: '0', line: 3 },
    { name: 'PI', type: 'float', scope: 'global', value: '3.14', line: 4 },
    { name: 'name', type: 'char', scope: 'global', value: "'A'", line: 5 },
    { name: 'total', type: 'double', scope: 'local', value: '0.0', line: 8 },
    { name: 'i', type: 'int', scope: 'local', value: '0', line: 10 },
    { name: 'result', type: 'int', scope: 'local', value: '42', line: 12 },
    { name: 'flag', type: 'bool', scope: 'global', value: 'true', line: 2 },
    { name: 'temp', type: 'float', scope: 'local', value: '98.6', line: 15 },
  ],
  'Functions': [
    { name: 'main', type: 'func', scope: 'global', value: 'int()', line: 1 },
    { name: 'add', type: 'func', scope: 'global', value: 'int(int,int)', line: 20 },
    { name: 'a', type: 'int', scope: 'param', value: '—', line: 20 },
    { name: 'b', type: 'int', scope: 'param', value: '—', line: 20 },
    { name: 'sum', type: 'int', scope: 'local', value: '—', line: 22 },
    { name: 'print', type: 'func', scope: 'global', value: 'void(char*)', line: 30 },
    { name: 'msg', type: 'pointer', scope: 'param', value: '—', line: 30 },
    { name: 'len', type: 'int', scope: 'local', value: '0', line: 32 },
  ],
  'Data Structures': [
    { name: 'arr', type: 'array', scope: 'global', value: 'int[100]', line: 5 },
    { name: 'size', type: 'int', scope: 'global', value: '100', line: 6 },
    { name: 'node', type: 'struct', scope: 'global', value: '{int,ptr}', line: 10 },
    { name: 'head', type: 'pointer', scope: 'global', value: 'NULL', line: 12 },
    { name: 'tail', type: 'pointer', scope: 'global', value: 'NULL', line: 13 },
    { name: 'matrix', type: 'array', scope: 'local', value: 'int[3][3]', line: 18 },
    { name: 'rows', type: 'int', scope: 'local', value: '3', line: 19 },
    { name: 'cols', type: 'int', scope: 'local', value: '3', line: 20 },
  ],
};

const TYPES = ['int', 'float', 'double', 'char', 'string', 'bool', 'void', 'array', 'pointer', 'struct', 'func'];
const SCOPES = ['global', 'local', 'param', 'block'];

/* ==============================
   SYMBOL TABLE INNER
   ============================== */
function SymbolTableInner() {
  const addToast = useToast();
  const TABLE_SIZE = 16;

  // Symbol table state: array of buckets
  const [buckets, setBuckets] = useState(() => Array.from({ length: TABLE_SIZE }, () => []));
  const [allSymbols, setAllSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  // Form state
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState('int');
  const [scopeInput, setScopeInput] = useState('global');
  const [valueInput, setValueInput] = useState('');
  const [lineInput, setLineInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Highlight
  const [highlightRow, setHighlightRow] = useState(null);

  // Add log
  const addLog = useCallback((msg) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs((prev) => [{ ts, msg, id: Date.now() + Math.random() }, ...prev].slice(0, 100));
  }, []);

  // Rebuild flat list from buckets
  useEffect(() => {
    const flat = [];
    buckets.forEach((bucket) => bucket.forEach((sym) => flat.push(sym)));
    flat.sort((a, b) => (a.insertOrder || 0) - (b.insertOrder || 0));
    setAllSymbols(flat);
  }, [buckets]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs]);

  // ===== INSERT SYMBOL =====
  const handleInsert = () => {
    const name = nameInput.trim();
    if (!name) { addToast('Symbol name is required', 'error'); return; }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      addToast('Invalid identifier — must start with a letter or _', 'error');
      return;
    }

    const idx = hashSymbol(name, TABLE_SIZE);
    const addr = randomAddr();
    const line = parseInt(lineInput, 10) || 1;
    const value = valueInput.trim() || '—';

    setBuckets((prev) => {
      const updated = prev.map((b) => [...b]);
      const existing = updated[idx].findIndex((s) => s.name === name);
      if (existing >= 0) {
        // Update existing symbol
        updated[idx][existing] = { ...updated[idx][existing], type: typeInput, scope: scopeInput, value, line };
        addLog(`<span class="highlight-orange">UPDATE</span> symbol <span class="highlight-cyan">${name}</span> in bucket <span class="highlight-green">[${idx}]</span>`);
        addToast(`Updated symbol "${name}"`, 'info');
      } else {
        const isCollision = updated[idx].length > 0;
        const sym = { name, type: typeInput, scope: scopeInput, value, line, addr, bucket: idx, insertOrder: Date.now() };
        updated[idx].push(sym);
        if (isCollision) {
          addLog(`<span class="highlight-red">COLLISION</span> at bucket <span class="highlight-green">[${idx}]</span> — chaining <span class="highlight-cyan">${name}</span> (${TYPES.find(t => t === typeInput) || typeInput})`);
          addToast(`Collision at bucket [${idx}]! "${name}" chained.`, 'warning');
        } else {
          addLog(`<span class="highlight-green">INSERT</span> <span class="highlight-cyan">${name}</span> → bucket <span class="highlight-green">[${idx}]</span>  addr:<span class="highlight-purple">${addr}</span>`);
          addToast(`Inserted "${name}" into symbol table`, 'success');
        }
      }
      return updated;
    });

    setHighlightRow(name);
    setTimeout(() => setHighlightRow(null), 1500);
    setNameInput('');
    setValueInput('');
    setLineInput('');
  };

  // ===== SEARCH SYMBOL =====
  const handleSearch = () => {
    const name = searchInput.trim();
    if (!name) { addToast('Enter a symbol name to search', 'error'); return; }

    const idx = hashSymbol(name, TABLE_SIZE);
    const found = buckets[idx].find((s) => s.name === name);
    if (found) {
      setSelectedSymbol(found);
      setHighlightRow(name);
      setTimeout(() => setHighlightRow(null), 2000);
      addLog(`<span class="highlight-green">FOUND</span> <span class="highlight-cyan">${name}</span> at bucket <span class="highlight-green">[${idx}]</span> — type: ${found.type}, scope: ${found.scope}`);
      addToast(`Found "${name}" → ${found.type} (${found.scope})`, 'success');
    } else {
      addLog(`<span class="highlight-red">NOT FOUND</span> <span class="highlight-cyan">${name}</span> — bucket <span class="highlight-green">[${idx}]</span> searched`);
      addToast(`Symbol "${name}" not found`, 'error');
    }
    setSearchInput('');
  };

  // ===== DELETE SYMBOL =====
  const handleDelete = (name) => {
    const idx = hashSymbol(name, TABLE_SIZE);
    setBuckets((prev) => {
      const updated = prev.map((b) => [...b]);
      updated[idx] = updated[idx].filter((s) => s.name !== name);
      return updated;
    });
    if (selectedSymbol && selectedSymbol.name === name) setSelectedSymbol(null);
    addLog(`<span class="highlight-red">DELETE</span> <span class="highlight-cyan">${name}</span> from bucket <span class="highlight-green">[${idx}]</span>`);
    addToast(`Removed "${name}" from symbol table`, 'info');
  };

  // ===== LOAD SAMPLE =====
  const handleLoadSample = (sampleName) => {
    const symbols = SAMPLE_PROGRAMS[sampleName];
    const newBuckets = Array.from({ length: TABLE_SIZE }, () => []);
    symbols.forEach((sym, i) => {
      const idx = hashSymbol(sym.name, TABLE_SIZE);
      newBuckets[idx].push({ ...sym, addr: randomAddr(), bucket: idx, insertOrder: Date.now() + i });
    });
    setBuckets(newBuckets);
    setSelectedSymbol(null);
    addLog(`<span class="highlight-orange">LOADED</span> sample: <span class="highlight-cyan">${sampleName}</span> (${symbols.length} symbols)`);
    addToast(`Loaded "${sampleName}" — ${symbols.length} symbols`, 'success');
  };

  // ===== CLEAR =====
  const handleClear = () => {
    setBuckets(Array.from({ length: TABLE_SIZE }, () => []));
    setSelectedSymbol(null);
    setLogs([]);
    addToast('Symbol table cleared', 'info');
  };

  // Stats
  const totalSymbols = allSymbols.length;
  const collisions = buckets.reduce((acc, b) => acc + Math.max(0, b.length - 1), 0);
  const usedBuckets = buckets.filter((b) => b.length > 0).length;
  const loadFactor = (totalSymbols / TABLE_SIZE).toFixed(2);

  return (
    <div className="symtable-page">
      <Navbar />
      <div className="symtable-layout">
        {/* ===== LEFT: CONTROLS ===== */}
        <div className="control-panel">
          {/* Add Symbol */}
          <div className="control-section">
            <h3>➕ Add Symbol</h3>
            <div className="input-group" style={{ marginBottom: 8 }}>
              <span className="input-label">Identifier Name</span>
              <input
                className="input-field"
                placeholder="e.g. count, main, arr"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                id="sym-name-input"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div className="input-group">
                <span className="input-label">Type</span>
                <select className="select-field" value={typeInput} onChange={(e) => setTypeInput(e.target.value)} id="sym-type-select">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <span className="input-label">Scope</span>
                <select className="select-field" value={scopeInput} onChange={(e) => setScopeInput(e.target.value)} id="sym-scope-select">
                  {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div className="input-group">
                <span className="input-label">Value</span>
                <input
                  className="input-field"
                  placeholder="e.g. 42"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  id="sym-value-input"
                />
              </div>
              <div className="input-group">
                <span className="input-label">Line #</span>
                <input
                  className="input-field"
                  placeholder="e.g. 5"
                  type="number"
                  min="1"
                  value={lineInput}
                  onChange={(e) => setLineInput(e.target.value)}
                  id="sym-line-input"
                />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleInsert} id="sym-insert-btn" style={{ width: '100%' }}>
              Insert Symbol
            </button>
          </div>

          {/* Search */}
          <div className="control-section">
            <h3>🔍 Lookup Symbol</h3>
            <div className="control-row">
              <input
                className="input-field"
                placeholder="Search identifier..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                id="sym-search-input"
              />
              <button className="btn btn-primary btn-sm" onClick={handleSearch} id="sym-search-btn">
                Go
              </button>
            </div>
          </div>

          {/* Quick Load Samples */}
          <div className="control-section">
            <h3>📦 Load Sample Program</h3>
            <div className="sample-btns">
              {Object.keys(SAMPLE_PROGRAMS).map((name) => (
                <button key={name} className="sample-btn" onClick={() => handleLoadSample(name)}>
                  {name}
                </button>
              ))}
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleClear} style={{ width: '100%', marginTop: 12 }} id="sym-clear-btn">
              🗑️ Clear All
            </button>
          </div>

          {/* Hash Bucket Preview */}
          <div className="control-section">
            <h3>🗄️ Internal Hash Buckets</h3>
            <div style={{ maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {buckets.map((bucket, i) => (
                bucket.length > 0 && (
                  <div key={i} className={`bucket-mini ${bucket.length > 1 ? 'bm-collision' : ''}`}>
                    <span className="bm-idx">[{i}]</span>
                    <span className="bm-names">
                      {bucket.map((s) => s.name).join(' → ')}
                      {bucket.length > 1 && <span style={{ color: '#ff9100', marginLeft: 4 }}>⚡</span>}
                    </span>
                  </div>
                )
              ))}
              {usedBuckets === 0 && (
                <p style={{ color: '#5c6bc0', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                  No symbols yet
                </p>
              )}
            </div>
          </div>

          {/* Selected Symbol Detail */}
          {selectedSymbol && (
            <div className="sym-detail-panel">
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                📋 Symbol Details
              </h3>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Name</span>
                <span className="sym-detail-value" style={{ color: '#00e5ff' }}>{selectedSymbol.name}</span>
              </div>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Type</span>
                <span className={`type-badge ${selectedSymbol.type}`}>{selectedSymbol.type}</span>
              </div>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Scope</span>
                <span className={`scope-badge ${selectedSymbol.scope}`}>{selectedSymbol.scope}</span>
              </div>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Value</span>
                <span className="sym-detail-value" style={{ color: '#7c4dff' }}>{selectedSymbol.value}</span>
              </div>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Line</span>
                <span className="sym-detail-value">{selectedSymbol.line}</span>
              </div>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Address</span>
                <span className="sym-detail-value" style={{ color: '#9fa8da', fontSize: '0.8rem' }}>{selectedSymbol.addr}</span>
              </div>
              <div className="sym-detail-row">
                <span className="sym-detail-label">Hash Bucket</span>
                <span className="sym-detail-value" style={{ color: '#76ff03' }}>[{selectedSymbol.bucket}]</span>
              </div>
            </div>
          )}

          {/* Log */}
          <div className="control-section">
            <h3>📋 Operation Log</h3>
            <div className="log-panel" ref={logRef}>
              {logs.length === 0 ? (
                <p style={{ color: '#5c6bc0', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                  No operations yet. Add a symbol or load a sample!
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">{log.ts}</span>
                    <span className="log-msg" dangerouslySetInnerHTML={{ __html: log.msg }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT: SYMBOL TABLE ===== */}
        <div className="symtable-wrapper">
          <div className="hash-table-header">
            <h2>📑 Symbol Table</h2>
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-value">{totalSymbols}</span>
                <span className="stat-label">Symbols</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: collisions > 0 ? '#ff9100' : undefined }}>{collisions}</span>
                <span className="stat-label">Collisions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{usedBuckets}/{TABLE_SIZE}</span>
                <span className="stat-label">Buckets Used</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: loadFactor > 0.75 ? '#ff1744' : loadFactor > 0.5 ? '#ff9100' : undefined }}>{loadFactor}</span>
                <span className="stat-label">Load Factor</span>
              </div>
            </div>
          </div>

          {/* Load factor bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.75rem', color: '#9fa8da' }}>Table Occupancy</span>
              <span style={{ fontSize: '0.75rem', color: '#9fa8da' }}>{(loadFactor * 100).toFixed(0)}%</span>
            </div>
            <div className="load-factor-bar">
              <div
                className={`load-factor-fill ${loadFactor > 0.75 ? 'danger' : loadFactor > 0.5 ? 'warning' : ''}`}
                style={{ width: `${Math.min(parseFloat(loadFactor) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="symtable-scroll">
            {allSymbols.length === 0 ? (
              <div className="symtable-empty">
                <div className="empty-icon">📑</div>
                <p>
                  No symbols in the table yet.
                  <br />
                  Add a symbol manually or <strong>load a sample program</strong> to get started.
                </p>
              </div>
            ) : (
              <table className="symtable-grid">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Identifier</th>
                    <th>Type</th>
                    <th>Scope</th>
                    <th>Value</th>
                    <th>Line</th>
                    <th>Address</th>
                    <th>Bucket</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allSymbols.map((sym, i) => (
                    <tr
                      key={sym.name}
                      className={`${selectedSymbol?.name === sym.name ? 'selected' : ''} ${highlightRow === sym.name ? 'row-flash' : ''}`}
                      onClick={() => setSelectedSymbol(sym)}
                    >
                      <td style={{ color: '#5c6bc0', fontSize: '0.75rem' }}>{i + 1}</td>
                      <td className="col-name">{sym.name}</td>
                      <td><span className={`type-badge ${sym.type}`}>{sym.type}</span></td>
                      <td><span className={`scope-badge ${sym.scope}`}>{sym.scope}</span></td>
                      <td className="col-value">{sym.value}</td>
                      <td>{sym.line}</td>
                      <td className="col-addr">{sym.addr}</td>
                      <td>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.75rem',
                          color: '#7c4dff',
                          fontWeight: 600,
                        }}>
                          [{sym.bucket}]
                        </span>
                      </td>
                      <td>
                        <button
                          className="sym-row-delete"
                          onClick={(e) => { e.stopPropagation(); handleDelete(sym.name); }}
                          title={`Delete ${sym.name}`}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Complexity footer */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(124,77,255,0.1)', flexWrap: 'wrap' }}>
            <span className="complexity-badge best">Insert: O(1) avg</span>
            <span className="complexity-badge avg">Lookup: O(1) avg</span>
            <span className="complexity-badge worst">Worst: O(n)</span>
            <span style={{ fontSize: '0.75rem', color: '#5c6bc0', display: 'flex', alignItems: 'center' }}>
              Hash: DJB2 &nbsp;|&nbsp; Chaining collision resolution &nbsp;|&nbsp; {TABLE_SIZE} buckets
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ==============================
   MAIN PAGE WRAPPER
   ============================== */
export default function SymbolTablePage() {
  return (
    <ToastProvider>
      <ParticleBg />
      <SymbolTableInner />
    </ToastProvider>
  );
}

'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBg from '../components/ParticleBg';
import { ToastProvider, useToast } from '../components/Toast';

/* ==============================
   HASH FUNCTIONS
   ============================== */
function hashDJB2(key, size) {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) + key.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % size;
}

function hashSimple(key, size) {
  let total = 0;
  for (let i = 0; i < key.length; i++) {
    total += key.charCodeAt(i);
  }
  return total % size;
}

function hashFNV1a(key, size) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash) % size;
}

const HASH_FUNCTIONS = {
  simple: { name: 'Sum of ASCII % size', fn: hashSimple },
  djb2: { name: 'DJB2 Hash', fn: hashDJB2 },
  fnv1a: { name: 'FNV-1a Hash', fn: hashFNV1a },
};

const TYPES = ['int', 'float', 'double', 'char', 'string', 'bool', 'void', 'array', 'pointer', 'struct', 'func'];
const SCOPES = ['global', 'local', 'param', 'block'];

function randomAddr() {
  return '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
}

/* ==============================
   SAMPLE PROGRAMS
   ============================== */
const SAMPLE_PROGRAMS = {
  'C Variables': [
    { key: 'count', value: '0', type: 'int', scope: 'global', line: 3 },
    { key: 'PI', value: '3.14', type: 'float', scope: 'global', line: 4 },
    { key: 'name', value: "'A'", type: 'char', scope: 'global', line: 5 },
    { key: 'total', value: '0.0', type: 'double', scope: 'local', line: 8 },
    { key: 'i', value: '0', type: 'int', scope: 'local', line: 10 },
    { key: 'result', value: '42', type: 'int', scope: 'local', line: 12 },
    { key: 'flag', value: 'true', type: 'bool', scope: 'global', line: 2 },
    { key: 'temp', value: '98.6', type: 'float', scope: 'local', line: 15 },
  ],
  'Functions': [
    { key: 'main', value: 'int()', type: 'func', scope: 'global', line: 1 },
    { key: 'add', value: 'int(int,int)', type: 'func', scope: 'global', line: 20 },
    { key: 'a', value: '—', type: 'int', scope: 'param', line: 20 },
    { key: 'b', value: '—', type: 'int', scope: 'param', line: 20 },
    { key: 'sum', value: '—', type: 'int', scope: 'local', line: 22 },
    { key: 'print', value: 'void(char*)', type: 'func', scope: 'global', line: 30 },
    { key: 'msg', value: '—', type: 'pointer', scope: 'param', line: 30 },
    { key: 'len', value: '0', type: 'int', scope: 'local', line: 32 },
  ],
  'Data Structures': [
    { key: 'arr', value: 'int[100]', type: 'array', scope: 'global', line: 5 },
    { key: 'size', value: '100', type: 'int', scope: 'global', line: 6 },
    { key: 'node', value: '{int,ptr}', type: 'struct', scope: 'global', line: 10 },
    { key: 'head', value: 'NULL', type: 'pointer', scope: 'global', line: 12 },
    { key: 'tail', value: 'NULL', type: 'pointer', scope: 'global', line: 13 },
    { key: 'matrix', value: 'int[3][3]', type: 'array', scope: 'local', line: 18 },
    { key: 'rows', value: '3', type: 'int', scope: 'local', line: 19 },
    { key: 'cols', value: '3', type: 'int', scope: 'local', line: 20 },
  ],
};

/* ==============================
   VISUALIZER INNER
   ============================== */
function VisualizerInner() {
  const addToast = useToast();
  const [tableSize, setTableSize] = useState(8);
  const [hashFn, setHashFn] = useState('simple');
  const [buckets, setBuckets] = useState(() => Array.from({ length: 8 }, () => []));
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [typeInput, setTypeInput] = useState('int');
  const [scopeInput, setScopeInput] = useState('global');
  const [lineInput, setLineInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [logs, setLogs] = useState([]);
  const [highlightBucket, setHighlightBucket] = useState(null);
  const [foundEntry, setFoundEntry] = useState(null);
  const [lastHash, setLastHash] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [collisionCount, setCollisionCount] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [highlightRow, setHighlightRow] = useState(null);
  const [activeView, setActiveView] = useState('both'); // 'buckets', 'table', 'both'
  const logRef = useRef(null);

  const addLog = useCallback((msg) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs((prev) => [{ ts, msg, id: Date.now() + Math.random() }, ...prev].slice(0, 50));
  }, []);

  // Flat list of all symbols for the table
  const allSymbols = [];
  buckets.forEach((bucket) => bucket.forEach((entry) => allSymbols.push(entry)));
  allSymbols.sort((a, b) => (a.insertOrder || 0) - (b.insertOrder || 0));

  useEffect(() => {
    let entries = 0;
    let collisions = 0;
    buckets.forEach((bucket) => {
      entries += bucket.length;
      if (bucket.length > 1) collisions += bucket.length - 1;
    });
    setTotalEntries(entries);
    setCollisionCount(collisions);
  }, [buckets]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs]);

  const computeHash = useCallback(
    (key) => HASH_FUNCTIONS[hashFn].fn(key, tableSize),
    [hashFn, tableSize]
  );

  // ===== INSERT =====
  const handleInsert = () => {
    const key = keyInput.trim();
    const value = valueInput.trim();
    if (!key) { addToast('Key / identifier cannot be empty', 'error'); return; }
    if (!value) { addToast('Value cannot be empty', 'error'); return; }

    const index = computeHash(key);
    const addr = randomAddr();
    const line = parseInt(lineInput, 10) || 1;
    setLastHash({ key, index, fn: hashFn });

    setBuckets((prev) => {
      const updated = prev.map((b) => [...b]);
      const existing = updated[index].findIndex((e) => e.key === key);
      if (existing >= 0) {
        updated[index][existing] = {
          ...updated[index][existing],
          key, value, type: typeInput, scope: scopeInput, line,
        };
        addLog(`<span class="highlight-orange">UPDATE</span> "<span class="highlight-cyan">${key}</span>" → "<span class="highlight-purple">${value}</span>" at bucket <span class="highlight-green">[${index}]</span>`);
        addToast(`Updated "${key}" in bucket [${index}]`, 'info');
      } else {
        const isCollision = updated[index].length > 0;
        updated[index].push({
          key, value, type: typeInput, scope: scopeInput, line,
          addr, bucket: index, insertOrder: Date.now(),
        });
        if (isCollision) {
          addLog(`<span class="highlight-red">COLLISION</span> at bucket <span class="highlight-green">[${index}]</span>! Chaining "<span class="highlight-cyan">${key}</span>" (${typeInput})`);
          addToast(`Collision at bucket [${index}]! Entry chained.`, 'warning');
        } else {
          addLog(`<span class="highlight-green">INSERT</span> "<span class="highlight-cyan">${key}</span>" → "<span class="highlight-purple">${value}</span>" at bucket <span class="highlight-green">[${index}]</span> addr:<span class="highlight-purple">${addr}</span>`);
          addToast(`Inserted "${key}" into bucket [${index}]`, 'success');
        }
      }
      return updated;
    });

    setHighlightBucket(index);
    setHighlightRow(key);
    setTimeout(() => { setHighlightBucket(null); setHighlightRow(null); }, 1500);
    setKeyInput('');
    setValueInput('');
    setLineInput('');
  };

  // ===== SEARCH =====
  const handleSearch = () => {
    const key = searchInput.trim();
    if (!key) { addToast('Enter a key to search', 'error'); return; }

    const index = computeHash(key);
    setLastHash({ key, index, fn: hashFn });
    setHighlightBucket(index);

    const entry = buckets[index].find((e) => e.key === key);
    if (entry) {
      setFoundEntry({ bucket: index, key: entry.key });
      setSelectedSymbol(entry);
      setHighlightRow(key);
      addLog(`<span class="highlight-green">FOUND</span> "<span class="highlight-cyan">${key}</span>" → "<span class="highlight-purple">${entry.value}</span>" at bucket <span class="highlight-green">[${index}]</span>`);
      addToast(`Found "${key}" = "${entry.value}" in bucket [${index}]`, 'success');
      setTimeout(() => { setFoundEntry(null); setHighlightRow(null); }, 2000);
    } else {
      addLog(`<span class="highlight-red">NOT FOUND</span> "<span class="highlight-cyan">${key}</span>" — bucket <span class="highlight-green">[${index}]</span> searched`);
      addToast(`"${key}" not found in the table`, 'error');
    }

    setTimeout(() => setHighlightBucket(null), 1500);
    setSearchInput('');
  };

  // ===== DELETE =====
  const handleDelete = (bucketIndex, key) => {
    setBuckets((prev) => {
      const updated = prev.map((b) => [...b]);
      updated[bucketIndex] = updated[bucketIndex].filter((e) => e.key !== key);
      return updated;
    });
    if (selectedSymbol && selectedSymbol.key === key) setSelectedSymbol(null);
    addLog(`<span class="highlight-red">DELETE</span> "<span class="highlight-cyan">${key}</span>" from bucket <span class="highlight-green">[${bucketIndex}]</span>`);
    addToast(`Deleted "${key}" from bucket [${bucketIndex}]`, 'info');
  };

  // ===== CLEAR =====
  const handleClear = () => {
    setBuckets(Array.from({ length: tableSize }, () => []));
    setLogs([]);
    setLastHash(null);
    setFoundEntry(null);
    setHighlightBucket(null);
    setSelectedSymbol(null);
    addToast('Hash table cleared', 'info');
  };

  // ===== RESIZE =====
  const handleResize = (newSize) => {
    const size = parseInt(newSize, 10);
    if (size < 2 || size > 32) return;
    setTableSize(size);
    const allEntries = [];
    buckets.forEach((b) => b.forEach((e) => allEntries.push(e)));
    const newBuckets = Array.from({ length: size }, () => []);
    allEntries.forEach((entry) => {
      const idx = HASH_FUNCTIONS[hashFn].fn(entry.key, size);
      newBuckets[idx].push({ ...entry, bucket: idx });
    });
    setBuckets(newBuckets);
    addLog(`<span class="highlight-orange">RESIZE</span> table to <span class="highlight-cyan">${size}</span> buckets — all entries rehashed`);
    addToast(`Table resized to ${size} buckets`, 'info');
  };

  // ===== LOAD SAMPLE =====
  const handleLoadSample = (sampleName) => {
    const symbols = SAMPLE_PROGRAMS[sampleName];
    const newBuckets = Array.from({ length: tableSize }, () => []);
    symbols.forEach((sym, i) => {
      const idx = HASH_FUNCTIONS[hashFn].fn(sym.key, tableSize);
      newBuckets[idx].push({
        ...sym, addr: randomAddr(), bucket: idx, insertOrder: Date.now() + i,
      });
    });
    setBuckets(newBuckets);
    setSelectedSymbol(null);
    addLog(`<span class="highlight-orange">LOADED</span> sample: <span class="highlight-cyan">${sampleName}</span> (${symbols.length} symbols)`);
    addToast(`Loaded "${sampleName}" — ${symbols.length} symbols`, 'success');
  };

  // ===== RANDOM INSERT =====
  const handleRandomInsert = () => {
    const sampleKeys = ['count', 'PI', 'total', 'flag', 'temp', 'arr', 'size', 'head',
      'main', 'add', 'sum', 'print', 'len', 'node', 'tail', 'matrix',
      'x', 'y', 'z', 'max', 'min', 'avg', 'ptr', 'buf', 'idx', 'val'];
    const sampleValues = ['0', '3.14', '42', 'true', '98.6', 'NULL', '100', '256',
      'int()', 'void()', '{data}', '0.0', "'A'", '1024', '—', 'false'];
    const key = sampleKeys[Math.floor(Math.random() * sampleKeys.length)];
    const value = sampleValues[Math.floor(Math.random() * sampleValues.length)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const scope = SCOPES[Math.floor(Math.random() * SCOPES.length)];
    const line = Math.floor(Math.random() * 50) + 1;

    setKeyInput(key);
    setValueInput(value);
    setTypeInput(type);
    setScopeInput(scope);
    setLineInput(String(line));

    setTimeout(() => {
      const index = HASH_FUNCTIONS[hashFn].fn(key, tableSize);
      const addr = randomAddr();
      setLastHash({ key, index, fn: hashFn });
      setBuckets((prev) => {
        const updated = prev.map((b) => [...b]);
        const existing = updated[index].findIndex((e) => e.key === key);
        if (existing >= 0) {
          updated[index][existing] = { ...updated[index][existing], key, value, type, scope, line };
          addLog(`<span class="highlight-orange">UPDATE</span> "<span class="highlight-cyan">${key}</span>" at bucket <span class="highlight-green">[${index}]</span>`);
        } else {
          const isCollision = updated[index].length > 0;
          updated[index].push({ key, value, type, scope, line, addr, bucket: index, insertOrder: Date.now() });
          if (isCollision) {
            addLog(`<span class="highlight-red">COLLISION</span> at [<span class="highlight-green">${index}</span>]! Chaining "<span class="highlight-cyan">${key}</span>"`);
            addToast(`Collision at bucket [${index}]!`, 'warning');
          } else {
            addLog(`<span class="highlight-green">INSERT</span> "<span class="highlight-cyan">${key}</span>" → "<span class="highlight-purple">${value}</span>" at [<span class="highlight-green">${index}</span>]`);
            addToast(`Inserted "${key}" = "${value}"`, 'success');
          }
        }
        return updated;
      });
      setHighlightBucket(index);
      setHighlightRow(key);
      setTimeout(() => { setHighlightBucket(null); setHighlightRow(null); }, 1500);
      setKeyInput('');
      setValueInput('');
      setLineInput('');
    }, 200);
  };

  const loadFactor = tableSize > 0 ? (totalEntries / tableSize).toFixed(2) : 0;
  const loadClass = loadFactor > 0.75 ? 'danger' : loadFactor > 0.5 ? 'warning' : '';
  const usedBuckets = buckets.filter((b) => b.length > 0).length;

  return (
    <div className="visualizer-page">
      <Navbar />
      <div className="visualizer-layout">
        {/* ===== LEFT PANEL: CONTROLS ===== */}
        <div className="control-panel">
          {/* Insert */}
          <div className="control-section">
            <h3>➕ Insert Symbol</h3>
            <div className="input-group" style={{ marginBottom: 8 }}>
              <span className="input-label">Identifier</span>
              <input
                className="input-field"
                placeholder="e.g. count, main, arr"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                id="insert-key-input"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 8 }}>
              <span className="input-label">Value</span>
              <input
                className="input-field"
                placeholder="e.g. 42, 3.14, NULL"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                id="insert-value-input"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div className="input-group">
                <span className="input-label">Type</span>
                <select className="select-field" value={typeInput} onChange={(e) => setTypeInput(e.target.value)} id="type-select">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <span className="input-label">Scope</span>
                <select className="select-field" value={scopeInput} onChange={(e) => setScopeInput(e.target.value)} id="scope-select">
                  {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <span className="input-label">Line #</span>
              <input
                className="input-field"
                placeholder="e.g. 5"
                type="number"
                min="1"
                value={lineInput}
                onChange={(e) => setLineInput(e.target.value)}
                id="line-input"
              />
            </div>
            <div className="control-row">
              <button className="btn btn-primary btn-sm" onClick={handleInsert} id="insert-btn" style={{ flex: 1 }}>
                Insert
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleRandomInsert} id="random-btn" style={{ flex: 1 }}>
                🎲 Random
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="control-section">
            <h3>🔍 Lookup</h3>
            <div className="control-row">
              <input
                className="input-field"
                placeholder="Search identifier..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                id="search-key-input"
              />
              <button className="btn btn-primary btn-sm" onClick={handleSearch} id="search-btn">
                Go
              </button>
            </div>
          </div>

          {/* Load Samples */}
          <div className="control-section">
            <h3>📦 Load Sample</h3>
            <div className="sample-btns">
              {Object.keys(SAMPLE_PROGRAMS).map((name) => (
                <button key={name} className="sample-btn" onClick={() => handleLoadSample(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="control-section">
            <h3>⚙️ Settings</h3>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <span className="input-label">Hash Function</span>
              <select
                className="select-field"
                value={hashFn}
                onChange={(e) => {
                  setHashFn(e.target.value);
                  const allEntries = [];
                  buckets.forEach((b) => b.forEach((entry) => allEntries.push(entry)));
                  const newBuckets = Array.from({ length: tableSize }, () => []);
                  allEntries.forEach((entry) => {
                    const idx = HASH_FUNCTIONS[e.target.value].fn(entry.key, tableSize);
                    newBuckets[idx].push({ ...entry, bucket: idx });
                  });
                  setBuckets(newBuckets);
                  addLog(`Switched to <span class="highlight-cyan">${HASH_FUNCTIONS[e.target.value].name}</span> — rehashed all entries`);
                }}
                id="hash-fn-select"
              >
                {Object.entries(HASH_FUNCTIONS).map(([id, hf]) => (
                  <option key={id} value={id}>{hf.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <span className="input-label">Table Size: {tableSize}</span>
              <div className="slider-container">
                <input type="range" min="2" max="32" value={tableSize} onChange={(e) => handleResize(e.target.value)} id="table-size-slider" />
                <span className="slider-value">{tableSize}</span>
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleClear} id="clear-btn" style={{ width: '100%' }}>
              🗑️ Clear Table
            </button>
          </div>

          {/* Hash Formula */}
          {lastHash && (
            <div className="control-section">
              <h3>🧮 Last Hash</h3>
              <div className="hash-formula">
                hash(&quot;<span className="formula-key">{lastHash.key}</span>&quot;) % {tableSize} = <span className="formula-result">{lastHash.index}</span>
              </div>
            </div>
          )}

          {/* Selected Symbol Detail */}
          {selectedSymbol && (
            <div className="sym-detail-panel">
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                📋 Symbol Details
              </h3>
              <div className="sym-detail-row"><span className="sym-detail-label">Name</span><span className="sym-detail-value" style={{ color: '#00e5ff' }}>{selectedSymbol.key}</span></div>
              <div className="sym-detail-row"><span className="sym-detail-label">Type</span><span className={`type-badge ${selectedSymbol.type}`}>{selectedSymbol.type}</span></div>
              <div className="sym-detail-row"><span className="sym-detail-label">Scope</span><span className={`scope-badge ${selectedSymbol.scope}`}>{selectedSymbol.scope}</span></div>
              <div className="sym-detail-row"><span className="sym-detail-label">Value</span><span className="sym-detail-value" style={{ color: '#7c4dff' }}>{selectedSymbol.value}</span></div>
              <div className="sym-detail-row"><span className="sym-detail-label">Line</span><span className="sym-detail-value">{selectedSymbol.line}</span></div>
              <div className="sym-detail-row"><span className="sym-detail-label">Address</span><span className="sym-detail-value" style={{ color: '#9fa8da', fontSize: '0.8rem' }}>{selectedSymbol.addr}</span></div>
              <div className="sym-detail-row"><span className="sym-detail-label">Bucket</span><span className="sym-detail-value" style={{ color: '#76ff03' }}>[{selectedSymbol.bucket}]</span></div>
            </div>
          )}

          {/* Log */}
          <div className="control-section">
            <h3>📋 Operation Log</h3>
            <div className="log-panel" ref={logRef}>
              {logs.length === 0 ? (
                <p style={{ color: '#5c6bc0', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                  No operations yet. Insert a symbol!
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

        {/* ===== RIGHT PANEL ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

          {/* View Toggle Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'both', label: '📊 Both Views' },
              { id: 'buckets', label: '🗄️ Hash Buckets' },
              { id: 'table', label: '📑 Symbol Table' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm ${activeView === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveView(tab.id)}
                style={{ fontSize: '0.8rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* STATS BAR (shared) */}
          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div className="stats-bar" style={{ justifyContent: 'space-between' }}>
              <div className="stat-item">
                <span className="stat-value">{totalEntries}</span>
                <span className="stat-label">Symbols</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: collisionCount > 0 ? '#ff9100' : undefined }}>{collisionCount}</span>
                <span className="stat-label">Collisions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{usedBuckets}/{tableSize}</span>
                <span className="stat-label">Buckets Used</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: loadFactor > 0.75 ? '#ff1744' : loadFactor > 0.5 ? '#ff9100' : undefined }}>{loadFactor}</span>
                <span className="stat-label">Load Factor</span>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', color: '#9fa8da' }}>Load Factor</span>
                <span style={{ fontSize: '0.7rem', color: '#9fa8da' }}>{(loadFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="load-factor-bar">
                <div className={`load-factor-fill ${loadClass}`} style={{ width: `${Math.min(parseFloat(loadFactor) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* ===== HASH TABLE BUCKETS VIEW ===== */}
          {(activeView === 'buckets' || activeView === 'both') && (
            <div className="hash-table-container">
              <div className="hash-table-header">
                <h2>🗄️ Hash Table Buckets</h2>
              </div>
              <div className="hash-table-grid">
                {buckets.map((bucket, i) => (
                  <div key={i} className="bucket-row">
                    <div className="bucket-index">{i}</div>
                    <div className={`bucket-content ${bucket.length === 0 ? 'empty' : ''} ${highlightBucket === i ? 'highlight' : ''} ${bucket.length > 1 ? 'collision' : ''}`}>
                      {bucket.length === 0 ? (
                        <span>empty</span>
                      ) : (
                        bucket.map((entry, j) => (
                          <span key={entry.key} style={{ display: 'contents' }}>
                            {j > 0 && <span className="chain-arrow">→</span>}
                            <span
                              className={`bucket-entry ${foundEntry && foundEntry.bucket === i && foundEntry.key === entry.key ? 'found' : ''}`}
                              onClick={() => setSelectedSymbol(entry)}
                              style={{ cursor: 'pointer' }}
                            >
                              <span className="entry-key">{entry.key}</span>
                              <span className="entry-sep">:</span>
                              <span className="entry-val">{entry.value}</span>
                              <span className={`type-badge ${entry.type}`} style={{ marginLeft: 4, fontSize: '0.6rem', padding: '1px 6px' }}>{entry.type}</span>
                              <span className="entry-delete" onClick={(e) => { e.stopPropagation(); handleDelete(i, entry.key); }} title={`Delete ${entry.key}`}>✕</span>
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SYMBOL TABLE VIEW ===== */}
          {(activeView === 'table' || activeView === 'both') && (
            <div className="symtable-wrapper">
              <div className="hash-table-header">
                <h2>📑 Symbol Table</h2>
              </div>
              <div className="symtable-scroll">
                {allSymbols.length === 0 ? (
                  <div className="symtable-empty">
                    <div className="empty-icon">📑</div>
                    <p>No symbols yet. Insert one or load a sample program!</p>
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
                          key={sym.key}
                          className={`${selectedSymbol?.key === sym.key ? 'selected' : ''} ${highlightRow === sym.key ? 'row-flash' : ''}`}
                          onClick={() => setSelectedSymbol(sym)}
                        >
                          <td style={{ color: '#5c6bc0', fontSize: '0.75rem' }}>{i + 1}</td>
                          <td className="col-name">{sym.key}</td>
                          <td><span className={`type-badge ${sym.type}`}>{sym.type}</span></td>
                          <td><span className={`scope-badge ${sym.scope}`}>{sym.scope}</span></td>
                          <td className="col-value">{sym.value}</td>
                          <td>{sym.line}</td>
                          <td className="col-addr">{sym.addr}</td>
                          <td>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#7c4dff', fontWeight: 600 }}>
                              [{sym.bucket}]
                            </span>
                          </td>
                          <td>
                            <button className="sym-row-delete" onClick={(e) => { e.stopPropagation(); handleDelete(sym.bucket, sym.key); }} title={`Delete ${sym.key}`}>
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Complexity badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span className="complexity-badge best">Insert: O(1) avg</span>
            <span className="complexity-badge avg">Lookup: O(1) avg</span>
            <span className="complexity-badge worst">Worst: O(n)</span>
            <span style={{ fontSize: '0.72rem', color: '#5c6bc0', display: 'flex', alignItems: 'center' }}>
              {HASH_FUNCTIONS[hashFn].name} &nbsp;|&nbsp; Chaining &nbsp;|&nbsp; {tableSize} buckets
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
export default function VisualizerPage() {
  return (
    <ToastProvider>
      <ParticleBg />
      <VisualizerInner />
    </ToastProvider>
  );
}

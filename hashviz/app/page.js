'use client';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBg from './components/ParticleBg';
import { ToastProvider } from './components/Toast';

export default function Home() {
  return (
    <ToastProvider>
      <ParticleBg />
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img src="/hero-bg.png" alt="Abstract data background" />
        </div>
        <div className="hero-content fade-in-up">
          <div className="hero-badge">
            <span className="dot" />
            Now in public beta
          </div>
          <h1>
            Master <span className="gradient-text">Hash Tables</span>
            <br />
            Interactively
          </h1>
          <p>
            The most beautiful and intuitive way to learn, visualize, and understand
            hash tables. Watch hashing algorithms work step by step with
            real-time animations and deep insights.
          </p>
          <div className="hero-actions">
            <Link href="/visualizer" className="btn btn-primary btn-lg">
              🚀 Launch Visualizer
            </Link>
            <Link href="/pricing" className="btn btn-secondary btn-lg">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="section" id="features">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2>
            Everything You Need to <span className="gradient-text">Learn Hashing</span>
          </h2>
          <p>
            From basic concepts to advanced collision resolution — we have you
            covered with real-time visualizations.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card fade-in-up fade-in-delay-1">
            <div className="feature-icon cyan">⚡</div>
            <h3>Real-Time Hashing</h3>
            <p>
              Watch each key get hashed in real-time. See the ASCII computation,
              modular arithmetic, and final bucket index — all animated step by
              step.
            </p>
          </div>

          <div className="feature-card fade-in-up fade-in-delay-2">
            <div className="feature-icon purple">🔗</div>
            <h3>Collision Resolution</h3>
            <p>
              Explore chaining (linked lists) collision handling. See how
              multiple keys map to the same bucket with visual chain links.
            </p>
          </div>

          <div className="feature-card fade-in-up fade-in-delay-3">
            <div className="feature-icon pink">📊</div>
            <h3>Live Statistics</h3>
            <p>
              Monitor load factor, collision count, and table utilization in
              real-time. Understand when its time to resize with visual
              indicators.
            </p>
          </div>

          <div className="feature-card fade-in-up fade-in-delay-1">
            <div className="feature-icon orange">🔍</div>
            <h3>Search & Delete</h3>
            <p>
              Perform lookup and delete operations with animated feedback.
              Found entries glow green, missing entries trigger clear warnings.
            </p>
          </div>

          <div className="feature-card fade-in-up fade-in-delay-2">
            <div className="feature-icon green">📝</div>
            <h3>Operation Log</h3>
            <p>
              Every operation is recorded in a detailed, color-coded log. Trace
              back through inserts, deletes, searches, and collisions with
              timestamps.
            </p>
          </div>

          <div className="feature-card fade-in-up fade-in-delay-3">
            <div className="feature-icon yellow">⚙️</div>
            <h3>Configurable Table</h3>
            <p>
              Adjust the table size from 4 to 32 buckets. Choose between
              different hash functions and watch how they affect distribution.
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section" id="how-it-works">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2>
            Simple. <span className="gradient-text">Powerful.</span> Interactive.
          </h2>
          <p>
            Three simple steps to mastering hash tables forever.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-item fade-in-up">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Enter a Key-Value Pair</h3>
              <p>
                Type any key (like a name or number) and its associated value into
                the input fields. Our hash function instantly computes the bucket
                index.
              </p>
            </div>
          </div>

          <div className="step-item fade-in-up fade-in-delay-1">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Watch the Magic Happen</h3>
              <p>
                See the hash computation in real-time, watch the entry animate
                into its bucket slot, and observe collision handling if another
                key maps to the same index.
              </p>
            </div>
          </div>

          <div className="step-item fade-in-up fade-in-delay-2">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Explore & Experiment</h3>
              <p>
                Search for keys, delete entries, resize the table, and monitor
                live statistics. Build an intuitive understanding of why hash
                tables are O(1) average case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPLEXITY OVERVIEW ===== */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Performance</span>
          <h2>
            Why Hash Tables Are <span className="gradient-text">Blazing Fast</span>
          </h2>
          <p>
            Understand the time complexities that make hash tables the backbone of
            modern computing.
          </p>
        </div>

        <div className="features-grid" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 16, color: '#e8eaf6' }}>Insert</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="complexity-badge avg">Avg: O(1)</span>
              <span className="complexity-badge worst">Worst: O(n)</span>
            </div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 16, color: '#e8eaf6' }}>Search</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="complexity-badge avg">Avg: O(1)</span>
              <span className="complexity-badge worst">Worst: O(n)</span>
            </div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 16, color: '#e8eaf6' }}>Delete</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="complexity-badge avg">Avg: O(1)</span>
              <span className="complexity-badge worst">Worst: O(n)</span>
            </div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 16, color: '#e8eaf6' }}>Space</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="complexity-badge best">O(n)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: 700, margin: '0 auto', padding: '48px 32px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 16,
          }}>
            Ready to <span className="gradient-text">Visualize</span>?
          </h2>
          <p style={{ color: '#9fa8da', fontSize: '1.05rem', marginBottom: 24, lineHeight: 1.7 }}>
            Jump into the interactive hash table visualizer now.
            No sign-up required for the free tier.
          </p>
          <Link href="/visualizer" className="btn btn-primary btn-lg">
            🚀 Launch Visualizer — It&apos;s Free
          </Link>
        </div>
      </section>

      <Footer />
    </ToastProvider>
  );
}

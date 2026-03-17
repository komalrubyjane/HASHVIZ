'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBg from '../components/ParticleBg';
import { ToastProvider } from '../components/Toast';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <ToastProvider>
      <ParticleBg />
      <Navbar />

      <section className="section about-hero">
        <div className="hero-badge" style={{ marginBottom: 24 }}>
          <span className="dot" /> Our Mission
        </div>
        <h1>
          Making Data Structures
          <br />
          <span className="gradient-text">Beautiful & Accessible</span>
        </h1>
        <p>
          HashViz was born from a simple belief: understanding data structures
          shouldn&apos;t require staring at walls of text. We build interactive
          visualizations that make learning intuitive, memorable, and genuinely
          enjoyable.
        </p>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="about-grid">
          <div className="about-card fade-in-up">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎓</div>
            <h3>Built for Education</h3>
            <p>
              Designed in collaboration with CS educators from top universities.
              HashViz integrates seamlessly with lecture materials, homework
              assignments, and coding interviews preparation.
            </p>
          </div>

          <div className="about-card fade-in-up fade-in-delay-1">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚡</div>
            <h3>Real-Time Visualization</h3>
            <p>
              Every operation is animated in real-time. Watch hash computation,
              collision resolution, and table restructuring happen before your
              eyes with smooth, informative animations.
            </p>
          </div>

          <div className="about-card fade-in-up fade-in-delay-2">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔬</div>
            <h3>Deep Insights</h3>
            <p>
              Go beyond surface-level understanding. Monitor load factors,
              collision rates, chain lengths, and distribution quality.
              Understand WHY some hash functions perform better than others.
            </p>
          </div>

          <div className="about-card fade-in-up fade-in-delay-3">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌍</div>
            <h3>Open & Accessible</h3>
            <p>
              Free to use for individual learners. Affordable for institutions.
              Works on any device with a modern browser. No installation
              required — just open and start exploring.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-tag">Our Story</span>
          <h2>
            Why We Built <span className="gradient-text">HashViz</span>
          </h2>
        </div>
        <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#9fa8da', marginBottom: 20 }}>
            As computer science students, we struggled with abstract data structure
            concepts. Textbooks showed static diagrams. Videos were passive.
            Nothing let us <strong style={{ color: '#e8eaf6' }}>interact</strong> with
            the data structures we were trying to learn.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#9fa8da', marginBottom: 20 }}>
            We built HashViz to solve this problem. What started as a classroom
            project has grown into a platform used by students and educators
            worldwide. Our mission is to make every data structure
            <strong style={{ color: '#00e5ff' }}> visually intuitive</strong>.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#9fa8da' }}>
            Today, HashViz supports hash tables with multiple collision resolution
            strategies, configurable hash functions, and real-time performance
            analytics. And we&apos;re just getting started — trees, graphs, and
            sorting algorithms are coming next.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Technology</span>
          <h2>
            Built with Modern <span className="gradient-text">Tech</span>
          </h2>
        </div>
        <div className="features-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '⚛️', name: 'Next.js 14', desc: 'React framework with App Router for blazing-fast performance' },
            { icon: '🎨', name: 'Vanilla CSS', desc: 'Hand-crafted glassmorphism design with zero library bloat' },
            { icon: '▲', name: 'Vercel', desc: 'Global edge deployment with instant rollbacks and previews' },
            { icon: '📐', name: 'Canvas API', desc: 'Hardware-accelerated particle animations for the background' },
            { icon: '🔤', name: 'JetBrains Mono', desc: 'Monospace font optimized for code and data visualization' },
            { icon: '📱', name: 'Responsive', desc: 'Fully adaptive layout from mobile to ultrawide displays' },
          ].map((tech, i) => (
            <div key={i} className="feature-card fade-in-up" style={{ ['--delay']: `${i * 0.1}s` }}>
              <div className="feature-icon cyan">{tech.icon}</div>
              <h3>{tech.name}</h3>
              <p>{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: 650, margin: '0 auto', padding: '48px 32px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 800,
            marginBottom: 16,
          }}>
            Ready to <span className="gradient-text">Explore</span>?
          </h2>
          <p style={{ color: '#9fa8da', fontSize: '1rem', marginBottom: 24 }}>
            Dive into the interactive hash table visualizer and see data structures
            come to life.
          </p>
          <Link href="/visualizer" className="btn btn-primary btn-lg">
            🚀 Try HashViz Free
          </Link>
        </div>
      </section>

      <Footer />
    </ToastProvider>
  );
}

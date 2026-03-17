import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>⚡ HashViz</h3>
          <p>
            The most intuitive way to learn and visualize hash tables.
            Built for students, educators, and developers who want to master
            data structures through interactive exploration.
          </p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <Link href="/visualizer">Visualizer</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <a href="#" onClick={e => e.preventDefault()}>Documentation</a>
          <a href="#" onClick={e => e.preventDefault()}>API Reference</a>
          <a href="#" onClick={e => e.preventDefault()}>Blog</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#" onClick={e => e.preventDefault()}>Careers</a>
          <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 HashViz. All rights reserved.</span>
        <div className="footer-social">
          <a href="#" title="GitHub" onClick={e => e.preventDefault()}>⌂</a>
          <a href="#" title="Twitter" onClick={e => e.preventDefault()}>𝕏</a>
          <a href="#" title="LinkedIn" onClick={e => e.preventDefault()}>in</a>
        </div>
      </div>
    </footer>
  );
}

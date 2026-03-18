'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBg from '../components/ParticleBg';
import { ToastProvider, useToast } from '../components/Toast';

function PricingInner() {
  const addToast = useToast();

  const handleSelect = (tier) => {
    addToast(`${tier} plan selected! Redirecting to checkout...`, 'success');
  };

  return (
    <>
      <Navbar />
      <section className="section" style={{ paddingTop: 120, minHeight: '100vh' }}>
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2>
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p>
            Start free. Upgrade when you need more power. Built for students,
            educators, and engineering teams.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Free Tier */}
          <div className="pricing-card fade-in-up">
            <div className="pricing-tier">Starter</div>
            <div className="pricing-price">
              <span className="currency">$</span>0
              <span className="period">/forever</span>
            </div>
            <p className="pricing-desc">
              Perfect for individual learners and quick experiments.
            </p>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Basic Hash Table Visualizer</li>
              <li><span className="check">✓</span> 3 Hash Functions</li>
              <li><span className="check">✓</span> Up to 16 Buckets</li>
              <li><span className="check">✓</span> Operation Log</li>
              <li><span className="check">✓</span> Real-time Stats</li>
            </ul>
            <Link href="/visualizer" className="btn btn-secondary" style={{ width: '100%' }}>
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="pricing-card featured fade-in-up fade-in-delay-1">
            <div className="pricing-tier">Professional</div>
            <div className="pricing-price">
              <span className="currency">$</span>19
              <span className="period">/month</span>
            </div>
            <p className="pricing-desc">
              For educators, tutors, and computer science departments.
            </p>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Starter</li>
              <li><span className="check">✓</span> Open Addressing (Linear/Quadratic)</li>
              <li><span className="check">✓</span> Up to 128 Buckets</li>
              <li><span className="check">✓</span> Export as PNG / GIF</li>
              <li><span className="check">✓</span> Step-by-Step Mode</li>
              <li><span className="check">✓</span> Custom Hash Functions</li>
              <li><span className="check">✓</span> Embeddable Widget</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleSelect('Professional')}>
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="pricing-card fade-in-up fade-in-delay-2">
            <div className="pricing-tier">Enterprise</div>
            <div className="pricing-price">
              <span className="currency">$</span>99
              <span className="period">/month</span>
            </div>
            <p className="pricing-desc">
              For universities, bootcamps, and engineering teams.
            </p>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Professional</li>
              <li><span className="check">✓</span> API Access</li>
              <li><span className="check">✓</span> Up to 1024 Buckets</li>
              <li><span className="check">✓</span> Team Collaboration</li>
              <li><span className="check">✓</span> LMS Integration (Canvas, Moodle)</li>
              <li><span className="check">✓</span> White-Label Branding</li>
              <li><span className="check">✓</span> Priority Support</li>
              <li><span className="check">✓</span> SSO & Admin Dashboard</li>
            </ul>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleSelect('Enterprise')}>
              Contact Sales
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 700, margin: '64px auto 0', textAlign: 'center' }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: 32,
            color: '#e8eaf6',
          }}>
            Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                q: 'Can I use HashViz completely free?',
                a: 'Absolutely! The Starter tier is free forever with no credit card required. You get full access to the core hash table visualizer.',
              },
              {
                q: 'What collision resolution methods are supported?',
                a: 'The free tier supports Chaining (Separate Chaining with linked lists). Pro and Enterprise add Linear Probing, Quadratic Probing, and Double Hashing.',
              },
              {
                q: 'Can I embed HashViz in my course materials?',
                a: 'Yes! Pro and Enterprise plans include an embeddable widget with a simple iframe code. Enterprise also supports full white-label branding.',
              },
              {
                q: 'Do you offer educational discounts?',
                a: 'Yes! Contact us for special pricing for universities, bootcamps, and non-profit educational institutions. We typically offer 40-60% off.',
              },
            ].map((faq, i) => (
              <div key={i} className="glass-card" style={{ textAlign: 'left', padding: '20px 24px' }}>
                <h4 style={{ color: '#e8eaf6', fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{faq.q}</h4>
                <p style={{ color: '#9fa8da', fontSize: '0.9rem', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default function PricingPage() {
  return (
    <ToastProvider>
      <ParticleBg />
      <PricingInner />
    </ToastProvider>
  );
}

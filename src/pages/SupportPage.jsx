import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, ShieldQuestion } from 'lucide-react';

export default function SupportPage() {
  return (
    <section className="info-page">
      <Link to="/" className="btn-link">
        <ArrowLeft size={18} /> Back home
      </Link>

      <div className="info-hero">
        <p className="eyebrow">Support center</p>
        <h1>Contact CartoonStream support</h1>
        <p>Get help with uploads, playback, categories, admin access, or missing episodes.</p>
      </div>

      <div className="support-grid">
        <article className="card support-card">
          <Mail size={24} />
          <h2>Email support</h2>
          <p>Send a support request to the CartoonStream admin inbox.</p>
          <a className="button" href="mailto:cartoonstrm@gmail.com?subject=CartoonStream%20Support">
            Contact support
          </a>
        </article>

        <article className="card support-card">
          <MessageSquare size={24} />
          <h2>Send feedback</h2>
          <p>Share feature ideas, design notes, or bugs you noticed while watching.</p>
          <Link className="btn-secondary" to="/feedback">
            Open feedback page
          </Link>
        </article>

        <article className="card support-card">
          <ShieldQuestion size={24} />
          <h2>Quick checks</h2>
          <p>For upload problems, confirm you are signed in, Supabase is connected, and the storage bucket is available.</p>
        </article>
      </div>
    </section>
  );
}

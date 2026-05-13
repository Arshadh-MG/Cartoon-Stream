import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <div className="section-header">
        <div>
          <h1 className="page-title">Page not found</h1>
          <p className="section-subtitle">The page you are looking for does not exist. Return to home to continue browsing cartoons.</p>
        </div>
      </div>
      <Link to="/" className="button">Back to Home</Link>
    </section>
  );
}

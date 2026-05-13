import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

const feedbackStorageKey = 'cartoonstream-site-feedback';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [feedbackItems, setFeedbackItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(feedbackStorageKey) || '[]');
      setFeedbackItems(Array.isArray(saved) ? saved : []);
    } catch (error) {
      setFeedbackItems([]);
    }
  }, []);

  function saveFeedback(items) {
    setFeedbackItems(items);
    localStorage.setItem(feedbackStorageKey, JSON.stringify(items));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;

    saveFeedback([
      {
        id: Date.now(),
        text,
        createdAt: new Date().toISOString(),
      },
      ...feedbackItems,
    ]);
    setMessage('');
  }

  return (
    <section className="info-page">
      <Link to="/" className="btn-link">
        <ArrowLeft size={18} /> Back home
      </Link>

      <div className="info-hero">
        <p className="eyebrow">Feedback</p>
        <h1>Send feedback</h1>
        <p>Write your idea, issue, or improvement request. Your feedback appears below after posting.</p>
      </div>

      <div className="card feedback-card">
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label>
            Your feedback
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="5" placeholder="Type feedback here" />
          </label>
          <button type="submit" className="button">
            <Send size={17} /> Post feedback
          </button>
        </form>

        <div className="feedback-list">
          <h2>{feedbackItems.length} feedback posts</h2>
          {feedbackItems.length === 0 ? (
            <p className="soft-status">No feedback has been posted yet.</p>
          ) : (
            feedbackItems.map((item) => (
              <article key={item.id} className="comment-item">
                <p>{item.text}</p>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

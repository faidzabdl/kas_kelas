import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Jika ada error saat render, tampilkan pesannya di layar (bukan halaman putih).
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error(error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Terjadi kesalahan pada aplikasi</h1>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c', marginTop: 12 }}>{String(this.state.error?.stack || this.state.error)}</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 14px' }}>Muat ulang</button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>
);
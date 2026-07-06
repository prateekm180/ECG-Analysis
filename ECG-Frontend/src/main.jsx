import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- Iske bina Tailwind kaam nahi karega
import App from './App.jsx'

// Top-level safety net. The ModelErrorBoundary inside EcgCanvas.jsx only
// catches failures loading the 3D heart model — anything else that throws
// during render (a bad response shape, an unexpected prop, etc.) would
// otherwise unmount the whole app to a blank white screen with no
// indication of what happened.
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('CORVIS crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050505] text-white text-center p-8">
          <p className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase">System Fault</p>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Something went wrong</h1>
          <p className="text-zinc-500 text-sm max-w-sm">
            The diagnostic interface hit an unexpected error. Reloading the page usually resolves it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error("Critical Error: Root element not found. Check index.html.");
}
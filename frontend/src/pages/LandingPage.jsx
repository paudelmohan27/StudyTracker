import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 sm:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-500/40">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">StudyTracker</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition font-medium px-4 py-2 rounded-xl hover:bg-white/10">
            Login
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-primary-900/40 border border-primary-700/50 rounded-full px-4 py-1.5 text-sm text-primary-300 font-medium mb-2">
          🎓 Built for serious students
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-3xl leading-none">
          Ace every exam with
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400"> clarity</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
          Track subjects, topics, and exam deadlines in one place. Get warned before it's too late.
          Study smarter, not harder.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/register" id="hero-cta" className="btn-primary text-base px-8 py-3 rounded-2xl shadow-xl shadow-primary-500/30">
            Start Tracking Free →
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3 rounded-2xl">
            I already have an account
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-3xl w-full">
          {[
            { icon: '📊', title: 'Visual Progress',     desc: 'Charts and progress bars show exactly where you stand.' },
            { icon: '⚠️',  title: 'Deadline Warnings',  desc: 'Get alerts when exams are close and topics are incomplete.' },
            { icon: '🍅', title: 'Pomodoro Timer',      desc: 'Built-in focus timer to keep your study sessions productive.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-600 py-6">
        © {new Date().getFullYear()} StudyTracker. Built for students.
      </footer>
    </div>
  );
}

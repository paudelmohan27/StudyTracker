import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 sm:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-indigo-500 rounded-xl blur opacity-25"></div>
            <div className="relative w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tighter hidden sm:inline-block">Study<span className="text-primary-400">Tracker</span></span>
          <span className="font-extrabold text-2xl tracking-tighter sm:hidden">ST</span>
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

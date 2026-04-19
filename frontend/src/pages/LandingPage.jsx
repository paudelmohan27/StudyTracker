import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

// ─── Animated Counter Hook ───────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ value, suffix, label, delay }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const count = useCounter(value, 2000, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      <span className="text-4xl md:text-5xl font-black text-white tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-sm text-white/50 mt-1 font-medium tracking-wide">{label}</span>
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ num, title, desc, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative flex flex-col p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-default"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-500/10 via-transparent to-amber-500/10 rounded-3xl" />
      <div className="absolute inset-px rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between mb-8">
        <span className="text-5xl font-black text-white/10 font-['Outfit'] leading-none">{num}</span>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 text-white/60 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors duration-300 border border-white/10"
        >
          {icon}
        </motion.div>
      </div>
      <div className="relative">
        <h3 className="text-xl font-bold text-white mb-3 font-['Plus_Jakarta_Sans'] group-hover:text-amber-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed font-light">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Floating Orb ─────────────────────────────────────────────────────────────
function FloatingOrb({ className, delay = 0, duration = 8 }) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
      transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
      className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`}
    />
  );
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-amber-400 to-primary-500 origin-left z-[100]"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax transforms
  const bgY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  // Mouse tracking for hero parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouse = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      mouseX.set((e.clientX / w - 0.5) * 20);
      mouseY.set((e.clientY / h - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  const features = [
    {
      num: '01', title: 'Organize beautifully.',
      desc: 'Break massive syllabuses into bite-sized, actionable topics. Never feel overwhelmed by a textbook again.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      num: '02', title: 'Track visually.',
      desc: 'Watch your progress bars fill up. See exactly what needs your attention today with our smart dashboard.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    {
      num: '03', title: 'Defeat deadlines.',
      desc: 'Smart countdowns warn you when an exam is approaching and you\'re falling behind. Stay ahead always.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      num: '04', title: 'Study smarter.',
      desc: 'AI-powered suggestions tell you which topics to revisit based on your progress patterns. Work efficiently.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    },
    {
      num: '05', title: 'Never forget.',
      desc: 'Spaced repetition reminders surface topics at exactly the right time. Your memory becomes your superpower.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    },
    {
      num: '06', title: 'Share and compete.',
      desc: 'Share progress with study groups and compete on leaderboards. Make studying a team sport for once.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
  ];

  return (
    <div className="bg-[#08090c] text-white font-['Outfit'] relative overflow-x-hidden selection:bg-amber-400/30">
      {/* ── Scroll Progress Bar ── */}
      <ScrollProgress />

      {/* ── HERO SECTION ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Parallax Background */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2676&auto=format&fit=crop")', backgroundPositionY: '30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#08090c]" />
        </motion.div>

        {/* Floating Orbs */}
        <FloatingOrb className="w-96 h-96 bg-primary-600/20 top-10 -left-32" delay={0} duration={7} />
        <FloatingOrb className="w-72 h-72 bg-amber-500/15 top-24 right-0" delay={2} duration={9} />
        <FloatingOrb className="w-56 h-56 bg-violet-500/15 bottom-32 left-1/3" delay={4} duration={6} />

        {/* ── Navbar ── */}
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 mx-auto mt-6 w-[95%] max-w-5xl"
        >
          <div className="rounded-2xl bg-white/8 backdrop-blur-2xl border border-white/12 shadow-xl flex justify-between items-center px-5 py-3.5">
            <Link to="/">
              <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Logo iconSize="w-8 h-8" showText={false} />
                <div className="flex flex-col leading-none">
                  <span className="text-base font-extrabold text-white tracking-tight">StudyTracker</span>
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-[0.2em]">Ace every exam</span>
                </div>
              </motion.div>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
              {['Features', 'Stats', 'Get Started'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  whileHover={{ color: '#fcd34d', y: -1 }}
                  className="transition-colors cursor-pointer"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="text-xs md:text-sm font-semibold text-white/70 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/25 transition-all">
                  Log in
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="text-xs md:text-sm font-bold bg-white text-slate-900 px-5 py-2 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] transition-all">
                  Sign up free
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.nav>

        {/* ── Hero Content ── */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-40"
        >
          {/* Mouse parallax layer */}
          <motion.div style={{ x: springX, y: springY }} className="flex flex-col items-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full mb-10 shadow-lg"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-green-400 inline-block"
              />
              The Ultimate Study Companion
            </motion.div>

            {/* Heading — word-by-word animated */}
            <div className="overflow-hidden mb-4">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight max-w-5xl leading-[1.08] drop-shadow-2xl font-['Plus_Jakarta_Sans']"
              >
                Ace every exam with
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="italic font-serif font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.08]"
              >
                absolute clarity.
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="text-base sm:text-lg text-white/60 max-w-xl leading-relaxed font-light mb-10"
            >
              Track subjects, topics, and exam deadlines in one place.
              Get warned before it's too late. Study smarter, not harder.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-white text-slate-900 font-extrabold text-sm px-10 py-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all"
                >
                  Start for Free
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm px-8 py-4 rounded-2xl border border-white/15 hover:border-white/30 backdrop-blur-sm transition-all"
                >
                  I have an account
                </Link>
              </motion.div>
            </motion.div>

          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS SECTION ── */}
      <section id="stats" className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-20"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <StatCard value={12} suffix="K+" label="Active Students" delay={0} />
            <StatCard value={95} suffix="%" label="Pass Rate Improvement" delay={0.1} />
            <StatCard value={50} suffix="+" label="Countries" delay={0.2} />
            <StatCard value={4} suffix=".9★" label="Average Rating" delay={0.3} />
          </div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-20"
          />
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="relative py-24 px-4">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              How it works
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight mb-6">
              From Chaos To{' '}
              <span className="italic font-serif font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                Control
              </span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto text-base font-light">
              Everything you need to turn exam anxiety into quiet confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section id="get-started" className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[3rem] overflow-hidden"
          >
            {/* Dark card bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950" />
            {/* Glow orbs inside */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary-600/30 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px]" />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            {/* Border glow */}
            <div className="absolute inset-0 rounded-[3rem] border border-white/10" />

            <div className="relative z-10 flex flex-col items-center text-center px-8 py-20 md:py-28">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 flex items-center justify-center mb-10 shadow-2xl cursor-pointer"
              >
                <Logo iconSize="w-12 h-12" showText={false} />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight max-w-2xl leading-[1.08] mb-6"
              >
                Ready to upgrade your GPA?
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="text-white/40 text-base md:text-lg font-light max-w-md mb-12"
              >
                Join thousands of highly organized students dominating their exams worldwide.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/register"
                  className="group flex items-center gap-3 bg-white text-slate-900 font-extrabold text-sm md:text-base px-12 py-5 rounded-2xl shadow-[0_20px_60px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_25px_80px_-10px_rgba(255,255,255,0.45)] transition-all uppercase tracking-wider"
                >
                  Get Started Now
                  <svg className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo iconSize="w-7 h-7" showText={false} />
            <span className="text-sm font-bold text-white/30">StudyTracker</span>
          </div>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} StudyTracker. Built for high achievers.</p>
          <div className="flex gap-6 text-xs text-white/30 font-medium">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fallbackWorlds = [
  { name: 'Your first course', icon: '✦', color: '#d3a342', progress: 0, empty: true },
  { name: 'Focus ritual', icon: '◌', color: '#397b55', progress: 0, empty: true },
];

function World({ world, index }) {
  const size = index === 0 ? 'h-20 w-20 sm:h-24 sm:w-24' : index === 1 ? 'h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]' : 'h-11 w-11 sm:h-14 sm:w-14';
  const position = [
    'left-[14%] top-[48%]',
    'right-[12%] top-[20%]',
    'right-[20%] bottom-[30%]',
    'left-[34%] top-[10%]',
    'left-[4%] top-[20%]',
  ][index % 5];
  const content = <motion.div
    animate={{ y: [0, -7, 0] }}
    transition={{ repeat: Infinity, duration: 4 + index, delay: index * 0.35, ease: 'easeInOut' }}
    whileHover={{ scale: 1.12 }}
    className={`group absolute z-[2] ${position} flex flex-col items-center gap-2`}
  >
    <div className={`${size} relative flex items-center justify-center rounded-full border border-[#fff8e9] shadow-[0_0_28px_var(--world-glow)] transition-shadow duration-300 group-hover:shadow-[0_0_48px_var(--world-glow)]`} style={{ '--world-glow': `${world.color}75`, background: `radial-gradient(circle at 32% 25%, #fffdf4 0%, ${world.color}d9 24%, ${world.color}75 62%, #445045 100%)` }}>
      <span className="relative z-10 text-xl drop-shadow-lg sm:text-2xl">{world.icon}</span>
      <span className="absolute inset-[-7px] rounded-full border border-white/10 opacity-70" />
      {!world.empty && <span className="absolute -bottom-1 -right-1 rounded-full border border-white/70 bg-[#1f2a22] px-1.5 py-0.5 text-[8px] font-black text-white">{world.progress}%</span>}
    </div>
    <span title={world.name} className="max-w-24 truncate text-center text-[9px] font-bold text-[#27382b]/80 sm:max-w-32 sm:text-[10px]">{world.name}</span>
  </motion.div>;

  return world.empty ? content : <Link to={`/subjects/${world._id}`}>{content}</Link>;
}

export default function StudyOrbit({ subjects = [] }) {
  const worlds = subjects.length ? subjects.slice(0, 5).map((subject) => ({ ...subject, progress: subject.averageProgress ?? 0 })) : fallbackWorlds;

  return <section className="relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-[#27382b]/15 bg-[#fffaf0] shadow-[0_28px_70px_rgba(84,65,35,0.14)] sm:min-h-[29rem]">
    <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(48,82,59,.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
    <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#d3a342]/20 blur-[90px]" />
    <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-violet-500/15 blur-[80px]" />
    <div className="absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#27382b]/10 sm:h-[21rem] sm:w-[21rem]" />
    <div className="absolute left-1/2 top-1/2 h-[10rem] w-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#27382b]/20 sm:h-[14rem] sm:w-[14rem]" />
    <div className="absolute left-1/2 top-1/2 h-[5rem] w-[5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#f3d783] via-[#d3a342] to-violet-500 shadow-[0_0_70px_rgba(211,163,66,.38)] sm:h-[6.5rem] sm:w-[6.5rem]" />
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"><span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#27382b]/70">Today</span><span className="mt-1 text-xl font-black text-[#1f2a22] sm:text-2xl">Mission<br />Control</span></div>
    {worlds.map((world, index) => <World key={world._id || world.name} world={world} index={index} />)}
    <div className="absolute left-5 top-5 z-10"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-700">Study atlas</p><p className="mt-1 text-sm font-bold text-[#1f2a22]">Your academic orbit</p></div>
    <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between rounded-2xl border border-[#27382b]/15 bg-[#fffdf7]/80 p-3 backdrop-blur-xl sm:p-4"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#27382b]/45">Next move</p><p className="mt-1 text-xs font-bold text-[#27382b] sm:text-sm">{subjects.length ? 'Choose a world and continue its mission.' : 'Create your first course to begin your atlas.'}</p></div><Link to="/subjects" className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 px-3 py-2 text-[10px] font-black text-white shadow-lg shadow-primary-500/20">{subjects.length ? 'OPEN COURSES' : 'CREATE COURSE'}</Link></div>
  </section>;
}

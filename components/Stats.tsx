
import React from 'react';
import { useAppContext } from '../context/AppContext';

const MockChart: React.FC<{ data: any[], title: string }> = ({ data, title }) => {
  const { language, translations } = useAppContext();
  const t = translations[language];
  const percentage = data.length > 0 ? (data.filter(d => d.completed > 50).length / data.length) * 100 : 0;
  return (
    <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-[2rem] bg-gray-50/50 dark:bg-gray-800/30 text-center relative overflow-hidden">
      <h3 className="font-bold text-xl dark:text-white mb-6 relative z-10">{title}</h3>
      <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden mb-6 z-10">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-green-light to-brand-green rounded-full shadow-[0_0_15px_rgba(139,197,63,0.6)] transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="flex justify-between items-end h-32 px-4 space-x-2 z-10 relative">
          {data.map((d, i) => (
               <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                    <div 
                        className="w-full bg-brand-green/30 rounded-t-lg group-hover:bg-brand-green transition-colors duration-300 relative" 
                        style={{height: `${d.completed}%`}}
                    >
                         <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.completed}%</div>
                    </div>
                    <span className="text-xs text-gray-400 mt-2 font-bold">{d.day.charAt(0)}</span>
               </div>
          ))}
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
    const { language, translations } = useAppContext();
    const t = translations[language];
    // Mock data for demonstration
    const adherenceData = [
        { day: 'Mon', completed: 80 },
        { day: 'Tue', completed: 60 },
        { day: 'Wed', completed: 90 },
        { day: 'Thu', completed: 75 },
        { day: 'Fri', completed: 85 },
        { day: 'Sat', completed: 95 },
        { day: 'Sun', completed: 70 },
    ];

    const totalAdherence = adherenceData.reduce((acc, day) => acc + day.completed, 0) / adherenceData.length;

    return (
        <div className="animate-fade-in pb-12">
            <h1 className="text-4xl font-black italic text-gray-900 dark:text-white mb-8 text-center">{t.yourProgress}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div className="glass-card p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green rounded-full blur-[60px] opacity-20"></div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t.overallAdherence}</h2>
                    
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * totalAdherence) / 100} className="text-brand-green transition-all duration-1000 ease-out" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-4xl font-black text-gray-800 dark:text-white">{totalAdherence.toFixed(0)}%</span>
                             <span className="text-xs text-gray-400 uppercase tracking-widest">Completed</span>
                        </div>
                    </div>
                </div>
                
                <div className="glass-card p-8 rounded-[2.5rem] shadow-sm">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{t.weeklyAdherence}</h2>
                    <MockChart data={adherenceData} title="Activity" />
                </div>
            </div>
        </div>
    );
};

export default Stats;

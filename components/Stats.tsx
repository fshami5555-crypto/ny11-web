
import React from 'react';
import { useAppContext } from '../context/AppContext';
// Note: In a real environment, Recharts would be installed via npm.
// This component is written assuming Recharts components are available.
// For browser-only, a script tag would be needed in index.html, e.g.,
// <script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
// For this example, we'll mock the chart if Recharts is not available.
// A real project must include recharts as a dependency.

const MockChart: React.FC<{ data: any[], title: string }> = ({ data, title }) => {
  const { language, translations } = useAppContext();
  const t = translations[language];
  const percentage = data.length > 0 ? (data.filter(d => d.completed > 50).length / data.length) * 100 : 0;
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-dark-card dark:border-gray-700 text-center">
      <h3 className="font-bold text-lg dark:text-white">{title}</h3>
      <div className="w-full bg-gray-200 rounded-full h-4 my-4 dark:bg-gray-700">
          <div className="bg-brand-green h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t.rechartsPlaceholder}</p>
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
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t.yourProgress}</h1>

            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{t.overallAdherence}</h2>
                <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                    <div className="bg-gradient-to-r from-brand-green-light to-brand-green h-4 rounded-full" style={{ width: `${totalAdherence}%` }}></div>
                </div>
                <p className="text-right mt-2 font-semibold text-brand-green-dark dark:text-brand-green-light">{totalAdherence.toFixed(0)}%</p>
            </div>
            
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t.weeklyAdherence}</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <MockChart data={adherenceData} title="Weekly Completion Rate" />
                    {/* 
                    In a real project with Recharts installed:
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adherenceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" fill="#22c55e" />
                        </BarChart>
                    </ResponsiveContainer>
                    */}
                </div>
            </div>
        </div>
    );
};

export default Stats;
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Language, Theme } from '../types';

const Settings: React.FC = () => {
    const { currentUser, language, setLanguage, theme, setTheme, logout, showNotification, translations } = useAppContext();
    const t = translations[language];

    const handleTestNotification = () => {
        showNotification({
            title: t.appointmentReminderTitle,
            body: t.appointmentReminderBody,
            icon: '🔔'
        });
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t.settings}</h1>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{t.profileInfo}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t.name}</label>
                        <input type="text" defaultValue={currentUser?.name} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        {/* Changed from Email to Phone */}
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t.whatsYourPhone}</label>
                        <input type="text" defaultValue={currentUser?.phone} disabled className="w-full mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed"/>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{t.preferences}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.theme}</label>
                        <div className="flex gap-4">
                            <button onClick={() => setTheme(Theme.LIGHT)} className={`px-4 py-2 rounded-lg ${theme === Theme.LIGHT ? 'bg-brand-green text-brand-green-dark font-semibold' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.light}</button>
                            <button onClick={() => setTheme(Theme.DARK)} className={`px-4 py-2 rounded-lg ${theme === Theme.DARK ? 'bg-brand-green text-brand-green-dark font-semibold' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.dark}</button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.language}</label>
                        <div className="flex gap-4">
                            <button onClick={() => setLanguage(Language.EN)} className={`px-4 py-2 rounded-lg ${language === Language.EN ? 'bg-brand-green text-brand-green-dark font-semibold' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.english}</button>
                            <button onClick={() => setLanguage(Language.AR)} className={`px-4 py-2 rounded-lg ${language === Language.AR ? 'bg-brand-green text-brand-green-dark font-semibold' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.arabic}</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                 <button onClick={handleTestNotification} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
                    {t.testNotification}
                </button>
                <button onClick={logout} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition">
                    {t.logout}
                </button>
            </div>
        </div>
    );
};

export default Settings;
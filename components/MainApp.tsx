import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Dashboard from './Dashboard';
import ChatPage from './Chat';
import Market from './Market';
import Stats from './Stats';
import Settings from './Settings';
import ActiveChats from './ActiveChats';
import OnboardingAndAuth from './OnboardingAndAuth';
import { useAppContext } from '../context/AppContext';
import { TranslationSet } from '../constants';
import { Theme, Language, Notification } from '../types';
import { format } from 'date-fns';

type ActivePage = 'dashboard' | 'chat' | 'activeChats' | 'market' | 'stats' | 'settings';

const Navbar: React.FC<{ activePage: ActivePage; setActivePage: (page: ActivePage) => void; onLoginClick: () => void }> = ({ activePage, setActivePage, onLoginClick }) => {
    const { language, setLanguage, theme, setTheme, currentUser, logout, translations } = useAppContext();
    const t = translations[language];

    const toggleTheme = () => {
        setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    };

    const toggleLanguage = () => {
        setLanguage(language === Language.EN ? Language.AR : Language.EN);
    };

    const navItems = [
        { id: 'dashboard', label: t.home },
        { id: 'chat', label: t.experts },
        { id: 'market', label: t.market },
        { id: 'stats', label: t.stats },
    ] as const;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;

    return (
        <nav className="bg-white dark:bg-dark-card shadow-md sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => setActivePage('dashboard')}>
                        <h1 className="text-3xl font-black italic tracking-tighter text-brand-green-dark dark:text-brand-green">NY11</h1>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id as ActivePage)}
                                className={`font-medium transition-colors duration-200 ${activePage === item.id ? 'text-brand-green font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-brand-green'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                         <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" dangerouslySetInnerHTML={{ __html: theme === 'light' ? moonIcon : sunIcon }} />
                        <button onClick={toggleLanguage} className="font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-green transition-colors">
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>
                        
                        {currentUser && currentUser.id !== 'guest' ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 rtl:space-x-reverse focus:outline-none">
                                     <img src={currentUser.avatar || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="User" className="w-10 h-10 rounded-full border-2 border-brand-green" />
                                     <span className="hidden md:block font-medium dark:text-white">{currentUser.name}</span>
                                     <i className="o-chevron-down text-xs text-gray-500"></i>
                                </button>
                                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-xl py-1 hidden group-hover:block animate-fade-in ring-1 ring-black ring-opacity-5">
                                    <button onClick={() => setActivePage('settings')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t.settings}</button>
                                    <button onClick={() => setActivePage('activeChats')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t.activeChats}</button>
                                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">{t.logout}</button>
                                </div>
                            </div>
                        ) : (
                             <button onClick={onLoginClick} className="bg-brand-green text-brand-green-dark px-6 py-2 rounded-full font-bold hover:opacity-90 transition shadow-lg">
                                {t.login}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile Nav Menu placeholder could go here */}
        </nav>
    );
};

const Footer: React.FC = () => {
    const { translations, language } = useAppContext();
    const t = translations[language];

    return (
        <footer className="bg-white dark:bg-dark-card border-t dark:border-gray-800 pt-12 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-3xl font-black italic tracking-tighter text-brand-green-dark dark:text-brand-green mb-4">NY11</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t.footerDesc}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t.appName}</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-brand-green">{t.home}</a></li>
                            <li><a href="#" className="hover:text-brand-green">{t.experts}</a></li>
                            <li><a href="#" className="hover:text-brand-green">{t.market}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t.about}</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-brand-green">{t.about}</a></li>
                            <li><a href="#" className="hover:text-brand-green">{t.contact}</a></li>
                            <li><a href="#" className="hover:text-brand-green">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t.contact}</h3>
                         <div className="flex space-x-4 rtl:space-x-reverse text-gray-400">
                             {/* Social Icons Placeholders */}
                             <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                             <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                             <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                         </div>
                    </div>
                </div>
                <div className="border-t dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-500">
                    <p>{t.copyright}</p>
                    <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">{t.privacy}</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">{t.terms}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};


const NotificationCard: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    return (
         <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl p-4 w-full max-w-sm flex items-start animate-fade-in border-l-4 border-brand-green">
            <div className="flex-shrink-0 w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green-dark font-bold text-xl">
                {notification.icon || 'N'}
            </div>
            <div className="ml-4 flex-1 rtl:mr-4 rtl:ml-0">
                <h4 className="font-bold text-gray-800 dark:text-white">{notification.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.body}</p>
            </div>
            <button onClick={onDismiss} className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rtl:mr-4 rtl:ml-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const { notifications, dismissNotification } = useAppContext();
    return (
        <div className="fixed top-24 right-4 rtl:right-auto rtl:left-4 space-y-3 z-50 w-full max-w-md">
            {notifications.map(notif => (
                <NotificationCard key={notif.id} notification={notif} onDismiss={() => dismissNotification(notif.id)} />
            ))}
        </div>
    );
};


const MainApp: React.FC = () => {
    const [activePage, setActivePage] = useState<ActivePage>('dashboard');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { currentUser } = useAppContext();

    useEffect(() => {
        // If logged in as guest via the prompt, close modal
        if (currentUser) {
            setShowAuthModal(false);
        }
    }, [currentUser]);

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'chat': return <ChatPage />;
            case 'activeChats': return <ActiveChats />;
            case 'market': return <Market />;
            case 'stats': return <Stats />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans transition-colors duration-300">
             <style>
                {`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            
            <Navbar activePage={activePage} setActivePage={setActivePage} onLoginClick={() => setShowAuthModal(true)} />
            
            <main className="flex-grow">
                 {/* Page Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
                    {renderPage()}
                </div>
            </main>
            
            <Footer />
            <NotificationContainer />

            {/* Auth Modal Overlay */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
                    <div className="relative bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                         <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <OnboardingAndAuth mode="modal" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainApp;
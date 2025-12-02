import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, addDays, subDays } from 'date-fns';
import { DailyPlan, Meal, Exercise, User, Goal } from '../types';

const HeroLanding: React.FC = () => {
    const { translations, language, setIsLanguageSelected, loginAsGuest } = useAppContext();
    const t = translations[language];

    const handleGetStarted = () => {
        setIsLanguageSelected(true);
        loginAsGuest();
        // Trigger auth modal via global event or context if simpler, 
        // but for now user clicks login on navbar or explores as guest
        // If guest mode logic in AppContext sets currentUser to guest, this updates the view.
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-3xl overflow-hidden shadow-2xl mb-12 animate-fade-in relative">
             <div className="absolute inset-0 bg-gradient-to-r from-brand-green/20 to-transparent pointer-events-none"></div>
             <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-16 relative z-10">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                        {t.heroTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t.heroSubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className="bg-brand-green text-brand-green-dark px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition transform">
                            {t.getStarted}
                        </button>
                         <button className="px-8 py-4 rounded-full font-bold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-brand-green dark:hover:border-brand-green hover:text-brand-green transition">
                            {t.about}
                        </button>
                    </div>
                </div>
                <div className="hidden md:block relative h-96">
                     <img 
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
                        alt="Healthy Food" 
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition duration-500"
                    />
                </div>
             </div>
        </div>
    );
};

const MealDetailModal: React.FC<{ meal: Meal; onClose: () => void }> = ({ meal, onClose }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-sm m-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <img src={meal.image || 'https://picsum.photos/400/300'} alt={meal.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{meal.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{meal.description || 'No description available.'}</p>
                    <div className="flex justify-between items-center text-brand-green dark:text-brand-green-light">
                        <span className="font-semibold">{t.calories}</span>
                        <span className="font-bold text-lg">{meal.calories} kcal</span>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                    <button onClick={onClose} className="w-full bg-brand-green text-brand-green-dark py-2 rounded-lg font-semibold hover:opacity-90 transition">{t.close}</button>
                </div>
            </div>
        </div>
    );
};

const ProfileCard: React.FC = () => {
    const { currentUser, language, translations } = useAppContext();
    const t = translations[language];
    return (
        <div className="bg-brand-green-dark text-white p-8 rounded-3xl shadow-lg mb-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <h1 className="text-9xl font-black italic">NY11</h1>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <img src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`} className="w-20 h-20 rounded-full border-4 border-brand-green" alt="Profile"/>
                <div className="flex-1 text-center md:text-left rtl:md:text-right">
                    <h2 className="text-3xl font-bold text-brand-green mb-1">{currentUser?.name}</h2>
                    <p className="text-gray-300 mb-4">{currentUser?.email}</p>
                    <div className="flex justify-center md:justify-start rtl:md:justify-end gap-8 mt-4">
                        <div className="text-center">
                            <p className="text-sm opacity-80 uppercase tracking-wide">{t.age}</p>
                            <p className="font-bold text-2xl">{currentUser?.age || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm opacity-80 uppercase tracking-wide">{t.weight}</p>
                            <p className="font-bold text-2xl">{currentUser?.weight ? `${currentUser.weight} kg` : 'N/A'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm opacity-80 uppercase tracking-wide">{t.height}</p>
                            <p className="font-bold text-2xl">{currentUser?.height ? `${currentUser.height} cm` : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlanItem: React.FC<{ item: Meal | Exercise; onToggle: () => void, isRtl: boolean; onMealClick: (meal: Meal) => void }> = ({ item, onToggle, isRtl, onMealClick }) => {
    const isExercise = 'duration' in item || 'reps' in item;

    const content = (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full border border-gray-100 dark:border-gray-800">
            <div className="flex items-center">
                <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-brand-green border-brand-green' : 'border-gray-300 dark:border-gray-600 hover:border-brand-green'}`}>
                    {item.completed && <i className="o-check text-brand-green-dark text-sm font-bold"></i>}
                </button>
                <div className={`mx-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className={`font-semibold text-gray-800 dark:text-dark-text ${item.completed ? 'line-through opacity-60' : ''}`}>{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isExercise ? (item as Exercise).duration || (item as Exercise).reps : `${(item as Meal).calories} kcal`}
                    </p>
                </div>
            </div>
            {!isExercise && <i className={`o-chevron-left text-gray-400 ${isRtl ? '' : 'transform rotate-180'}`}></i>}
        </div>
    );

    if (isExercise) {
        return <div className="w-full">{content}</div>;
    }

    return (
        <button onClick={() => onMealClick(item as Meal)} className="w-full text-left">
            {content}
        </button>
    );
};


const DailyPlanView: React.FC = () => {
    const { plan, updateDailyPlan, language, translations } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const isRtl = language === 'ar';
    const t = translations[language];

    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dailyPlan = plan[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [], exercises: [] };

    const handleToggleItem = (category: keyof DailyPlan, index: number) => {
        const newDailyPlan = { ...dailyPlan };
        const items = [...newDailyPlan[category]];
        const item = items[index];
        items[index] = { ...item, completed: !item.completed };
        // @ts-ignore
        newDailyPlan[category] = items;
        updateDailyPlan(dateKey, newDailyPlan);
    };
    
    const sections: { title: string, key: keyof DailyPlan }[] = [
        { title: t.breakfast, key: "breakfast" },
        { title: t.lunch, key: "lunch" },
        { title: t.dinner, key: "dinner" },
        { title: t.snacks, key: "snacks" },
        { title: t.exercises, key: "exercises" },
    ];
    
    return (
         <div id="tour-daily-plan" className="animate-slide-up bg-white/50 dark:bg-dark-card/30 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-3 bg-white dark:bg-dark-card rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"><i className={`o-chevron-left ${isRtl && 'transform rotate-180'}`}></i></button>
                <div className="text-center">
                     <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{t.todaysPlan}</p>
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">{format(currentDate, 'EEEE, MMM d')}</h2>
                </div>
                <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-3 bg-white dark:bg-dark-card rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"><i className={`o-chevron-right ${isRtl && 'transform rotate-180'}`}></i></button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map(section => (
                    (dailyPlan[section.key] && dailyPlan[section.key].length > 0) && (
                        <div key={section.key} className="bg-white/60 dark:bg-dark-card/50 rounded-2xl p-4">
                            <h3 className="font-bold text-lg mb-4 text-brand-green-dark dark:text-brand-green px-2 border-l-4 border-brand-green rtl:border-l-0 rtl:border-r-4 rtl:pr-2">{section.title}</h3>
                            <div className="space-y-2">
                                {dailyPlan[section.key].map((item, index) => (
                                   <PlanItem key={index} item={item} onToggle={() => handleToggleItem(section.key, index)} isRtl={isRtl} onMealClick={setSelectedMeal} />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
            {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
        </div>
    );
}

const ProfileSetup: React.FC<{ onComplete: (data: Partial<User>) => void }> = ({ onComplete }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        age: '',
        weight: '',
        height: '',
        goal: '' as Goal | '',
    });

    const goals: { key: Goal, label: keyof typeof t }[] = [
        { key: Goal.WEIGHT_LOSS, label: 'weightLoss' },
        { key: Goal.WEIGHT_GAIN, label: 'weightGain' },
        { key: Goal.MUSCLE_BUILD, label: 'muscleBuild' },
        { key: Goal.FITNESS, label: 'fitness' },
        { key: Goal.MAINTENANCE, label: 'maintenance' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
         if (step === 1 && !profileData.age) return;
         if (step === 2 && !profileData.weight) return;
         if (step === 3 && !profileData.height) return;
         setStep(s => s + 1)
    };
    
    const handleSubmit = () => {
        if (!profileData.age || !profileData.weight || !profileData.height || !profileData.goal) {
            alert('Please fill all fields');
            return;
        }
        onComplete({
            age: parseInt(profileData.age, 10),
            weight: parseInt(profileData.weight, 10),
            height: parseInt(profileData.height, 10),
            goal: profileData.goal,
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="bg-white dark:bg-dark-card p-10 rounded-3xl shadow-xl text-center animate-fade-in w-full max-w-md mx-auto">
                        <h3 className="text-3xl font-bold mb-6 dark:text-white">{t.whatsYourAge}</h3>
                        <input type="number" name="age" value={profileData.age} onChange={handleInputChange} className="w-full p-4 text-center text-2xl rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition" placeholder={t.agePlaceholder} autoFocus />
                        <button onClick={nextStep} className="w-full bg-brand-green text-brand-green-dark mt-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">{t.next}</button>
                    </div>
                );
            case 2:
                return (
                    <div className="bg-white dark:bg-dark-card p-10 rounded-3xl shadow-xl text-center animate-fade-in w-full max-w-md mx-auto">
                        <h3 className="text-3xl font-bold mb-6 dark:text-white">{t.whatsYourWeight}</h3>
                        <input type="number" name="weight" value={profileData.weight} onChange={handleInputChange} className="w-full p-4 text-center text-2xl rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition" placeholder={t.weightPlaceholder} autoFocus />
                        <button onClick={nextStep} className="w-full bg-brand-green text-brand-green-dark mt-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">{t.next}</button>
                    </div>
                );
            case 3:
                return (
                     <div className="bg-white dark:bg-dark-card p-10 rounded-3xl shadow-xl text-center animate-fade-in w-full max-w-md mx-auto">
                        <h3 className="text-3xl font-bold mb-6 dark:text-white">{t.whatsYourHeight}</h3>
                        <input type="number" name="height" value={profileData.height} onChange={handleInputChange} className="w-full p-4 text-center text-2xl rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition" placeholder={t.heightPlaceholder} autoFocus />
                        <button onClick={nextStep} className="w-full bg-brand-green text-brand-green-dark mt-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">{t.next}</button>
                    </div>
                );
            case 4:
                return (
                     <div className="bg-white dark:bg-dark-card p-10 rounded-3xl shadow-xl text-center animate-fade-in w-full max-w-md mx-auto">
                        <h3 className="text-3xl font-bold mb-6 dark:text-white">{t.yourGoal}</h3>
                        <div className="space-y-4">
                            {goals.map(goal => (
                                <button
                                    key={goal.key}
                                    onClick={() => setProfileData(prev => ({ ...prev, goal: goal.key }))}
                                    className={`w-full p-4 rounded-xl font-bold text-lg border-2 transition ${profileData.goal === goal.key ? 'bg-brand-green text-brand-green-dark border-brand-green shadow-lg scale-105' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-green dark:hover:border-brand-green'}`}
                                >
                                    {t[goal.label]}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleSubmit} disabled={!profileData.goal} className="w-full bg-brand-green text-brand-green-dark mt-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">{t.finishSetup}</button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-fade-in">
            <h2 className="text-4xl font-black text-gray-800 dark:text-white mb-6 text-center">{t.setupProfileTitle}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-lg text-center text-lg leading-relaxed">
                {t.setupProfileSubtitle}
            </p>
            {renderStep()}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { currentUser, updateUserProfile, plan, language, translations } = useAppContext();
    const t = translations[language];

    // If no user or explicit Guest user who hasn't set up profile
    // But logically guest user object is created in AppContext with id 'guest'
    // If currentUser is null (initial state), we show Hero
    
    if (!currentUser || currentUser.id === 'guest') {
        return <HeroLanding />;
    }

    const isProfileComplete = !!(currentUser?.age && currentUser?.weight && currentUser?.height && currentUser?.goal);

    if (!isProfileComplete) {
        return <ProfileSetup onComplete={updateUserProfile} />;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const hasPlan = !!plan[today];

    if (!hasPlan) {
        return (
            <div className="flex flex-col items-center justify-center text-center pt-20 animate-fade-in min-h-[50vh]">
                <div className="w-20 h-20 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">{t.generatingPlan}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{t.generatingPlanDesc}</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <ProfileCard />
            <DailyPlanView />
        </div>
    );
};

export default Dashboard;
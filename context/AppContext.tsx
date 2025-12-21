
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Language, Theme, CartItem, Plan, DailyPlan, QuoteStatus, Message, MessageSender, UserRole, Goal, Coach, CoachOnboardingData, Notification, MarketItem, SiteConfig, KnowledgeBaseItem } from '../types';
import { USERS, COACHES, MARKET_ITEMS, GOAL_PLANS, TRANSLATIONS, BANNER_IMAGES, DEFAULT_SITE_CONFIG, DEFAULT_KNOWLEDGE_BASE } from '../constants';
import { format } from 'date-fns';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface AppContextType {
    currentUser: User | null;
    users: User[];
    coaches: Coach[];
    language: Language;
    theme: Theme;
    cart: CartItem[];
    toasts: Toast[];
    plan: Plan;
    notifications: Notification[];
    isLanguageSelected: boolean;
    marketItems: MarketItem[];
    bannerImages: string[];
    siteConfig: SiteConfig;
    translations: typeof TRANSLATIONS;
    knowledgeBase: KnowledgeBaseItem[];
    login: (phone: string, password?: string) => boolean;
    loginAsGuest: () => void;
    logout: () => void;
    register: (user: Omit<User, 'id' | 'role' | 'avatar' | 'email'>) => void;
    registerCoach: (data: CoachOnboardingData) => void;
    updateCoach: (id: string, data: CoachOnboardingData) => void;
    setLanguage: (lang: Language) => void;
    setIsLanguageSelected: (isSelected: boolean) => void;
    setTheme: (theme: Theme) => void;
    addToCart: (item: CartItem['id']) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
    updatePlan: (newPlan: Plan) => void;
    updateDailyPlan: (date: string, dailyPlan: DailyPlan) => void;
    updateQuoteStatus: (messageId: string, status: QuoteStatus, conversation: Message[], setConversation: React.Dispatch<React.SetStateAction<Message[]>>) => void;
    updateUserProfile: (profileData: Partial<Omit<User, 'id' | 'role' | 'email'>>) => void;
    showNotification: (notification: Omit<Notification, 'id'>) => void;
    dismissNotification: (id: number) => void;
    addMarketItem: (item: Omit<MarketItem, 'id'>) => void;
    updateMarketItem: (item: MarketItem) => void;
    deleteMarketItem: (itemId: string) => void;
    addBannerImage: (url: string) => void;
    deleteBannerImage: (index: number) => void;
    updateBannerImage: (index: number, url: string) => void;
    updateTranslations: (newTranslations: typeof TRANSLATIONS) => void;
    updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
    addKnowledgeItem: (item: Omit<KnowledgeBaseItem, 'id'>) => void;
    updateKnowledgeItem: (item: KnowledgeBaseItem) => void;
    deleteKnowledgeItem: (id: string) => void;
    getAIResponse: (question: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(USERS);
    const [coaches, setCoaches] = useState<Coach[]>(COACHES);
    const [language, setLanguage] = useState<Language>(Language.AR);
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(true);
    const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [plan, setPlan] = useState<Plan>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [marketItems, setMarketItems] = useState<MarketItem[]>(MARKET_ITEMS);
    const [bannerImages, setBannerImages] = useState<string[]>(BANNER_IMAGES);
    const [translations, setTranslations] = useState(TRANSLATIONS);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(DEFAULT_KNOWLEDGE_BASE);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const login = (phone: string, password?: string) => {
        const user = users.find(u => u.phone === phone);
        if (user) {
            if (user.role === UserRole.ADMIN && user.password !== password) {
                return false;
            }
            setCurrentUser(user);
            if (user.age && user.weight && user.height && user.goal) {
                const today = format(new Date(), 'yyyy-MM-dd');
                const userPlan = GOAL_PLANS[user.goal] || GOAL_PLANS[Goal.MAINTENANCE];
                setPlan({ [today]: userPlan });
            } else {
                setPlan({});
            }
            return true;
        }
        return false;
    };

    const loginAsGuest = () => {
        const guestUser: User = {
            id: 'guest',
            name: translations[language].guest,
            email: '',
            phone: '',
            role: UserRole.USER,
        };
        setCurrentUser(guestUser);
        setPlan({});
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const register = (userData: Omit<User, 'id' | 'role' | 'avatar' | 'email'>) => {
        const newUser: User = { 
            ...userData, 
            email: `${userData.phone}@ny11.com`,
            id: `user${Date.now()}`, 
            role: UserRole.USER,
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);

        if (newUser.goal) {
            const today = format(new Date(), 'yyyy-MM-dd');
            const userPlan = GOAL_PLANS[newUser.goal] || GOAL_PLANS[Goal.MAINTENANCE];
            setPlan({ [today]: userPlan });
        } else {
            setPlan({});
        }
    };

    const registerCoach = (data: CoachOnboardingData) => {
        if (!data.password) {
            showToast('Password is required to create a coach account.', 'error');
            return;
        }
        const newId = `coach${Date.now()}`;
        const newUser: User = {
            id: newId,
            name: data.name,
            email: data.email || `${data.phone}@ny11.com`,
            phone: data.phone,
            role: UserRole.COACH,
            password: data.password,
            avatar: data.avatar,
        };
        const newCoach: Coach = {
            id: newId,
            name: data.name,
            specialty: data.specialty,
            bio: data.bio,
            experienceYears: parseInt(data.experienceYears, 10) || 0,
            clientsHelped: parseInt(data.clientsHelped, 10) || 0,
            avatar: data.avatar,
        };
        setUsers(prev => [...prev, newUser]);
        setCoaches(prev => [...prev, newCoach]);
        showToast(`Coach ${data.name} has been successfully registered.`, 'success');
    };

    const updateCoach = (id: string, data: CoachOnboardingData) => {
        setCoaches(prev => prev.map(c => c.id === id ? {
            ...c,
            name: data.name,
            specialty: data.specialty,
            bio: data.bio,
            experienceYears: parseInt(data.experienceYears, 10) || 0,
            clientsHelped: parseInt(data.clientsHelped, 10) || 0,
            avatar: data.avatar,
        } : c));

        setUsers(prev => prev.map(u => u.id === id ? {
            ...u,
            name: data.name,
            phone: data.phone,
            avatar: data.avatar,
            password: data.password || u.password
        } : u));
        
        showToast(`Coach ${data.name} updated successfully.`, 'success');
    };

    const addToCart = (itemId: string) => {
        const itemToAdd = cart.find(i => i.id === itemId);
        if (itemToAdd) {
            setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
             const newItem = marketItems.find((i) => i.id === itemId);
             if(newItem) setCart([...cart, { ...newItem, quantity: 1 }]);
        }
    };
    
    const removeFromCart = (itemId: string) => {
        setCart(cart.filter(item => item.id !== itemId));
    };
    
    const addMarketItem = (itemData: Omit<MarketItem, 'id'>) => {
        const newItem: MarketItem = {
            ...itemData,
            id: `${itemData.category.slice(0,1)}${Date.now()}`,
        };
        setMarketItems(prev => [...prev, newItem]);
        showToast(`${itemData.name} has been added to the store.`, 'success');
    };

    const updateMarketItem = (updatedItem: MarketItem) => {
        setMarketItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        showToast('Item updated successfully.', 'success');
    };

    const deleteMarketItem = (itemId: string) => {
        setMarketItems(prev => prev.filter(item => item.id !== itemId));
        showToast('Item deleted successfully.', 'success');
    };

    const addBannerImage = (url: string) => {
        setBannerImages(prev => [...prev, url]);
        showToast('Banner image added.', 'success');
    };

    const deleteBannerImage = (index: number) => {
        setBannerImages(prev => prev.filter((_, i) => i !== index));
        showToast('Banner image removed.', 'success');
    };

    const updateBannerImage = (index: number, url: string) => {
        setBannerImages(prev => prev.map((img, i) => (i === index ? url : img)));
        showToast('Banner image updated.', 'success');
    };

    const updateTranslations = (newTranslations: typeof TRANSLATIONS) => {
        setTranslations(newTranslations);
        showToast('Text content updated successfully.', 'success');
    };

    const updateSiteConfig = (newConfig: Partial<SiteConfig>) => {
        setSiteConfig(prev => ({...prev, ...newConfig}));
        showToast('Site configuration updated.', 'success');
    };

    const addKnowledgeItem = (item: Omit<KnowledgeBaseItem, 'id'>) => {
        const newItem: KnowledgeBaseItem = {
            ...item,
            id: `kb${Date.now()}`,
        };
        setKnowledgeBase(prev => [...prev, newItem]);
        showToast('Q&A added to AI Knowledge Base.', 'success');
    };

    const updateKnowledgeItem = (updatedItem: KnowledgeBaseItem) => {
        setKnowledgeBase(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        showToast('AI Knowledge Base updated.', 'success');
    };

    const deleteKnowledgeItem = (id: string) => {
        setKnowledgeBase(prev => prev.filter(item => item.id !== id));
        showToast('Item removed from AI Knowledge Base.', 'success');
    };

    const getAIResponse = async (userQuestion: string): Promise<string> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const knowledgeContext = knowledgeBase.map(kb => 
                `Q: ${kb.question}\nA: ${kb.answer}`
            ).join('\n---\n');

            const systemInstruction = `You are the NY11 AI Nutrition & Health Expert.
            
            Persona:
            - Professional, motivating, and strictly health-focused.
            - Expert in nutrition, fitness, hydration, and overall wellness.
            
            Sources of Knowledge:
            1. PRIMARY SOURCE (Internal Admin Data): Use the provided data below for platform-specific questions (subscription, company rules, specific breakfast recommendations).
            2. SECONDARY SOURCE (General Expertise): If the user's question isn't in the internal data, use your advanced medical and nutrition knowledge as a world-class health coach.
            
            INTERNAL ADMIN KNOWLEDGE BASE:
            ${knowledgeContext}
            
            Rules:
            - Never say "I don't have enough info" unless the question is completely unrelated to health or the app.
            - Always prefer the Internal Admin data if relevant.
            - Keep answers brief and encouraging.
            - Respond in ${language === Language.AR ? 'Arabic' : 'English'}.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userQuestion,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            return response.text || (language === Language.AR ? "عذرًا، لم أتمكن من الرد في الوقت الحالي." : "Sorry, I couldn't generate a response right now.");
        } catch (error) {
            console.error("Gemini API Error:", error);
            return language === Language.AR 
                ? "أواجه مشكلة في الاتصال بالخادم حاليًا. يرجى المحاولة لاحقًا."
                : "I'm having trouble connecting to the server right now. Please try again later.";
        }
    };

    const clearCart = () => setCart([]);

    const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, ...notification }]);
        setTimeout(() => {
            dismissNotification(id);
        }, 5000);
    }, []);

    const dismissNotification = (id: number) => {
        setNotifications(current => current.filter(notif => notif.id !== id));
    };
    
    const updatePlan = (newPlan: Plan) => {
        setPlan(prevPlan => ({...prevPlan, ...newPlan}));
    };

    const updateDailyPlan = (date: string, dailyPlan: DailyPlan) => {
        setPlan(prevPlan => ({...prevPlan, [date]: dailyPlan}));
    }
    
    const updateUserProfile = (profileData: Partial<Omit<User, 'id' | 'role' | 'email'>>) => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, ...profileData };
            if (updatedUser.age && updatedUser.weight && updatedUser.height && updatedUser.goal) {
                const today = format(new Date(), 'yyyy-MM-dd');
                const userPlan = GOAL_PLANS[updatedUser.goal] || GOAL_PLANS[Goal.MAINTENANCE];
                setTimeout(() => {
                  setPlan({ [today]: userPlan });
                }, 1000);
            }
            return updatedUser;
        });
    };

    const updateQuoteStatus = (messageId: string, status: QuoteStatus, conversation: Message[], setConversation: React.Dispatch<React.SetStateAction<Message[]>>) => {
        const updatedConversation = conversation.map(msg => {
            if (msg.id === messageId && msg.quote) {
                return { ...msg, quote: { ...msg.quote, status } };
            }
            return msg;
        });

        const statusMessage: Message = {
            id: `sys-${Date.now()}`,
            sender: MessageSender.SYSTEM,
            text: `You have ${status} the quote.`,
            timestamp: new Date().toISOString()
        };
        
        setConversation([...updatedConversation, statusMessage]);

        if (status === QuoteStatus.ACCEPTED) {
            setTimeout(() => {
                const newPlanData = GOAL_PLANS[Goal.MUSCLE_BUILD];
                const newPlan: Plan = { [format(new Date(), 'yyyy-MM-dd')]: newPlanData };
                
                const planMessage: Message = {
                    id: `plan-${Date.now()}`,
                    sender: MessageSender.COACH,
                    text: 'Great! Here is your personalized plan. It has been added to your dashboard.',
                    plan: newPlan,
                    timestamp: new Date().toISOString()
                };
                setConversation(prev => [...prev, planMessage]);
                updatePlan(newPlan);
                const t = translations[language];
                showNotification({
                    title: t.planUpdatedTitle,
                    body: t.planUpdatedBody,
                });
            }, 2000);
        }
    };


    return (
        <AppContext.Provider value={{
            currentUser,
            users,
            coaches,
            language,
            theme,
            cart,
            toasts,
            plan,
            notifications,
            isLanguageSelected,
            marketItems,
            bannerImages,
            siteConfig,
            translations,
            knowledgeBase,
            login,
            loginAsGuest,
            logout,
            register,
            registerCoach,
            updateCoach,
            setLanguage,
            setIsLanguageSelected,
            setTheme,
            addToCart,
            removeFromCart,
            clearCart,
            showToast,
            updatePlan,
            updateDailyPlan,
            updateQuoteStatus,
            updateUserProfile,
            showNotification,
            dismissNotification,
            addMarketItem,
            updateMarketItem,
            deleteMarketItem,
            addBannerImage,
            deleteBannerImage,
            updateBannerImage,
            updateTranslations,
            updateSiteConfig,
            addKnowledgeItem,
            updateKnowledgeItem,
            deleteKnowledgeItem,
            getAIResponse,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

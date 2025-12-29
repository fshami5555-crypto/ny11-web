
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  User, Language, Theme, CartItem, Plan, DailyPlan, QuoteStatus, 
  Message, MessageSender, UserRole, Goal, Coach, CoachOnboardingData, 
  Notification, MarketItem, SiteConfig, KnowledgeBaseItem 
} from '../types';
import { 
  COACHES, MARKET_ITEMS, GOAL_PLANS, TRANSLATIONS, 
  BANNER_IMAGES, DEFAULT_SITE_CONFIG, DEFAULT_KNOWLEDGE_BASE 
} from '../constants';
import { format } from 'date-fns';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, onSnapshot, 
  addDoc, updateDoc, deleteDoc 
} from 'firebase/firestore';

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
    isLoading: boolean;
    login: (phone: string, password?: string) => Promise<boolean>;
    loginAsGuest: () => void;
    logout: () => void;
    register: (user: Omit<User, 'id' | 'role' | 'avatar' | 'email'>, password?: string) => Promise<void>;
    registerCoach: (data: CoachOnboardingData) => Promise<void>;
    updateCoach: (id: string, data: CoachOnboardingData) => Promise<void>;
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
    addMarketItem: (item: Omit<MarketItem, 'id'>) => Promise<void>;
    updateMarketItem: (item: MarketItem) => Promise<void>;
    deleteMarketItem: (itemId: string) => Promise<void>;
    addBannerImage: (url: string) => void;
    deleteBannerImage: (index: number) => void;
    updateBannerImage: (index: number, url: string) => void;
    updateTranslations: (newTranslations: typeof TRANSLATIONS) => void;
    updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
    addKnowledgeItem: (item: Omit<KnowledgeBaseItem, 'id'>) => Promise<void>;
    updateKnowledgeItem: (item: KnowledgeBaseItem) => Promise<void>;
    deleteKnowledgeItem: (id: string) => Promise<void>;
    getAIResponse: (question: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_PHONES = ['000000000', '00000000', '0597288408'];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [language, setLanguage] = useState<Language>(Language.AR);
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(true);
    const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [plan, setPlan] = useState<Plan>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
    const [bannerImages, setBannerImages] = useState<string[]>(BANNER_IMAGES);
    const [translations, setTranslations] = useState(TRANSLATIONS);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 4000);
    }, []);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                try {
                    const userDocRef = doc(db, "users", fbUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        let userData = userDoc.data() as User;
                        
                        // AUTO-UPGRADE TO ADMIN IF PHONE MATCHES
                        if (ADMIN_PHONES.includes(userData.phone) && userData.role !== UserRole.ADMIN) {
                            await updateDoc(userDocRef, { role: UserRole.ADMIN });
                            userData = { ...userData, role: UserRole.ADMIN };
                            console.log("User auto-upgraded to Admin:", userData.phone);
                        }

                        setCurrentUser(userData);
                        if (userData.goal) {
                            const today = format(new Date(), 'yyyy-MM-dd');
                            const userPlan = GOAL_PLANS[userData.goal] || GOAL_PLANS[Goal.MAINTENANCE];
                            setPlan({ [today]: userPlan });
                        }
                    }
                } catch (e) {
                    console.error("Auth User Sync Error:", e);
                }
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        // Listeners
        const unsubscribeMarket = onSnapshot(collection(db, "marketItems"), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[];
            setMarketItems(items.length > 0 ? items : MARKET_ITEMS);
        });
        const unsubscribeCoaches = onSnapshot(collection(db, "coaches"), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coach[];
            setCoaches(items.length > 0 ? items : COACHES);
        });
        const unsubscribeKB = onSnapshot(collection(db, "knowledgeBase"), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as KnowledgeBaseItem[];
            setKnowledgeBase(items.length > 0 ? items : DEFAULT_KNOWLEDGE_BASE);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeMarket();
            unsubscribeCoaches();
            unsubscribeKB();
        };
    }, []);

    useEffect(() => {
        if (!currentUser || currentUser.role !== UserRole.ADMIN) {
            setUsers([]);
            return;
        }
        const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
            setUsers(items);
        }, (error) => {
            if (error.code !== 'permission-denied') console.error("Admin Users Listener Error:", error);
        });
        return () => unsubscribeUsers();
    }, [currentUser]);

    const login = async (phone: string, password?: string) => {
        setIsLoading(true);
        try {
            const trimmedPhone = phone.trim();
            const email = `${trimmedPhone}@ny11.com`;
            const pass = password || "default123";
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            
            if (userDoc.exists()) {
                let userData = userDoc.data() as User;
                if (ADMIN_PHONES.includes(trimmedPhone) && userData.role !== UserRole.ADMIN) {
                    await updateDoc(doc(db, "users", userCredential.user.uid), { role: UserRole.ADMIN });
                    userData.role = UserRole.ADMIN;
                }
                setCurrentUser(userData);
                showToast(language === Language.AR ? "تم تسجيل الدخول بنجاح" : "Logged in successfully", "success");
                return true;
            }
            return false;
        } catch (error: any) {
            console.error("Login Error:", error.code, error.message);
            let msg = language === Language.AR ? "خطأ في تسجيل الدخول" : "Login error";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                msg = language === Language.AR 
                    ? "رقم الهاتف أو كلمة المرور غير صحيحة. يرجى التأكد من إنشاء الحساب أولاً بنفس البيانات." 
                    : "Invalid phone or password. Make sure you registered with these details.";
            }
            showToast(msg, "error");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'email'>, customPassword?: string) => {
        setIsLoading(true);
        try {
            const trimmedPhone = userData.phone.trim();
            const email = `${trimmedPhone}@ny11.com`;
            const password = customPassword || "default123";
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const isAdmin = ADMIN_PHONES.includes(trimmedPhone);
            
            const newUser: User = { 
                ...userData, 
                phone: trimmedPhone,
                id: userCredential.user.uid,
                email: email,
                role: isAdmin ? UserRole.ADMIN : UserRole.USER,
            };

            await setDoc(doc(db, "users", newUser.id), newUser);
            setCurrentUser(newUser);
            showToast(language === Language.AR ? "تم إنشاء الحساب بنجاح" : "Account created successfully", "success");
        } catch (error: any) {
            console.error("Register Error:", error.code, error.message);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') {
                msg = language === Language.AR ? "رقم الهاتف مسجل مسبقاً، يرجى تسجيل الدخول" : "Phone number already registered. Please login.";
            } else if (error.code === 'auth/weak-password') {
                msg = language === Language.AR ? "كلمة المرور ضعيفة جداً" : "Password is too weak.";
            }
            showToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
    };

    const loginAsGuest = () => {
        setCurrentUser({ id: 'guest', name: translations[language].guest, email: '', phone: '', role: UserRole.USER });
        setPlan({});
    };

    // Helper functions for Admin/Context updates
    const registerCoach = async (data: CoachOnboardingData) => {
        try {
            const email = data.email || `${data.phone}@ny11.com`;
            const userCredential = await createUserWithEmailAndPassword(auth, email, data.password || "coach123");
            const newUser: User = { id: userCredential.user.uid, name: data.name, email, phone: data.phone, role: UserRole.COACH, avatar: data.avatar };
            const newCoach: Coach = { id: userCredential.user.uid, name: data.name, specialty: data.specialty, bio: data.bio, experienceYears: parseInt(data.experienceYears, 10) || 0, clientsHelped: parseInt(data.clientsHelped, 10) || 0, avatar: data.avatar };
            await setDoc(doc(db, "users", newUser.id), newUser);
            await setDoc(doc(db, "coaches", newCoach.id), newCoach);
            showToast(`Coach ${data.name} registered.`, 'success');
        } catch (error: any) { showToast(error.message, 'error'); }
    };
    const updateCoach = async (id: string, data: CoachOnboardingData) => {
        try {
            await updateDoc(doc(db, "coaches", id), { name: data.name, specialty: data.specialty, bio: data.bio, experienceYears: parseInt(data.experienceYears, 10) || 0, clientsHelped: parseInt(data.clientsHelped, 10) || 0, avatar: data.avatar });
            await updateDoc(doc(db, "users", id), { name: data.name, phone: data.phone, avatar: data.avatar });
            showToast(`Coach updated.`, 'success');
        } catch (error: any) { showToast(error.message, 'error'); }
    };
    const addToCart = (itemId: string) => {
        const itemToAdd = cart.find(i => i.id === itemId);
        if (itemToAdd) setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
        else { const newItem = marketItems.find((i) => i.id === itemId); if(newItem) setCart([...cart, { ...newItem, quantity: 1 }]); }
    };
    const removeFromCart = (itemId: string) => setCart(cart.filter(item => item.id !== itemId));
    const addMarketItem = async (itemData: Omit<MarketItem, 'id'>) => { await addDoc(collection(db, "marketItems"), itemData); showToast('Item added.', 'success'); };
    const updateMarketItem = async (updatedItem: MarketItem) => { const { id, ...data } = updatedItem; await updateDoc(doc(db, "marketItems", id), data); showToast('Item updated.', 'success'); };
    const deleteMarketItem = async (itemId: string) => { await deleteDoc(doc(db, "marketItems", itemId)); showToast('Item deleted.', 'success'); };
    const addKnowledgeItem = async (item: Omit<KnowledgeBaseItem, 'id'>) => { await addDoc(collection(db, "knowledgeBase"), item); showToast('Q&A added.', 'success'); };
    const updateKnowledgeItem = async (updatedItem: KnowledgeBaseItem) => { const { id, ...data } = updatedItem; await updateDoc(doc(db, "knowledgeBase", id), data); showToast('Q&A updated.', 'success'); };
    const deleteKnowledgeItem = async (id: string) => { await deleteDoc(doc(db, "knowledgeBase", id)); showToast('Q&A deleted.', 'success'); };

    const getAIResponse = async (userQuestion: string): Promise<string> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const knowledgeContext = knowledgeBase.map(kb => `Question: ${kb.question}\nAnswer: ${kb.answer}\nKeywords: ${kb.keywords.join(', ')}`).join('\n---\n');
            const systemInstruction = `You are the NY11 AI Health & Nutrition Coach. NY11 KNOWLEDGE: ${knowledgeContext}. Prioritize this data. Match user language (AR/EN).`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: userQuestion, config: { systemInstruction, temperature: 0.7 } });
            return response.text || (language === Language.AR ? "عذراً، لم أستطع الرد حالياً." : "Sorry, I can't answer right now.");
        } catch (error) { return "Connection error."; }
    };

    const clearCart = () => setCart([]);
    const showNotification = useCallback((notification: Omit<Notification, 'id'>) => { const id = Date.now(); setNotifications(prev => [...prev, { id, ...notification }]); setTimeout(() => dismissNotification(id), 5000); }, []);
    const dismissNotification = (id: number) => setNotifications(current => current.filter(notif => notif.id !== id));
    const updatePlan = (newPlan: Plan) => setPlan(prevPlan => ({...prevPlan, ...newPlan}));
    const updateDailyPlan = (date: string, dailyPlan: DailyPlan) => setPlan(prevPlan => ({...prevPlan, [date]: dailyPlan}));

    const updateUserProfile = async (profileData: Partial<Omit<User, 'id' | 'role' | 'email'>>) => {
        if (!currentUser) return;
        try { await updateDoc(doc(db, "users", currentUser.id), profileData); setCurrentUser({ ...currentUser, ...profileData }); showToast("Profile updated", "success"); }
        catch (error: any) { showToast(error.message, "error"); }
    };

    const addBannerImage = (url: string) => setBannerImages(prev => [...prev, url]);
    const deleteBannerImage = (index: number) => setBannerImages(prev => prev.filter((_, i) => i !== index));
    const updateBannerImage = (index: number, url: string) => setBannerImages(prev => prev.map((img, i) => (i === index ? url : img)));
    const updateTranslations = (newTranslations: typeof TRANSLATIONS) => setTranslations(newTranslations);
    const updateSiteConfig = (newConfig: Partial<SiteConfig>) => setSiteConfig(prev => ({...prev, ...newConfig}));

    const updateQuoteStatus = (messageId: string, status: QuoteStatus, conversation: Message[], setConversation: React.Dispatch<React.SetStateAction<Message[]>>) => {
        const updatedConversation = conversation.map(msg => (msg.id === messageId && msg.quote) ? { ...msg, quote: { ...msg.quote, status } } : msg);
        setConversation([...updatedConversation, { id: `sys-${Date.now()}`, sender: MessageSender.SYSTEM, text: `Quote ${status}.`, timestamp: new Date().toISOString() }]);
        if (status === QuoteStatus.ACCEPTED) {
            setTimeout(() => {
                const newPlanData = GOAL_PLANS[Goal.MUSCLE_BUILD];
                const newPlan: Plan = { [format(new Date(), 'yyyy-MM-dd')]: newPlanData };
                setConversation(prev => [...prev, { id: `plan-${Date.now()}`, sender: MessageSender.COACH, text: 'Plan updated!', plan: newPlan, timestamp: new Date().toISOString() }]);
                updatePlan(newPlan);
                showNotification({ title: translations[language].planUpdatedTitle, body: translations[language].planUpdatedBody });
            }, 2000);
        }
    };

    return (
        <AppContext.Provider value={{
            currentUser, users, coaches, language, theme, cart, toasts, plan, notifications,
            isLanguageSelected, marketItems, bannerImages, siteConfig, translations, knowledgeBase, isLoading,
            login, loginAsGuest, logout, register, registerCoach, updateCoach, setLanguage, setIsLanguageSelected,
            setTheme, addToCart, removeFromCart, clearCart, showToast, updatePlan, updateDailyPlan,
            updateQuoteStatus, updateUserProfile, showNotification, dismissNotification, addMarketItem,
            updateMarketItem, deleteMarketItem, addBannerImage, deleteBannerImage, updateBannerImage,
            updateTranslations, updateSiteConfig, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem, getAIResponse
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};


import React, { useState, useRef, useEffect } from 'react';
import { Coach, Message, MessageSender, Quote, QuoteStatus } from '../types';
import { useAppContext } from '../context/AppContext';

const QuoteCard: React.FC<{ message: Message; onRespond: (status: QuoteStatus) => void }> = ({ message, onRespond }) => {
    const { quote } = message;
    const { language, translations } = useAppContext();
    const t = translations[language];
    if (!quote) return null;

    const isPending = quote.status === QuoteStatus.PENDING;

    return (
        <div className="bg-white dark:bg-dark-card border border-brand-green rounded-lg p-4 my-2 max-w-xs shadow-md">
            <h3 className="font-bold text-lg text-brand-green-dark dark:text-brand-green">{t.serviceQuote}</h3>
            <p className="text-gray-700 dark:text-gray-300 my-2">{quote.service}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${quote.amount.toFixed(2)}</p>
            {isPending ? (
                <div className="flex gap-2 mt-4">
                    <button onClick={() => onRespond(QuoteStatus.ACCEPTED)} className="flex-1 bg-brand-green text-brand-green-dark px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">{t.accept}</button>
                    <button onClick={() => onRespond(QuoteStatus.DECLINED)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">{t.decline}</button>
                </div>
            ) : (
                <p className={`mt-4 font-semibold text-center ${quote.status === QuoteStatus.ACCEPTED ? 'text-green-500' : 'text-red-500'}`}>
                    Quote {quote.status}
                </p>
            )}
        </div>
    );
};


const ChatView: React.FC<{ coach: Coach; onBack: () => void }> = ({ coach, onBack }) => {
    const { updateQuoteStatus, showToast, language, showNotification, translations } = useAppContext();
    const t = translations[language];
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: MessageSender.COACH, text: `Hello! I'm ${coach.name}. How can I help you achieve your health goals today?`, timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (input.trim() === '') return;
        
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            sender: MessageSender.USER,
            text: input,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Simulate coach response and sending a quote
        setTimeout(() => {
            const coachResponseText = "Based on your goals, I recommend a personalized nutrition and workout plan. I can create one for you. Here is the quote.";
            const coachResponse: Message = {
                id: `coach-${Date.now()}`,
                sender: MessageSender.COACH,
                text: coachResponseText,
                timestamp: new Date().toISOString(),
            };
            
            const quoteMessage: Message = {
                id: `quote-${Date.now()}`,
                sender: MessageSender.COACH,
                timestamp: new Date().toISOString(),
                quote: {
                    amount: 99.99,
                    service: "1-Month Personalized Plan",
                    status: QuoteStatus.PENDING,
                }
            };
            setMessages(prev => [...prev, coachResponse, quoteMessage]);
            showNotification({
                title: t.newMessageFrom.replace('{name}', coach.name),
                body: coachResponseText,
                icon: coach.name.charAt(0)
            });
        }, 1500);
    };

    const handleQuoteResponse = (messageId: string, status: QuoteStatus) => {
        updateQuoteStatus(messageId, status, messages, setMessages);
        if (status === QuoteStatus.ACCEPTED) {
            showToast('Quote accepted! Check your dashboard for the new plan soon.', 'success');
        } else {
            showToast('You have declined the quote.', 'error');
        }
    };

    return (
        <div 
            className="h-full flex flex-col overflow-y-auto bg-gray-100 dark:bg-dark-bg"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <header className="flex items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-dark-card sticky top-0 z-10 flex-shrink-0">
                <button onClick={onBack} className="mr-4"><i className="o-arrow-left"></i></button>
                <img src={coach.avatar} alt={coach.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <h2 className="font-bold text-lg dark:text-white">{coach.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{coach.specialty}</p>
                </div>
            </header>
            <main className="flex-1 p-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-4 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.sender === MessageSender.USER ? 'bg-brand-green text-brand-green-dark font-semibold rounded-br-none' : msg.sender === MessageSender.SYSTEM ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 w-full text-center' : 'bg-white dark:bg-dark-card text-gray-800 dark:text-white rounded-bl-none'}`}>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.quote && <QuoteCard message={msg} onRespond={(status) => handleQuoteResponse(msg.id, status)} />}
                         </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 bg-white dark:bg-dark-card border-t dark:border-gray-700 sticky bottom-0 z-10 flex-shrink-0">
                <div className="flex items-center">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={t.typeAMessage} className="flex-1 p-3 rounded-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                    <button onClick={handleSend} className="ml-3 bg-brand-green text-brand-green-dark rounded-full w-12 h-12 flex items-center justify-center hover:opacity-90 transition"><i className="o-paper-airplane transform rotate-45"></i></button>
                </div>
            </footer>
        </div>
    );
};

const CoachProfileView: React.FC<{ coach: Coach; onBack: () => void; onStartChat: () => void }> = ({ coach, onBack, onStartChat }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center text-gray-600 dark:text-gray-400 font-semibold mb-4 hover:text-brand-green">
                <i className="o-arrow-left mr-2"></i> {t.backToExperts}
            </button>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6 md:p-8 text-center">
                <img src={coach.avatar} alt={coach.name} className="w-32 h-32 rounded-full mb-4 border-4 border-brand-green-light mx-auto" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{coach.name}</h1>
                <p className="text-brand-green-dark dark:text-brand-green font-semibold text-lg mb-4">{coach.specialty}</p>
                
                <div className="flex justify-center gap-8 my-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{coach.experienceYears}+</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.yearsExp}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{coach.clientsHelped}+</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.clientsHelped}</p>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-left md:text-center max-w-2xl mx-auto my-6">{coach.bio}</p>

                <button onClick={onStartChat} className="w-full max-w-xs mx-auto bg-brand-green text-brand-green-dark px-8 py-3 rounded-full font-bold text-lg hover:opacity-90 transition-colors duration-300">
                    {t.startChat}
                </button>
            </div>
        </div>
    )
};

const CoachCard: React.FC<{ coach: Coach; onClick: () => void }> = ({ coach, onClick }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];

    return (
        <div onClick={onClick} className="flex-shrink-0 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <img src={coach.avatar} alt={coach.name} className="w-24 h-24 rounded-full mb-4 border-4 border-brand-green-light" />
            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{coach.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{coach.specialty}</p>
            <div className="mt-auto bg-brand-green text-brand-green-dark px-6 py-2 rounded-full font-semibold">
                {t.viewProfile}
            </div>
        </div>
    )
};

const BannerSlider: React.FC<{images: string[]}> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [images]);

    if (images.length === 0) {
        return <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden shadow-lg bg-gray-200 dark:bg-dark-card flex items-center justify-center"><p className="text-gray-500">No images available</p></div>;
    }

    return (
        <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden shadow-lg" dir="ltr">
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`Banner image ${index + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                    />
                ))}
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            currentIndex === index ? 'bg-white scale-110' : 'bg-white/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};


const ChatPage: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [isChatting, setIsChatting] = useState(false);
    const { language, coaches, currentUser, logout, showToast, bannerImages, translations } = useAppContext();
    const t = translations[language];

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    };

    const handleMouseLeaveOrUp = () => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = x - startXRef.current;
        if (Math.abs(walk) > 3) {
            hasDraggedRef.current = true;
        }
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleCoachClick = (coach: Coach) => {
        if (hasDraggedRef.current) {
            return;
        }
        setSelectedCoach(coach);
    };

    const handleStartChat = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        setIsChatting(true);
    };

    if (isChatting && selectedCoach) {
        return <ChatView coach={selectedCoach} onBack={() => setIsChatting(false)} />;
    }

    if (selectedCoach) {
        return <CoachProfileView coach={selectedCoach} onBack={() => setSelectedCoach(null)} onStartChat={handleStartChat} />;
    }

    return (
        <div className="animate-fade-in">
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
            <BannerSlider images={bannerImages} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.connectWithExpert}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">{t.connectWithExpertDesc}</p>
            
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 cursor-grab active:cursor-grabbing scrollbar-hide"
            >
                {coaches.map(coach => (
                     <CoachCard key={coach.id} coach={coach} onClick={() => handleCoachClick(coach)} />
                ))}
            </div>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t.whyAnExpert}</h2>
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                        {t.whyAnExpertDesc}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;


import React, { useState, useMemo } from 'react';
import { MarketItem, MarketCategory } from '../types';
import { useAppContext } from '../context/AppContext';

const CartModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, clearCart, showToast, language, translations } = useAppContext();
    const t = translations[language];

    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        showToast('Checkout successful!', 'success');
        clearCart();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-dark-card w-full max-w-md h-full shadow-2xl p-6 flex flex-col animate-slide-left transform transition-transform" 
                onClick={(e) => e.stopPropagation()}
                style={{animation: 'slideInRight 0.3s ease-out'}}
            >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <i className="o-shopping-bag"></i> {t.shoppingCart}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition"><i className="o-x-mark"></i></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="text-6xl mb-4">🛒</span>
                            <p>{t.cartIsEmpty}</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover mr-4" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 dark:text-white leading-tight mb-1">{item.name}</p>
                                    <p className="text-sm font-medium text-brand-green">${item.price.toFixed(2)} x {item.quantity}</p>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                    <i className="o-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="mt-8 pt-6 border-t dark:border-gray-800">
                        <div className="flex justify-between items-center font-black text-2xl mb-6 text-gray-900 dark:text-white">
                            <span>{t.total}</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button onClick={handleCheckout} className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-lg hover:shadow-glow hover:-translate-y-1 transition-all">{t.checkout}</button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};


const MarketItemCard: React.FC<{ item: MarketItem }> = ({ item }) => {
    const { addToCart, showToast, language, currentUser, logout, translations } = useAppContext();
    const t = translations[language];

    const handleAddToCart = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        addToCart(item.id);
        showToast(`${item.name} added to cart!`, 'success');
    };

    return (
        <div className="group bg-white dark:bg-dark-card rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-transparent hover:border-brand-green/30 animate-fade-in">
            <div className="relative h-56 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <button 
                    onClick={handleAddToCart}
                    className="absolute bottom-4 right-4 bg-brand-green text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform translate-y-20 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white hover:text-brand-green"
                >
                    <i className="o-plus text-xl font-bold"></i>
                </button>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                    <span className="font-black text-lg text-brand-green">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-1 rounded-md">
                        {item.category}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Market: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<MarketCategory>('all');
    const { cart, language, currentUser, logout, showToast, marketItems, translations } = useAppContext();
    const t = translations[language];

    const categories: { id: MarketCategory; label: string; icon: string }[] = [
        { id: 'all', label: t.all, icon: '✨' },
        { id: 'breakfast', label: t.cat_breakfast, icon: '🍳' },
        { id: 'lunch', label: t.cat_lunch, icon: '🍛' },
        { id: 'dinner', label: t.cat_dinner, icon: '🥗' },
        { id: 'snack', label: t.cat_snack, icon: '🥜' },
        { id: 'drink', label: t.cat_drink, icon: '🥤' },
    ];

    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return marketItems;
        return marketItems.filter(item => item.category === activeCategory);
    }, [activeCategory, marketItems]);

    const handleCartIconClick = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        setIsCartOpen(true);
    };

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                     <h1 className="text-4xl font-black italic text-gray-900 dark:text-white">{t.market}</h1>
                     <p className="text-gray-500 mt-2">Healthy meals & snacks delivered to your door.</p>
                </div>
               
                <button onClick={handleCartIconClick} className="relative bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm hover:shadow-md transition group">
                    <i className="o-shopping-cart text-2xl text-gray-700 dark:text-white group-hover:text-brand-green transition-colors"></i>
                    {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm border-2 border-gray-50 dark:border-dark-bg">{cart.reduce((total, item) => total + item.quantity, 0)}</span>}
                </button>
            </div>

            {/* Category Selector */}
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide gap-3 md:gap-4 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                            activeCategory === cat.id
                                ? 'bg-brand-green text-white shadow-glow scale-105'
                                : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
            
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map(item => (
                        <MarketItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                    <span className="text-6xl mb-4">🍽️</span>
                    <p className="text-xl font-medium">No items found in this category.</p>
                </div>
            )}

            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default Market;

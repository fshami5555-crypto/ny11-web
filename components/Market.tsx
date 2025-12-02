

import React, { useState } from 'react';
import { MarketItem } from '../types';
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.shoppingCart}</h2>
                    <button onClick={onClose}><i className="o-x-mark text-2xl"></i></button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">{t.cartIsEmpty}</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                    <i className="o-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="p-4 border-t dark:border-gray-700">
                        <div className="flex justify-between items-center font-bold text-lg mb-4 text-gray-800 dark:text-white">
                            <span>{t.total}</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button onClick={handleCheckout} className="w-full bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{t.checkout}</button>
                    </div>
                )}
            </div>
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
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden animate-slide-up">
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 h-10">{item.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-xl text-brand-green">${item.price.toFixed(2)}</span>
                    <button onClick={handleAddToCart} className="bg-brand-green-light text-brand-green-dark font-bold px-4 py-2 rounded-full hover:bg-brand-green transition">{t.add}</button>
                </div>
            </div>
        </div>
    );
};

const Market: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart, language, currentUser, logout, showToast, marketItems, translations } = useAppContext();
    const t = translations[language];

    const handleCartIconClick = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        setIsCartOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.market}</h1>
                <button onClick={handleCartIconClick} className="relative p-2">
                    <i className="o-shopping-cart text-2xl text-gray-700 dark:text-gray-300"></i>
                    {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.reduce((total, item) => total + item.quantity, 0)}</span>}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketItems.map(item => (
                    <MarketItemCard key={item.id} item={item} />
                ))}
            </div>

            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default Market;
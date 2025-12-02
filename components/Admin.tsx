import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CoachOnboardingData, MarketItem, UserRole, Language } from '../types';

type AdminTab = 'accounts' | 'coaches' | 'store' | 'payments' | 'content' | 'roadmap';

const Admin: React.FC = () => {
    const { 
        logout, 
        users, 
        coaches, 
        registerCoach, 
        marketItems, 
        addMarketItem, 
        updateMarketItem,
        deleteMarketItem,
        language, 
        showToast,
        bannerImages,
        addBannerImage,
        deleteBannerImage,
        updateBannerImage,
        translations,
        updateTranslations
    } = useAppContext();
    
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<AdminTab>('accounts');
    
    // Removed email from newCoach state
    const [showAddCoachForm, setShowAddCoachForm] = useState(false);
    const [newCoach, setNewCoach] = useState<CoachOnboardingData>({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
    
    const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
    const [newItem, setNewItem] = useState<Omit<MarketItem, 'id'>>({ name: '', description: '', price: 0, image: '', category: 'meal' });

    const [newBannerUrl, setNewBannerUrl] = useState('');
    const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
    const [editingBannerUrl, setEditingBannerUrl] = useState('');
    const [enTranslations, setEnTranslations] = useState(JSON.stringify(translations.en, null, 2));
    const [arTranslations, setArTranslations] = useState(JSON.stringify(translations.ar, null, 2));

    useEffect(() => {
        setEnTranslations(JSON.stringify(translations.en, null, 2));
        setArTranslations(JSON.stringify(translations.ar, null, 2));
    }, [translations]);


    const handleCoachInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCoach({ ...newCoach, [e.target.name]: e.target.value });
    };

    const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItem({ ...newItem, [name]: name === 'price' ? parseFloat(value) : value });
    };

    const handleAddCoach = (e: React.FormEvent) => {
        e.preventDefault();
        // Removed check for email
        if (Object.values({ ...newCoach, email: 'dummy' }).some(val => val === '')) {
            showToast('Please fill all coach fields.', 'error');
            return;
        }
        registerCoach(newCoach);
        setNewCoach({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
        setShowAddCoachForm(false);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.description || newItem.price <= 0 || !newItem.image) {
            showToast('Please fill all item fields correctly.', 'error');
            return;
        }
        addMarketItem(newItem);
        setNewItem({ name: '', description: '', price: 0, image: '', category: 'meal' });
    };
    
    const handleUpdateItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        updateMarketItem({ ...newItem, id: editingItem.id });
        setEditingItem(null);
        setNewItem({ name: '', description: '', price: 0, image: '', category: 'meal' });
    };

    const handleEditItemClick = (item: MarketItem) => {
        setEditingItem(item);
        setNewItem(item);
    };
    
    const handleCancelEdit = () => {
        setEditingItem(null);
        setNewItem({ name: '', description: '', price: 0, image: '', category: 'meal' });
    };

    const handleDeleteItem = (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            deleteMarketItem(itemId);
        }
    };
    
    const handleAddBannerImage = () => {
        if (newBannerUrl.trim() === '') {
            showToast('Please enter a valid image URL.', 'error');
            return;
        }
        addBannerImage(newBannerUrl);
        setNewBannerUrl('');
    };

    const handleEditBannerClick = (index: number, url: string) => {
        setEditingBannerIndex(index);
        setEditingBannerUrl(url);
    };

    const handleCancelBannerEdit = () => {
        setEditingBannerIndex(null);
        setEditingBannerUrl('');
    };

    const handleSaveBannerEdit = () => {
        if (editingBannerIndex === null) return;
        if (editingBannerUrl.trim() === '') {
            showToast('Please enter a valid image URL.', 'error');
            return;
        }
        updateBannerImage(editingBannerIndex, editingBannerUrl);
        handleCancelBannerEdit();
    };

    const handleSaveTranslations = () => {
        try {
            const parsedEn = JSON.parse(enTranslations);
            const parsedAr = JSON.parse(arTranslations);
            updateTranslations({ [Language.EN]: parsedEn, [Language.AR]: parsedAr });
        } catch (error) {
            showToast('Invalid JSON format. Please check your text.', 'error');
        }
    };

    const handlePrintRoadmap = () => {
        window.print();
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'accounts':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.users}</h3>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white dark:bg-dark-card">
                                        <tr>
                                            <th className="p-2 border-b dark:border-gray-700">{t.name}</th>
                                            {/* Changed Email to Phone */}
                                            <th className="p-2 border-b dark:border-gray-700">{t.whatsYourPhone}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.yourGoal}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(u => u.role === UserRole.USER && u.id !== 'guest').map(user => (
                                            <tr key={user.id}>
                                                <td className="p-2 border-b dark:border-gray-700">{user.name}</td>
                                                {/* Displaying Phone instead of Email */}
                                                <td className="p-2 border-b dark:border-gray-700">{user.phone}</td>
                                                <td className="p-2 border-b dark:border-gray-700 capitalize">{user.goal?.replace('_', ' ') || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.coaches}</h3>
                            <div className="max-h-96 overflow-y-auto">
                                 <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white dark:bg-dark-card">
                                        <tr>
                                            <th className="p-2 border-b dark:border-gray-700">{t.name}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.specialty}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.clients}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coaches.map(coach => (
                                            <tr key={coach.id}>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.name}</td>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.specialty}</td>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.clientsHelped}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'coaches':
                 return (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.existingCoaches}</h3>
                                <button onClick={() => setShowAddCoachForm(prev => !prev)} className="bg-brand-green text-brand-green-dark py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition">
                                    {showAddCoachForm ? t.close : t.addNewCoach}
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white dark:bg-dark-card">
                                        <tr>
                                            <th className="p-2 border-b dark:border-gray-700">{t.name}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.specialty}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.clients}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coaches.map(coach => (
                                            <tr key={coach.id}>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.name}</td>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.specialty}</td>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.clientsHelped}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                       
                       {showAddCoachForm && (
                           <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg animate-fade-in">
                               <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.addNewCoach}</h3>
                               <form onSubmit={handleAddCoach} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="text" name="name" value={newCoach.name} onChange={handleCoachInputChange} placeholder={t.name} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  {/* Removed Email Input */}
                                  <input type="text" name="phone" value={newCoach.phone} onChange={handleCoachInputChange} placeholder={t.phonePlaceholder} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="text" name="specialty" value={newCoach.specialty} onChange={handleCoachInputChange} placeholder={t.specialty} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="number" name="experienceYears" value={newCoach.experienceYears} onChange={handleCoachInputChange} placeholder={t.experience} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="number" name="clientsHelped" value={newCoach.clientsHelped} onChange={handleCoachInputChange} placeholder={t.clients} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="text" name="avatar" value={newCoach.avatar} onChange={handleCoachInputChange} placeholder={t.avatarUrl} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="password" name="password" value={newCoach.password} onChange={handleCoachInputChange} placeholder={t.password} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <textarea name="bio" value={newCoach.bio} onChange={handleCoachInputChange} placeholder={t.bio} className="md:col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <button type="submit" className="md:col-span-2 bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{t.addCoach}</button>
                               </form>
                           </div>
                       )}
                    </div>
                 );
            case 'store':
                 return (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.storeManagement}</h3>
                             <div className="max-h-[500px] overflow-y-auto space-y-3">
                                {marketItems.map(item => (
                                    <div key={item.id} className="flex items-center p-2 border rounded-lg dark:border-gray-700">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <button onClick={() => handleEditItemClick(item)} className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900">{t.edit}</button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-md text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900">{t.delete}</button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{editingItem ? t.edit : t.addNewItem}</h3>
                             <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                                <input type="text" name="name" value={newItem.name} onChange={handleItemInputChange} placeholder={t.itemName} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <textarea name="description" value={newItem.description} onChange={handleItemInputChange} placeholder={t.description} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="number" step="0.01" name="price" value={newItem.price} onChange={handleItemInputChange} placeholder={t.price} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="text" name="image" value={newItem.image} onChange={handleItemInputChange} placeholder={t.imageUrl} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <select name="category" value={newItem.category} onChange={handleItemInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option value="meal">{t.meal}</option>
                                    <option value="drink">{t.drink}</option>
                                </select>
                                <div className="flex flex-col space-y-2">
                                    <button type="submit" className="w-full bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{editingItem ? t.updateItem : t.addItem}</button>
                                    {editingItem && (
                                        <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t.cancel}</button>
                                    )}
                                </div>
                             </form>
                        </div>
                    </div>
                 );
             case 'payments':
                return (
                    <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg text-center animate-fade-in">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.paymentManagement}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t.paymentsInfo}</p>
                    </div>
                );
            case 'content':
                return (
                    <div className="animate-fade-in space-y-8">
                        {/* Banner Management */}
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.bannerImages}</h3>
                             <div className="flex gap-2 mb-4">
                                <input type="text" value={newBannerUrl} onChange={(e) => setNewBannerUrl(e.target.value)} placeholder={t.imageUrl} className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <button onClick={handleAddBannerImage} className="bg-brand-green text-brand-green-dark py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition">{t.add}</button>
                             </div>
                             <div className="space-y-2 max-h-60 overflow-y-auto">
                                {bannerImages.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg gap-4">
                                        <img src={url} alt={`Banner ${index}`} className="w-20 h-10 object-cover rounded-md flex-shrink-0" />
                                        
                                        {editingBannerIndex === index ? (
                                            <div className="flex-grow flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    value={editingBannerUrl} 
                                                    onChange={(e) => setEditingBannerUrl(e.target.value)} 
                                                    className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-600 text-sm"
                                                />
                                            </div>
                                        ) : (
                                            <span className="truncate text-sm flex-grow">{url}</span>
                                        )}

                                        <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
                                            {editingBannerIndex === index ? (
                                                <>
                                                    <button onClick={handleSaveBannerEdit} className="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900">{t.save}</button>
                                                    <button onClick={handleCancelBannerEdit} className="bg-gray-100 text-gray-600 dark:bg-gray-600/50 dark:text-gray-300 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">{t.cancel}</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditBannerClick(index, url)} className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900">{t.edit}</button>
                                                    <button onClick={() => deleteBannerImage(index)} className="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-md text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900">{t.delete}</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Text Content Management */}
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.textContentManagement}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold mb-2 block">{t.englishContent}</label>
                                    <textarea value={enTranslations} onChange={(e) => setEnTranslations(e.target.value)} rows={15} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 font-mono text-sm"></textarea>
                                </div>
                                <div>
                                    <label className="font-semibold mb-2 block">{t.arabicContent}</label>
                                    <textarea value={arTranslations} onChange={(e) => setArTranslations(e.target.value)} rows={15} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 font-mono text-sm" dir="rtl"></textarea>
                                </div>
                            </div>
                             <button onClick={handleSaveTranslations} className="mt-4 w-full bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{t.saveChanges}</button>
                        </div>
                    </div>
                );
            case 'roadmap':
                const roadmapSteps = [
                    { title: t.q1Title, desc: t.q1Desc, status: 'completed' },
                    { title: t.q2Title, desc: t.q2Desc, status: 'current' },
                    { title: t.q3Title, desc: t.q3Desc, status: 'upcoming' },
                    { title: t.q4Title, desc: t.q4Desc, status: 'upcoming' },
                ];

                return (
                    <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg animate-fade-in print:shadow-none print:p-0">
                        <style>{`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                #roadmap-content, #roadmap-content * {
                                    visibility: visible;
                                }
                                #roadmap-content {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                }
                                .no-print {
                                    display: none !important;
                                }
                            }
                        `}</style>
                        <div id="roadmap-content">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center">
                                     <h1 className="text-4xl font-black italic tracking-tighter text-brand-green-dark dark:text-brand-green mr-4">NY11</h1>
                                     <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t.roadmapTitle}</h2>
                                </div>
                                <button onClick={handlePrintRoadmap} className="no-print bg-brand-green text-brand-green-dark py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {t.exportPdf}
                                </button>
                            </div>

                            <div className="relative border-l-4 border-brand-green ml-4 space-y-10">
                                {roadmapSteps.map((step, index) => (
                                    <div key={index} className="mb-8 ml-6">
                                        <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4.5 ring-4 ring-white dark:ring-dark-card ${step.status === 'completed' ? 'bg-brand-green' : step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                            {step.status === 'completed' ? (
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                            ) : (
                                                 <div className="w-3 h-3 bg-white rounded-full"></div>
                                            )}
                                        </span>
                                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const TabButton: React.FC<{ tab: AdminTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === tab ? 'bg-brand-green text-brand-green-dark' : 'bg-gray-200 dark:bg-dark-card hover:bg-gray-300 dark:hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-gray-100 dark:bg-dark-bg min-h-screen text-gray-800 dark:text-white">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 no-print">
                <h1 className="text-4xl font-bold">{t.adminDashboard}</h1>
                <button onClick={logout} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition">
                    {t.logout}
                </button>
            </div>

            <div className="mb-6 flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 no-print">
                <TabButton tab="accounts" label={t.accountManagement} />
                <TabButton tab="coaches" label={t.coachManagement} />
                <TabButton tab="store" label={t.storeManagement} />
                <TabButton tab="payments" label={t.paymentManagement} />
                <TabButton tab="content" label={t.contentManagement} />
                <TabButton tab="roadmap" label={t.roadmap} />
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;
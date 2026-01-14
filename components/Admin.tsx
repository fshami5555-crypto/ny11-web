
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CoachOnboardingData, MarketItem, UserRole, Language, KnowledgeBaseItem } from '../types';

type AdminTab = 'accounts' | 'coaches' | 'homepage' | 'footer' | 'store' | 'ai-config';

const Admin: React.FC = () => {
    const { 
        logout, 
        users, 
        coaches, 
        registerCoach,
        updateCoach,
        marketItems, 
        addMarketItem, 
        updateMarketItem, 
        deleteMarketItem,
        language, 
        showToast,
        siteConfig,
        updateSiteConfig,
        translations,
        updateTranslations,
        knowledgeBase,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem
    } = useAppContext();
    
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<AdminTab>('accounts');
    
    // Coach State
    const [showAddCoachForm, setShowAddCoachForm] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
    const [newCoach, setNewCoach] = useState<CoachOnboardingData>({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
    
    // Store State
    const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
    const [newItem, setNewItem] = useState<Omit<MarketItem, 'id'>>({ 
        name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
        ingredients: '', caution: '',
        nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
    });

    // Text Management State
    const [heroTitleEn, setHeroTitleEn] = useState(translations.en.heroTitle);
    const [heroTitleAr, setHeroTitleAr] = useState(translations.ar.heroTitle);
    const [heroSubtitleEn, setHeroSubtitleEn] = useState(translations.en.heroSubtitle);
    const [heroSubtitleAr, setHeroSubtitleAr] = useState(translations.ar.heroSubtitle);
    const [heroImage, setHeroImage] = useState(siteConfig.heroImage);

    const [footerDescEn, setFooterDescEn] = useState(translations.en.footerDesc);
    const [footerDescAr, setFooterDescAr] = useState(translations.ar.footerDesc);
    const [footerCopyrightEn, setFooterCopyrightEn] = useState(translations.en.copyright);
    const [footerCopyrightAr, setFooterCopyrightAr] = useState(translations.ar.copyright);

    // AI Knowledge Base State
    const [editingKBItem, setEditingKBItem] = useState<KnowledgeBaseItem | null>(null);
    const [newKBItem, setNewKBItem] = useState({ question: '', answer: '', keywords: '' });

    const handleCoachInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCoach({ ...newCoach, [e.target.name]: e.target.value });
    };

    const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('nut-')) {
            const nutField = name.replace('nut-', '');
            setNewItem({
                ...newItem,
                nutrition: {
                    ...(newItem.nutrition || { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }),
                    [nutField]: value
                }
            });
        } else {
            setNewItem({ ...newItem, [name]: name === 'price' ? parseFloat(value) : value });
        }
    };

    const handleSaveCoach = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoach.name || !newCoach.phone || !newCoach.specialty) {
             showToast('Please fill all required coach fields.', 'error');
             return;
        }

        if (editingCoachId) {
            updateCoach(editingCoachId, newCoach);
            setEditingCoachId(null);
        } else {
            registerCoach(newCoach);
        }
        
        setNewCoach({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
        setShowAddCoachForm(false);
    };

    const handleEditCoachClick = (coach: any) => {
        const userDetails = users.find(u => u.id === coach.id);
        setNewCoach({
            name: coach.name,
            email: userDetails?.email || '',
            phone: userDetails?.phone || '',
            specialty: coach.specialty,
            bio: coach.bio,
            experienceYears: coach.experienceYears.toString(),
            clientsHelped: coach.clientsHelped.toString(),
            avatar: coach.avatar,
            password: '' 
        });
        setEditingCoachId(coach.id);
        setShowAddCoachForm(true);
    };

    const handleCancelCoachEdit = () => {
        setEditingCoachId(null);
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
        setNewItem({ 
            name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
            ingredients: '', caution: '',
            nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };
    
    const handleUpdateItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        updateMarketItem({ ...newItem, id: editingItem.id });
        setEditingItem(null);
        setNewItem({ 
            name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
            ingredients: '', caution: '',
            nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };

    const handleEditItemClick = (item: MarketItem) => {
        setEditingItem(item);
        setNewItem({
            ...item,
            nutrition: item.nutrition || { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };
    
    const handleCancelEdit = () => {
        setEditingItem(null);
        setNewItem({ 
            name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
            ingredients: '', caution: '',
            nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };

    const handleDeleteItem = (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            deleteMarketItem(itemId);
        }
    };
    
    const handleSaveHomePage = () => {
        const newTranslations = { ...translations };
        newTranslations.en.heroTitle = heroTitleEn;
        newTranslations.ar.heroTitle = heroTitleAr;
        newTranslations.en.heroSubtitle = heroSubtitleEn;
        newTranslations.ar.heroSubtitle = heroSubtitleAr;
        updateTranslations(newTranslations);
        updateSiteConfig({ heroImage });
    };

    const handleSaveFooter = () => {
        const newTranslations = { ...translations };
        newTranslations.en.footerDesc = footerDescEn;
        newTranslations.ar.footerDesc = footerDescAr;
        newTranslations.en.copyright = footerCopyrightEn;
        newTranslations.ar.copyright = footerCopyrightAr;
        updateTranslations(newTranslations);
    };

    const handleAddKBItem = () => {
        if(!newKBItem.question || !newKBItem.answer) {
            showToast('Please fill question and answer.', 'error');
            return;
        }
        addKnowledgeItem({
            question: newKBItem.question,
            answer: newKBItem.answer,
            keywords: newKBItem.keywords.split(',').map(k => k.trim()).filter(k => k)
        });
        setNewKBItem({ question: '', answer: '', keywords: '' });
    };

    const handleUpdateKBItem = () => {
        if(!editingKBItem || !newKBItem.question || !newKBItem.answer) return;
        updateKnowledgeItem({
            id: editingKBItem.id,
            question: newKBItem.question,
            answer: newKBItem.answer,
            keywords: newKBItem.keywords.split(',').map(k => k.trim()).filter(k => k)
        });
        setEditingKBItem(null);
        setNewKBItem({ question: '', answer: '', keywords: '' });
    };

    const handleEditKBClick = (item: KnowledgeBaseItem) => {
        setEditingKBItem(item);
        setNewKBItem({
            question: item.question,
            answer: item.answer,
            keywords: item.keywords.join(', ')
        });
    };

    const handleDeleteKBItem = (id: string) => {
        if (window.confirm('Delete this Q&A pair?')) {
            deleteKnowledgeItem(id);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'accounts':
                return (
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg animate-fade-in">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.users}</h3>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white dark:bg-dark-card">
                                    <tr>
                                        <th className="p-2 border-b dark:border-gray-700">{t.name}</th>
                                        <th className="p-2 border-b dark:border-gray-700">{t.whatsYourPhone}</th>
                                        <th className="p-2 border-b dark:border-gray-700">{t.yourGoal}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.role === UserRole.USER && u.id !== 'guest').map(user => (
                                        <tr key={user.id}>
                                            <td className="p-2 border-b dark:border-gray-700">{user.name}</td>
                                            <td className="p-2 border-b dark:border-gray-700">{user.phone}</td>
                                            <td className="p-2 border-b dark:border-gray-700 capitalize">{user.goal?.replace('_', ' ') || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'coaches':
                 return (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.existingCoaches}</h3>
                                <button onClick={() => { setEditingCoachId(null); setShowAddCoachForm(prev => !prev); }} className="bg-brand-green text-brand-green-dark py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition">
                                    {showAddCoachForm && !editingCoachId ? t.close : t.addNewCoach}
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white dark:bg-dark-card">
                                        <tr>
                                            <th className="p-2 border-b dark:border-gray-700">{t.name}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.specialty}</th>
                                            <th className="p-2 border-b dark:border-gray-700">{t.clients}</th>
                                            <th className="p-2 border-b dark:border-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coaches.map(coach => (
                                            <tr key={coach.id}>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.name}</td>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.specialty}</td>
                                                <td className="p-2 border-b dark:border-gray-700">{coach.clientsHelped}</td>
                                                <td className="p-2 border-b dark:border-gray-700">
                                                    <button onClick={() => handleEditCoachClick(coach)} className="text-blue-500 hover:text-blue-700 font-semibold">{t.edit}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                       
                       {showAddCoachForm && (
                           <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg animate-fade-in">
                               <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{editingCoachId ? t.editCoach : t.addNewCoach}</h3>
                               <form onSubmit={handleSaveCoach} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="text" name="name" value={newCoach.name} onChange={handleCoachInputChange} placeholder={t.name} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="text" name="phone" value={newCoach.phone} onChange={handleCoachInputChange} placeholder={t.phonePlaceholder} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="text" name="specialty" value={newCoach.specialty} onChange={handleCoachInputChange} placeholder={t.specialty} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="number" name="experienceYears" value={newCoach.experienceYears} onChange={handleCoachInputChange} placeholder={t.experience} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="number" name="clientsHelped" value={newCoach.clientsHelped} onChange={handleCoachInputChange} placeholder={t.clients} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="text" name="avatar" value={newCoach.avatar} onChange={handleCoachInputChange} placeholder={t.avatarUrl} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <input type="password" name="password" value={newCoach.password} onChange={handleCoachInputChange} placeholder={editingCoachId ? `${t.password} (Leave blank to keep)` : t.password} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <textarea name="bio" value={newCoach.bio} onChange={handleCoachInputChange} placeholder={t.bio} className="md:col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                  <div className="md:col-span-2 flex gap-4">
                                      <button type="submit" className="flex-1 bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{editingCoachId ? t.updateCoach : t.addCoach}</button>
                                      {editingCoachId && <button type="button" onClick={handleCancelCoachEdit} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">{t.cancel}</button>}
                                  </div>
                               </form>
                           </div>
                       )}
                    </div>
                 );
            case 'homepage':
                return (
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg animate-fade-in">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t.homePageManagement}</h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold mb-2">{t.manageHeroTitle} ({t.enText})</label>
                                    <input type="text" value={heroTitleEn} onChange={(e) => setHeroTitleEn(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">{t.manageHeroTitle} ({t.arText})</label>
                                    <input type="text" value={heroTitleAr} onChange={(e) => setHeroTitleAr(e.target.value)} dir="rtl" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold mb-2">{t.manageHeroSubtitle} ({t.enText})</label>
                                    <textarea value={heroSubtitleEn} onChange={(e) => setHeroSubtitleEn(e.target.value)} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">{t.manageHeroSubtitle} ({t.arText})</label>
                                    <textarea value={heroSubtitleAr} onChange={(e) => setHeroSubtitleAr(e.target.value)} rows={3} dir="rtl" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">{t.heroImage}</label>
                                <input type="text" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                {heroImage && <img src={heroImage} alt="Hero Preview" className="mt-4 h-48 w-full object-cover rounded-lg border dark:border-gray-600" />}
                            </div>

                            <button onClick={handleSaveHomePage} className="w-full bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{t.saveChanges}</button>
                        </div>
                    </div>
                );
            case 'footer':
                 return (
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg animate-fade-in">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t.footerManagement}</h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold mb-2">{t.manageFooterDesc} ({t.enText})</label>
                                    <textarea value={footerDescEn} onChange={(e) => setFooterDescEn(e.target.value)} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">{t.manageFooterDesc} ({t.arText})</label>
                                    <textarea value={footerDescAr} onChange={(e) => setFooterDescAr(e.target.value)} rows={3} dir="rtl" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold mb-2">{t.footerCopyright} ({t.enText})</label>
                                    <input type="text" value={footerCopyrightEn} onChange={(e) => setFooterCopyrightEn(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">{t.footerCopyright} ({t.arText})</label>
                                    <input type="text" value={footerCopyrightAr} onChange={(e) => setFooterCopyrightAr(e.target.value)} dir="rtl" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>

                            <button onClick={handleSaveFooter} className="w-full bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition">{t.saveChanges}</button>
                        </div>
                    </div>
                );
            case 'store':
                 return (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.storeManagement}</h3>
                             <div className="max-h-[800px] overflow-y-auto space-y-3">
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
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                             <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{editingItem ? t.edit : t.addNewItem}</h3>
                             <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" name="name" value={newItem.name} onChange={handleItemInputChange} placeholder={t.itemName} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                    <input type="text" name="summary" value={newItem.summary} onChange={handleItemInputChange} placeholder="Description Bubble (e.g., HIGH PROTEIN)" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                    <input type="number" step="0.01" name="price" value={newItem.price} onChange={handleItemInputChange} placeholder={t.price} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                    <input type="text" name="image" value={newItem.image} onChange={handleItemInputChange} placeholder={t.imageUrl} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                    <select name="category" value={newItem.category} onChange={handleItemInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                        <option value="meal">{t.meal}</option>
                                        <option value="drink">{t.drink}</option>
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                    </select>
                                </div>
                                
                                <textarea name="description" value={newItem.description} onChange={handleItemInputChange} placeholder={t.description} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <textarea name="ingredients" value={newItem.ingredients} onChange={handleItemInputChange} placeholder={t.ingredients} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                
                                <div className="border-t pt-6">
                                    <h4 className="font-bold mb-3">{t.nutritionFacts}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <input type="text" name="nut-servingSize" value={newItem.nutrition?.servingSize} onChange={handleItemInputChange} placeholder={t.servingSize} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-xs" />
                                        <input type="text" name="nut-energy" value={newItem.nutrition?.energy} onChange={handleItemInputChange} placeholder={t.energy} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-xs" />
                                        <input type="text" name="nut-protein" value={newItem.nutrition?.protein} onChange={handleItemInputChange} placeholder={t.protein} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-xs" />
                                        <input type="text" name="nut-carbs" value={newItem.nutrition?.carbs} onChange={handleItemInputChange} placeholder={t.carbohydrates} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-xs" />
                                        <input type="text" name="nut-fat" value={newItem.nutrition?.fat} onChange={handleItemInputChange} placeholder={t.fat} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-xs" />
                                    </div>
                                </div>

                                <textarea name="caution" value={newItem.caution} onChange={handleItemInputChange} placeholder={t.caution} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />

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
            case 'ai-config':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.existingQA}</h3>
                            <p className="text-sm text-gray-500 mb-6 italic">This information serves as the primary brain for the NY11 AI Coach.</p>
                            <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
                                {knowledgeBase.map(item => (
                                    <div key={item.id} className="p-4 border rounded-2xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-brand-green/30 transition-colors">
                                        <p className="font-black text-brand-green-dark dark:text-brand-green mb-1" dir="auto">{t.question}: {item.question}</p>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed" dir="auto">{t.answer}: {item.answer}</p>
                                        <div className="flex justify-between items-center text-[10px] mt-4 pt-2 border-t dark:border-gray-700">
                                            <span className="text-gray-500 font-bold uppercase tracking-widest truncate max-w-[200px]">Keywords: {item.keywords.join(', ')}</span>
                                            <div className="flex space-x-3 rtl:space-x-reverse">
                                                <button onClick={() => handleEditKBClick(item)} className="text-blue-500 hover:text-blue-700 font-bold uppercase">{t.edit}</button>
                                                <button onClick={() => handleDeleteKBItem(item.id)} className="text-red-500 hover:text-red-700 font-bold uppercase">{t.delete}</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{editingKBItem ? t.updateQA : t.addNewQA}</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t.question}</label>
                                    <input 
                                        type="text" 
                                        value={newKBItem.question} 
                                        onChange={(e) => setNewKBItem({...newKBItem, question: e.target.value})} 
                                        className="w-full p-4 rounded-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-brand-green outline-none transition" 
                                        dir="auto"
                                        placeholder="Enter the typical user question..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t.answer}</label>
                                    <textarea 
                                        value={newKBItem.answer} 
                                        onChange={(e) => setNewKBItem({...newKBItem, answer: e.target.value})} 
                                        rows={6} 
                                        className="w-full p-4 rounded-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-brand-green outline-none transition" 
                                        dir="auto"
                                        placeholder="How should the AI respond to this specific question?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t.keywords}</label>
                                    <input 
                                        type="text" 
                                        value={newKBItem.keywords} 
                                        onChange={(e) => setNewKBItem({...newKBItem, keywords: e.target.value})} 
                                        className="w-full p-4 rounded-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-brand-green outline-none transition" 
                                        placeholder="Separate, with, commas"
                                    />
                                    <p className="mt-2 text-[10px] text-gray-400 font-medium">Keywords help the AI find the right answer even if the question is worded differently.</p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                     <button onClick={editingKBItem ? handleUpdateKBItem : handleAddKBItem} className="flex-1 bg-brand-green text-white py-4 rounded-xl font-bold hover:shadow-glow transition-all">
                                        {editingKBItem ? t.updateQA : t.addQA}
                                    </button>
                                    {editingKBItem && (
                                        <button onClick={() => { setEditingKBItem(null); setNewKBItem({question: '', answer: '', keywords: ''}); }} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
                                            {t.cancel}
                                        </button>
                                    )}
                                </div>
                            </div>
                         </div>
                    </div>
                );
        }
    };

    const TabButton: React.FC<{ tab: AdminTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brand-green text-white shadow-glow-sm scale-105' : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-gray-50 dark:bg-dark-bg min-h-screen text-gray-800 dark:text-white">
            <div className="flex flex-wrap justify-between items-center mb-10 gap-4 no-print max-w-7xl mx-auto">
                <div>
                    <h1 className="text-4xl font-black italic text-brand-green">ADMIN <span className="text-gray-900 dark:text-white">PANEL</span></h1>
                    <p className="text-gray-500 font-medium mt-1">Management Console v1.2</p>
                </div>
                <button onClick={logout} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 hover:shadow-lg transition-all transform active:scale-95">
                    {t.logout}
                </button>
            </div>

            <div className="mb-10 flex space-x-3 rtl:space-x-reverse overflow-x-auto pb-4 no-print max-w-7xl mx-auto scrollbar-hide">
                <TabButton tab="accounts" label={t.users} />
                <TabButton tab="coaches" label={t.coaches} />
                <TabButton tab="ai-config" label={t.aiConfig} />
                <TabButton tab="homepage" label={t.home} />
                <TabButton tab="footer" label="Footer" />
                <TabButton tab="store" label={t.storeManagement} />
            </div>

            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;

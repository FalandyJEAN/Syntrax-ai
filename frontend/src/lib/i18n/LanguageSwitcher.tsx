'use client';

import { useTranslation } from './LanguageContext';
import { FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

const languageConfig = {
    en: { flag: '/flag-uk.png', label: 'English' },
    fr: { flag: '/flag-fr.png', label: 'Français' },
};

export default function LanguageSwitcher({ position = 'bottom' }: { position?: 'top' | 'bottom' }) {
    const { language, setLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const currentLang = languageConfig[language];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/50 transition-all text-sm font-medium text-white"
            >
                <img src={currentLang.flag} alt={currentLang.label} className="w-5 h-5 rounded object-cover" />
                <span className="hidden sm:inline">{currentLang.label}</span>
                <FiChevronDown size={14} className="opacity-60" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown menu - position based on prop */}
                    <div className={`absolute right-0 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden`}>
                        <button
                            onClick={() => {
                                setLanguage('en');
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-3 ${language === 'en' ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-zinc-300'
                                }`}
                        >
                            <img src={languageConfig.en.flag} alt="English" className="w-5 h-5 rounded object-cover" />
                            <span>{languageConfig.en.label}</span>
                        </button>
                        <button
                            onClick={() => {
                                setLanguage('fr');
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-3 ${language === 'fr' ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-zinc-300'
                                }`}
                        >
                            <img src={languageConfig.fr.flag} alt="Français" className="w-5 h-5 rounded object-cover" />
                            <span>{languageConfig.fr.label}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

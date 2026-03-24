'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { frTranslations } from './translations';

type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    // Load language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('syntrax-language') as Language;
        if (saved && (saved === 'en' || saved === 'fr')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('syntrax-language', lang);
        document.documentElement.lang = lang;
    };

    // Simple translation function
    const t = (text: string): string => {
        if (language === 'en') {
            return text;
        }
        // Return French translation if exists, otherwise return original
        return frTranslations[text] || text;
    };

    const value = {
        language,
        setLanguage,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return context;
}

// Hook for automatic translation
export function useTranslate(text: string): string {
    const { t } = useTranslation();
    return t(text);
}

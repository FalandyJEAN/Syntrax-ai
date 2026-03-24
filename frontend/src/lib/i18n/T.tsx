'use client';

import { useTranslate } from './LanguageContext';

interface TProps {
    children: string;
}

/**
 * Component wrapper for automatic translation
 * Usage: <T>Your English text here</T>
 */
export default function T({ children }: TProps) {
    const translated = useTranslate(children);
    return <>{translated}</>;
}

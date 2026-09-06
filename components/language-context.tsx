"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
    language: LanguageConfig;
    setLanguage: (langValue: string) => void;
}
interface LanguageConfig {
    value: string;
    label: string;
    targetLanguage: string;
    targetScriptCode: string;
}

export const LANGUAGES: LanguageConfig[] = [
    { value: "en", label: "English", targetLanguage: "en", targetScriptCode: "Latn" },
    { value: "hi", label: "हिन्दी", targetLanguage: "hi", targetScriptCode: "Deva" },
    { value: "mr", label: "मराठी", targetLanguage: "mr", targetScriptCode: "Deva" },
    { value: "gom", label: "कोंकणी", targetLanguage: "gom", targetScriptCode: "Deva" },
    { value: "gu", label: "ગુજરાતી", targetLanguage: "gu", targetScriptCode: "Gujr" },
    { value: "ta", label: "தமிழ்", targetLanguage: "ta", targetScriptCode: "Taml" },
    { value: "te", label: "తెలుగు", targetLanguage: "te", targetScriptCode: "Telu" },
    { value: "kn", label: "ಕನ್ನಡ", targetLanguage: "kn", targetScriptCode: "Knda" },
    { value: "ml", label: "മലയാളം", targetLanguage: "ml", targetScriptCode: "Mlym" },
    { value: "bn", label: "বাংলা", targetLanguage: "bn", targetScriptCode: "Beng" },
    { value: "pa", label: "ਪੰਜਾਬੀ", targetLanguage: "pa", targetScriptCode: "Guru" },
    { value: "or", label: "ଓଡ଼ିଆ", targetLanguage: "or", targetScriptCode: "Orya" },
    { value: "as", label: "অসমীয়া", targetLanguage: "as", targetScriptCode: "Beng" },
    { value: "sa", label: "संस्कृतम्", targetLanguage: "sa", targetScriptCode: "Deva" },
    { value: "ur", label: "اردو", targetLanguage: "ur", targetScriptCode: "Arab" },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageConfig>(LANGUAGES[0]);

    // Load from localStorage on mount if available
    useEffect(() => {
        const saved = localStorage.getItem("gati-dristi");
        if (saved) {
            const found = LANGUAGES.find((l) => l.value === saved);
            if (found) {
                setLanguageState(found);
            }
        }
    }, []);

    const setLanguage = (langValue: string) => {
        const found = LANGUAGES.find((l) => l.value === langValue);
        if (found) {
            setLanguageState(found);
            localStorage.setItem("gati-dristi", langValue);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

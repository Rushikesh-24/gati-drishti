"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type Language } from '@/lib/i18n/config';

type TranslationCache = Record<string, Record<string, string>>;

interface TranslationContextType {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [cache, setCache] = useState<TranslationCache>({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  const pendingQueue = useRef<Set<string>>(new Set());
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  const setLanguage = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    if (lang) {
      setCurrentLanguage(lang);
    }
  };

  const processQueue = useCallback(async () => {
    if (pendingQueue.current.size === 0 || currentLanguage.code === 'en') return;
    
    const textsToTranslate = Array.from(pendingQueue.current);
    pendingQueue.current.clear();
    setIsTranslating(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLanguage: currentLanguage.code,
          targetScriptCode: currentLanguage.script
        })
      });

      if (response.ok) {
        const data = await response.json();
        const translations = data.translations as string[];
        
        setCache(prev => {
          const newCache = { ...prev };
          if (!newCache[currentLanguage.code]) {
            newCache[currentLanguage.code] = {};
          }
          textsToTranslate.forEach((text, idx) => {
            newCache[currentLanguage.code][text] = translations[idx] || text;
          });
          return newCache;
        });
      }
    } catch (error) {
      console.error('Translation failed, falling back to English', error);
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage]);

  const t = useCallback((text: string): string => {
    if (currentLanguage.code === 'en') return text;
    
    const langCache = cache[currentLanguage.code];
    if (langCache && langCache[text]) {
      return langCache[text];
    }

    if (!pendingQueue.current.has(text)) {
      pendingQueue.current.add(text);
      if (batchTimeout.current) clearTimeout(batchTimeout.current);
      batchTimeout.current = setTimeout(() => {
        processQueue();
      }, 50); // 50ms batching window
    }

    // Return english fallback while translating
    return text;
  }, [currentLanguage, cache, processQueue]);

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, t, isTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

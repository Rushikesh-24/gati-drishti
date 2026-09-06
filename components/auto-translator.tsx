"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./language-context";

interface TranslationCache {
    [lang: string]: {
        [englishText: string]: string;
    };
}

const IGNORE_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const BATCH_SIZE = 50; // max texts to translate in one API call
const DEBOUNCE_MS = 250;

export function AutoTranslator() {
    const { language } = useLanguage();
    const observerRef = useRef<MutationObserver | null>(null);

    // Pending nodes waiting for translation
    const pendingNodesRef = useRef<Set<Text>>(new Set());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load cache from localStorage
    const getCache = (): TranslationCache => {
        try {
            const data = localStorage.getItem("bhashini-translations");
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    };

    const saveCache = (cache: TranslationCache) => {
        try {
            localStorage.setItem("bhashini-translations", JSON.stringify(cache));
        } catch (e) {
            console.warn("Could not save translations to cache", e);
        }
    };

    const isValidTextNode = (node: Text): boolean => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyNode = node as any;

        // Validate against original English text if available
        const text = (anyNode.__originalTrimmed ?? node.nodeValue?.trim() ?? "");
        if (!text || text.length < 2) return false;

        // Ignore if it doesn't contain any letters (Unicode aware)
        if (!/\p{L}/u.test(text)) return false;

        let parent = node.parentNode as HTMLElement | null;
        while (parent) {
            if (IGNORE_TAGS.has(parent.tagName)) return false;
            if (parent.getAttribute?.("translate") === "no" || parent.classList?.contains("no-translate")) return false;
            parent = parent.parentNode as HTMLElement | null;
        }
        return true;
    };

    const traverseAndProcess = (root: Node, langValue: string) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        let node;
        const cache = getCache();
        const langCache = cache[langValue] || {};

        while ((node = walker.nextNode())) {
            const textNode = node as Text;
            if (isValidTextNode(textNode)) {
                processTextNode(textNode, langValue, langCache);
            }
        }

        // Trigger flush if any pending nodes
        if (pendingNodesRef.current.size > 0) {
            scheduleBatchProcess();
        }
    };

    const processTextNode = (node: Text, langValue: string, langCache: Record<string, string>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyNode = node as any;
        if (anyNode.__originalText === undefined) {
            anyNode.__originalText = node.nodeValue || "";
            anyNode.__originalTrimmed = node.nodeValue?.trim() || "";
        }

        const original = anyNode.__originalText;
        const originalTrimmed = anyNode.__originalTrimmed;

        if (langValue === "en") {
            // Revert to exact original
            if (node.nodeValue !== original) {
                node.nodeValue = original;
            }
            pendingNodesRef.current.delete(node);
            return;
        }

        if (langCache[originalTrimmed]) {
            // Use cached translation and preserve leading/trailing whitespace
            const translated = langCache[originalTrimmed];
            const leadingSpace = original.match(/^\s*/)?.[0] || "";
            const trailingSpace = original.match(/\s*$/)?.[0] || "";
            const fullTranslated = leadingSpace + translated + trailingSpace;

            if (node.nodeValue !== fullTranslated) {
                node.nodeValue = fullTranslated;
            }
            pendingNodesRef.current.delete(node);
        } else {
            // Needs translation
            pendingNodesRef.current.add(node);
        }
    };

    const scheduleBatchProcess = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            flushPendingNodes();
        }, DEBOUNCE_MS);
    };

    const flushPendingNodes = async () => {
        if (pendingNodesRef.current.size === 0 || language.value === "en") return;

        // Snapshot nodes to translate
        const nodesToTranslate = Array.from(pendingNodesRef.current);
        pendingNodesRef.current.clear();

        // Deduplicate texts
        const textToNodes = new Map<string, Text[]>();
        for (const node of nodesToTranslate) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const originalTrimmed = (node as any).__originalTrimmed;
            if (!textToNodes.has(originalTrimmed)) {
                textToNodes.set(originalTrimmed, []);
            }
            textToNodes.get(originalTrimmed)?.push(node);
        }

        const uniqueTexts = Array.from(textToNodes.keys());
        if (uniqueTexts.length === 0) return;
        
        document.body.classList.add("translating");

        // Process in batches
        for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
            const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
            try {
                const response = await fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        texts: batch,
                        targetLanguage: language.targetLanguage,
                        targetScriptCode: language.targetScriptCode,
                    }),
                });

                if (response.ok) {
                    const { translatedTexts } = await response.json();

                    if (translatedTexts && translatedTexts.length === batch.length) {
                        const cache = getCache();
                        if (!cache[language.value]) cache[language.value] = {};

                        batch.forEach((text, index) => {
                            const translated = translatedTexts[index];
                            cache[language.value][text] = translated;

                            // Update all nodes for this text
                            const nodes = textToNodes.get(text) || [];
                            nodes.forEach((node) => {
                                if (document.contains(node)) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const original = (node as any).__originalText;
                                    const leadingSpace = original.match(/^\s*/)?.[0] || "";
                                    const trailingSpace = original.match(/\s*$/)?.[0] || "";
                                    node.nodeValue = leadingSpace + translated + trailingSpace;
                                }
                            });
                        });

                        saveCache(cache);
                    }
                }
            } catch (err) {
                console.error("Batch translation failed", err);
            }
        }
        
        document.body.classList.remove("translating");
    };

    useEffect(() => {
        // Traverse existing DOM on language change
        traverseAndProcess(document.body, language.value);

        // Set up MutationObserver to catch new elements
        const observer = new MutationObserver((mutations) => {
            const cache = getCache();
            const langCache = cache[language.value] || {};
            let hasNewNodes = false;

            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            if (isValidTextNode(node as Text)) {
                                processTextNode(node as Text, language.value, langCache);
                                hasNewNodes = true;
                            }
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
                            let childText;
                            while ((childText = walker.nextNode())) {
                                const tn = childText as Text;
                                if (isValidTextNode(tn)) {
                                    processTextNode(tn, language.value, langCache);
                                    hasNewNodes = true;
                                }
                            }
                        }
                    });
                }
            });

            if (hasNewNodes) {
                scheduleBatchProcess();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        observerRef.current = observer;

        return () => {
            observer.disconnect();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [language]);

    return null; // This component does not render anything
}

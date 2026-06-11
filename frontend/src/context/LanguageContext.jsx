import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../constants/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("lang") || "vi";
  });

  const changeLanguage = (lang) => {
    if (lang === "en" || lang === "vi") {
      setLanguage(lang);
      localStorage.setItem("lang", lang);
    }
  };

  const t = (pathKey) => {
    const keys = pathKey.split(".");
    let current = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if not found in current language
        let enFallback = translations["en"];
        for (const k of keys) {
          if (enFallback && enFallback[k] !== undefined) {
            enFallback = enFallback[k];
          } else {
            enFallback = null;
            break;
          }
        }
        return enFallback || pathKey;
      }
    }
    return typeof current === "string" ? current : pathKey;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

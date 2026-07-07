import React, { useState, useEffect } from "react";
import { 
  Languages, Globe, Sparkles, BookOpen, CheckCircle, 
  AlertCircle, ChevronRight, HelpCircle, Save
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

// Mock AI Translation database dictionary for demo
const TRANSLATION_MOCK = {
  gu: {
    title: "સ્કેલ માટે ડિઝાઇનિંગ",
    description: "ઉચ્ચ સ્થિતિસ્થાપક વેબ એપ્લિકેશન્સ બનાવવા માટે એક વ્યવહારુ માર્ગદર્શિકા. આ પુસ્તક અદ્યતન ફ્રેમવર્ક લેઆઉટ, સ્પેસિંગ ગ્રીડ અને ડાયનેમિક સ્ટેટ સ્ટ્રક્ચર્સને આવરી લે છે."
  },
  hi: {
    title: "स्केल के लिए डिज़ाइनिंग",
    description: "अत्यधिक लचीला वेब एप्लिकेशन बनाने के लिए एक व्यावहारिक गाइड। यह पुस्तक उन्नत फ्रेमवर्क लेआउट, स्पेसिंग ग्रिड और गतिशील स्थिति संरचनाओं को शामिल करती है।"
  },
  es: {
    title: "Diseño para Escalar",
    description: "Una guía práctica para crear aplicaciones web altamente resilientes. Este libro cubre diseños de frameworks avanzados, cuadrículas de espaciado y estructuras de estado dinámicas."
  },
  fr: {
    title: "Conception pour la Mise à l'Échelle",
    description: "Un guide pratique pour créer des applications web hautement résilientes. Ce livre couvre les mises en page de frameworks avancés, les grilles d'espacement et les structures d'état dynamiques."
  },
  ja: {
    title: "スケール向け設計ガイド",
    description: "非常に復元力の高いWebアプリケーションを構築するための実用的なガイド。この本では、高度なフレームワークレイアウト、間隔グリッド、および動的状態構造について説明します。"
  }
};

const LANGUAGES_LIST = [
  { code: "en", name: "English", native: "English", status: "Active (Default)" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", status: "Draft available" },
  { code: "hi", name: "Hindi", native: "हिन्दी", status: "Draft available" },
  { code: "es", name: "Spanish", native: "Español", status: "Not translated" },
  { code: "fr", name: "French", native: "Français", status: "Not translated" },
  { code: "ja", name: "Japanese", native: "日本語", status: "Not translated" }
];

export const MultiLanguage = ({ books = [] }) => {
  const [selectedBookId, setSelectedBookId] = useState("");
  const [targetLang, setTargetLang] = useState("gu");
  
  // Translation values
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceDesc, setSourceDesc] = useState("");
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDesc, setTranslatedDesc] = useState("");

  const [translating, setTranslating] = useState(false);
  const [activeTranslations, setActiveTranslations] = useState(["en"]);

  // Set default book selection
  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  const selectedBook = books.find(b => b.id === selectedBookId);

  // Load book details
  useEffect(() => {
    if (selectedBook) {
      setSourceTitle(selectedBook.title);
      setSourceDesc(selectedBook.description || "");
      // Clear target translation initially
      setTranslatedTitle("");
      setTranslatedDesc("");
    }
  }, [selectedBookId]);

  // Trigger simulated translation
  const handleAiTranslate = () => {
    if (!selectedBook) return;
    setTranslating(true);
    const toastId = toast.loading(`AI Translating into ${LANGUAGES_LIST.find(l => l.code === targetLang)?.name}...`);

    setTimeout(() => {
      const mockResult = TRANSLATION_MOCK[targetLang] || {
        title: `${selectedBook.title} [${targetLang.toUpperCase()}]`,
        description: `[Translated] ${selectedBook.description || ""}`
      };
      
      setTranslatedTitle(mockResult.title);
      setTranslatedDesc(mockResult.description);
      setTranslating(false);
      
      // Add translated lang code to active list
      if (!activeTranslations.includes(targetLang)) {
        setActiveTranslations([...activeTranslations, targetLang]);
      }
      
      toast.success("AI Translation Completed! 🌍✨", { id: toastId });
    }, 2000);
  };

  const handleSaveTranslation = () => {
    toast.success("Localized translations saved to database! 💾");
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-brand-text">Multi-Language & Localization</h1>
          <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
            Localize your eBook for global readers. Add translations in regional languages and trigger AI translations.
          </p>
        </div>

        {/* Selected Book Dropdown */}
        <div className="flex items-center gap-2 select-none">
          <BookOpen className="h-4 w-4 text-brand-accent shrink-0" />
          <select 
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="bg-brand-card border border-brand-border px-3 py-1.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-brand-border rounded-[20px] bg-brand-card p-6 select-none font-display">
          <AlertCircle className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-3" />
          <h3 className="text-sm font-bold text-brand-text">No Books Available</h3>
          <p className="text-xs text-brand-text-secondary mt-1">Please create an eBook project first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
          
          {/* Main workspace */}
          <div className="lg:col-span-2 flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm">
            
            <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
              <span className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-brand-accent animate-pulse" /> AI Translation Engine
              </span>
              
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-brand-text-secondary">Translate to:</span>
                <select 
                  value={targetLang}
                  onChange={(e) => {
                    setTargetLang(e.target.value);
                    setTranslatedTitle("");
                    setTranslatedDesc("");
                  }}
                  className="bg-brand-bg border border-brand-border px-3 py-1 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                >
                  {LANGUAGES_LIST.filter(l => l.code !== "en").map(l => (
                    <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
                  ))}
                </select>
                <Button 
                  onClick={handleAiTranslate} 
                  disabled={translating}
                  variant="primary" 
                  size="sm" 
                  className="h-8 rounded-full text-[11px] font-bold px-3.5"
                >
                  {translating ? (
                    <>
                      <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" /> Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3.5 w-3.5" /> AI Translate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Translation inputs side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              
              {/* English (Source) */}
              <div className="flex flex-col gap-4 p-4 border border-brand-border bg-brand-bg-secondary/20 rounded-[18px]">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-[11px] font-bold text-brand-text uppercase tracking-wider font-mono flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-brand-text-secondary" /> English (Source)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-brand-success/15 text-brand-success rounded-full uppercase">Source</span>
                </div>
                
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">eBook Title</label>
                  <p className="text-xs font-bold text-brand-text border border-transparent p-2.5 bg-brand-bg/40 rounded-lg">{sourceTitle}</p>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Description</label>
                  <p className="text-xs font-medium text-brand-text leading-relaxed p-2.5 bg-brand-bg/40 border border-transparent rounded-lg min-h-[120px]">{sourceDesc}</p>
                </div>
              </div>

              {/* Target language */}
              <div className="flex flex-col gap-4 p-4 border border-brand-border bg-brand-bg-secondary/25 rounded-[18px] relative">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider font-mono flex items-center gap-1">
                    <Languages className="h-3.5 w-3.5" /> {LANGUAGES_LIST.find(l => l.code === targetLang)?.name}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-brand-accent/15 text-brand-accent rounded-full uppercase">Localization</span>
                </div>
                
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Translated Title</label>
                  <input 
                    type="text" 
                    value={translatedTitle}
                    onChange={(e) => setTranslatedTitle(e.target.value)}
                    placeholder="Localization Title"
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Translated Description</label>
                  <textarea 
                    rows={6}
                    value={translatedDesc}
                    onChange={(e) => setTranslatedDesc(e.target.value)}
                    placeholder="Localization Description details"
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-accent text-brand-text leading-relaxed min-h-[120px] placeholder:text-brand-text-secondary/30"
                  />
                </div>

                {/* Translation state loading card */}
                {translating && (
                  <div className="absolute inset-0 bg-brand-card/85 backdrop-blur-sm rounded-[18px] flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="h-7 w-7 text-brand-accent animate-spin" />
                    <span className="text-xs font-bold text-brand-text">AI Localization in progress...</span>
                  </div>
                )}
              </div>

            </div>

            <Button onClick={handleSaveTranslation} variant="primary" className="rounded-full text-xs font-bold h-11 w-full sm:w-fit px-6 shadow-sm mt-2">
              Save Localization Details
            </Button>

          </div>

          {/* Languages directory list */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 flex flex-col gap-4 shadow-sm select-none">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-accent" /> Active Languages
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {LANGUAGES_LIST.map((lang) => {
                const isActive = activeTranslations.includes(lang.code);
                return (
                  <div key={lang.code} className="p-3 bg-brand-bg-secondary border border-brand-border rounded-[14px] flex items-center justify-between gap-2 text-left">
                    <div>
                      <p className="text-xs font-bold text-brand-text">{lang.name} ({lang.native})</p>
                      <p className={`text-[9px] font-mono mt-0.5 font-bold uppercase tracking-wider ${
                        isActive ? "text-brand-success" : "text-brand-text-secondary/70"
                      }`}>
                        {isActive ? "Active (Ready)" : "Not active"}
                      </p>
                    </div>
                    {isActive ? (
                      <CheckCircle className="h-4 w-4 text-brand-success shrink-0" />
                    ) : (
                      <button 
                        onClick={() => {
                          setTargetLang(lang.code);
                          toast.success(`Switched target language to ${lang.name}`);
                        }}
                        className="text-[10px] text-brand-accent font-bold hover:underline cursor-pointer"
                      >
                        Localize
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-brand-accent/5 border border-brand-accent/10 rounded-[16px] text-left">
              <span className="text-[10px] font-bold text-brand-accent flex items-center gap-1 uppercase tracking-widest font-mono">
                <HelpCircle className="h-3.5 w-3.5" /> Localization Info
              </span>
              <p className="text-[10px] text-brand-text-secondary mt-1 font-semibold leading-relaxed">
                Active languages will show as a translation dropdown choice on the reader details and marketplace catalog.
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
export default MultiLanguage;

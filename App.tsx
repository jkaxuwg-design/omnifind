import React, { useState, useEffect, useRef } from 'react';
import { DivinationInput, DivinationResult, Direction, Language, HistoryItem, AiInsightResult } from './types';
import { calculateDivination } from './services/divinationEngine';
import { storageProvider } from './services/storageEngine';
import { GoogleGenAI } from "@google/genai";

const translations = {
  zh: {
    title: '都能找',
    itemName: '丢了什么？',
    lostLoc: '在哪丢的？',
    lostLocPlaceholder: '比如：卧室、出租车、公园...',
    direction: '大概方位 (选填)',
    timeNow: '刚刚',
    timeHour: '1小时前',
    time12h: '半天前',
    timeEarlier: '自定义',
    timeUnsure: '忘了',
    unsure: '不清楚',
    start: '开始感应',
    liuyaoTitle: '六爻感应',
    clickToToss: '点击硬币 · 获取线索',
    quickCast: '一键获取',
    modeManual: '手动模式',
    modeQuick: '快速模式',
    tossing: '正在感应...',
    analyzing: '大师正在分析...',
    summaryTitle: '寻找建议',
    locAnalysis: '环境特征',
    meihua: '卦象分析',
    liuyao: '变爻指引',
    xlr: '当前时运',
    aiInsight: 'AI 大师点评',
    retry: '再算一次',
    markFound: '我找到了',
    markedFound: '已找回',
    feedbackThanks: '太棒了！数据已回传，帮助模型进化。',
    historyTitle: '历史记录',
    confirm: '确认',
    itemState: '找回概率',
    foundLocations: '推荐搜寻地点',
    directions: {
      NORTH: '正北', SOUTH: '正南', EAST: '正东', WEST: '正西',
      NORTHEAST: '东北', NORTHWEST: '西北', SOUTHEAST: '东南', SOUTHWEST: '西南',
      CENTER: '中间', UNKNOWN: '不清楚'
    },
    footer: '万物皆有迹 · 乾坤入袖中',
    error: '请告诉我是什么东西丢了',
    aiNetError: '大师正在休息，请稍后再试。',
    missingKey: '未配置 API Key',
    landing: {
      slogan: '传统易学与人工智能的完美融合',
      desc: '结合梅花易数、六爻预测与 AI 推理，为您提供专业的寻物指引。',
      enter: '开始寻物',
      features: [
        { title: '方位指引', text: '五行生克定方位' },
        { title: '状态分析', text: '动爻揭示物品状态' },
        { title: 'AI 参谋', text: '大模型辅助推理' }
      ]
    }
  },
  tw: {
    title: '都能找',
    itemName: '丟了什麼？',
    lostLoc: '在哪丟的？',
    lostLocPlaceholder: '比如：臥室、出租車、公園...',
    direction: '大概方位 (選填)',
    timeNow: '剛剛',
    timeHour: '1小時前',
    time12h: '半天前',
    timeEarlier: '自定義',
    timeUnsure: '忘了',
    unsure: '不清楚',
    start: '開始感應',
    liuyaoTitle: '六爻感應',
    clickToToss: '點擊硬幣 · 獲取線索',
    quickCast: '一鍵獲取',
    modeManual: '手動模式',
    modeQuick: '快速模式',
    tossing: '正在感應...',
    analyzing: '大師正在分析...',
    summaryTitle: '尋找建議',
    locAnalysis: '環境特徵',
    meihua: '卦象分析',
    liuyao: '變爻指引',
    xlr: '當前時運',
    aiInsight: 'AI 大師點評',
    retry: '再算一次',
    markFound: '我找到了',
    markedFound: '已找回',
    feedbackThanks: '太棒了！數據已回傳，幫助模型進化。',
    historyTitle: '歷史記錄',
    confirm: '確認',
    itemState: '找回概率',
    foundLocations: '推薦搜尋地點',
    directions: {
      NORTH: '正北', SOUTH: '正南', EAST: '正東', WEST: '正西',
      NORTHEAST: '東北', NORTHWEST: '西北', SOUTHEAST: '東南', SOUTHWEST: '西南',
      CENTER: '中間', UNKNOWN: '不清楚'
    },
    footer: '萬物皆有跡 · 乾坤入袖中',
    error: '請告訴我是什麼東西丟了',
    aiNetError: '大師正在休息，請稍後再試。',
    missingKey: '未配置 API Key',
    landing: {
      slogan: '傳統易學與人工智能的完美融合',
      desc: '結合梅花易數、六爻預測與 AI 推理，為您提供專業的尋物指引。',
      enter: '開始尋物',
      features: [
        { title: '方位指引', text: '五行生克定方位' },
        { title: '狀態分析', text: '動爻揭示物品狀態' },
        { title: 'AI 參謀', text: '大模型輔助推理' }
      ]
    }
  },
  en: {
    title: 'OmniFind',
    itemName: 'What did you lose?',
    lostLoc: 'Where was it?',
    lostLocPlaceholder: 'e.g., Bedroom, Taxi, Park...',
    direction: 'Rough Direction (Optional)',
    timeNow: 'Just now',
    timeHour: '1h ago',
    time12h: '12h ago',
    timeEarlier: 'Custom',
    timeUnsure: 'Unsure',
    unsure: 'Unsure',
    start: 'START SCAN',
    liuyaoTitle: 'Coin Toss',
    clickToToss: 'TAP TO TOSS',
    quickCast: 'QUICK SCAN',
    modeManual: 'Manual',
    modeQuick: 'Quick',
    tossing: 'Sensing...',
    analyzing: 'Analyzing...',
    summaryTitle: 'SUMMARY',
    locAnalysis: 'ENVIRONMENT',
    meihua: 'HEXAGRAM',
    liuyao: 'MOVING LINE',
    xlr: 'LUCK CYCLE',
    aiInsight: 'AI INSIGHT',
    retry: 'SEARCH AGAIN',
    markFound: 'I FOUND IT!',
    markedFound: 'FOUND',
    feedbackThanks: 'Great! Data sent to improve the AI.',
    historyTitle: 'RECORDS',
    confirm: 'CONFIRM',
    itemState: 'PROBABILITY',
    foundLocations: 'SUGGESTED SPOTS',
    directions: {
      NORTH: 'North', SOUTH: 'South', EAST: 'East', WEST: 'West',
      NORTHEAST: 'Northeast', NORTHWEST: 'Northwest', SOUTHEAST: 'Southeast', SOUTHWEST: 'Southwest',
      CENTER: 'Center', UNKNOWN: 'Unsure'
    },
    footer: 'Every object leaves a cosmic trace',
    error: 'What was lost?',
    aiNetError: 'AI is resting.',
    missingKey: 'API Key missing.',
    landing: {
      slogan: 'Ancient Wisdom meets Modern AI',
      desc: 'Merging traditional I Ching divination with AI reasoning to help you find what matters.',
      enter: 'START FINDING',
      features: [
        { title: 'Direction', text: 'Elemental guidance' },
        { title: 'Status', text: 'Hidden or moving?' },
        { title: 'AI Guide', text: 'Smart reasoning' }
      ]
    }
  },
  ko: {
    title: '옴니파인드',
    itemName: '무엇을 잃어버렸나요?',
    lostLoc: '어디서 잃어버렸나요?',
    lostLocPlaceholder: '예: 침실, 택시, 공원...',
    direction: '대략적인 방향 (선택)',
    timeNow: '방금',
    timeHour: '1시간 전',
    time12h: '반나절 전',
    timeEarlier: '직접 입력',
    timeUnsure: '모름',
    unsure: '잘 모름',
    start: '찾기 시작',
    liuyaoTitle: '육효 감지',
    clickToToss: '동전 던지기',
    quickCast: '빠른 탐색',
    modeManual: '수동 모드',
    modeQuick: '빠른 모드',
    tossing: '감지 중...',
    analyzing: '분석 중...',
    summaryTitle: '요약',
    locAnalysis: '환경 분석',
    meihua: '괘상 분석',
    liuyao: '변효 지침',
    xlr: '현재 운세',
    aiInsight: 'AI 통찰',
    retry: '다시 찾기',
    markFound: '찾았습니다!',
    markedFound: '찾음',
    feedbackThanks: '축하합니다! 데이터가 AI 학습에 반영됩니다.',
    historyTitle: '기록',
    confirm: '확인',
    itemState: '발견 확률',
    foundLocations: '추천 장소',
    directions: {
      NORTH: '북쪽', SOUTH: '남쪽', EAST: '동쪽', WEST: '서쪽',
      NORTHEAST: '북동', NORTHWEST: '북서', SOUTHEAST: '남동', SOUTHWEST: '남서',
      CENTER: '중앙', UNKNOWN: '모름'
    },
    footer: '모든 사물은 흔적을 남깁니다',
    error: '무엇을 잃어버렸는지 알려주세요',
    aiNetError: 'AI가 휴식 중입니다.',
    missingKey: 'API 키가 없습니다.',
    landing: {
      slogan: '고대 지혜와 현대 AI의 만남',
      desc: '주역과 AI 추론을 결합하여 잃어버린 물건을 찾아드립니다.',
      enter: '찾기 시작',
      features: [
        { title: '방향', text: '오행에 따른 방향' },
        { title: '상태', text: '물건의 숨겨진 상태' },
        { title: 'AI 가이드', text: '스마트한 추론' }
      ]
    }
  }
};

const StandardTaijiIcon = ({ className = "", size = "60" }: { className?: string, size?: string | number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`${className} rotate-continuous`}>
    <circle cx="50" cy="50" r="47" fill="white" />
    <path d="M 50,3 A 47,47 0 0,1 50,97 A 23.5,23.5 0 0,1 50,50 A 23.5,23.5 0 0,0 50,3 Z" fill="black" />
    <circle cx="50" cy="26.5" r="6.5" fill="black" />
    <circle cx="50" cy="73.5" r="6.5" fill="white" />
  </svg>
);

const LogoIcon = ({ className = "", size = "60" }: { className?: string, size?: string | number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <line x1="66" y1="66" x2="88" y2="88" stroke="white" strokeWidth="12" strokeLinecap="round" />
    <circle cx="42" cy="42" r="34" stroke="white" strokeWidth="6" fill="black" />
    <g transform="translate(42, 42)">
      <circle cx="0" cy="0" r="28" fill="white" />
      <path d="M 0,-28 A 28,28 0 0,1 0,28 A 14,14 0 0,1 0,0 A 14,14 0 0,0 0,-28 Z" fill="black" />
      <circle cx="0" cy="-14" r="4" fill="black" />
      <circle cx="0" cy="14" r="4" fill="white" />
    </g>
  </svg>
);

const AncientCoin = ({ type }: { type: 'yang' | 'yin' }) => (
  <div className="w-full h-full rounded-full relative shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-[3px] border-[#c5a059] bg-gradient-to-br from-[#f2e6b6] via-[#d4b975] to-[#9d7d3b] flex items-center justify-center">
    <div className="absolute inset-1.5 rounded-full border border-[#9d7d3b]/40"></div>
    <span className="text-[#3e2b0e] font-serif font-black text-3xl md:text-4xl drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] opacity-90">
      {type === 'yang' ? 'I' : 'II'}
    </span>
  </div>
);

const FormattedText = ({ text, className = "" }: { text: string, className?: string }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={index} className="text-[#9d7d3b] font-black mx-0.5">{part.slice(2, -2)}</span>;
        }
        return part;
      })}
    </span>
  );
};

const EtherealBackground = () => {
  return (
    <div className="ambient-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="bg-noise"></div>
      <div className="vignette"></div>
    </div>
  );
};

const SplashScene = ({ onComplete }: { onComplete: () => void }) => {
  const symbols = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
  const [isFading, setIsFading] = useState(false);
  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFading(true), 1300);
    const completeTimer = setTimeout(onComplete, 1600);
    return () => { clearTimeout(fadeTimer); clearTimeout(completeTimer); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[1000] bg-black flex items-center justify-center transition-all duration-700 ease-in-out ${isFading ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
      <EtherealBackground />
      <div className="relative w-80 h-80 animate-bagua-fast z-10">
        <div className="absolute inset-0 rotate-continuous">
          {symbols.map((s, i) => (
            <div key={i} className="absolute text-white/70 text-5xl font-sans" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-140px)` }}>{s}</div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full p-1 shadow-[0_0_80px_rgba(255,255,255,0.25)]"><StandardTaijiIcon size="90" /></div>
        </div>
      </div>
    </div>
  );
};

const BaguaTaijiAnimation = ({ size = 200 }) => {
  const symbols = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
  return (
    <div className="relative flex items-center justify-center mx-auto my-6" style={{ width: size, height: size }}>
      <div className="absolute inset-0 animate-spin-slow opacity-30">
        {symbols.map((s, i) => (
          <div key={i} className="absolute text-white text-2xl font-sans" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${size / 2.2}px)` }}>{s}</div>
        ))}
      </div>
      <div className="relative z-10 bg-white rounded-full p-1 shadow-[0_0_50px_rgba(255,255,255,0.12)] scale-75 animate-float"><StandardTaijiIcon size={size * 0.45} /></div>
    </div>
  );
};

const XiaoLiuRenWheel = ({ activeIndex, lang }: { activeIndex: number, lang: Language }) => {
  const items = {
    zh: ['大安', '留连', '速喜', '赤口', '小吉', '空亡'],
    tw: ['大安', '留連', '速喜', '赤口', '小吉', '空亡'],
    en: ['Peace', 'Delay', 'Joy', 'Clash', 'Luck', 'Void'],
    ko: ['대안', '유연', '속희', '적구', '소길', '공망']
  };
  const radius = 60;
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_20s_linear_infinite] opacity-50" />
      {items[lang].map((item, i) => {
        const angle = i * 60 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const isActive = i === activeIndex;
        return (
          <div key={i} className={`absolute flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-500 ${isActive ? 'bg-[#9d7d3b] border-[#9d7d3b] text-white z-10 shadow-[0_0_15px_#9d7d3b] scale-110' : 'bg-black/60 border-white/10 text-white/30 z-0 scale-90'}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <span className="text-[10px] font-bold">{item}</span>
          </div>
        );
      })}
      <div className="absolute w-2 h-2 bg-white/20 rounded-full" />
    </div>
  );
};

const LanguageSelector = ({ current, setLang }: { current: Language, setLang: (l: Language) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const opts: {id: Language, label: string}[] = [
    { id: 'en', label: 'English' },
    { id: 'zh', label: '简体中文' },
    { id: 'tw', label: '繁體中文' },
    { id: 'ko', label: '한국어' },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="apple-glass-interactive px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg min-w-[3.5rem] text-center flex items-center gap-2 text-white/80 hover:text-white">
        {opts.find(o => o.id === current)?.label}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 apple-glass-strong rounded-xl overflow-hidden py-1 z-50 flex flex-col shadow-2xl animate-fadeIn">
          {opts.map(opt => (
            <button key={opt.id} onClick={() => { setLang(opt.id); setIsOpen(false); }} className={`px-4 py-3 text-left text-xs font-bold transition-colors ${current === opt.id ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LandingPage = ({ onEnter, lang, setLang }: { onEnter: () => void, lang: Language, setLang: (l: Language) => void }) => {
  const t = translations[lang].landing;
  const common = translations[lang];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-10 animate-fadeIn">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector current={lang} setLang={(l) => { setLang(l); localStorage.setItem('app_lang', l); }} />
      </div>

      <div className="mb-12 scale-110 animate-float relative z-10"><LogoIcon size="100" /></div>
      <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 tracking-widest mb-6 text-center uppercase relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{common.title}</h1>
      <p className="text-sm md:text-base font-bold text-[#9d7d3b] tracking-widest uppercase mb-12 text-center animate-pulse relative z-10 max-w-lg leading-loose">{t.slogan}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-4xl px-4 relative z-10">
        {t.features.map((f, i) => (
          <div key={i} className="apple-glass-card p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 border-t border-white/10">
            <div className="w-12 h-12 rounded-full bg-[#9d7d3b]/20 flex items-center justify-center mb-4 text-[#9d7d3b] font-serif font-bold text-xl border border-[#9d7d3b]/30 shadow-[0_0_15px_rgba(157,125,59,0.3)]">{i + 1}</div>
            <h3 className="text-white font-bold text-lg mb-2 tracking-wide">{f.title}</h3>
            <p className="text-white/60 text-xs leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>
      <p className="max-w-md text-center text-white/50 text-sm leading-7 mb-12 font-light px-4 relative z-10">{t.desc}</p>
      <button onClick={onEnter} className="group relative px-12 py-5 bg-white text-black rounded-full font-black text-sm tracking-[0.3em] uppercase overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all active:scale-95 z-20">
        <span className="relative z-10 group-hover:text-black transition-colors">{t.enter}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9d7d3b]/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </button>
      <div className="absolute bottom-8 text-[9px] text-white/20 tracking-[0.2em] uppercase z-10">{common.footer}</div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    try { return (localStorage.getItem('app_lang') as Language) || 'en'; } catch { return 'en'; }
  });
  const t = translations[lang];
  const [showSplash, setShowSplash] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [phase, setPhase] = useState<'idle' | 'liuyao' | 'analyzing' | 'done'>('idle');
  const [formData, setFormData] = useState<DivinationInput>({ itemName: '', lostLocation: '', direction: Direction.CENTER, lostTime: new Date().toISOString().slice(0, 16) });
  const [activeTimePreset, setActiveTimePreset] = useState<string>('now');
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [aiInsight, setAiInsight] = useState<AiInsightResult | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isFound, setIsFound] = useState(false);
  
  const [castMode, setCastMode] = useState<'manual' | 'quick'>('manual');
  const [liuyaoStep, setLiuyaoStep] = useState(0);
  const [liuyaoHistory, setLiuyaoHistory] = useState<{val: number, isYang: boolean, isMoving: boolean}[]>([]);
  const [liuyaoCoins, setLiuyaoCoins] = useState<boolean[]>([true, true, true]); 
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoTossing, setIsAutoTossing] = useState(false);
  const [error, setError] = useState('');
  
  const triggerHaptic = (pattern: VibratePattern = 20) => {
    try { if (typeof window !== 'undefined' && window.navigator?.vibrate) window.navigator.vibrate(pattern); } catch (e) {}
  };

  useEffect(() => { storageProvider.getAll().then(setHistory); }, []);

  const handleBack = () => {
    triggerHaptic(10);
    if (showTimePicker) { setShowTimePicker(false); return; }
    if (showHistory) { setShowHistory(false); return; }
    if (phase === 'analyzing') return; 
    if (phase === 'done') { setPhase('idle'); setResult(null); setAiInsight(null); setIsFound(false); setCurrentHistoryId(null); return; }
    if (phase === 'liuyao') { setPhase('idle'); setLiuyaoStep(0); setLiuyaoHistory([]); setIsAutoTossing(false); setIsSpinning(false); return; }
    if (phase === 'idle') { setHasEntered(false); return; }
  };

  const generateAIInsight = async (input: DivinationInput, res: DivinationResult) => {
    // 兼容 Vite 环境变量，增加安全检查
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_API_KEY || '';
    
    if (!apiKey) { 
        console.error("❌ API Key is missing. Please check Vercel Environment Variables.");
        setAiInsight({ content: t.missingKey }); 
        return; 
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      setAiInsight(null); 
      const promptLang = { en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', ko: 'Korean' }[lang];
      
      const prompt = `You are a professional I Ching Divination Expert.
      Respond in ${promptLang} ONLY.
      
      User lost item: "${input.itemName}"
      Location clue: "${input.lostLocation || 'Unknown'}"
      
      [Divination Data]
      Category: ${res.itemCategory} (Element: ${res.usefulGodElement})
      Hexagram Analysis: ${res.meihua.en}
      
      Task:
      1. Interpret the hexagram and element relationships.
      2. Provide 3 specific, logical places to look for the item based on the "Useful God" element and modern context.
      3. Be comforting but precise. Limit to 100 words.`;

      // 尝试使用 Google Search Grounding (质量最好)
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        if (response.text) {
            const text = response.text;
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = chunks.map(c => c.web ? { uri: c.web.uri, title: c.web.title } : null).filter(c => c !== null) as { uri: string, title: string }[];
            const uniqueSources = sources.filter((v,i,a) => a.findIndex(t => (t.uri === v.uri)) === i);

            setAiInsight({ content: text, groundingSources: uniqueSources.length > 0 ? uniqueSources : undefined });
            return; // 成功则直接返回
        }
      } catch (searchErr) {
        console.warn("⚠️ Search grounding failed, falling back to basic generation...", searchErr);
        // 如果搜索失败，不中断，继续下面的备用方案
      }

      // 备用方案：不使用工具，仅进行纯文本生成 (Gemini 3 Flash)
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || '';
      setAiInsight({ content: text });

    } catch (e: any) {
      console.error("❌ AI Error:", e);
      // 显示具体错误信息方便调试
      let errMsg = t.aiNetError;
      if (e.message?.includes('403')) errMsg += " (API Key 权限不足)";
      else if (e.message?.includes('429')) errMsg += " (请求过于频繁)";
      else if (e.message?.includes('404')) errMsg += " (模型不可用)";
      else if (e.message?.includes('400')) errMsg += " (请求格式错误)";
      
      setAiInsight({ content: errMsg });
    }
  };

  const handleMarkFound = async () => {
    if (!currentHistoryId) return;
    triggerHaptic([50, 50, 50]);
    setIsFound(true);
    
    // Update Storage & Cloud
    await storageProvider.markAsFound(currentHistoryId);
    
    // Update Local State History to reflect change immediately
    setHistory(prev => prev.map(item => item.id === currentHistoryId ? { ...item, found: true } : item));
    
    // Show Toast (Simulation)
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 bg-[#9d7d3b] text-black px-6 py-3 rounded-full font-bold shadow-2xl z-[1000] animate-fadeIn';
    toast.innerText = t.feedbackThanks;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  useEffect(() => {
    if (liuyaoStep === 6 && !isSpinning && phase === 'liuyao') {
      const timer = setTimeout(async () => {
        setPhase('analyzing');
        setIsAutoTossing(false);
        const finalInput = { ...formData, manualYao: liuyaoHistory };
        const rawResult = calculateDivination(finalInput); 
        
        const newItem: HistoryItem = { id: crypto.randomUUID(), timestamp: Date.now(), input: finalInput, result: rawResult, found: false };
        setHistory(prev => [newItem, ...prev]);
        setResult(rawResult);
        setCurrentHistoryId(newItem.id);
        setIsFound(false);
        
        setTimeout(() => {
          setPhase('done');
          storageProvider.save(newItem); 
          generateAIInsight(finalInput, rawResult);
        }, 1500); 
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [liuyaoStep, isSpinning, phase, formData, liuyaoHistory]); 

  useEffect(() => {
    if (phase === 'done' && result && !aiInsight) {
        generateAIInsight(formData, result);
    }
  }, [lang]); 

  const tossOnce = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    triggerHaptic(50);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    const coins = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]; 
    const sum = coins.reduce((acc, isHead) => acc + (isHead ? 3 : 2), 0);
    let isYang = false, isMoving = false;
    if (sum === 9) { isYang = true; isMoving = true; } 
    else if (sum === 6) { isYang = false; isMoving = true; } 
    else if (sum === 7) { isYang = true; isMoving = false; } 
    else if (sum === 8) { isYang = false; isMoving = false; } 
    setLiuyaoCoins(coins);
    setLiuyaoStep(s => s + 1);
    setLiuyaoHistory(prev => [...prev, { val: sum, isYang, isMoving }]);
    setIsSpinning(false);
    triggerHaptic([30, 50, 30]);
  };

  const runAutomaticLiuyao = async () => {
    if (isSpinning || isAutoTossing || liuyaoStep > 0) return;
    setIsAutoTossing(true);
    setLiuyaoHistory([]);
    for (let i = 0; i < 6; i++) {
      await tossOnce();
      if (i < 5) await new Promise(resolve => setTimeout(resolve, 400)); 
    }
  };

  const setQuickTime = (hoursAgo: number, presetId: string) => {
    const d = new Date();
    d.setHours(d.getHours() - hoursAgo);
    setFormData(prev => ({ ...prev, lostTime: d.toISOString().slice(0, 16) }));
    setActiveTimePreset(presetId);
    triggerHaptic(10);
  };

  const getXLRIndex = () => {
    if (!result) return 0;
    const map = ['Peace', 'Delay', 'Joy', 'Clash', 'Luck', 'Void'];
    const val = result.xiaoliuren.en; 
    return map.indexOf(val) > -1 ? map.indexOf(val) : 0;
  };

  if (showSplash) return <SplashScene onComplete={() => setShowSplash(false)} />;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <EtherealBackground />
      {!hasEntered ? (
        <LandingPage onEnter={() => setHasEntered(true)} lang={lang} setLang={(l) => { setLang(l); localStorage.setItem('app_lang', l); }} />
      ) : (
        <>
          <div className="fixed top-6 right-6 left-6 z-50 flex justify-between items-center animate-fadeIn pointer-events-none">
            <div className="pointer-events-auto">
              <button onClick={handleBack} className={`apple-glass-interactive p-3 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${phase === 'analyzing' ? 'opacity-0 scale-75 cursor-default' : 'opacity-100 scale-100'}`} disabled={phase === 'analyzing'}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto">
              <button onClick={() => setShowHistory(true)} className="apple-glass-interactive p-3 rounded-full shadow-lg group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </button>
              <LanguageSelector current={lang} setLang={(l) => { setLang(l); localStorage.setItem('app_lang', l); }} />
            </div>
          </div>

          {phase === 'idle' && (
            <div className="w-full max-sm:max-w-[320px] max-w-sm flex flex-col items-center animate-fadeIn relative z-10">
              <div className="mb-10 animate-float"><LogoIcon size="75" /></div>
              <h1 className="text-4xl font-black tracking-[0.25em] mb-12 uppercase text-white/95">{t.title}</h1>
              <form onSubmit={(e) => { e.preventDefault(); if(formData.itemName) { setPhase('liuyao'); setCastMode('manual'); setLiuyaoStep(0); setLiuyaoHistory([]); } else setError(t.error); }} className="w-full space-y-6">
                <div className="apple-glass-card rounded-[32px] p-7 transition-transform focus-within:scale-[1.02]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{t.itemName}</p>
                  <input type="text" value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} placeholder="..." className="w-full bg-transparent text-2xl font-bold focus:outline-none placeholder:text-white/10" />
                </div>
                <div className="apple-glass-card rounded-[32px] p-7 space-y-7">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{t.lostLoc}</p>
                      <button type="button" onClick={() => setFormData({...formData, lostLocation: t.unsure})} className="text-[9px] bg-white/10 px-2 py-1 rounded text-white/60 uppercase hover:bg-white/20 hover:text-white transition-colors">{t.unsure}</button>
                    </div>
                    <input type="text" value={formData.lostLocation} placeholder={t.lostLocPlaceholder} onChange={(e) => setFormData({...formData, lostLocation: e.target.value})} className="w-full bg-transparent text-lg border-b border-white/5 pb-1 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/10 placeholder:text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setQuickTime(0, 'now')} className={`py-4 rounded-2xl text-[9px] font-bold uppercase transition-all duration-500 ${activeTimePreset === 'now' ? 'bg-white text-black shadow-xl scale-105' : 'apple-glass-interactive text-white/30'}`}>{t.timeNow}</button>
                    <button type="button" onClick={() => setQuickTime(0, 'unsure')} className={`py-4 rounded-2xl text-[9px] font-bold uppercase transition-all duration-500 ${activeTimePreset === 'unsure' ? 'bg-white text-black shadow-xl scale-105' : 'apple-glass-interactive text-white/30'}`}>{t.timeUnsure}</button>
                    <button type="button" onClick={() => setShowTimePicker(true)} className={`py-4 rounded-2xl text-[9px] font-bold uppercase transition-all duration-500 ${activeTimePreset === 'custom' ? 'bg-white text-black shadow-xl scale-105' : 'apple-glass-interactive text-white/30'}`}>{t.timeEarlier}</button>
                  </div>
                  <select value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})} className="w-full apple-glass-interactive p-4 rounded-2xl text-[11px] font-bold uppercase border-none outline-none appearance-none text-center cursor-pointer transition-all hover:bg-white/10">
                    {Object.keys(Direction).map(d => <option key={d} value={d} className="bg-zinc-900">{(t.directions as any)[d]}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-7 bg-white text-black rounded-full font-black text-xl tracking-[0.5em] transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] relative overflow-hidden group">
                  <span className="relative z-10">{t.start}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
                </button>
              </form>
            </div>
          )}

          {phase === 'liuyao' && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 overflow-hidden">
              <EtherealBackground />
              <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-8 md:space-y-12">
                {liuyaoStep === 0 && !isAutoTossing && (
                  <div className="absolute top-0 transform -translate-y-[120%] flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                    <button onClick={() => setCastMode('manual')} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${castMode === 'manual' ? 'bg-[#9d7d3b] text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}>{t.modeManual}</button>
                    <button onClick={() => setCastMode('quick')} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${castMode === 'quick' ? 'bg-[#9d7d3b] text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}>{t.modeQuick}</button>
                  </div>
                )}
                <div className="text-center animate-fadeIn">
                  <h2 className="text-3xl font-black tracking-[0.4em] uppercase mb-2 text-white/90">{t.liuyaoTitle}</h2>
                  <div className="text-sm font-bold text-white/20 uppercase tracking-[0.6em]">{liuyaoStep}/6</div>
                </div>
                <div className="flex space-x-6 md:space-x-12 perspective-1000">
                  {liuyaoCoins.map((isHeads, i) => (
                    <div key={i} className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full preserve-3d transition-all duration-[600ms] ${isSpinning ? 'animate-spin-x' : (isHeads ? 'rotate-y-0' : 'rotate-y-180')}`}>
                      <div className="absolute inset-0 backface-hidden rounded-full flex items-center justify-center"><AncientCoin type="yang" /></div>
                      <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-full flex items-center justify-center"><AncientCoin type="yin" /></div>
                    </div>
                  ))}
                </div>
                <button onClick={castMode === 'quick' ? runAutomaticLiuyao : (isAutoTossing ? undefined : tossOnce)} disabled={isSpinning || (castMode === 'manual' && isAutoTossing) || liuyaoStep >= 6} className={`w-48 h-48 md:w-64 md:h-64 rounded-full apple-glass-card flex flex-col items-center justify-center transition-all duration-300 relative group ${isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'} ${!isAutoTossing && liuyaoStep < 6 ? 'hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}`}>
                  <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`text-xl md:text-2xl font-black text-center px-6 leading-[1.6] tracking-widest transition-colors whitespace-pre-line ${isAutoTossing ? 'text-[#9d7d3b]' : 'text-white/50'}`}>{isAutoTossing ? t.tossing : (liuyaoStep >= 6 ? t.analyzing : (castMode === 'quick' ? t.quickCast : t.clickToToss))}</span>
                  {(isAutoTossing || liuyaoStep > 0) && (<div className="mt-8 w-16 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#9d7d3b] transition-all duration-500 shadow-[0_0_15px_#9d7d3b]" style={{width: `${(liuyaoStep/6)*100}%`}} /></div>)}
                </button>
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-14">
              <StandardTaijiIcon size="125" />
              <div className="flex flex-col items-center space-y-6">
                <p className="text-xl font-black tracking-[0.8em] animate-pulse text-white/60 uppercase ml-[0.8em]">{t.analyzing}</p>
                <div className="w-56 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="relative w-full h-full">
              <div className="w-full max-w-lg animate-fadeIn overflow-y-auto max-h-[100vh] pb-40 scrollbar-hide pt-14 px-4 space-y-10 mx-auto">
                <div className="space-y-10 p-4 rounded-[40px] border border-transparent">
                  <BaguaTaijiAnimation size={170} />
                  <div className="apple-glass-card rounded-[48px] p-12 text-center relative overflow-hidden border-t border-white/20 shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
                    <span className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase mb-6 block">{t.summaryTitle}</span>
                    <h2 className="text-2xl md:text-3xl font-light mb-10 leading-relaxed tracking-wide px-3 text-white/95">{result.summary[lang]}</h2>
                    <div className="inline-flex flex-col items-center p-8 bg-white/[0.03] rounded-[40px] border border-white/5 shadow-inner">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2">{t.itemState}</span>
                      <span className="text-6xl md:text-7xl font-black text-[#9d7d3b] drop-shadow-[0_0_25px_rgba(157,125,59,0.3)]">{result.probability}%</span>
                    </div>
                  </div>
                  <div className="apple-glass-card border-[#9d7d3b]/40 bg-[#9d7d3b]/10 rounded-[42px] p-10 relative shadow-[0_0_30px_rgba(157,125,59,0.1)] overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#9d7d3b] to-[#735a24]"></div>
                      <span className="text-[11px] font-black text-[#9d7d3b] tracking-[0.4em] uppercase mb-5 block">{t.aiInsight}</span>
                      <p className="text-lg md:text-xl italic font-medium leading-relaxed text-white group-hover:text-white transition-all duration-500">{aiInsight ? <FormattedText text={aiInsight.content} /> : <span className="animate-pulse opacity-50">{lang === 'en' ? 'AI Analyzing...' : '大师正在连线...'}</span>}</p>
                      {aiInsight?.groundingSources && aiInsight.groundingSources.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/10">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-4">{t.foundLocations}</span>
                          <div className="space-y-3">
                            {aiInsight.groundingSources.map((source, idx) => (
                              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="block bg-white/5 rounded-xl p-3 text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center justify-between"><span className="truncate mr-2">{source.title}</span><svg className="flex-shrink-0 opacity-50" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-stretch">
                     <div className="apple-glass-card rounded-[36px] p-9 flex flex-col justify-center border-white/5">
                        <span className="text-[10px] font-black text-white/30 uppercase block tracking-widest mb-4">{t.locAnalysis}</span>
                        <p className="text-lg font-light text-white/80 leading-relaxed italic border-l-2 border-[#9d7d3b]/30 pl-6 bg-white/[0.01] p-5 rounded-r-2xl">{result.locationAnalysis[lang]}</p>
                     </div>
                     <div className="apple-glass-card rounded-[36px] p-9 flex flex-col items-center justify-center border-white/5"><XiaoLiuRenWheel activeIndex={getXLRIndex()} lang={lang} /></div>
                  </div>
                  <div className="apple-glass-card rounded-[48px] p-12 space-y-16 mb-12 border-white/5">
                     <div className="space-y-10">
                        <div className="flex items-center space-x-6">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/5"></div>
                          <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">{t.meihua}</span>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/5"></div>
                        </div>
                        <div className="text-base font-light leading-relaxed text-white/75 whitespace-pre-line bg-white/[0.015] p-9 rounded-[36px] border border-white/5 shadow-inner font-serif tracking-wide text-justify">{result.meihua[lang]}</div>
                     </div>
                     <div className="space-y-10">
                        <div className="flex items-center space-x-6">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/5"></div>
                          <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">{t.liuyao}</span>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/5"></div>
                        </div>
                        <div className="text-base font-light leading-relaxed text-white/75 whitespace-pre-line bg-white/[0.015] p-9 rounded-[36px] border border-white/5 shadow-inner font-serif tracking-wide text-justify">{result.liuyao[lang]}</div>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-50 flex flex-col items-center gap-4 pb-8 pt-10 pointer-events-none">
                <button 
                  onClick={handleMarkFound} 
                  disabled={isFound}
                  className={`pointer-events-auto max-w-sm w-full py-5 rounded-full font-black text-sm tracking-[0.3em] uppercase transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_50px_rgba(157,125,59,0.3)]
                    ${isFound ? 'bg-[#9d7d3b] text-white scale-95 opacity-90 cursor-default' : 'bg-[#9d7d3b] text-white hover:bg-[#b08d45] hover:shadow-[0_0_70px_rgba(157,125,59,0.5)]'}
                  `}
                >
                   {isFound ? (
                     <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>{t.markedFound}</>
                   ) : (
                     <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>{t.markFound}</>
                   )}
                </button>

                <button onClick={() => { setPhase('idle'); setResult(null); setAiInsight(null); setLiuyaoStep(0); setLiuyaoHistory([]); setIsFound(false); setCurrentHistoryId(null); }} className="pointer-events-auto max-w-sm w-full py-4 bg-white/10 backdrop-blur-md text-white/70 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/20 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                   {t.retry}
                </button>
              </div>
            </div>
          )}

          <div className={`fixed inset-0 z-[100] transition-all duration-700 ${showTimePicker ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity ${showTimePicker ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowTimePicker(false)} />
            <div className={`absolute bottom-0 inset-x-0 apple-glass-strong rounded-t-[52px] p-12 pt-14 sheet-enter ${showTimePicker ? 'sheet-show' : ''}`}>
              <div className="w-20 h-1.5 bg-white/10 rounded-full mx-auto mb-14 shadow-sm" />
              <h3 className="text-center text-[10px] font-black tracking-[0.5em] text-white/20 mb-12 uppercase">Select Time</h3>
              <input type="datetime-local" value={formData.lostTime} onChange={(e) => setFormData({...formData, lostTime: e.target.value})} className="w-full apple-glass-interactive rounded-3xl p-9 text-white text-center text-3xl font-bold outline-none shadow-inner mb-14" />
              <button onClick={() => { setShowTimePicker(false); setActiveTimePreset('custom'); }} className="w-full py-8 bg-white text-black rounded-full font-black uppercase tracking-[0.6em] text-xl shadow-[0_20px_60px_rgba(255,255,255,0.05)] active:scale-95 transition-all hover:bg-zinc-50">{t.confirm}</button>
            </div>
          </div>

          <div className={`fixed inset-0 z-[200] transition-all duration-700 ${showHistory ? 'visible' : 'invisible'}`}>
            <div className={`absolute inset-0 bg-black/90 backdrop-blur-3xl transition-opacity ${showHistory ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowHistory(false)} />
            <div className={`absolute right-0 h-full w-full max-w-md apple-glass-strong border-l border-white/5 p-12 pt-20 transition-transform duration-700 ease-[cubic-bezier(0.2, 1, 0.3, 1)] ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex justify-between items-center mb-16">
                <h3 className="text-2xl font-black tracking-[0.4em] uppercase text-white/85">{t.historyTitle}</h3>
                <button onClick={() => setShowHistory(false)} className="p-3.5 apple-glass-interactive rounded-full opacity-30 hover:opacity-100 hover:rotate-90"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              </div>
              <div className="space-y-7 overflow-y-auto h-[78vh] scrollbar-hide pr-2">
                {history.map(item => (
                  <div key={item.id} onClick={() => { setResult(item.result); setFormData(item.input); setAiInsight(item.aiInsight || null); setPhase('done'); setShowHistory(false); setCurrentHistoryId(item.id); setIsFound(!!item.found); }} className={`apple-glass-card rounded-[32px] p-9 active:scale-95 transition-all cursor-pointer hover:bg-white/[0.06] group relative overflow-hidden ${item.found ? 'border-[#9d7d3b]/50' : ''}`}>
                     {item.found && <div className="absolute top-0 right-0 p-2 bg-[#9d7d3b] rounded-bl-xl shadow-lg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                     <div className="text-white text-xl font-bold mb-3 group-hover:text-[#9d7d3b] transition-colors">{item.input.itemName}</div>
                     <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{new Date(item.timestamp).toLocaleDateString()} · {item.result.probability}%</div>
                  </div>
                ))}
                {history.length === 0 && <div className="text-center py-24 text-white/5 tracking-[1.5em] font-bold text-xs uppercase">No Records</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
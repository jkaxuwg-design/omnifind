
import { DivinationInput, DivinationResult, Direction, Language } from '../types';

const XIAO_LIU_REN = {
  names: {
    zh: ['大安', '留连', '速喜', '赤口', '小吉', '空亡'],
    tw: ['大安', '留連', '速喜', '赤口', '小吉', '空亡'],
    en: ['Great Peace', 'Lingering', 'Swift Joy', 'Red Mouth', 'Small Luck', 'Void'],
    ko: ['대안 (평안)', '유연 (지체)', '속희 (기쁨)', '적구 (다툼)', '소길 (행운)', '공망 (비움)']
  }
};

// Bagua Data
const GUA_DATA = [
  { element: '' }, // 0
  { element: 'Metal' }, // 1 Qian
  { element: 'Metal' }, // 2 Dui
  { element: 'Fire' },  // 3 Li
  { element: 'Wood' },  // 4 Zhen
  { element: 'Wood' },  // 5 Xun
  { element: 'Water' }, // 6 Kan
  { element: 'Earth' }, // 7 Gen
  { element: 'Earth' }, // 8 Kun
];

const ELEMENTS = {
  Metal: { zh: '金', tw: '金', en: 'Metal', ko: '금(Metal)' },
  Wood: { zh: '木', tw: '木', en: 'Wood', ko: '목(Wood)' },
  Water: { zh: '水', tw: '水', en: 'Water', ko: '수(Water)' },
  Fire: { zh: '火', tw: '火', en: 'Fire', ko: '화(Fire)' },
  Earth: { zh: '土', tw: '土', en: 'Earth', ko: '토(Earth)' }
};

const DIRECTION_DATA: Record<string, { element: string; feature: Record<Language, string> }> = {
  [Direction.NORTH]: { element: 'Water', feature: { zh: '潮湿、低洼、黑色物体', tw: '潮濕、低窪、黑色物體', en: 'Wet, low-lying, black objects', ko: '습하고 낮은 곳, 검은 물체' } },
  [Direction.SOUTH]: { element: 'Fire', feature: { zh: '明亮、高处、红色/电器', tw: '明亮、高處、紅色/電器', en: 'Bright, high, red/electronics', ko: '밝고 높은 곳, 붉은색/전자제품' } },
  [Direction.EAST]: { element: 'Wood', feature: { zh: '花草、木制家具', tw: '花草、木製家具', en: 'Plants, wooden furniture', ko: '식물, 나무 가구' } },
  [Direction.WEST]: { element: 'Metal', feature: { zh: '金属、白色、坚硬物体', tw: '金屬、白色、堅硬物體', en: 'Metal, white, hard objects', ko: '금속, 흰색, 단단한 물체' } },
  [Direction.NORTHEAST]: { element: 'Earth', feature: { zh: '墙角、山坡、杂物堆', tw: '牆角、山坡、雜物堆', en: 'Corners, slopes, piles', ko: '모퉁이, 언덕, 잡동사니' } },
  [Direction.NORTHWEST]: { element: 'Metal', feature: { zh: '贵重品、圆形物体', tw: '貴重品、圓形物體', en: 'Valuables, round objects', ko: '귀중품, 둥근 물체' } },
  [Direction.SOUTHEAST]: { element: 'Wood', feature: { zh: '通风口、过道、细长物', tw: '通風口、過道、細長物', en: 'Vents, corridors, slender objects', ko: '통풍구, 복도, 가늘고 긴 물체' } },
  [Direction.SOUTHWEST]: { element: 'Earth', feature: { zh: '储藏室、低矮处、布料', tw: '儲藏室、低矮處、布料', en: 'Storage, low places, fabrics', ko: '창고, 낮은 곳, 직물' } },
  [Direction.CENTER]: { element: 'Earth', feature: { zh: '房间中央、桌面', tw: '房間中央、桌面', en: 'Center of room, tables', ko: '방 중앙, 테이블' } },
  [Direction.UNKNOWN]: { element: 'Earth', feature: { zh: '位置不定，随手放置', tw: '位置不定，隨手放置', en: 'Variable locations', ko: '불확실한 위치' } },
};

// "Useful God" Classification
const CATEGORIES = {
  WEALTH: { 
    keywords: /钱|包|卡|金|银|钻|首饰|手机|车|wallet|money|card|gold|jewelry|phone|watch|지갑|돈|카드|금|보석|핸드폰/i, 
    name: { zh: '妻财 (财物)', tw: '妻財 (財物)', en: 'Wealth (Possessions)', ko: '처재 (재물)' },
    element: 'Metal' 
  },
  PARENT: { 
    keywords: /证|书|纸|衣|服|帽|鞋|钥|key|document|paper|cloth|shoe|passport|id|서류|종이|옷|신발|키|열쇠|여권/i, 
    name: { zh: '父母 (庇护/证件)', tw: '父母 (庇護/證件)', en: 'Parent (Protection/Docs)', ko: '부모 (문서/의복)' },
    element: 'Earth' // Tradition: Earth supports Metal (Body), or specialized logic. Simplified here to Earth/Wood context. Let's use Earth for Protection/Container.
  },
  OFFSPRING: { 
    keywords: /药|宠|猫|狗|玩|酒|medicine|pet|cat|dog|toy|game|약|반려동물|고양이|강아지|장난감/i, 
    name: { zh: '子孙 (快乐/药物)', tw: '子孫 (快樂/藥物)', en: 'Offspring (Joy/Medicine)', ko: '자손 (즐거움/약)' },
    element: 'Water' 
  },
  OFFICER: { 
    keywords: /官|职|名|章|official|stamp|badge|도장|직인|명찰/i, 
    name: { zh: '官鬼 (功名)', tw: '官鬼 (功名)', en: 'Officer (Power)', ko: '관귀 (명예)' },
    element: 'Fire' 
  },
};

const getCategory = (itemName: string) => {
  for (const key in CATEGORIES) {
    // @ts-ignore
    if (CATEGORIES[key].keywords.test(itemName)) {
      // @ts-ignore
      return CATEGORIES[key];
    }
  }
  return { 
    name: { zh: '杂物', tw: '雜物', en: 'General Item', ko: '잡동사니' }, 
    element: 'Earth' // Default element
  };
};

const linesToGua = (lines: boolean[]): number => {
  const code = (lines[2] ? '1' : '0') + (lines[1] ? '1' : '0') + (lines[0] ? '1' : '0');
  const map: Record<string, number> = { '111':1, '011':2, '101':3, '001':4, '110':5, '010':6, '100':7, '000':8 };
  return map[code] || 8;
};

const getElementRelation = (el1: string, el2: string): 'generate' | 'control' | 'same' | 'weak' | 'controlled' => {
  if (el1 === el2) return 'same'; 
  const generation: Record<string, string> = { 'Metal': 'Water', 'Water': 'Wood', 'Wood': 'Fire', 'Fire': 'Earth', 'Earth': 'Metal' };
  const control: Record<string, string> = { 'Metal': 'Wood', 'Wood': 'Earth', 'Earth': 'Water', 'Water': 'Fire', 'Fire': 'Metal' };

  if (generation[el1] === el2) return 'generate'; 
  if (control[el1] === el2) return 'control'; 
  if (generation[el2] === el1) return 'weak'; 
  if (control[el2] === el1) return 'controlled'; 
  return 'same';
};

export const calculateDivination = (input: DivinationInput): DivinationResult => {
  const { itemName, direction, lostTime, lostLocation, manualYao } = input;
  const date = new Date(lostTime);
  const hour = date.getHours();
  const diZhiIndex = Math.floor(((hour + 1) % 24) / 2);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const dirObj = DIRECTION_DATA[direction] || DIRECTION_DATA[Direction.UNKNOWN];

  // 1. Identify "Useful God"
  const category = getCategory(itemName);

  // 2. Location Analysis
  const getLocText = (lang: Language) => {
    // Simple logic for location hints based on keywords
    if (/车|subway|car|bus|차/i.test(lostLocation)) {
      return { zh: '移动中/交通工具', tw: '移動中/交通工具', en: 'In motion/Transport', ko: '이동 중/교통수단' }[lang];
    }
    return { zh: '室内/静止', tw: '室內/靜止', en: 'Indoors/Static', ko: '실내/정지' }[lang];
  };

  // 3. Hexagram Calculation
  let upperGuaNum = 0, lowerGuaNum = 0, dongYao = 0;
  if (manualYao && manualYao.length === 6) {
    lowerGuaNum = linesToGua([manualYao[0].isYang, manualYao[1].isYang, manualYao[2].isYang]);
    upperGuaNum = linesToGua([manualYao[3].isYang, manualYao[4].isYang, manualYao[5].isYang]);
    const movingIndices = manualYao.map((y, i) => y.isMoving ? i + 1 : 0).filter(i => i > 0);
    dongYao = movingIndices.length > 0 ? movingIndices[movingIndices.length - 1] : (itemName.length + hour) % 6 || 6;
  } else {
    upperGuaNum = (itemName.length + hour + month) % 8 || 8;
    lowerGuaNum = (itemName.length + hour + day + month) % 8 || 8;
    dongYao = (itemName.length + hour + day + month + diZhiIndex + 1) % 6 || 6;
  }

  const tiGuaNum = dongYao > 3 ? lowerGuaNum : upperGuaNum; 
  const yongGuaNum = dongYao > 3 ? upperGuaNum : lowerGuaNum; 
  
  const tiElement = GUA_DATA[tiGuaNum].element;
  const yongElement = GUA_DATA[yongGuaNum].element;
  const relation = getElementRelation(yongElement, tiElement);

  // 4. Probability & Relation Text
  let prob = 50;
  const relationTexts: Record<string, Record<Language, string>> = {
    generate: { zh: '大吉·生', tw: '大吉·生', en: 'Excellent (Generating)', ko: '대길 (상생)' },
    same: { zh: '中吉·比', tw: '中吉·比', en: 'Good (Harmony)', ko: '중길 (비화)' },
    weak: { zh: '小凶·泄', tw: '小凶·洩', en: 'Fair (Draining)', ko: '소흉 (설기)' },
    control: { zh: '平·克', tw: '平·剋', en: 'Fair (Control)', ko: '평범 (극)' },
    controlled: { zh: '凶·鬼', tw: '凶·鬼', en: 'Difficult (Clash)', ko: '흉 (상극)' }
  };

  if (relation === 'generate') prob = 90;
  else if (relation === 'same') prob = 80;
  else if (relation === 'weak') prob = 60;
  else if (relation === 'control') prob = 50;
  else prob = 30;

  // 5. Useful God Adjustment
  const catDirRelation = getElementRelation(dirObj.element, category.element);
  if (['generate', 'same'].includes(catDirRelation)) prob = Math.min(99, prob + 15);
  else if (catDirRelation === 'controlled') prob = Math.max(10, prob - 15);

  // 6. Xiao Liu Ren
  const xlrIndex = (month + day + (diZhiIndex + 1) - 2) % 6;
  const xlrNames = {
    zh: XIAO_LIU_REN.names.zh[xlrIndex],
    tw: XIAO_LIU_REN.names.tw[xlrIndex],
    en: XIAO_LIU_REN.names.en[xlrIndex],
    ko: XIAO_LIU_REN.names.ko[xlrIndex]
  };
  if (xlrIndex === 5) prob = Math.max(5, prob - 20); // Void
  if (xlrIndex === 0 || xlrIndex === 2) prob = Math.min(99, prob + 10); // Peace/Joy

  // 7. Generate Text for All Languages
  const langs: Language[] = ['zh', 'tw', 'en', 'ko'];
  const result: any = { 
    meihua: {}, xiaoliuren: {}, liuyao: {}, summary: {}, locationAnalysis: {},
    probability: prob,
    itemCategory: category.name.en, // Default for logic use
    usefulGodElement: category.element
  };

  const isMovingLineYang = manualYao ? manualYao[dongYao-1].isYang : (dongYao % 2 !== 0);

  langs.forEach(l => {
    // @ts-ignore
    const catName = category.name[l];
    // @ts-ignore
    const catElName = ELEMENTS[category.element][l];
    // @ts-ignore
    const dirElName = ELEMENTS[dirObj.element][l];
    
    // Meihua
    const relText = relationTexts[relation === 'controlled' ? 'controlled' : relation][l];
    let mhText = '';
    if (l === 'en') {
      mhText = `[${relText}]\nCategory: ${catName} (${catElName}).\nDirection Element: ${dirElName}.\nRelation: ${catDirRelation === 'generate' ? 'Direction supports Item' : catDirRelation === 'controlled' ? 'Direction opposes Item' : 'Neutral'}.`;
    } else if (l === 'ko') {
      mhText = `[${relText}]\n분류: ${catName} (${catElName}).\n방위 오행: ${dirElName}.\n관계: ${catDirRelation === 'generate' ? '방위가 물건을 생함' : catDirRelation === 'controlled' ? '방위가 물건을 극함' : '평이함'}.`;
    } else {
      mhText = `【${relText}】\n用神：${catName}（${catElName}）。\n方位五行：${dirElName}。\n生克关系：${catDirRelation === 'generate' ? '方位生旺物品' : catDirRelation === 'controlled' ? '方位克制物品' : '平和'}。`;
    }
    result.meihua[l] = mhText;

    // Xiao Liu Ren
    // @ts-ignore
    result.xiaoliuren[l] = xlrNames[l];

    // Liu Yao
    const state = !isMovingLineYang ? 
      { zh: '静止/遮挡', tw: '靜止/遮擋', en: 'Static/Hidden', ko: '정지/숨겨짐' } : 
      { zh: '变动/显露', tw: '變動/顯露', en: 'Active/Exposed', ko: '변동/드러남' };
    
    if (l === 'en') {
      result.liuyao[l] = `Moving Line: ${dongYao}.\nState: ${state.en}.\nHint: ${!isMovingLineYang ? 'Look in dark corners or under things.' : 'Look in open spaces or near passages.'}`;
    } else if (l === 'ko') {
      result.liuyao[l] = `동효: ${dongYao}효.\n상태: ${state.ko}.\n힌트: ${!isMovingLineYang ? '어두운 구석이나 물건 아래.' : '탁 트인 곳이나 통로 근처.'}`;
    } else {
      const txt = !isMovingLineYang ? '在暗处或被遮盖。' : '在明处或过道旁。';
      result.liuyao[l] = `动爻：第${dongYao}爻。\n状态：${state[l === 'tw' ? 'tw' : 'zh']}。\n提示：${l === 'tw' ? txt.replace('盖', '蓋').replace('处', '處') : txt}`;
    }

    // Location
    result.locationAnalysis[l] = dirObj.feature[l];

    // Summary
    if (l === 'en') result.summary[l] = `Look towards ${DIRECTION_DATA[direction] ? direction : 'Unsure'}. Focus on ${catElName} objects.`;
    else if (l === 'ko') result.summary[l] = `${dirElName} 방향을 찾아보세요. ${catElName} 속성의 물건 근처.`;
    else result.summary[l] = `重点搜寻${dirElName}方。留意${catElName}属性物体。`;
  });

  return result;
};

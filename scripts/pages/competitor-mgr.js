/* ============================================
   竞品管理 - 三视图：管理看板 / 子品类竞品库 / SKU竞品库
   ============================================ */

let _competitorMgrRendered = false;
let _productMgrRendered = false;

const competitorMgrState = {
  tab: 'pool',
  subcategory: 'woundPatch',
  category: 'woundPatch',
  categoryKw: '',
  expandedCategories: { woundCare: true },
  sidebarCollapsed: false,
  pagination: { page: 1, pageSize: 10 },
  selectedAsins: [],
  batchLevel: '核心竞品',
  sku: 'PO17X4011',
  poolFilter: { site: '', tier: '', kw: '' },
  viewMode: 'list',
  detailAsin: '',
  drawerTab: 'overview',
  drawerNavList: [],
  drawerExpanded: {},
  drawerActiveSample: '',
};

const competitorSubcategories = [
  { id: 'pillbox',  name: '便携药盒',  site: 'US', owner: 'Mason', total: 42, core: 8, stale: 3, coverage: 92 },
  { id: 'therapy',  name: '理疗仪',    site: 'US', owner: 'Ida',   total: 36, core: 6, stale: 5, coverage: 84 },
  { id: 'oximeter', name: '血氧仪',    site: 'UK', owner: 'Brian', total: 28, core: 5, stale: 2, coverage: 78 },
  { id: 'storage',  name: '家居收纳',  site: 'DE', owner: 'Suki',  total: 31, core: 4, stale: 4, coverage: 71 },
];

const competitorCategoryTree = [
  { id: 'dressingLine', name: '敷料', children: [
    { id: 'dressing', name: '敷料', subcategory: 'dressing' },
    { id: 'foamDressing', name: '泡沫敷料', subcategory: '' },
    { id: 'transparentDressing', name: '透明敷料', subcategory: '' },
  ] },
  { id: 'woundCare', name: '伤口贴', children: [
    { id: 'woundPatch', name: '伤口贴', subcategory: 'woundPatch' },
    { id: 'hydrocolloidPatch', name: '水胶体贴', subcategory: '' },
    { id: 'waterproofBandage', name: '防水创可贴', subcategory: '' },
  ] },
  { id: 'nightLightLine', name: '夜间照明', children: [
    { id: 'nightLight', name: '夜间照明', subcategory: '' },
    { id: 'motionNightLight', name: '感应夜灯', subcategory: '' },
    { id: 'clipLight', name: '夹灯', subcategory: '' },
  ] },
  { id: 'tractionLine', name: '牵引', children: [
    { id: 'traction', name: '牵引', subcategory: '' },
    { id: 'neckTraction', name: '颈椎牵引', subcategory: '' },
    { id: 'lumbarTraction', name: '腰椎牵引', subcategory: '' },
  ] },
  { id: 'multiToolLine', name: '多功能工具', children: [
    { id: 'multiTool', name: '多功能工具', subcategory: '' },
    { id: 'rescueTool', name: '应急工具', subcategory: '' },
    { id: 'dailyTool', name: '日用工具', subcategory: '' },
  ] },
  { id: 'electrotherapyLine', name: '电疗', children: [
    { id: 'electrotherapy', name: '电疗', subcategory: 'therapy' },
    { id: 'electrotherapyPatch', name: '贴片', subcategory: '' },
    { id: 'electrotherapyAccessory', name: '其他电疗配件', subcategory: '' },
  ] },
  { id: 'phototherapyLine', name: '光疗', children: [
    { id: 'phototherapy', name: '光疗', subcategory: '' },
    { id: 'redLightTherapy', name: '红光理疗', subcategory: '' },
    { id: 'lightTherapyAccessory', name: '光疗配件', subcategory: '' },
  ] },
  { id: 'heatTherapyLine', name: '热疗', children: [
    { id: 'heatTherapy', name: '热疗', subcategory: 'therapy' },
    { id: 'heatingPad', name: '热敷垫', subcategory: '' },
    { id: 'warmCompress', name: '温热护具', subcategory: '' },
  ] },
  { id: 'painReliefLine', name: '外用止痛药线', children: [
    { id: 'painReliefPatch', name: '外用止痛药线', subcategory: 'painReliefPatch' },
    { id: 'coolingGelPatch', name: '冷敷凝胶贴', subcategory: '' },
    { id: 'lidocainePatch', name: '利多卡因贴', subcategory: '' },
  ] },
  { id: 'bloodGlucoseLine', name: '血糖线', children: [
    { id: 'bloodGlucose', name: '血糖线', subcategory: 'oximeter' },
    { id: 'testStrip', name: '试纸', subcategory: '' },
    { id: 'lancetAccessory', name: '采血配件', subcategory: '' },
  ] },
  { id: 'medicineManagementLine', name: '药物管理', children: [
    { id: 'pillbox', name: '便携药盒', subcategory: 'pillbox' },
    { id: 'smartPillbox', name: '智能药盒', subcategory: '' },
    { id: 'pillCutter', name: '切药器', subcategory: '' },
  ] },
  { id: 'assistiveLine', name: '辅具线', children: [
    { id: 'walkingAid', name: '助行辅助', subcategory: '' },
    { id: 'bathAssist', name: '洗浴辅助', subcategory: '' },
    { id: 'dailyAssist', name: '日常辅具', subcategory: '' },
  ] },
  { id: 'seatHealthLine', name: '坐垫健康方案', children: [
    { id: 'seatHealth', name: '坐垫健康方案', subcategory: '' },
    { id: 'coccyxCushion', name: '尾椎坐垫', subcategory: '' },
    { id: 'lumbarSeatSupport', name: '腰靠坐垫', subcategory: '' },
  ] },
  { id: 'bedHealthLine', name: '床上健康用品', children: [
    { id: 'bedHealth', name: '床上健康用品', subcategory: '' },
    { id: 'wedgePillow', name: '楔形枕', subcategory: '' },
    { id: 'bedRail', name: '床边护栏', subcategory: '' },
  ] },
];

const competitorCategoryMap = {
  dressing: 'dressing',
  woundPatch: 'woundPatch',
  painReliefPatch: 'painReliefPatch',
  medicineManagement: 'pillbox',
  electrotherapy: 'therapy',
  heatTherapy: 'therapy',
  bloodGlucose: 'oximeter',
};

const competitorSkus = [
  { id: 'WO26P1001', name: '防水伤口贴组合装',   subcategory: 'woundPatch', owner: 'Mason', launchDate: '2026-03-18' },
  { id: 'WO26P1002', name: '儿童卡通伤口贴',     subcategory: 'woundPatch', owner: 'Ida',   launchDate: '2026-04-02' },
  { id: 'DR26G2101', name: '无菌纱布敷料套装',   subcategory: 'dressing',   owner: 'Brian', launchDate: '2026-02-12' },
  { id: 'PR26L3301', name: '外用止痛贴 20 片装', subcategory: 'painReliefPatch', owner: 'Suki', launchDate: '2026-01-28' },
  { id: 'PO17X4011', name: '7格便携药盒',     subcategory: 'pillbox',  owner: 'Mason', launchDate: '2025-08-15' },
  { id: 'PO20A1101', name: '智能温控药盒',     subcategory: 'pillbox',  owner: 'Ida',   launchDate: '2026-01-10' },
  { id: 'PO20A1102', name: '迷你便携药盒',     subcategory: 'pillbox',  owner: 'Mason', launchDate: '2025-12-01' },
  { id: 'PO21C3301', name: '加热颈椎仪',      subcategory: 'therapy',  owner: 'Brian', launchDate: '2025-09-20' },
  { id: 'PO21D4401', name: '家用按摩枪',      subcategory: 'therapy',  owner: 'Ida',   launchDate: '2026-02-05' },
  { id: 'PO22F6601', name: '便携血氧仪',      subcategory: 'oximeter', owner: 'Suki',  launchDate: '2025-11-12' },
  { id: 'PO22F6602', name: '智能血压仪',      subcategory: 'oximeter', owner: 'Brian', launchDate: '2026-03-01' },
  { id: 'PO23S7701', name: '家居收纳箱',      subcategory: 'storage',  owner: 'Suki',  launchDate: '2026-01-20' },
];

// 竞品主数据（按站点 + ASIN 唯一）
const competitorRecords = [
  {
    asin: 'B08AUVON01',
    title: 'AUVON Weekly Pill Organizer 7 Day Large Compartment Black',
    brand: 'AUVON',
    site: 'US',
    subcategory: 'pillbox',
    link: 'https://www.amazon.com/dp/B08AUVON01',
    image: 'https://picsum.photos/seed/B08AUVON01/120/120',
    tier: '头部竞品',
    status: '有效',
    price: '$9.99',
    coupon: '10% coupon',
    rating: 4.7,
    reviews: 42836,
    monthSales: '50,000+',
    listedDate: '2018-04',
    bsrMain: '#52 Health & Household',
    bsrSub: '#3 Pill Organizers',
    bullets: ['7-day large capacity', 'BPA free travel pill case', 'Moisture-proof seal'],
    owner: 'Mason',
    updated: '2小时前',
    reason: '同功能、同价格带、同关键词排名靠前，是当前 SKU 的第一对标对象。',
    changes: ['价格 7 天内下降 8%', 'Review 周增 326', '主图新增容量对比文案'],
  },
  {
    asin: 'B09EZYDOSE2',
    title: 'Ezy Dose Push Button Pill Case with Large Compartments 7 Day',
    brand: 'Ezy Dose',
    site: 'US',
    subcategory: 'pillbox',
    link: 'https://www.amazon.com/dp/B09EZYDOSE2',
    image: 'https://picsum.photos/seed/B09EZYDOSE2/120/120',
    tier: '直接竞品',
    status: '有效',
    price: '$7.48',
    coupon: '无',
    rating: 4.6,
    reviews: 31802,
    monthSales: '40,000+',
    listedDate: '2017-08',
    bsrMain: '#88 Health & Household',
    bsrSub: '#7 Pill Organizers',
    bullets: ['Push button opening', 'Large weekly compartments', 'Subscribe & Save eligible'],
    owner: 'Mason',
    updated: '5小时前',
    reason: '价格低、Review 体量大，适合用于价格防御和转化率对比。',
    changes: ['BSR 上升 12 位', '新增 Subscribe & Save'],
  },
  {
    asin: 'B0CNEWPILL3',
    title: 'Travel Pill Organizer Small Waterproof Vitamin Case Portable',
    brand: 'MedPocket',
    site: 'US',
    subcategory: 'pillbox',
    link: 'https://www.amazon.com/dp/B0CNEWPILL3',
    image: 'https://picsum.photos/seed/B0CNEWPILL3/120/120',
    tier: '新兴竞品',
    status: '待复核',
    price: '$12.99',
    coupon: '15% coupon',
    rating: 4.8,
    reviews: 1260,
    monthSales: '8,000+',
    listedDate: '2025-09',
    bsrMain: '#240 Health & Household',
    bsrSub: '#19 Pill Organizers',
    bullets: ['IP67 waterproof design', 'Travel-ready compact', 'Vitamin & supplement friendly'],
    owner: 'Ida',
    updated: '1天前',
    reason: '新品 Review 增长快，主打防水和旅行场景，可能影响便携药盒关键词流量。',
    changes: ['Review 30 天增长 62%', '广告位覆盖 travel pill organizer'],
  },
  {
    asin: 'B0PILL4SUKU',
    title: 'Sukuos Pill Organizer 7 Day Pill Box Weekly with Compartments',
    brand: 'Sukuos',
    site: 'US',
    subcategory: 'pillbox',
    link: 'https://www.amazon.com/dp/B0PILL4SUKU',
    image: 'https://picsum.photos/seed/B0PILL4SUKU/120/120',
    tier: '直接竞品',
    status: '有效',
    price: '$8.99',
    coupon: '5% coupon',
    rating: 4.5,
    reviews: 18420,
    monthSales: '20,000+',
    listedDate: '2020-06',
    bsrMain: '#120 Health & Household',
    bsrSub: '#9 Pill Organizers',
    bullets: ['Compact daily pill case', 'Removable individual boxes', 'Color coded for AM/PM'],
    owner: 'Mason',
    updated: '2天前',
    reason: '中价位主流款，主图采用纯产品展示，可作为视觉差异化对比。',
    changes: ['评分稳定 4.5', 'Listing 主图未变'],
  },
  {
    asin: 'B07THERA04',
    title: 'TENS Unit Muscle Stimulator for Pain Relief Therapy Wireless',
    brand: 'iReliev',
    site: 'US',
    subcategory: 'therapy',
    link: 'https://www.amazon.com/dp/B07THERA04',
    image: 'https://picsum.photos/seed/B07THERA04/120/120',
    tier: '标杆竞品',
    status: '有效',
    price: '$39.95',
    coupon: '$5 off',
    rating: 4.5,
    reviews: 18420,
    monthSales: '12,000+',
    listedDate: '2019-11',
    bsrMain: '#350 Health & Household',
    bsrSub: '#12 Electrotherapy Products',
    bullets: ['FDA 510(k) cleared', '14 pre-set massage modes', 'Rechargeable wireless unit'],
    owner: 'Brian',
    updated: '3天前',
    reason: '内容教育成熟，A+ 页面结构适合参考。',
    changes: ['A+ 页面新增使用场景图', '评分下降 0.1'],
  },
  {
    asin: 'B0BGLUCO05',
    title: 'Fingertip Pulse Oximeter Blood Oxygen Saturation Monitor',
    brand: 'Zacurate',
    site: 'UK',
    subcategory: 'oximeter',
    link: 'https://www.amazon.co.uk/dp/B0BGLUCO05',
    image: 'https://picsum.photos/seed/B0BGLUCO05/120/120',
    tier: '头部竞品',
    status: '有效',
    price: '£15.99',
    coupon: '无',
    rating: 4.6,
    reviews: 22340,
    monthSales: '25,000+',
    listedDate: '2017-03',
    bsrMain: '#75 Health & Personal Care',
    bsrSub: '#4 Pulse Oximeters',
    bullets: ['SpO2 + pulse rate', 'OLED dual color display', 'Includes lanyard & batteries'],
    owner: 'Suki',
    updated: '4小时前',
    reason: '核心价格带竞品，标题关键词覆盖完整。',
    changes: ['价格稳定', 'Review 周增 118'],
  },
  {
    asin: 'B0DELIST06',
    title: 'Daily Pill Box Organizer Old Listing Now Discontinued',
    brand: 'Unknown',
    site: 'US',
    subcategory: 'pillbox',
    link: 'https://www.amazon.com/dp/B0DELIST06',
    image: 'https://picsum.photos/seed/B0DELIST06/120/120',
    tier: '替代竞品',
    status: '下架',
    price: '$0.00',
    coupon: '无',
    rating: 4.1,
    reviews: 3420,
    monthSales: '不可售',
    listedDate: '2015-02',
    bsrMain: '不可售',
    bsrSub: '不可售',
    bullets: ['Listing 已下架', '历史快照保留', '建议归档'],
    owner: 'Mason',
    updated: '21天前',
    reason: '历史参考竞品，当前已不可售，建议归档保留历史记录。',
    changes: ['商品不可售', '超过 14 天未恢复'],
  },
];

const cmAmazonSnapshotByAsin = {
  B0F48MH6WK: {
    asin: 'B0F48MH6WK',
    title: 'TENS EMS Unit Muscle Stimulator for Pain Relief Therapy - 4 in 1 TENS EMS Relax Custom Frequency+Pulse - Muscle Massager 36 Modes 20 Intensity, Memory & Favorites Function, 3.8" Color Display - Gray',
    brand: 'Belifu',
    site: 'US',
    subcategory: 'therapy',
    link: 'https://www.amazon.com/dp/B0F48MH6WK',
    image: '',
    source: 'Amazon public page snapshot · 2026-05-27',
    productType: '电疗/热疗',
    staticProfile: {
      dimensions: '3.8" color display device · exact package dimensions pending collection',
      material: 'Device body and reusable latex-free electrode pads',
      color: 'Gray',
      packageIncludes: ['TENS EMS unit', 'Reusable electrode pads', 'Lead wires', 'Travel case'],
      targetUsers: ['Back pain users', 'Neck pain users', 'Sciatica users', 'Workout recovery users'],
      usageScenarios: ['Home therapy', 'Office relaxation', 'Gym recovery', 'Travel use'],
      compliance: ['FSA or HSA eligible'],
    },
    tier: '头部竞品',
    status: '待复核',
    price: '$47.99',
    coupon: 'No featured offers available',
    rating: 4.5,
    reviews: 1702,
    monthSales: '500+ bought in past month',
    listedDate: 'Amazon 页面未公开，待采集',
    bsrMain: '#20,661 in Health & Household',
    bsrSub: '#35 in Muscle Stimulators & Accessories',
    bullets: [
      '4-IN-1 PRO TENS EMS PAIN THERAPY: Belifu, a 15-year professional brand trusted by 5M+ users, combines 4-in-1 TENS, EMS, RELAX, and DIY pulse therapy to relieve back pain, neck pain, sciatica, and deep muscle tension. This muscle stimulator offers custom frequency, pulse, and therapy settings for personalized pain relief and long-term recovery.',
      'ULTRA-CLEAR 3.8" COLOR DISPLAY: Still struggling with small, dull monochrome screens on older TENS units? Our upgraded device solves that problem instantly. Featuring a 3.8-inch ultra-large full-color display, this tens unit delivers a bright, high-clarity interface that makes every setting easier to read and adjust. Enjoy clearer visuals and effortless control—so you can focus on effective pain relief without frustration.',
      '36 MODES & CUSTOM DIY FREQUENCY: Equipped with 36 modes, adjustable pulse width, and DIY frequency, this upgraded tens unit simulates deep tissue massage, helping reduce sciatica pain, nerve pain relief, and muscle soreness. Ideal for muscle recovery, tension release, and full-body therapy after long workdays or workouts.',
      'INDEPENDENT DUAL CHANNEL FOR PAIN THERAPY: The independent dual channel design allows different pulse, intensity, and therapy modes for neck pain and back pain at the same time. Enjoy drug-free, non-invasive pain relief that targets sciatica, tight muscles, and daily stress, making it the perfect home massager for personalized recovery.',
      'MEDICAL-GRADE REUSABLE PADS: Belifu uses premium electric conductive pads with advanced gel for powerful muscle stimulator performance. These latex-free pads offer deep tissue contact, reduce irritation, and can be reused over 50 times, ensuring consistent therapy, stable pulse delivery, and more effective pain relief.',
      'LONG-LASTING RECHARGEABLE BATTERY & FULL ACCESSORY KIT INCLUDED: The rechargeable 600mAh battery delivers up to 60 hours of continuous use. Includes premium pads, wires, and a travel case for easy storage. Perfect portable back pain relief products for home, office, gym, or travel, delivering reliable tens ems therapy and full-body relax support anytime.',
    ],
    listing: {
      title: 'TENS EMS Unit Muscle Stimulator for Pain Relief Therapy - 4 in 1 TENS EMS Relax Custom Frequency+Pulse - Muscle Massager 36 Modes 20 Intensity, Memory & Favorites Function, 3.8" Color Display - Gray',
      bullets: [
        '4-IN-1 PRO TENS EMS PAIN THERAPY: Belifu, a 15-year professional brand trusted by 5M+ users, combines 4-in-1 TENS, EMS, RELAX, and DIY pulse therapy to relieve back pain, neck pain, sciatica, and deep muscle tension. This muscle stimulator offers custom frequency, pulse, and therapy settings for personalized pain relief and long-term recovery.',
        'ULTRA-CLEAR 3.8" COLOR DISPLAY: Still struggling with small, dull monochrome screens on older TENS units? Our upgraded device solves that problem instantly. Featuring a 3.8-inch ultra-large full-color display, this tens unit delivers a bright, high-clarity interface that makes every setting easier to read and adjust. Enjoy clearer visuals and effortless control—so you can focus on effective pain relief without frustration.',
        '36 MODES & CUSTOM DIY FREQUENCY: Equipped with 36 modes, adjustable pulse width, and DIY frequency, this upgraded tens unit simulates deep tissue massage, helping reduce sciatica pain, nerve pain relief, and muscle soreness. Ideal for muscle recovery, tension release, and full-body therapy after long workdays or workouts.',
        'INDEPENDENT DUAL CHANNEL FOR PAIN THERAPY: The independent dual channel design allows different pulse, intensity, and therapy modes for neck pain and back pain at the same time. Enjoy drug-free, non-invasive pain relief that targets sciatica, tight muscles, and daily stress, making it the perfect home massager for personalized recovery.',
        'MEDICAL-GRADE REUSABLE PADS: Belifu uses premium electric conductive pads with advanced gel for powerful muscle stimulator performance. These latex-free pads offer deep tissue contact, reduce irritation, and can be reused over 50 times, ensuring consistent therapy, stable pulse delivery, and more effective pain relief.',
        'LONG-LASTING RECHARGEABLE BATTERY & FULL ACCESSORY KIT INCLUDED: The rechargeable 600mAh battery delivers up to 60 hours of continuous use. Includes premium pads, wires, and a travel case for easy storage. Perfect portable back pain relief products for home, office, gym, or travel, delivering reliable tens ems therapy and full-body relax support anytime.',
      ],
      aplus: ['Amazon 页面公开快照未暴露 A+ 内容，待采集。'],
      faq: ['Amazon 页面公开快照未暴露 FAQ 内容，待采集。'],
    },
    scenarios: [
      'Back pain, neck pain, sciatica, deep muscle tension, nerve pain relief, muscle soreness.',
      'Home, office, gym, travel, post-workday recovery and workout recovery.',
      'Users who need drug-free, non-invasive pain relief with adjustable intensity and therapy modes.',
    ],
    productAnalysis: {
      functions: [
        '4-in-1 TENS, EMS, RELAX and DIY pulse therapy.',
        '36 modes, 20 intensity levels, custom frequency and pulse width.',
        'Independent dual channel therapy for different body areas.',
        '3.8-inch color display and rechargeable 600mAh battery.',
        'Reusable latex-free electrode pads and full accessory kit.',
      ],
      advantages: [
        'The title and bullets clearly cover TENS EMS, pain relief, muscle stimulator, 36 modes, dual channel and color display keywords.',
        'The listing uses specific feature numbers such as 36 modes, 20 intensity levels, 3.8-inch display, 600mAh battery and 60 hours use.',
        'Customer review volume and 4.5-star rating support conversion credibility.',
      ],
      weaknesses: [
        'Public reviews mention first-use learning cost and instruction clarity issues.',
        'Public reviews mention screen protective film removal can create friction before use.',
      ],
      opportunities: [
        'Content can compete by explaining setup steps, intensity adjustment and first-use workflow more clearly.',
        'Images and A+ can emphasize ease of use, screen operation and accessory completeness.',
      ],
      references: [
        'Keyword-dense English Title structure.',
        'Feature-led Bullet structure with capitalized benefit headers.',
        'Specific quantified proof points in bullets.',
      ],
    },
    userAnalysis: {
      positive: [
        'Public reviews mention good size, good pads and effective pain relief after use.',
        'Public reviews mention broad settings and useful fine-tuning for EMS/TENS use.',
      ],
      negative: [
        'Public reviews mention first-time setup can be hard to figure out.',
        'Public reviews mention the screen protective overlay can be difficult to remove.',
      ],
      unmetNeeds: [
        'Users need clearer quick-start guidance for turning up intensity after selecting settings.',
        'Users need lower-friction packaging and screen film removal experience.',
      ],
      concerns: [
        'Whether the device is easy enough for first-time TENS/EMS users.',
        'Whether instructions and setup flow are clear enough before therapy starts.',
      ],
    },
    aiSummary: {
      conclusion: 'Belifu B0F48MH6WK is a high-relevance TENS/EMS competitor with strong keyword coverage, quantified feature claims and credible review volume.',
      threatLevel: '高',
      contentStrategy: [
        'Keep Title and TD in English and front-load TENS EMS, pain relief, muscle stimulator and therapy mode keywords.',
        'Use quantified proof points such as modes, intensity levels, display size, battery life and accessory kit.',
        'Add first-use guidance content to reduce setup friction highlighted in reviews.',
      ],
      risks: [
        'Avoid unsupported medical claims beyond the Amazon page wording.',
        'Do not copy competitor TD verbatim into owned listing content.',
      ],
      actions: [
        'Add B0F48MH6WK to the electrotherapy core competitor pool.',
        'Use its Title/TD as an English keyword and feature structure reference.',
        'Review negative feedback around instructions and screen film as content differentiation opportunities.',
      ],
    },
    owner: 'Brian',
    updated: '今天',
    reason: 'Amazon 公开页面显示该 ASIN 覆盖 TENS EMS、pain relief、muscle stimulator 等核心英文关键词，且有 4.5 星和 1,702 条评分，适合作为电疗/热疗核心竞品跟踪。',
    changes: ['Amazon public page snapshot captured on 2026-05-27', '500+ bought in past month', '4.5 out of 5 stars, 1,702 ratings'],
    dynamicMetrics: {
      priceTrend: [
        { label: '当前', value: '$47.99', note: 'New (3) from $47.99 & FREE Shipping' },
        { label: '优惠', value: 'No featured offers', note: '公开页面未显示 coupon' },
      ],
      bsrTrend: [
        { label: '大类', value: '#20,661', note: 'Health & Household' },
        { label: '小类', value: '#35', note: 'Muscle Stimulators & Accessories' },
      ],
      reviewTrend: [
        { label: '当前', value: '1,702', note: 'global ratings' },
        { label: '销量信号', value: '500+', note: 'bought in past month' },
      ],
      ratingTrend: [
        { label: '当前评分', value: '4.5', note: 'out of 5 stars' },
      ],
    },
    reviewKeywords: {
      positive: [
        { keyword: 'pain relief', count: 46, sentiment: 'positive' },
        { keyword: 'good pads', count: 28, sentiment: 'positive' },
        { keyword: 'fine tuning', count: 22, sentiment: 'positive' },
        { keyword: 'works well', count: 20, sentiment: 'positive' },
      ],
      negative: [
        { keyword: 'hard to figure out', count: 31, sentiment: 'negative' },
        { keyword: 'instructions', count: 26, sentiment: 'negative' },
        { keyword: 'screen film', count: 18, sentiment: 'negative' },
        { keyword: 'setup friction', count: 14, sentiment: 'negative' },
      ],
      scenarios: [
        { keyword: 'back pain', count: 42, sentiment: 'scenario' },
        { keyword: 'neck pain', count: 33, sentiment: 'scenario' },
        { keyword: 'sciatica', count: 25, sentiment: 'scenario' },
        { keyword: 'muscle recovery', count: 21, sentiment: 'scenario' },
      ],
      unmetNeeds: [
        { keyword: 'clearer quick start', count: 24, sentiment: 'unmet' },
        { keyword: 'easier intensity control', count: 19, sentiment: 'unmet' },
        { keyword: 'better screen protector', count: 16, sentiment: 'unmet' },
      ],
    },
  },
};

competitorRecords.push(...cmBuildAdditionalCompetitors());

competitorRecords.forEach(cmEnsureCompetitorIntel);

function cmEnsureArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

// 抽屉 sparkline / 关键词样本 mock 辅助
function cmParseNumericBase(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null) return 0;
  const match = String(value).match(/-?\d+(?:[.,]\d+)*/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, '')) || 0;
}

// 基于 ASIN + label 生成稳定的伪随机序列，避免每次渲染数据抖动
function cmMakeSeededRandom(seed) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) {
    s = (s * 31 + String(seed).charCodeAt(i)) % 2147483647;
  }
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function cmGenerateSparklineSeries(base, seed, length = 30, jitter = 0.1) {
  const safe = cmParseNumericBase(base);
  const anchor = safe > 0 ? safe : 1;
  const rand = cmMakeSeededRandom(seed);
  const series = [];
  let cur = anchor * (1 + (rand() - 0.5) * jitter);
  for (let i = 0; i < length - 1; i++) {
    const drift = (rand() - 0.5) * 2 * jitter * 0.35;
    cur = Math.max(0, cur + anchor * drift);
    series.push(Number(cur.toFixed(4)));
  }
  // 末点回到当前值，使最新点与展示的数字一致
  series.push(Number(anchor.toFixed(4)));
  return series;
}

function cmGenerateKeywordSamples(brand, keyword, sentiment) {
  const safeBrand = brand || 'this product';
  const safeKw = keyword || '';
  const templates = {
    positive: [
      `Love how ${safeBrand} handles "${safeKw}" – noticeably better than the brand I had before.`,
      `The "${safeKw}" experience is the main reason I keep recommending ${safeBrand}.`,
      `${safeBrand} nails "${safeKw}" – feels well thought out for daily use.`,
    ],
    negative: [
      `"${safeKw}" is the biggest miss on ${safeBrand} – took me a while to work around it.`,
      `Had real friction with "${safeKw}" – wish ${safeBrand} addressed it in the next revision.`,
      `Compared to similar brands, "${safeKw}" on ${safeBrand} feels rushed.`,
    ],
    scenario: [
      `Use it daily for "${safeKw}" – ${safeBrand} fits the routine without surprises.`,
      `Bought ${safeBrand} specifically for "${safeKw}" – matches the use case as advertised.`,
      `For "${safeKw}" situations ${safeBrand} has become my default pick.`,
    ],
    unmet: [
      `Hoping ${safeBrand} adds proper support for "${safeKw}" – would be a no-brainer upgrade.`,
      `If ${safeBrand} can solve "${safeKw}", I'd repurchase without comparing other options.`,
      `Missing "${safeKw}" is the only reason I'm still on the fence about ${safeBrand}.`,
    ],
  };
  const arr = templates[sentiment] || templates.positive;
  const n = 2 + ((safeKw.length || 0) % 2);
  return arr.slice(0, Math.min(n, arr.length));
}

function cmInjectTrendSparkline(asin, label, trendList) {
  if (!Array.isArray(trendList)) return trendList;
  return trendList.map((row, idx) => {
    if (!row || typeof row !== 'object') return row;
    if (Array.isArray(row.series) && row.series.length > 0) return row;
    const seed = `${asin}-${label}-${row.label || ''}-${idx}`;
    return Object.assign({}, row, {
      series: cmGenerateSparklineSeries(row.value, seed, 30, 0.1),
    });
  });
}

function cmInjectKeywordSamples(brand, list, sentimentKey) {
  if (!Array.isArray(list)) return list;
  return list.map(item => {
    if (!item || typeof item !== 'object') return item;
    if (Array.isArray(item.samples) && item.samples.length > 0) return item;
    return Object.assign({}, item, {
      samples: cmGenerateKeywordSamples(brand, item.keyword, sentimentKey),
    });
  });
}

function cmKeywordFallback(subcategory) {
  const wound = {
    positive: [
      { keyword: 'waterproof', count: 42, sentiment: 'positive' },
      { keyword: 'adhesive', count: 31, sentiment: 'positive' },
      { keyword: 'comfortable', count: 24, sentiment: 'positive' },
      { keyword: 'clear bandage', count: 18, sentiment: 'positive' },
    ],
    negative: [
      { keyword: 'peel off', count: 27, sentiment: 'negative' },
      { keyword: 'skin irritation', count: 21, sentiment: 'negative' },
      { keyword: 'too small', count: 15, sentiment: 'negative' },
    ],
    scenarios: [
      { keyword: 'shower', count: 36, sentiment: 'scenario' },
      { keyword: 'kids', count: 22, sentiment: 'scenario' },
      { keyword: 'wound care', count: 20, sentiment: 'scenario' },
    ],
    unmetNeeds: [
      { keyword: 'stronger adhesion', count: 25, sentiment: 'unmet' },
      { keyword: 'larger size', count: 17, sentiment: 'unmet' },
      { keyword: 'sensitive skin', count: 13, sentiment: 'unmet' },
    ],
  };
  const generic = {
    positive: [
      { keyword: 'easy to use', count: 35, sentiment: 'positive' },
      { keyword: 'good value', count: 28, sentiment: 'positive' },
      { keyword: 'portable', count: 22, sentiment: 'positive' },
    ],
    negative: [
      { keyword: 'durability', count: 24, sentiment: 'negative' },
      { keyword: 'size mismatch', count: 18, sentiment: 'negative' },
      { keyword: 'instructions', count: 12, sentiment: 'negative' },
    ],
    scenarios: [
      { keyword: 'home use', count: 30, sentiment: 'scenario' },
      { keyword: 'travel', count: 20, sentiment: 'scenario' },
      { keyword: 'daily use', count: 18, sentiment: 'scenario' },
    ],
    unmetNeeds: [
      { keyword: 'clearer specs', count: 19, sentiment: 'unmet' },
      { keyword: 'better packaging', count: 13, sentiment: 'unmet' },
    ],
  };
  return ['woundPatch', 'dressing'].includes(subcategory) ? wound : generic;
}

function cmSeoFallback(item) {
  const subcategory = item && item.subcategory;
  const electro = {
    trafficTerms: [
      { keyword: 'tens unit muscle stimulator', volume: 48200, organicRank: 6, adRank: 2, conversion: '8.4%' },
      { keyword: 'electrotherapy massager', volume: 29600, organicRank: 9, adRank: 4, conversion: '7.6%' },
      { keyword: 'muscle stimulator for pain relief', volume: 24800, organicRank: 12, adRank: 5, conversion: '6.9%' },
      { keyword: 'tens unit pads replacement', volume: 21200, organicRank: 4, adRank: 3, conversion: '9.1%' },
      { keyword: 'portable tens machine', volume: 18700, organicRank: 11, adRank: 6, conversion: '6.4%' },
      { keyword: 'back pain tens unit', volume: 16500, organicRank: 15, adRank: 8, conversion: '5.8%' },
      { keyword: 'ems foot massager', volume: 13900, organicRank: 18, adRank: 9, conversion: '5.2%' },
      { keyword: 'wireless tens unit', volume: 12100, organicRank: 21, adRank: 12, conversion: '4.9%' },
    ],
    abaTerms: [
      { keyword: 'tens unit', freqRank: 1248, clickShare: '18.7%', conversionShare: '12.4%' },
      { keyword: 'tens unit muscle stimulator', freqRank: 2186, clickShare: '11.3%', conversionShare: '8.9%' },
      { keyword: 'electrode pads', freqRank: 3920, clickShare: '7.6%', conversionShare: '6.1%' },
      { keyword: 'back pain relief device', freqRank: 4865, clickShare: '5.8%', conversionShare: '4.7%' },
      { keyword: 'portable muscle stimulator', freqRank: 5932, clickShare: '4.2%', conversionShare: '3.6%' },
    ],
    gap: {
      covered: ['tens unit', 'muscle stimulator', 'electrode pads', 'pain relief device'],
      uncovered: ['wireless tens unit', 'ems foot massager', 'deep tissue stimulation'],
      opportunity: ['portable tens machine', 'back pain tens unit', 'replacement pads for tens unit'],
    },
  };
  const wound = {
    trafficTerms: [
      { keyword: 'waterproof bandages', volume: 38600, organicRank: 5, adRank: 2, conversion: '9.0%' },
      { keyword: 'clear bandages waterproof', volume: 22400, organicRank: 8, adRank: 4, conversion: '7.8%' },
      { keyword: 'adhesive bandages', volume: 21000, organicRank: 12, adRank: 6, conversion: '6.6%' },
      { keyword: 'shower proof bandages', volume: 15200, organicRank: 10, adRank: 5, conversion: '7.1%' },
      { keyword: 'flexible fabric bandages', volume: 13800, organicRank: 16, adRank: 9, conversion: '5.7%' },
      { keyword: 'large waterproof bandages', volume: 12200, organicRank: 14, adRank: 7, conversion: '6.0%' },
      { keyword: 'sensitive skin bandages', volume: 9800, organicRank: 19, adRank: 11, conversion: '5.2%' },
      { keyword: 'transparent wound dressing', volume: 8200, organicRank: 22, adRank: 13, conversion: '4.7%' },
    ],
    abaTerms: [
      { keyword: 'waterproof bandages', freqRank: 1650, clickShare: '15.2%', conversionShare: '10.8%' },
      { keyword: 'bandages', freqRank: 1942, clickShare: '12.1%', conversionShare: '8.2%' },
      { keyword: 'clear bandages', freqRank: 3610, clickShare: '8.4%', conversionShare: '6.3%' },
      { keyword: 'wound dressing', freqRank: 4728, clickShare: '5.9%', conversionShare: '4.6%' },
      { keyword: 'sensitive skin bandages', freqRank: 6140, clickShare: '3.7%', conversionShare: '3.1%' },
    ],
    gap: {
      covered: ['waterproof bandages', 'clear bandages', 'adhesive bandages', 'wound dressing'],
      uncovered: ['sensitive skin bandages', 'shower proof bandages', 'transparent wound dressing'],
      opportunity: ['large waterproof bandages', 'flexible fabric bandages', 'waterproof first aid bandages'],
    },
  };
  const genericName = cmGetSubcategoryName(subcategory).toLowerCase();
  const generic = {
    trafficTerms: [
      { keyword: `${genericName} for home use`, volume: 24800, organicRank: 7, adRank: 3, conversion: '7.4%' },
      { keyword: `portable ${genericName}`, volume: 19600, organicRank: 10, adRank: 5, conversion: '6.8%' },
      { keyword: `best ${genericName}`, volume: 17800, organicRank: 13, adRank: 7, conversion: '6.1%' },
      { keyword: `${genericName} amazon`, volume: 14200, organicRank: 9, adRank: 4, conversion: '6.9%' },
      { keyword: `${genericName} accessories`, volume: 11900, organicRank: 16, adRank: 9, conversion: '5.5%' },
      { keyword: `${genericName} travel size`, volume: 10400, organicRank: 18, adRank: 10, conversion: '5.2%' },
      { keyword: `${genericName} bulk pack`, volume: 8600, organicRank: 21, adRank: 12, conversion: '4.8%' },
      { keyword: `${genericName} replacement`, volume: 7200, organicRank: 24, adRank: 14, conversion: '4.3%' },
    ],
    abaTerms: [
      { keyword: genericName, freqRank: 2380, clickShare: '13.6%', conversionShare: '9.2%' },
      { keyword: `best ${genericName}`, freqRank: 3520, clickShare: '8.5%', conversionShare: '6.7%' },
      { keyword: `portable ${genericName}`, freqRank: 4175, clickShare: '6.4%', conversionShare: '5.1%' },
      { keyword: `${genericName} for home use`, freqRank: 5290, clickShare: '4.9%', conversionShare: '4.0%' },
      { keyword: `${genericName} replacement`, freqRank: 6805, clickShare: '3.5%', conversionShare: '2.9%' },
    ],
    gap: {
      covered: [genericName, `portable ${genericName}`, `best ${genericName}`],
      uncovered: [`${genericName} accessories`, `${genericName} travel size`, `${genericName} bulk pack`],
      opportunity: [`${genericName} for home use`, `${genericName} replacement`, `${genericName} amazon`],
    },
  };
  if (cmIsElectrotherapyItem(item) || ['therapy', 'electrotherapy', 'electrotherapyPatch', 'electrotherapyAccessory'].includes(subcategory)) return electro;
  if (['woundPatch', 'hydrocolloidPatch', 'waterproofBandage', 'dressing'].includes(subcategory)) return wound;
  return generic;
}

function cmEnsureCompetitorIntel(item) {
  const defaultBullets = cmDefaultListingBullets(item);
  const bullets = cmEnsureArray(item.bullets, defaultBullets);
  const currentListing = item.listing || {};
  item.listing = {
    title: currentListing.title || item.title || cmDefaultListingTitle(item),
    bullets: cmNormalizeListingBullets({ bullets: currentListing.bullets || bullets }, item),
    aplus: cmEnsureArray(currentListing.aplus, [
      `${item.brand} 在 A+ 页面重点解释使用场景和产品结构。`,
      '适合拆解图片模块、场景模块与信任背书模块。',
    ]),
    faq: cmEnsureArray(currentListing.faq, cmDefaultListingFaq()),
    gallery: cmNormalizeSellingImages(currentListing, item),
  };
  item.staticProfile = {
    dimensions: item.staticProfile?.dimensions || 'Amazon 页面未公开，待采集',
    material: item.staticProfile?.material || 'Amazon 页面未公开，待采集',
    color: item.staticProfile?.color || 'Amazon 页面未公开，待采集',
    packageIncludes: cmEnsureArray(item.staticProfile?.packageIncludes, ['包装清单待采集']),
    targetUsers: cmEnsureArray(item.staticProfile?.targetUsers, ['目标人群待采集']),
    usageScenarios: cmEnsureArray(item.staticProfile?.usageScenarios, item.scenarios || ['使用场景待采集']),
    compliance: cmEnsureArray(item.staticProfile?.compliance, ['认证/合规信息待采集']),
  };
  item.scenarios = cmEnsureArray(item.scenarios, [
    `${cmGetSubcategoryName(item.subcategory)}日常使用场景`,
    '家庭护理 / 旅行携带 / 办公备用',
    '用户需要快速判断是否适合自己的实际需求',
  ]);
  item.productAnalysis = {
    functions: cmEnsureArray(item.productAnalysis?.functions, bullets),
    advantages: cmEnsureArray(item.productAnalysis?.advantages, [
      '关键词覆盖和评价体量具备参考价值',
      '价格带与当前品类主流用户预期接近',
    ]),
    weaknesses: cmEnsureArray(item.productAnalysis?.weaknesses, [
      '差异化表达不足，容易与同类产品混淆',
      '部分卖点证据链需要进一步确认',
    ]),
    opportunities: cmEnsureArray(item.productAnalysis?.opportunities, [
      '可从场景、材质、便利性中寻找本品差异化机会',
      '可针对差评痛点设计图片与 FAQ 回答',
    ]),
    references: cmEnsureArray(item.productAnalysis?.references, [
      '主图结构',
      'Bullet 卖点顺序',
      'A+ 场景模块',
    ]),
  };
  item.userAnalysis = {
    positive: cmEnsureArray(item.userAnalysis?.positive, [
      '用户认可基础功能清晰、价格可接受',
      '好评多集中在易用性、容量和交付完整度',
    ]),
    negative: cmEnsureArray(item.userAnalysis?.negative, [
      '差评常见于尺寸不符预期、耐用性或使用说明不足',
      '部分用户对材质、安全感和长期使用稳定性敏感',
    ]),
    unmetNeeds: cmEnsureArray(item.userAnalysis?.unmetNeeds, [
      '希望更清晰的尺寸/容量说明',
      '希望更真实的使用场景与对比图',
    ]),
    concerns: cmEnsureArray(item.userAnalysis?.concerns, [
      '担心购买后不适合自己的使用场景',
      '担心产品质量、售后和长期稳定性',
    ]),
  };
  item.aiSummary = {
    conclusion: item.aiSummary?.conclusion || `${item.brand} 是 ${cmGetSubcategoryName(item.subcategory)} 下需要持续跟踪的竞品，适合用于卖点、价格和图片表达对标。`,
    threatLevel: item.aiSummary?.threatLevel || (item.tier === '头部竞品' ? '高' : item.tier === '直接竞品' ? '中' : '观察'),
    contentStrategy: cmEnsureArray(item.aiSummary?.contentStrategy, [
      '拆解 Title、Bullet、主图和 A+ 的卖点顺序，判断哪些表达值得本品借鉴',
      '对照差评痛点补强本品图片文案、FAQ 和场景证明',
      '结合关键词覆盖和 Review 体量，识别本品可抢占的差异化卖点',
    ]),
    risks: cmEnsureArray(item.aiSummary?.risks, [
      '避免直接照搬竞品 Listing 表达，尤其是功效、材质和认证类说法',
      '医疗功效、绝对化承诺和对比图需核实合规依据',
      '如果只跟随低价或同质化卖点，容易拉低本品利润和品牌识别度',
    ]),
    actions: cmEnsureArray(item.aiSummary?.actions, [
      '纳入核心竞品池，每周复核价格、Review、BSR 和主图变化',
      '在本品 Listing 中补充材质安全、尺寸容量、使用场景等差异化证明点',
      '把竞品差评高频痛点转成图片文案、FAQ 和 A+ 模块优化任务',
    ]),
  };
  item.dynamicMetrics = {
    priceTrend: cmEnsureArray(item.dynamicMetrics?.priceTrend, [
      { label: '当前价格', value: item.price || '-', note: item.coupon || '无优惠信息' },
      { label: '月销估算', value: item.monthSales || '-', note: '基于当前 mock 监控口径' },
    ]),
    bsrTrend: cmEnsureArray(item.dynamicMetrics?.bsrTrend, [
      { label: 'BSR 大类', value: item.bsrMain || '-', note: '当前快照' },
      { label: 'BSR 小类', value: item.bsrSub || '-', note: '当前快照' },
    ]),
    reviewTrend: cmEnsureArray(item.dynamicMetrics?.reviewTrend, [
      { label: 'Review', value: item.reviews ? item.reviews.toLocaleString() : '-', note: '当前累计评论数' },
      { label: '近期变化', value: (item.changes || [])[0] || '待采集', note: item.updated || '-' },
    ]),
    ratingTrend: cmEnsureArray(item.dynamicMetrics?.ratingTrend, [
      { label: '当前评分', value: String(item.rating || '-'), note: '当前快照' },
    ]),
  };
  const keywordFallback = cmKeywordFallback(item.subcategory);
  item.reviewKeywords = {
    positive: cmEnsureArray(item.reviewKeywords?.positive, keywordFallback.positive),
    negative: cmEnsureArray(item.reviewKeywords?.negative, keywordFallback.negative),
    scenarios: cmEnsureArray(item.reviewKeywords?.scenarios, keywordFallback.scenarios),
    unmetNeeds: cmEnsureArray(item.reviewKeywords?.unmetNeeds, keywordFallback.unmetNeeds),
  };
  const seoFallback = cmSeoFallback(item);
  item.seoKeywords = {
    trafficTerms: cmEnsureArray(item.seoKeywords?.trafficTerms, seoFallback.trafficTerms),
    abaTerms: cmEnsureArray(item.seoKeywords?.abaTerms, seoFallback.abaTerms),
    gap: {
      covered: cmEnsureArray(item.seoKeywords?.gap?.covered, seoFallback.gap.covered),
      uncovered: cmEnsureArray(item.seoKeywords?.gap?.uncovered, seoFallback.gap.uncovered),
      opportunity: cmEnsureArray(item.seoKeywords?.gap?.opportunity, seoFallback.gap.opportunity),
    },
  };
  // 给每个趋势项注入 30 天 mock 序列，给每个关键词注入 2-3 条代表性评论
  item.dynamicMetrics.priceTrend = cmInjectTrendSparkline(item.asin, 'price', item.dynamicMetrics.priceTrend);
  item.dynamicMetrics.bsrTrend = cmInjectTrendSparkline(item.asin, 'bsr', item.dynamicMetrics.bsrTrend);
  item.dynamicMetrics.reviewTrend = cmInjectTrendSparkline(item.asin, 'review', item.dynamicMetrics.reviewTrend);
  item.dynamicMetrics.ratingTrend = cmInjectTrendSparkline(item.asin, 'rating', item.dynamicMetrics.ratingTrend);
  item.reviewKeywords.positive = cmInjectKeywordSamples(item.brand, item.reviewKeywords.positive, 'positive');
  item.reviewKeywords.negative = cmInjectKeywordSamples(item.brand, item.reviewKeywords.negative, 'negative');
  item.reviewKeywords.scenarios = cmInjectKeywordSamples(item.brand, item.reviewKeywords.scenarios, 'scenario');
  item.reviewKeywords.unmetNeeds = cmInjectKeywordSamples(item.brand, item.reviewKeywords.unmetNeeds, 'unmet');
}

// SKU - 竞品 绑定关系（同一竞品可绑多个 SKU；同一 SKU 可绑多个竞品并区分级别）
const competitorBindings = [
  { sku: 'PO17X4011', asin: 'B08AUVON01',  level: '核心竞品', boundBy: 'Mason', boundAt: '2026-01-12' },
  { sku: 'PO17X4011', asin: 'B09EZYDOSE2', level: '核心竞品', boundBy: 'Mason', boundAt: '2026-01-12' },
  { sku: 'PO17X4011', asin: 'B0PILL4SUKU', level: '参考竞品', boundBy: 'Mason', boundAt: '2026-01-15' },
  { sku: 'PO17X4011', asin: 'B0CNEWPILL3', level: '观察竞品', boundBy: 'Ida',   boundAt: '2026-04-08' },
  { sku: 'PO20A1101', asin: 'B08AUVON01',  level: '核心竞品', boundBy: 'Ida',   boundAt: '2026-02-01' },
  { sku: 'PO20A1101', asin: 'B0PILL4SUKU', level: '参考竞品', boundBy: 'Ida',   boundAt: '2026-02-01' },
  { sku: 'PO20A1102', asin: 'B0CNEWPILL3', level: '核心竞品', boundBy: 'Mason', boundAt: '2026-03-15' },
  { sku: 'PO21C3301', asin: 'B07THERA04',  level: '核心竞品', boundBy: 'Brian', boundAt: '2025-12-20' },
  { sku: 'PO22F6601', asin: 'B0BGLUCO05',  level: '核心竞品', boundBy: 'Suki',  boundAt: '2026-01-05' },
];

const competitorAlerts = [
  { level: 'high', title: '核心竞品 AUVON 价格下降 8%',     detail: '建议运营复核 PO17X4011 当前价格和优惠策略。',  time: '2小时前' },
  { level: 'high', title: '新兴竞品 MedPocket 30 天 Review +62%', detail: '建议进入核心观察，并分析其广告关键词和主图表达。', time: '今天 09:20' },
  { level: 'mid',  title: 'Ezy Dose BSR 上升 12 位',         detail: '可能与低价促销有关，建议关注 7 天趋势。',         time: '昨天' },
  { level: 'low',  title: 'iReliev A+ 页面更新',             detail: '新增使用场景图，可给理疗仪 Listing 优化做参考。', time: '3天前' },
  { level: 'mid',  title: '历史竞品 B0DELIST06 不可售',      detail: '已超过 14 天，建议归档但保留历史快照。',         time: '5天前' },
];

const competitorPending = [
  { id: 'P001', text: '便携药盒池新增 1 条待审核：MedPocket B0CNEWPILL3', tab: 'pool' },
  { id: 'P002', text: 'PO17X4011 核心竞品价格异常，需复核',              tab: 'sku'  },
  { id: 'P003', text: '理疗仪子品类覆盖率仅 67%，建议补充',              tab: 'pool' },
  { id: 'P004', text: 'B0DELIST06 已下架 21 天，建议归档',                tab: 'sku'  },
];

const cmTabs = [
  ['pool',      '竞品主数据'],
  ['sku',       'SKU竞品绑定'],
  ['dashboard', '数据概览'],
];

// ============================================
//  入口
// ============================================
function renderCompetitorMgrView() {
  const v = document.getElementById('competitor-mgr-view');
  if (!v) return;
  if (!_competitorMgrRendered) {
    v.innerHTML = buildCompetitorMgrHtml();
    _competitorMgrRendered = true;
  }
  const listEl = document.getElementById('cm-list-container');
  const detailEl = document.getElementById('cm-detail-container');
  const mode = competitorMgrState.viewMode;
  const item = mode !== 'list'
    ? competitorRecords.find(r => r.asin === competitorMgrState.detailAsin)
    : null;
  if (mode === 'detail' && item) {
    cmEnsureCompetitorIntel(item);
    if (listEl) listEl.style.display = 'none';
    if (detailEl) {
      detailEl.style.display = '';
      detailEl.innerHTML = cmRenderCompetitorDetailPage(item);
    }
    return;
  }
  if (mode === 'editor' && item) {
    cmEnsureCompetitorIntel(item);
    if (listEl) listEl.style.display = 'none';
    if (detailEl) {
      detailEl.style.display = '';
      detailEl.innerHTML = cmRenderCompetitorEditorPage(item);
    }
    return;
  }
  if (listEl) listEl.style.display = '';
  if (detailEl) {
    detailEl.style.display = 'none';
    detailEl.innerHTML = '';
  }
  refreshCompetitorMgr();
}

function buildCompetitorMgrHtml() {
  return `
<div class="cm-app" id="cm-list-container">
  <main class="cm-tab-body">
    <section class="cm-tab-pane" id="cm-pane-pool"></section>
    <section class="cm-tab-pane" id="cm-pane-sku"></section>
    <section class="cm-tab-pane" id="cm-pane-dashboard"></section>
  </main>
</div>

<div id="cm-detail-container" style="display:none;"></div>

<div class="cm-modal-mask" id="cm-add-modal">
  <div class="cm-modal">
    <div class="cm-modal-head">
      <div>
        <h3>新增竞品录入</h3>
        <p>录入后进入待审核队列，子品类负责人确认后进入竞品池。</p>
      </div>
      <button onclick="cmCloseAddDialog()">×</button>
    </div>
    <div class="cm-form-grid">
      <label>站点<select><option>US</option><option>UK</option><option>DE</option><option>JP</option></select></label>
      <label>ASIN<input value="B0NEWASIN8" /></label>
      <label>子品类<select><option>便携药盒</option><option>理疗仪</option><option>血氧仪</option><option>家居收纳</option></select></label>
      <label>竞品定位<select><option>头部竞品</option><option>直接竞品</option><option>新兴竞品</option><option>标杆竞品</option><option>替代竞品</option></select></label>
      <label>Amazon 链接<input value="https://www.amazon.com/dp/B0NEWASIN8" /></label>
      <label>维护人<select><option>Mason</option><option>Ida</option><option>Brian</option><option>Suki</option></select></label>
      <label class="cm-form-wide">关注原因<textarea>关键词搜索结果首页出现，价格带与本品接近，Review 增长较快。</textarea></label>
    </div>
    <div class="cm-modal-actions">
      <button class="cm-btn cm-btn-secondary" onclick="cmCloseAddDialog()">取消</button>
      <button class="cm-btn cm-btn-primary" onclick="cmSubmitCompetitor()">提交审核</button>
    </div>
  </div>
</div>`;
}

function refreshCompetitorMgr() {
  renderCompetitorTabs();
  renderCompetitorDashboard();
  renderCompetitorPool();
  renderCompetitorSku();
  document.querySelectorAll('.cm-tab-pane').forEach(el => el.classList.remove('active'));
  const active = document.getElementById(`cm-pane-${competitorMgrState.tab}`);
  if (active) active.classList.add('active');
}

function renderCompetitorTabs() {
  const nav = document.getElementById('cm-tabs');
  if (!nav) return;
  nav.innerHTML = cmTabs.map(([id, name]) => `
    <button class="cm-tab ${competitorMgrState.tab === id ? 'active' : ''}" onclick="cmSwitchTab('${id}')">${name}</button>
  `).join('');
}

// ============================================
//  Tab 1: 管理看板
// ============================================
function renderCompetitorDashboard() {
  const el = document.getElementById('cm-pane-dashboard');
  if (!el) return;
  const totalRecords = competitorRecords.filter(r => r.status !== '下架').length + 132;
  const pending = competitorRecords.filter(r => r.status === '待复核').length + 3;
  const stale = competitorSubcategories.reduce((sum, s) => sum + s.stale, 0);
  const skuBound = new Set(competitorBindings.map(b => b.sku)).size;
  const kpis = [
    { label: '竞品主数据',         value: totalRecords, desc: '站点 + ASIN 唯一沉淀' },
    { label: '已绑定 SKU 数',      value: skuBound,     desc: '至少绑定 1 个核心竞品' },
    { label: '待审核 / 复核',       value: pending,      desc: '新增、异常集中处理',  warn: true },
    { label: '待更新',             value: stale,        desc: '超过更新周期未刷新',  warn: stale > 10 },
    { label: '重点 SKU 覆盖率',     value: '89%',        desc: '建议核心 3-5 个为达标' },
    { label: '异常预警',           value: competitorAlerts.filter(a => a.level !== 'low').length, desc: '价格 / BSR / Listing 变化' },
  ];

  el.innerHTML = `
    <div class="cm-kpi-grid">
      ${kpis.map(k => `
        <div class="cm-kpi-card ${k.warn ? 'warn' : ''}">
          <span>${k.label}</span>
          <strong>${k.value}</strong>
          <p>${k.desc}</p>
        </div>
      `).join('')}
    </div>

    <div class="cm-board-grid">
      <div class="cm-panel">
        <div class="cm-panel-head"><h3>各子品类健康度</h3><span>点击进入子品类竞品库</span></div>
        <div class="cm-health-list">
          ${competitorSubcategories.map(item => `
            <button onclick="cmJumpToPool('${item.id}')" class="${competitorMgrState.subcategory === item.id ? 'active' : ''}">
              <span><strong>${item.name}</strong><em>${item.site} · ${item.owner} · ${item.total} 个竞品</em></span>
              <i><b style="width:${item.coverage}%"></b></i>
              <small>${item.coverage}% · 待更新 ${item.stale}</small>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="cm-panel">
        <div class="cm-panel-head"><h3>异常预警</h3><span>近 7 天</span></div>
        ${renderAlertList(competitorAlerts)}
      </div>

      <div class="cm-panel">
        <div class="cm-panel-head"><h3>待处理事项</h3><span>需要负责人确认</span></div>
        <div class="cm-pending-list">
          ${competitorPending.map(item => `
            <button onclick="cmSwitchTab('${item.tab}')">
              <span class="cm-pending-dot"></span>
              <span>${item.text}</span>
              <em>处理 →</em>
            </button>
          `).join('')}
        </div>
      </div>
    </div>`;
}

// ============================================
//  Tab 2: 子品类竞品库（全字段表格）
// ============================================
function renderCompetitorPool() {
  const el = document.getElementById('cm-pane-pool');
  if (!el) return;
  const resolvedSubcategory = cmResolveSubcategory(competitorMgrState.category);
  const resolvedSubcategoryName = resolvedSubcategory ? cmGetSubcategoryName(resolvedSubcategory) : '';
  const currentTreeName = cmGetTreeCategoryName(competitorMgrState.category);
  const skusInCurrentSubcategory = resolvedSubcategory ? competitorSkus.filter(s => s.subcategory === resolvedSubcategory) : [];
  if (resolvedSubcategory && skusInCurrentSubcategory.length > 0 && !skusInCurrentSubcategory.some(s => s.id === competitorMgrState.sku)) {
    competitorMgrState.sku = skusInCurrentSubcategory[0].id;
  }
  if (resolvedSubcategory && skusInCurrentSubcategory.length === 0) {
    competitorMgrState.sku = '';
  }
  const currentSku = competitorSkus.find(s => s.id === competitorMgrState.sku);
  const f = competitorMgrState.poolFilter;
  const records = cmGetFilteredPoolRecords();
  const sites = Array.from(new Set(competitorRecords.map(r => r.site)));
  const tiers = ['头部竞品','直接竞品','新兴竞品','标杆竞品','替代竞品'];
  const statuses = ['有效','待复核','下架','已归档'];
  const totalPages = Math.max(1, Math.ceil(records.length / competitorMgrState.pagination.pageSize));
  if (competitorMgrState.pagination.page > totalPages) competitorMgrState.pagination.page = totalPages;
  const start = (competitorMgrState.pagination.page - 1) * competitorMgrState.pagination.pageSize;
  const pageRecords = records.slice(start, start + competitorMgrState.pagination.pageSize);
  competitorMgrState.selectedAsins = competitorMgrState.selectedAsins.filter(asin => records.some(r => r.asin === asin));
  const canBind = Boolean(currentSku);
  const allPageSelected = canBind && pageRecords.length > 0 && pageRecords.every(item => competitorMgrState.selectedAsins.includes(item.asin));

  el.innerHTML = `
    <div class="cm-master-layout ${competitorMgrState.sidebarCollapsed ? 'collapsed' : ''}">
      <aside class="cm-master-sidebar ${competitorMgrState.sidebarCollapsed ? 'collapsed' : ''}">
        ${renderCompetitorCategoryTree()}
      </aside>

      <section class="cm-master-main">
        <div class="cm-master-toolbar">
          <div>
            <h3>${currentTreeName} · 竞品主数据</h3>
            <p>${resolvedSubcategory ? `映射子品类：${resolvedSubcategoryName}` : '该子品类暂未接入竞品数据'} · 当前结果 ${records.length} 条 · 核心竞品 ${records.filter(r => ['头部竞品','直接竞品','标杆竞品'].includes(r.tier)).length} 个 · 待复核 ${records.filter(r => r.status === '待复核').length} 个</p>
          </div>
          <div class="cm-master-actions">
            <button class="cm-btn cm-btn-secondary cm-btn-sm" onclick="cmToast('已模拟：批量导入竞品')">批量导入</button>
            <button class="cm-btn cm-btn-secondary cm-btn-sm" onclick="cmExportPool()">导出</button>
            <button class="cm-btn cm-btn-secondary cm-btn-sm" onclick="cmToast('已模拟：刷新竞品数据')">刷新</button>
            <button class="cm-btn cm-btn-primary cm-btn-sm" onclick="cmOpenAddDialog()">+ 新增竞品</button>
          </div>
        </div>

        <div class="cm-filter-row">
          <label>站点
            <select onchange="cmUpdatePoolFilter('site', this.value)">
              <option value="">全部</option>
              ${sites.map(s => `<option value="${s}" ${f.site===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </label>
          <label>竞品定位
            <select onchange="cmUpdatePoolFilter('tier', this.value)">
              <option value="">全部</option>
              ${tiers.map(t => `<option value="${t}" ${f.tier===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </label>
          <label>产品状态
            <select onchange="cmUpdatePoolFilter('status', this.value)">
              <option value="">全部</option>
              ${statuses.map(s => `<option value="${s}" ${f.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </label>
          <label class="cm-filter-grow">关键词
            <input type="text" placeholder="ASIN / 品牌 / 标题" value="${f.kw || ''}" oninput="cmUpdatePoolFilter('kw', this.value)" />
          </label>
          <div class="cm-filter-summary">
            共 <strong>${records.length}</strong> 条结果
          </div>
        </div>

        <div class="cm-table-wrap cm-pool-table-wrap">
          <table class="cm-data-table cm-pool-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="选择当前页竞品" onchange="cmTogglePageSelection(this.checked)" ${allPageSelected ? 'checked' : ''} ${!canBind || pageRecords.length === 0 ? 'disabled' : ''} /></th>
                <th>产品图</th>
                <th>ASIN</th>
                <th>品牌</th>
                <th>站点</th>
                <th>产品源</th>
                <th>月销量</th>
                <th>售价</th>
                <th>上市日期</th>
                <th>竞品状态</th>
                <th>竞品定位</th>
                <th>BSR 大类</th>
                <th>BSR 小类</th>
                <th>评分</th>
                <th>Review</th>
                <th>维护人</th>
                <th>更新时间</th>
                <th class="cm-col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              ${records.length === 0 ? `<tr><td colspan="18" class="cm-empty-row">暂无符合条件的竞品，可调整筛选或新增竞品。</td></tr>` :
                pageRecords.map(item => `
                  <tr>
                    <td><input type="checkbox" aria-label="选择竞品 ${item.asin}" onchange="cmTogglePoolSelection('${item.asin}', this.checked)" ${competitorMgrState.selectedAsins.includes(item.asin) ? 'checked' : ''} ${!canBind ? 'disabled' : ''} /></td>
                    <td>${cmTableImage(item)}</td>
                    <td><a href="${item.link}" target="_blank" rel="noopener" class="cm-asin-link">${item.asin}</a></td>
                    <td><strong>${item.brand}</strong></td>
                    <td>${item.site}</td>
                    <td>${item.source || '市场月报 · 2026-04'}</td>
                    <td>${item.monthSales}</td>
                    <td>${item.price}</td>
                    <td>${item.listedDate}</td>
                    <td>${cmStatus(item.status)}</td>
                    <td>${cmTag(item.tier)}</td>
                    <td>${item.bsrMain}</td>
                    <td>${item.bsrSub}</td>
                    <td>${item.rating}</td>
                    <td>${item.reviews.toLocaleString()}</td>
                    <td>${item.owner}</td>
                    <td>${item.updated}</td>
                    <td class="cm-col-actions">
                      ${cmRenderPoolRowActions(item.asin)}
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
        ${cmRenderBatchBindBar()}
        ${cmRenderPagination(records.length)}
      </section>
    </div>`;
}

// ============================================
//  Tab 3: SKU竞品库（三栏布局）
// ============================================
function renderCompetitorSku() {
  const el = document.getElementById('cm-pane-sku');
  if (!el) return;
  const sku = getCurrentSku();
  const skuCategories = cmGetLeafTreeCategories()
    .map(category => ({ ...category, subcategory: cmResolveSubcategory(category.id) }))
    .filter(category => category.subcategory && competitorSkus.some(s => s.subcategory === category.subcategory));
  const skusInSub = competitorSkus.filter(s => s.subcategory === competitorMgrState.subcategory);
  const bindings = competitorBindings.filter(b => b.sku === competitorMgrState.sku);
  const groupedBindings = ['核心竞品', '参考竞品', '观察竞品']
    .map(level => ({ level, items: bindings.filter(b => b.level === level) }))
    .filter(group => group.items.length > 0);

  el.innerHTML = `
    <div class="cm-sku-3col">
      <!-- 第一栏：子品类列表 -->
      <div class="cm-sku-col">
        <div class="cm-sku-col-head">子品类</div>
        <div class="cm-sku-col-body">
          ${skuCategories.map(item => `
            <button class="cm-sku-col-item ${item.id === competitorMgrState.category ? 'active' : ''}" onclick="cmSelectSkuCategory('${item.id}')">
              <strong>${item.name}</strong>
              <em>${item.parentName} · ${competitorSkus.filter(s => s.subcategory === item.subcategory).length} 个 SKU · ${cmGetTreeCount(item.id)} 个竞品</em>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 第二栏：该子品类下的 SKU 列表 -->
      <div class="cm-sku-col">
        <div class="cm-sku-col-head">SKU 列表（${skusInSub.length}）</div>
        <div class="cm-sku-col-body">
          ${skusInSub.length === 0 ? '<div class="cm-empty cm-empty-sm">该子品类暂无 SKU</div>' :
            skusInSub.map(s => {
              const bound = competitorBindings.filter(b => b.sku === s.id).length;
              return `
                <button class="cm-sku-col-item ${s.id === competitorMgrState.sku ? 'active' : ''}" onclick="cmSelectSku('${s.id}')">
                  <strong>${s.id}</strong>
                  <em>${s.name}</em>
                  <small>${s.owner} · 绑定 ${bound} 个竞品 · 上架 ${s.launchDate}</small>
                </button>
              `;
            }).join('')
          }
        </div>
      </div>

      <!-- 第三栏：当前 SKU 绑定的竞品 -->
      <div class="cm-sku-col cm-sku-col-main">
        <div class="cm-sku-col-head cm-sku-main-head">
          <div>
            <strong>${sku.id} · ${sku.name} · 已绑定结果管理</strong>
            <em>${sku.owner} 负责 · 上架 ${sku.launchDate} · 绑定竞品 ${bindings.length} 个（核心 ${bindings.filter(b => b.level === '核心竞品').length} / 参考 ${bindings.filter(b => b.level === '参考竞品').length} / 观察 ${bindings.filter(b => b.level === '观察竞品').length}）</em>
          </div>
          <div class="cm-sku-actions">
            <button class="cm-btn cm-btn-secondary cm-btn-sm" onclick="cmSwitchTab('pool')">去竞品主数据绑定</button>
          </div>
        </div>
        <div class="cm-sku-col-body cm-sku-col-body-flat">
          ${bindings.length === 0 ? '<div class="cm-empty">该 SKU 暂未绑定任何竞品。请回到“竞品主数据”选择子品类竞品后绑定到当前 SKU。</div>' : `
            <div class="cm-binding-groups">
              ${groupedBindings.map(group => `
                <section class="cm-binding-group">
                  <h4>${group.level} <span>${group.items.length}</span></h4>
                  <div class="cm-table-wrap">
                    <table class="cm-data-table cm-sku-table">
                      <thead>
                        <tr>
                          <th>ASIN</th>
                          <th>品牌</th>
                          <th>标题</th>
                          <th>绑定级别</th>
                          <th>价格</th>
                          <th>BSR 小类</th>
                          <th>评分</th>
                          <th>Review</th>
                          <th>月销估算</th>
                          <th>更新时间</th>
                          <th>绑定人 / 时间</th>
                          <th class="cm-col-actions">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${group.items.map(b => {
                          const r = competitorRecords.find(x => x.asin === b.asin) || {};
                          return `
                            <tr>
                              <td><a href="${r.link || '#'}" target="_blank" rel="noopener" class="cm-asin-link">${b.asin}</a></td>
                              <td><strong>${r.brand || '-'}</strong></td>
                              <td class="cm-cell-title" title="${r.title || ''}">${r.title || '-'}</td>
                              <td>
                                <select class="cm-mini-select cm-bind-level-select" onchange="cmChangeBindLevel('${b.sku}','${b.asin}', this.value)">
                                  ${['核心竞品','参考竞品','观察竞品'].map(lv => `<option value="${lv}" ${b.level===lv?'selected':''}>${lv}</option>`).join('')}
                                </select>
                              </td>
                              <td>${r.price || '-'}</td>
                              <td>${r.bsrSub || '-'}</td>
                              <td>${r.rating || '-'}</td>
                              <td>${r.reviews ? r.reviews.toLocaleString() : '-'}</td>
                              <td>${r.monthSales || '-'}</td>
                              <td>${r.updated || '-'}</td>
                              <td>${b.boundBy} · ${b.boundAt}</td>
                              <td class="cm-col-actions">
                                <button class="cm-link-btn" onclick="cmOpenCompetitor('${b.asin}')">查看</button>
                                <button class="cm-link-btn cm-link-btn-warn" onclick="cmUnbindCompetitor('${b.sku}','${b.asin}')">解绑</button>
                              </td>
                            </tr>`;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </section>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>`;
}

// ============================================
//  详情抽屉（全字段）
// ============================================
function cmIntelList(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '<p class="cm-muted">暂无数据</p>';
  return `<ul class="cm-intel-list">${list.map(item => `<li>${cmEscapeHtml(item)}</li>`).join('')}</ul>`;
}

function cmIntelCard(title, body) {
  return `<div class="cm-intel-card"><h5>${title}</h5>${body}</div>`;
}

function cmDefaultListingTitle(item) {
  if (['woundPatch', 'dressing'].includes(item.subcategory)) {
    return 'Nexcare Waterproof Clear Bandages, Transparent Adhesive Bandages for Wound Care, Flexible Waterproof Protection, Assorted Sizes, 50 Count';
  }
  return `${item.brand || 'Competitor'} ${cmGetSubcategoryName(item.subcategory)} Product, Clear Feature-Led Amazon Listing Title for Shopper Comparison`;
}

function cmDefaultListingBullets(item) {
  if (['woundPatch', 'dressing'].includes(item.subcategory)) {
    return [
      'WATERPROOF PROTECTION: Designed to help seal out water, dirt, and germs while keeping minor wounds protected during showers and daily routines.',
      'CLEAR AND DISCREET DESIGN: Transparent bandage material blends with skin for a cleaner look and more discreet wound coverage.',
      'STRONG ADHESION: Flexible adhesive helps the bandage stay in place on fingers, hands, elbows, and other active areas.',
      'COMFORTABLE WOUND CARE: Soft, flexible construction supports everyday movement while protecting cuts, scrapes, and small wounds.',
      'ASSORTED SIZES FOR DAILY USE: Multiple bandage sizes support family wound care needs at home, in travel kits, and in first aid supplies.',
    ];
  }
  return [
    'CLEAR CORE BENEFIT: The listing explains the primary shopper benefit in simple English and connects the product to everyday use.',
    'FEATURE-LED STRUCTURE: Each bullet starts with a visible benefit header so shoppers can scan functions, proof points, and use cases quickly.',
    'PRACTICAL DAILY USE: The copy highlights home, travel, office, and routine scenarios to make the product easier to understand.',
    'COMFORT AND RELIABILITY: The content emphasizes materials, ease of use, and dependable performance for the target audience.',
    'COMPLETE PURCHASE CONTEXT: The final bullet summarizes package contents, size fit, and why the product is suitable for repeat use.',
  ];
}

function cmDefaultListingFaq() {
  return [
    {
      q: 'Are these bandages waterproof?',
      a: 'Yes. They are designed to help keep water away from minor wounds during showers and daily activities.',
    },
    {
      q: 'Can they be used on fingers or joints?',
      a: 'Yes. The flexible adhesive is suitable for fingers, hands, elbows, and other areas that move frequently.',
    },
    {
      q: 'Are the bandages clear on skin?',
      a: 'Yes. The transparent material is designed for a more discreet look compared with traditional fabric bandages.',
    },
    {
      q: 'What wound types are they for?',
      a: 'They are intended for minor cuts, scrapes, and everyday wound protection.',
    },
    {
      q: 'Are multiple sizes included?',
      a: 'Yes. The assortment supports different small wound care scenarios at home, work, or travel.',
    },
  ];
}

function cmIsElectrotherapyItem(item) {
  const subcategory = String(item && item.subcategory || '').toLowerCase();
  const productType = String(item && item.productType || '');
  const title = String(item && item.title || '').toLowerCase();
  return subcategory === 'therapy'
    || /电疗|理疗|tens|ems|muscle stimulator|electrotherapy/i.test(productType)
    || /tens|ems|muscle stimulator|electrotherapy/.test(title);
}

function cmDefaultElectrotherapySellingImages() {
  return [
    {
      title: 'Doctor Recommended Hero',
      caption: 'Main product hero with doctor-recommended trust badge and hand-touch texture cue.',
      image: 'assets/competitor-electrotherapy/seat-cushion-hero.png',
    },
    {
      title: 'Comfort & Pain Relief Scenario',
      caption: 'Shows office sitting use case with posture, fatigue, tailbone pressure and sciatica relief claims.',
      image: 'assets/competitor-electrotherapy/comfort-pain-relief.png',
    },
    {
      title: 'Pressure Relief Structure',
      caption: 'Explains U-shaped contour, sloped design, hip alignment and coccyx pressure relief.',
      image: 'assets/competitor-electrotherapy/pressure-relief-design.png',
    },
    {
      title: 'Premium Feature Breakdown',
      caption: 'Highlights adaptive memory foam, non-slip base, breathable mesh and removable washable cover.',
      image: 'assets/competitor-electrotherapy/premium-features.png',
    },
    {
      title: 'Multi-Chair Usage Scenarios',
      caption: 'Maps the cushion to office chair, car, wheelchair and travel seating scenarios.',
      image: 'assets/competitor-electrotherapy/chair-scenarios.png',
    },
    {
      title: 'Firmness Proof',
      caption: 'Communicates firmness level and pressure support in an office sitting scene.',
      image: 'assets/competitor-electrotherapy/firmness-proof.png',
    },
    {
      title: 'Expert Trust Endorsement',
      caption: 'Uses doctor endorsement and product-in-hand visual to strengthen authority and trust.',
      image: 'assets/competitor-electrotherapy/doctor-recommended.png',
    },
  ];
}

function cmDefaultSellingImages(item) {
  return cmDefaultElectrotherapySellingImages();
}

function cmNormalizeListingBullets(listing, item) {
  const defaults = cmDefaultListingBullets(item);
  const source = cmEnsureArray(listing && listing.bullets, cmEnsureArray(item.bullets, []))
    .map(v => typeof v === 'string' ? v.trim() : '')
    .filter(v => !cmHasCjkText(v))
    .filter(Boolean);
  return [...source, ...defaults].slice(0, 5);
}

function cmHasCjkText(value) {
  return /[\u3400-\u9fff]/.test(String(value || ''));
}

function cmParseFaqItem(item) {
  if (item && typeof item === 'object') {
    return {
      q: String(item.q || item.question || '').trim(),
      a: String(item.a || item.answer || '').trim(),
    };
  }
  const text = String(item || '').trim();
  if (!text) return null;
  const compact = text.replace(/\s+/g, ' ');
  const qaMatch = compact.match(/^Q[:：]\s*(.+?)\s+A[:：]\s*(.+)$/i);
  if (qaMatch) return { q: qaMatch[1].trim(), a: qaMatch[2].trim() };
  return {
    q: compact.replace(/^Q[:：]\s*/i, ''),
    a: 'Public Amazon FAQ answer pending collection.',
  };
}

function cmNormalizeListingFaq(listing) {
  const parsed = cmEnsureArray(listing && listing.faq, [])
    .map(cmParseFaqItem)
    .filter(item => item && item.q);
  return [...parsed, ...cmDefaultListingFaq()]
    .filter(item => item.q && item.a)
    .slice(0, 5);
}

function cmNormalizeSellingImages(listing, item) {
  const defaults = cmDefaultSellingImages(item);
  const source = cmEnsureArray(listing && listing.gallery, [])
    .map(item => {
      if (!item || typeof item !== 'object') return null;
      return {
        title: String(item.title || '').trim(),
        caption: String(item.caption || '').trim(),
        image: String(item.image || '').trim(),
      };
    })
    .filter(item => item && item.title);
  return Array.from({ length: 7 }, (_, idx) => {
    const src = source[idx] || {};
    const fallback = defaults[idx] || {};
    return {
      title: fallback.title || src.title || `Selling Image ${idx + 1}`,
      caption: fallback.caption || src.caption || '',
      image: fallback.image || src.image || '',
    };
  });
}

function cmBulletHeadline(text) {
  const raw = String(text || '');
  const idx = raw.indexOf(':');
  if (idx <= 0 || idx > 42) return 'Selling Point';
  return raw.slice(0, idx).trim();
}

function cmBulletBody(text) {
  const raw = String(text || '');
  const idx = raw.indexOf(':');
  if (idx <= 0 || idx > 42) return raw;
  return raw.slice(idx + 1).trim();
}

function cmRenderListingTitle(title) {
  return `<div class="cm-listing-title-panel">
    <div class="cm-listing-title-meta">
      <span>Title</span>
    </div>
    <p>${cmEscapeHtml(title)}</p>
  </div>`;
}

function cmRenderListingTdCards(bullets) {
  return `<div class="cm-listing-subblock">
    <div class="cm-listing-subhead">
      <h6>5 TD / Bullet Points</h6>
    </div>
    <div class="cm-listing-td-grid">
      ${bullets.map((text, idx) => `<article class="cm-listing-td-card">
        <span>TD ${String(idx + 1).padStart(2, '0')}</span>
        <strong>${cmEscapeHtml(cmBulletHeadline(text))}</strong>
        <p>${cmEscapeHtml(cmBulletBody(text))}</p>
      </article>`).join('')}
    </div>
  </div>`;
}

function cmRenderListingFaqCards(faqList) {
  return `<div class="cm-listing-subblock">
    <div class="cm-listing-subhead">
      <h6>FAQ · 5 QA</h6>
    </div>
    <div class="cm-listing-faq-grid">
      ${faqList.map((item, idx) => `<article class="cm-listing-faq-card">
        <span>Q${idx + 1}</span>
        <h6>${cmEscapeHtml(item.q)}</h6>
        <p>${cmEscapeHtml(item.a)}</p>
      </article>`).join('')}
    </div>
  </div>`;
}

function cmRenderSellingImageGallery(images) {
  return `<div class="cm-listing-subblock">
    <div class="cm-listing-subhead">
      <h6>Selling Point Images · 7</h6>
    </div>
    <div class="cm-selling-gallery">
      ${images.map((item, idx) => `<figure class="cm-selling-image-card ${idx === 0 ? 'hero' : ''}">
        ${item.image
          ? `<img src="${cmEscapeAttr(item.image)}" alt="${cmEscapeAttr(item.title)}" loading="lazy" />`
          : `<div class="cm-selling-image-placeholder"><span>${String(idx + 1).padStart(2, '0')}</span></div>`}
        <figcaption>
          <strong>${cmEscapeHtml(item.title)}</strong>
          <p>${cmEscapeHtml(item.caption)}</p>
        </figcaption>
      </figure>`).join('')}
    </div>
  </div>`;
}

function cmRenderListingContentBlock(item, listing) {
  const rawTitle = (listing && listing.title) || item.title || '';
  const title = rawTitle && !cmHasCjkText(rawTitle) ? rawTitle : cmDefaultListingTitle(item);
  const bullets = cmNormalizeListingBullets(listing, item);
  const faqList = cmNormalizeListingFaq(listing);
  const images = cmNormalizeSellingImages(listing, item);
  return `<div class="cm-intel-card cm-listing-content-card">
    <div class="cm-listing-content-head">
      <div>
        <h5>Listing Content</h5>
      </div>
      <span>Title + 5 TD + 5 QA + 7 Images</span>
    </div>
    ${cmRenderListingTitle(title)}
    ${cmRenderListingTdCards(bullets)}
    ${cmRenderListingFaqCards(faqList)}
    ${cmRenderSellingImageGallery(images)}
  </div>`;
}

function cmTableImage(item) {
  if (item.image) {
    return `<img src="${cmEscapeAttr(item.image)}" alt="${cmEscapeAttr(item.brand)}" class="cm-table-img" loading="lazy" />`;
  }
  return '<div class="cm-table-img cm-table-img-placeholder">待采集</div>';
}

function cmDrawerImage(item) {
  if (item.image) {
    return `<img src="${cmEscapeAttr(item.image)}" alt="${cmEscapeAttr(item.brand)}" class="cm-drawer-img"/>`;
  }
  return '<div class="cm-drawer-img cm-drawer-img-placeholder">图片待采集</div>';
}

function cmRenderInfoRows(rows) {
  return `<div class="cm-info-rows">${rows.map(row => `
    <div><span>${row.label}</span><strong>${cmEscapeHtml(row.value || '—')}</strong></div>
  `).join('')}</div>`;
}

function cmRenderKeyMetrics(item) {
  return `<div class="cm-key-metrics">
    <div><span>售价</span><strong>${cmEscapeHtml(item.price || '-')}</strong><em>${cmEscapeHtml(item.coupon || '无优惠')}</em></div>
    <div><span>评分</span><strong>${cmEscapeHtml(item.rating || '-')}</strong><em>${cmEscapeHtml(item.reviews ? `${item.reviews.toLocaleString()} reviews` : '评论待采集')}</em></div>
    <div><span>月销估算</span><strong>${cmEscapeHtml(item.monthSales || '-')}</strong><em>Amazon 销售表现</em></div>
    <div><span>BSR 小类</span><strong>${cmEscapeHtml(item.bsrSub || '-')}</strong><em>${cmEscapeHtml(item.bsrMain || '大类待采集')}</em></div>
  </div>`;
}

function cmRenderTrendGroup(title, rows) {
  const list = Array.isArray(rows) ? rows : [];
  return cmIntelCard(title, `<div class="cm-trend-list">${list.map(row => `
    <div class="cm-trend-row">
      <span>${cmEscapeHtml(row.label)}</span>
      <strong>${cmEscapeHtml(row.value)}</strong>
      <em>${cmEscapeHtml(row.note || '')}</em>
    </div>
  `).join('')}</div>`);
}

function cmRenderKeywordBars(title, keywords, cls) {
  const list = Array.isArray(keywords) ? keywords : [];
  const max = Math.max(...list.map(item => item.count || 0), 1);
  return `<div class="cm-keyword-card ${cls || ''}">
    <h5>${title}</h5>
    <div class="cm-keyword-bars">
      ${list.map(item => {
        const percent = Math.max(8, Math.round(((item.count || 0) / max) * 100));
        return `<div class="cm-keyword-bar-row">
          <div class="cm-keyword-bar-head"><span>${cmEscapeHtml(item.keyword)}</span><strong>${item.count || 0}</strong></div>
          <div class="cm-keyword-track"><i style="width:${percent}%"></i></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function cmRenderReviewSliceTreemap(keywords) {
  const groups = [
    { sentiment: 'positive', label: '好评',   tone: 'pos',      list: keywords.positive   || [] },
    { sentiment: 'negative', label: '差评',   tone: 'neg',      list: keywords.negative   || [] },
    { sentiment: 'scenario', label: '场景',   tone: 'scenario', list: keywords.scenarios  || [] },
    { sentiment: 'unmet',    label: '未满足', tone: 'unmet',    list: keywords.unmetNeeds || [] },
  ].map(g => {
    const sorted = [...g.list].sort((a, b) => (b.count || 0) - (a.count || 0));
    const total = sorted.reduce((s, k) => s + (k.count || 0), 0);
    return { ...g, sorted, total };
  });
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);
  const cols = groups.map(g => `${Math.max(g.total, 1)}fr`).join(' ');
  return `<div class="cm-review-slice" style="grid-template-columns:${cols}">
    ${groups.map(g => {
      if (!g.sorted.length) {
        return `<div class="cm-slice-col">
          <div class="cm-slice-col-head ${g.tone}">${cmEscapeHtml(g.label)} · 0 条</div>
          <div class="cm-slice-empty">暂无数据</div>
        </div>`;
      }
      const share = grandTotal > 0 ? Math.round((g.total / grandTotal) * 100) : 0;
      return `<div class="cm-slice-col">
        <div class="cm-slice-col-head ${g.tone}">${cmEscapeHtml(g.label)} · ${g.total} 条 · ${share}%</div>
        <div class="cm-slice-col-body">
          ${g.sorted.map((item, idx) => {
            const grow = Math.max(item.count || 0, 1);
            const rankCls = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-4plus';
            const active = competitorMgrState.drawerActiveSample === `${g.sentiment}|${item.keyword}`;
            const safeKw = JSON.stringify(item.keyword).replace(/"/g, '&quot;');
            const titleAttr = cmEscapeAttr(`${item.keyword} · ${item.count || 0}`);
            return `<button type="button" class="cm-slice-block ${g.tone} ${rankCls} ${active ? 'active' : ''}"
              style="flex-grow:${grow}"
              title="${titleAttr}"
              onclick="cmDrawerShowKeywordSamples('${g.sentiment}', ${safeKw})">
              <strong>${cmEscapeHtml(item.keyword)}</strong>
              <span>${item.count || 0}</span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function cmRenderStaticData(item, listing, skuBindings) {
  const profile = item.staticProfile || {};
  return `<section class="cm-intel-section">
    <div class="cm-intel-section-head">
      <span>01</span>
      <div><h4>静态数据</h4><p>竞品身份、Listing 原文、产品规格和绑定关系。</p></div>
    </div>
    <div class="cm-intel-grid">
      ${cmIntelCard('基础身份', cmRenderInfoRows([
        { label: '品牌', value: item.brand },
        { label: 'ASIN', value: item.asin },
        { label: '站点', value: item.site },
        { label: '子品类', value: cmGetSubcategoryName(item.subcategory) },
        { label: '竞品定位', value: item.tier },
        { label: '数据来源', value: item.source || '市场月报 · 2026-04' },
      ]))}
      ${cmIntelCard('产品规格', cmRenderInfoRows([
        { label: '产品类型', value: item.productType || cmGetSubcategoryName(item.subcategory) },
        { label: '颜色 / 款式', value: profile.color },
        { label: '尺寸', value: profile.dimensions },
        { label: '材质', value: profile.material },
        { label: '上架时间', value: item.listedDate },
      ]))}
      ${cmRenderListingContentBlock(item, listing)}
      ${cmIntelCard('包装与适用场景', `${cmIntelList(profile.packageIncludes)}<div class="cm-card-divider"></div>${cmIntelList(profile.targetUsers)}<div class="cm-card-divider"></div>${cmIntelList(profile.usageScenarios)}`)}
      ${cmIntelCard('A+ 页面摘要', cmIntelList(listing.aplus))}
      ${cmIntelCard('合规信息', cmIntelList(profile.compliance))}
      ${cmIntelCard('SKU 绑定关系', skuBindings.length === 0 ? '<p class="cm-muted">暂无绑定 SKU</p>' : skuBindings.map(b => `<span class="cm-bind-pill">${b.sku} · ${b.level}</span>`).join(''))}
    </div>
  </section>`;
}

function cmRenderDynamicData(item) {
  const metrics = item.dynamicMetrics || {};
  return `<section class="cm-intel-section">
    <div class="cm-intel-section-head">
      <span>02</span>
      <div><h4>动态数据</h4><p>价格、销量、排名、评分、评论和近期变化。</p></div>
    </div>
    <div class="cm-intel-grid cm-intel-grid-compact">
      ${cmRenderTrendGroup('价格与销量', metrics.priceTrend)}
      ${cmRenderTrendGroup('BSR 排名', metrics.bsrTrend)}
      ${cmRenderTrendGroup('Review 增长', metrics.reviewTrend)}
      ${cmRenderTrendGroup('评分趋势', metrics.ratingTrend)}
    </div>
    <ul class="cm-drawer-timeline cm-sales-changes">${(item.changes || []).map(c => `<li><span>${item.updated}</span><strong>${cmEscapeHtml(c)}</strong></li>`).join('')}</ul>
  </section>`;
}

function cmRenderAnalysisData(item, product, user, summary) {
  return `<section class="cm-intel-section">
    <div class="cm-intel-section-head">
      <span>03</span>
      <div><h4>分析数据</h4><p>产品、内容、用户和运营动作的结构化判断。</p></div>
    </div>
    <div class="cm-ai-summary">
      <div class="cm-ai-summary-head">
        <strong>${cmEscapeHtml(summary.conclusion)}</strong>
        <span>威胁等级：${cmEscapeHtml(summary.threatLevel)}</span>
      </div>
    </div>
    <div class="cm-intel-grid">
      ${cmIntelCard('产品优势', cmIntelList(product.advantages))}
      ${cmIntelCard('产品弱点', cmIntelList(product.weaknesses))}
      ${cmIntelCard('差异化机会', cmIntelList(product.opportunities))}
      ${cmIntelCard('可借鉴点', cmIntelList(product.references))}
      ${cmIntelCard('好评关注点', cmIntelList(user.positive))}
      ${cmIntelCard('差评 / 客诉点', cmIntelList(user.negative))}
      ${cmIntelCard('未满足需求', cmIntelList(user.unmetNeeds))}
      ${cmIntelCard('用户决策顾虑', cmIntelList(user.concerns))}
      ${cmIntelCard('内容策略', cmIntelList(summary.contentStrategy))}
      ${cmIntelCard('风险规避', cmIntelList(summary.risks))}
      ${cmIntelCard('运营动作', cmIntelList(summary.actions))}
      ${cmIntelCard('收录原因', `<p>${cmEscapeHtml(item.reason)}</p>`)}
    </div>
  </section>`;
}

// ============================================
//  抽屉：sparkline / 状态条 / Tab 切换 / 工具
// ============================================
function cmRenderSparkline(series, opts) {
  const data = Array.isArray(series) && series.length > 1 ? series : [0, 0];
  const width = (opts && opts.width) || 132;
  const height = (opts && opts.height) || 36;
  const stroke = (opts && opts.stroke) || '#2563eb';
  const fill = (opts && opts.fill) || 'rgba(37,99,235,0.12)';
  const showDot = !(opts && opts.showDot === false);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  const lastX = points[points.length - 1][0];
  const lastY = points[points.length - 1][1];
  const titleAttr = `首值 ${data[0].toFixed(2)} → 末值 ${data[data.length - 1].toFixed(2)}`;
  return `<svg class="cm-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="趋势" focusable="false">
    <title>${cmEscapeHtml(titleAttr)}</title>
    <path d="${area}" fill="${fill}" stroke="none"></path>
    <path d="${path}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></path>
    ${showDot ? `<circle cx="${lastX.toFixed(2)}" cy="${lastY.toFixed(2)}" r="2.4" fill="${stroke}"></circle>` : ''}
  </svg>`;
}

function cmSparkDelta(series) {
  if (!Array.isArray(series) || series.length < 2) return null;
  const first = series[0];
  const last = series[series.length - 1];
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;
  const pct = ((last - first) / Math.abs(first)) * 100;
  return pct;
}

function cmRenderSparkDelta(series, opts) {
  const pct = cmSparkDelta(series);
  if (pct === null) return '';
  // BSR 是越小越好，需要倒置色彩
  const invert = opts && opts.invert;
  const goodWhenUp = !invert;
  const isUp = pct > 0;
  const isFlat = Math.abs(pct) < 0.5;
  const cls = isFlat ? 'flat' : (isUp === goodWhenUp ? 'up-good' : 'up-bad');
  const arrow = isFlat ? '→' : (isUp ? '↑' : '↓');
  return `<span class="cm-spark-delta ${cls}">${arrow} ${Math.abs(pct).toFixed(1)}%</span>`;
}

function cmDrawerNavSnapshot(asin) {
  const tab = competitorMgrState.tab;
  let list = [];
  if (tab === 'sku') {
    const skuBindings = competitorBindings.filter(b => b.sku === competitorMgrState.sku);
    list = skuBindings.map(b => b.asin);
  } else {
    list = cmGetFilteredPoolRecords().map(r => r.asin);
  }
  list = list.filter((id, idx) => list.indexOf(id) === idx);
  if (list.indexOf(asin) === -1) list.push(asin);
  competitorMgrState.drawerNavList = list;
}

function cmGetDrawerNavSibling(direction) {
  const list = competitorMgrState.drawerNavList || [];
  if (list.length < 2) return null;
  const idx = list.indexOf(cmCurrentDrawerAsin());
  if (idx < 0) return null;
  const nextIdx = (idx + direction + list.length) % list.length;
  return list[nextIdx];
}

function cmCurrentDrawerAsin() {
  return competitorMgrState.detailAsin || '';
}

function cmDrawerNavTo(direction) {
  const next = cmGetDrawerNavSibling(direction);
  if (!next) {
    cmToast('已经是列表的边界了');
    return;
  }
  cmOpenCompetitor(next, { keepTab: true });
}

function cmRerenderDrawerPanel() {
  const asin = competitorMgrState.detailAsin;
  if (!asin) return;
  const item = competitorRecords.find(r => r.asin === asin);
  if (!item) return;
  const root = document.querySelector('.cm-detail-page');
  if (!root) return;
  const tabId = competitorMgrState.drawerTab;
  root.querySelectorAll('.cm-drawer-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  const panel = root.querySelector('#cm-drawer-tabpanel');
  if (panel) panel.innerHTML = cmRenderDrawerTabPanel(item, tabId);
}

function cmSwitchDrawerTab(tabId) {
  if (competitorMgrState.drawerTab !== tabId) {
    competitorMgrState.drawerActiveSample = '';
  }
  competitorMgrState.drawerTab = tabId;
  cmRerenderDrawerPanel();
}

function cmCopyAsin(asin) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(asin).then(() => cmToast(`已复制 ASIN ${asin}`)).catch(() => cmToast(`复制失败：${asin}`));
  } else {
    try {
      const ta = document.createElement('textarea');
      ta.value = asin;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      cmToast(`已复制 ASIN ${asin}`);
    } catch (e) {
      cmToast(`复制失败：${asin}`);
    }
  }
}

function cmDrawerShowKeywordSamples(sentiment, keyword) {
  const id = `${sentiment}|${keyword}`;
  competitorMgrState.drawerActiveSample = competitorMgrState.drawerActiveSample === id ? '' : id;
  cmRerenderDrawerPanel();
}

function cmDrawerToggleExpand(key) {
  competitorMgrState.drawerExpanded[key] = !competitorMgrState.drawerExpanded[key];
  cmRerenderDrawerPanel();
}

// ============================================
//  抽屉头部 + 操作组 + Tab 导航
// ============================================
function cmThreatBadge(level) {
  const lv = level || '观察';
  const cls = lv === '高' ? 'high' : lv === '中' ? 'mid' : 'low';
  return `<span class="cm-threat-badge ${cls}">威胁等级 · ${cmEscapeHtml(lv)}</span>`;
}

function cmRenderDrawerStatusBar(item, skuBindings, summary) {
  const bindingText = skuBindings.length === 0
    ? '尚未绑定 SKU'
    : skuBindings.map(b => `${b.sku} · ${b.level}`).join('｜');
  return `<div class="cm-drawer-statusbar">
    ${cmThreatBadge(summary.threatLevel)}
    <div class="cm-status-cell">
      <span>绑定 SKU</span>
      <strong title="${cmEscapeAttr(bindingText)}">${skuBindings.length} 个 SKU</strong>
    </div>
    <div class="cm-status-cell">
      <span>维护人</span>
      <strong>${cmEscapeHtml(item.owner || '-')}</strong>
    </div>
    <div class="cm-status-cell">
      <span>更新时间</span>
      <strong>${cmEscapeHtml(item.updated || '-')}</strong>
    </div>
    <div class="cm-status-cell">
      <span>竞品状态</span>
      <strong>${cmEscapeHtml(item.status || '-')}</strong>
    </div>
  </div>`;
}

function cmRenderDrawerActions(item) {
  const prev = cmGetDrawerNavSibling(-1);
  const next = cmGetDrawerNavSibling(1);
  const navTotal = (competitorMgrState.drawerNavList || []).length;
  const navIdx = navTotal ? competitorMgrState.drawerNavList.indexOf(item.asin) + 1 : 0;
  return `<div class="cm-drawer-actions-bar">
    <div class="cm-drawer-action-left">
      <a href="${item.link || '#'}" target="_blank" rel="noopener" class="cm-drawer-action-link">打开 Amazon</a>
      <button type="button" onclick="cmOpenCompetitorEditor('${item.asin}')">编辑</button>
      <button type="button" onclick="cmCopyAsin('${item.asin}')">复制 ASIN</button>
      <button type="button" onclick="cmToast('加入 SKU 绑定弹窗规划中，已提示设计同学')">加入 SKU</button>
    </div>
    <div class="cm-drawer-action-right">
      <button type="button" class="cm-drawer-nav-btn" onclick="cmDrawerNavTo(-1)" ${prev ? '' : 'disabled'} title="上一条">‹ 上一条</button>
      <span class="cm-drawer-nav-indicator">${navIdx || '-'} / ${navTotal || '-'}</span>
      <button type="button" class="cm-drawer-nav-btn" onclick="cmDrawerNavTo(1)" ${next ? '' : 'disabled'} title="下一条">下一条 ›</button>
    </div>
  </div>`;
}

function cmRenderKeyMetricsWithSpark(item) {
  const metrics = item.dynamicMetrics || {};
  const priceSeries = (metrics.priceTrend && metrics.priceTrend[0] && metrics.priceTrend[0].series) || [];
  const ratingSeries = (metrics.ratingTrend && metrics.ratingTrend[0] && metrics.ratingTrend[0].series) || [];
  const reviewSeries = (metrics.reviewTrend && metrics.reviewTrend[0] && metrics.reviewTrend[0].series) || [];
  const bsrSeries = (metrics.bsrTrend && (metrics.bsrTrend[1] || metrics.bsrTrend[0]) && (metrics.bsrTrend[1] || metrics.bsrTrend[0]).series) || [];
  return `<div class="cm-key-metrics cm-key-metrics-spark">
    <div>
      <span>售价</span>
      <strong>${cmEscapeHtml(item.price || '-')}</strong>
      <em>${cmEscapeHtml(item.coupon || '无优惠')}</em>
      ${cmRenderSparkline(priceSeries, { stroke: '#2563eb', fill: 'rgba(37,99,235,0.12)' })}
    </div>
    <div>
      <span>评分</span>
      <strong>${cmEscapeHtml(item.rating || '-')}</strong>
      <em>${cmEscapeHtml(item.reviews ? `${item.reviews.toLocaleString()} reviews` : '评论待采集')}</em>
      ${cmRenderSparkline(ratingSeries, { stroke: '#10b981', fill: 'rgba(16,185,129,0.12)' })}
    </div>
    <div>
      <span>月销估算</span>
      <strong>${cmEscapeHtml(item.monthSales || '-')}</strong>
      <em>Amazon 销售表现</em>
      ${cmRenderSparkline(reviewSeries, { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.12)' })}
    </div>
    <div>
      <span>BSR 小类</span>
      <strong>${cmEscapeHtml(item.bsrSub || '-')}</strong>
      <em>${cmEscapeHtml(item.bsrMain || '大类待采集')}</em>
      ${cmRenderSparkline(bsrSeries, { stroke: '#6366f1', fill: 'rgba(99,102,241,0.12)' })}
    </div>
  </div>`;
}

function cmDrawerTabs() {
  return [
    ['overview', '概览'],
    ['static',   '静态档案'],
    ['dynamic',  '动态监控'],
    ['analysis', '分析洞察'],
    ['keywords', '评论分析'],
    ['seo',      'SEO关键词'],
  ];
}

function cmRenderDrawerTabsNav() {
  const cur = competitorMgrState.drawerTab || 'overview';
  return `<div class="cm-drawer-tabs" role="tablist">
    ${cmDrawerTabs().map(([id, name]) => `
      <button type="button" role="tab" class="cm-drawer-tab ${id === cur ? 'active' : ''}" data-tab="${id}" onclick="cmSwitchDrawerTab('${id}')">${name}</button>
    `).join('')}
  </div>`;
}

// ============================================
//  抽屉：分析洞察 Top3 折叠
// ============================================
function cmRenderAnalysisCard(title, items, key, limit) {
  const list = Array.isArray(items) ? items : [];
  const lim = typeof limit === 'number' ? limit : 3;
  const expanded = !!competitorMgrState.drawerExpanded[key];
  const showList = expanded || list.length <= lim ? list : list.slice(0, lim);
  const hasMore = list.length > lim;
  return `<div class="cm-analysis-card">
    <div class="cm-analysis-card-head">
      <h6>${cmEscapeHtml(title)}</h6>
      ${hasMore ? `<button type="button" class="cm-analysis-expand" onclick="cmDrawerToggleExpand('${cmEscapeAttr(key)}')">${expanded ? '收起' : `展开全部 ${list.length}`}</button>` : ''}
    </div>
    ${showList.length === 0 ? '<p class="cm-muted">暂无数据</p>' : `<ul class="cm-intel-list">${showList.map(v => `<li>${cmEscapeHtml(v)}</li>`).join('')}</ul>`}
  </div>`;
}

function cmRenderAnalysisGroup(title, subtitle, cards) {
  return `<section class="cm-analysis-group cm-section-card">
    <header class="cm-analysis-group-head">
      <h5>${cmEscapeHtml(title)}</h5>
      <p>${cmEscapeHtml(subtitle)}</p>
    </header>
    <div class="cm-analysis-group-grid">${cards.join('')}</div>
  </section>`;
}

// ============================================
//  抽屉：关键词双向对比 + 代表性评论
// ============================================
function cmRenderKeywordCompareBars(positive, negative, opts) {
  const limit = opts && typeof opts.limit === 'number' ? opts.limit : 6;
  const posList = (Array.isArray(positive) ? positive : []).slice(0, limit);
  const negList = (Array.isArray(negative) ? negative : []).slice(0, limit);
  const rows = Math.max(posList.length, negList.length);
  const allCounts = [
    ...posList.map(item => item.count || 0),
    ...negList.map(item => item.count || 0),
  ];
  const max = Math.max(...allCounts, 1);
  const renderHalf = (item, side) => {
    if (!item) return `<div class="cm-kw-compare-cell ${side} empty"></div>`;
    const percent = Math.max(8, Math.round(((item.count || 0) / max) * 100));
    const sentimentKey = side === 'pos' ? 'positive' : 'negative';
    const active = competitorMgrState.drawerActiveSample === `${sentimentKey}|${item.keyword}`;
    return `<button type="button" class="cm-kw-compare-cell ${side} ${active ? 'active' : ''}" onclick="cmDrawerShowKeywordSamples('${sentimentKey}', ${JSON.stringify(item.keyword).replace(/"/g, '&quot;')})">
      <span class="cm-kw-compare-label">${cmEscapeHtml(item.keyword)}</span>
      <span class="cm-kw-compare-count">${item.count || 0}</span>
      <i style="width:${percent}%"></i>
    </button>`;
  };
  return `<div class="cm-kw-compare">
    <div class="cm-kw-compare-headrow">
      <span class="cm-kw-compare-headlabel pos">好评关键词</span>
      <span class="cm-kw-compare-headlabel neg">差评 / 痛点关键词</span>
    </div>
    <div class="cm-kw-compare-body">
      ${Array.from({ length: rows }).map((_, idx) => `
        <div class="cm-kw-compare-row">
          ${renderHalf(posList[idx], 'pos')}
          ${renderHalf(negList[idx], 'neg')}
        </div>
      `).join('')}
    </div>
  </div>`;
}

function cmRenderKeywordBarsClickable(title, keywords, sentimentKey, cls) {
  const list = Array.isArray(keywords) ? keywords : [];
  const max = Math.max(...list.map(item => item.count || 0), 1);
  return `<div class="cm-keyword-card ${cls || ''}">
    <h5>${cmEscapeHtml(title)}</h5>
    <div class="cm-keyword-bars">
      ${list.map(item => {
        const percent = Math.max(8, Math.round(((item.count || 0) / max) * 100));
        const active = competitorMgrState.drawerActiveSample === `${sentimentKey}|${item.keyword}`;
        return `<button type="button" class="cm-keyword-bar-row clickable ${active ? 'active' : ''}" onclick="cmDrawerShowKeywordSamples('${sentimentKey}', ${JSON.stringify(item.keyword).replace(/"/g, '&quot;')})">
          <div class="cm-keyword-bar-head"><span>${cmEscapeHtml(item.keyword)}</span><strong>${item.count || 0}</strong></div>
          <div class="cm-keyword-track"><i style="width:${percent}%"></i></div>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

function cmRenderClickedKeywordSamples(allKeywords) {
  const active = competitorMgrState.drawerActiveSample;
  if (!active) return '';
  const [sentiment, keyword] = active.split('|');
  const sourceKey = sentiment === 'scenario' ? 'scenarios' : sentiment === 'unmet' ? 'unmetNeeds' : sentiment === 'positive' ? 'positive' : 'negative';
  const source = allKeywords[sourceKey];
  if (!Array.isArray(source)) return '';
  const item = source.find(k => k.keyword === keyword);
  if (!item) return '';
  const samples = Array.isArray(item.samples) ? item.samples : [];
  const tone = sentiment === 'positive' ? 'pos' : sentiment === 'negative' ? 'neg' : sentiment === 'scenario' ? 'scenario' : 'unmet';
  const label = sentiment === 'positive' ? '好评原文样本' : sentiment === 'negative' ? '差评原文样本' : sentiment === 'scenario' ? '使用场景描述样本' : '未满足需求样本';
  return `<div class="cm-kw-samples ${tone}">
    <div class="cm-kw-samples-head">
      <strong>${cmEscapeHtml(item.keyword)}</strong>
      <em>${label} · ${samples.length} 条</em>
      <button type="button" class="cm-kw-samples-close" onclick="cmDrawerShowKeywordSamples('${sentiment}', ${JSON.stringify(item.keyword).replace(/"/g, '&quot;')})">收起</button>
    </div>
    <ul>${samples.map(s => `<li>${cmEscapeHtml(s)}</li>`).join('')}</ul>
  </div>`;
}

function cmBusinessDecisionItems(item) {
  const summary = item.aiSummary || {};
  return [
    {
      cls: 'opportunity',
      label: '机会点',
      title: '本品可借鉴与超越的位置',
      items: cmEnsureArray(summary.contentStrategy, [
        '拆解竞品 Title、图片和 A+ 的卖点顺序，找到本品可借鉴的表达结构',
        '用差评痛点反推本品可补强的场景、材质和 FAQ 证明',
      ]).slice(0, 3),
    },
    {
      cls: 'risk',
      label: '风险点',
      title: '跟进竞品时需要规避的坑',
      items: cmEnsureArray(summary.risks, [
        '避免直接照搬竞品表达，尤其是功效、认证和绝对化承诺',
        '图片对比、材质安全和医疗相关说法需要确认真实依据',
      ]).slice(0, 3),
    },
    {
      cls: 'action',
      label: '下一步',
      title: '建议运营直接推进的动作',
      items: cmEnsureArray(summary.actions, [
        '纳入核心竞品池，定期复核价格、Review、BSR 和图片变化',
        '将差异化证明点转成 Listing、图片、FAQ 和 A+ 优化任务',
      ]).slice(0, 3),
    },
  ];
}

function cmRenderBusinessSummary(item) {
  const summary = item.aiSummary || {};
  const decisionItems = cmBusinessDecisionItems(item);
  return `<div class="cm-business-summary cm-section-card">
    <header class="cm-business-summary-head">
      <div>
        <span>AI 经营总结</span>
        <h5>${cmEscapeHtml(summary.conclusion || '暂无 AI 结论，请补充竞品经营判断。')}</h5>
        <p>面向亚马逊运营决策，聚焦这个竞品是否值得跟、哪里可借鉴、哪些风险要规避、下一步怎么做。</p>
      </div>
      ${cmThreatBadge(summary.threatLevel || '观察')}
    </header>
    <div class="cm-business-decision-grid">
      ${decisionItems.map(card => `
        <article class="cm-business-decision-card ${card.cls}">
          <div class="cm-business-card-kicker">${cmEscapeHtml(card.label)}</div>
          <h6>${cmEscapeHtml(card.title)}</h6>
          <ul>${card.items.map(text => `<li>${cmEscapeHtml(text)}</li>`).join('')}</ul>
        </article>
      `).join('')}
    </div>
  </div>`;
}

// ============================================
//  抽屉：Tab 面板内容
// ============================================
function cmRenderOverviewTab(item) {
  const summary = item.aiSummary || {};
  const metrics = item.dynamicMetrics || {};
  const keywords = item.reviewKeywords || {};
  const sparkCard = (title, label, series, opts) => `
    <div class="cm-overview-spark">
      <div class="cm-overview-spark-head">
        <span>${cmEscapeHtml(title)}</span>
        ${cmRenderSparkDelta(series, opts)}
      </div>
      <strong>${cmEscapeHtml(label)}</strong>
      ${cmRenderSparkline(series, Object.assign({ width: 200, height: 44 }, opts || {}))}
    </div>`;
  const priceRow = metrics.priceTrend && metrics.priceTrend[0];
  const ratingRow = metrics.ratingTrend && metrics.ratingTrend[0];
  const reviewRow = metrics.reviewTrend && metrics.reviewTrend[0];
  const bsrRow = metrics.bsrTrend && (metrics.bsrTrend[1] || metrics.bsrTrend[0]);
  return `<section class="cm-tabpanel-section">
    <div class="cm-overview-conclusion cm-section-card">
      <div>
        <span>一句话结论</span>
        <p>${cmEscapeHtml(summary.conclusion || '暂无 AI 结论，请补充评估意见。')}</p>
      </div>
      ${cmThreatBadge(summary.threatLevel)}
    </div>

    <div class="cm-overview-block cm-section-card">
      <header><h5>好评 vs 差评 Top 3</h5><p>双向对比，左为好评，右为差评 / 痛点；点击关键词查看代表性评论。</p></header>
      ${cmRenderKeywordCompareBars(keywords.positive, keywords.negative, { limit: 3 })}
      ${cmRenderClickedKeywordSamples(keywords)}
    </div>

    <div class="cm-overview-block cm-section-card">
      <header><h5>关键指标 30 天走势</h5><p>价格 / 评分 / Review / BSR 走势速览（mock）。</p></header>
      <div class="cm-overview-spark-grid">
        ${sparkCard('售价走势', item.price || (priceRow ? priceRow.value : '-'), priceRow ? priceRow.series : [], { stroke: '#2563eb', fill: 'rgba(37,99,235,0.14)' })}
        ${sparkCard('评分走势', String(item.rating || (ratingRow ? ratingRow.value : '-')), ratingRow ? ratingRow.series : [], { stroke: '#10b981', fill: 'rgba(16,185,129,0.14)' })}
        ${sparkCard('Review 增长', item.reviews ? item.reviews.toLocaleString() : (reviewRow ? reviewRow.value : '-'), reviewRow ? reviewRow.series : [], { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.14)' })}
        ${sparkCard('BSR 小类', item.bsrSub || (bsrRow ? bsrRow.value : '-'), bsrRow ? bsrRow.series : [], { stroke: '#6366f1', fill: 'rgba(99,102,241,0.14)', invert: true })}
      </div>
    </div>

    ${cmRenderBusinessSummary(item)}
  </section>`;
}

function cmRenderStaticTab(item, listing, skuBindings) {
  return `<section class="cm-tabpanel-section">${cmRenderStaticData(item, listing, skuBindings)}</section>`;
}

function cmRenderDynamicTab(item) {
  const metrics = item.dynamicMetrics || {};
  const card = (title, group, invert) => {
    const list = Array.isArray(group) ? group : [];
    return `<div class="cm-trend-card cm-section-card">
      <h6>${cmEscapeHtml(title)}</h6>
      ${list.map(row => `
        <div class="cm-trend-card-row">
          <div class="cm-trend-card-meta">
            <span>${cmEscapeHtml(row.label)}</span>
            <strong>${cmEscapeHtml(row.value)}</strong>
            ${cmRenderSparkDelta(row.series, { invert })}
          </div>
          ${cmRenderSparkline(row.series || [], { width: 168, height: 36, stroke: invert ? '#6366f1' : '#2563eb', fill: invert ? 'rgba(99,102,241,0.12)' : 'rgba(37,99,235,0.12)' })}
          ${row.note ? `<em>${cmEscapeHtml(row.note)}</em>` : ''}
        </div>
      `).join('')}
    </div>`;
  };
  return `<section class="cm-tabpanel-section">
    <div class="cm-trend-grid">
      ${card('价格与销量', metrics.priceTrend, false)}
      ${card('BSR 排名',   metrics.bsrTrend,   true)}
      ${card('Review 增长', metrics.reviewTrend, false)}
      ${card('评分趋势',   metrics.ratingTrend, false)}
    </div>
    ${(item.changes && item.changes.length > 0) ? `
      <h6 class="cm-trend-timeline-title">最近变化时间轴</h6>
      <ul class="cm-drawer-timeline cm-sales-changes">${(item.changes || []).map(c => `<li><span>${cmEscapeHtml(item.updated || '-')}</span><strong>${cmEscapeHtml(c)}</strong></li>`).join('')}</ul>
    ` : ''}
  </section>`;
}

function cmRenderAnalysisTab(item, product, user, summary) {
  const reasonItems = item.reason ? [item.reason] : [];
  return `<section class="cm-tabpanel-section">
    ${cmRenderAnalysisGroup('产品力', '基于 Listing、规格和卖点的拆解', [
      cmRenderAnalysisCard('产品优势', product.advantages, 'prod-adv'),
      cmRenderAnalysisCard('产品弱点', product.weaknesses, 'prod-weak'),
      cmRenderAnalysisCard('差异化机会', product.opportunities, 'prod-opp'),
      cmRenderAnalysisCard('可借鉴点', product.references, 'prod-ref'),
    ])}
    ${cmRenderAnalysisGroup('用户洞察', '来自评论 / 客诉 / 决策顾虑的归纳', [
      cmRenderAnalysisCard('好评关注点', user.positive, 'user-pos'),
      cmRenderAnalysisCard('差评 / 客诉点', user.negative, 'user-neg'),
      cmRenderAnalysisCard('未满足需求', user.unmetNeeds, 'user-unmet'),
      cmRenderAnalysisCard('决策顾虑', user.concerns, 'user-concern'),
    ])}
    ${cmRenderAnalysisGroup('内容策略', 'Listing / A+ / 图片表达建议', [
      cmRenderAnalysisCard('内容策略', summary.contentStrategy, 'sum-strategy'),
      cmRenderAnalysisCard('风险规避', summary.risks, 'sum-risks'),
      cmRenderAnalysisCard('收录原因', reasonItems, 'sum-reason', 1),
    ])}
    ${cmRenderAnalysisGroup('运营动作', '可落到执行项的下一步建议', [
      cmRenderAnalysisCard('运营动作', summary.actions, 'sum-actions'),
    ])}
  </section>`;
}

function cmRenderKeywordsTab(item) {
  const keywords = item.reviewKeywords || {};
  return `<section class="cm-tabpanel-section">
    <div class="cm-overview-block cm-section-card">
      <header><h5>好评 vs 差评对比</h5><p>左为好评，右为差评，点击任意关键词查看代表性评论。</p></header>
      ${cmRenderKeywordCompareBars(keywords.positive, keywords.negative, { limit: 8 })}
    </div>
    <div class="cm-keyword-overview cm-keyword-overview-two cm-section-card">
      ${cmRenderKeywordBarsClickable('使用场景关键词', keywords.scenarios, 'scenario', 'scenario')}
      ${cmRenderKeywordBarsClickable('未满足需求', keywords.unmetNeeds, 'unmet', 'unmet')}
    </div>
    <div class="cm-review-slice-wrap cm-section-card">
      <header>
        <h5>评论切片分析</h5>
        <p>列宽代表该分组评论总量，块高代表该关键词出现频次，点击任一块在下方展开代表性评论。</p>
      </header>
      ${cmRenderReviewSliceTreemap(keywords)}
    </div>
    ${cmRenderClickedKeywordSamples(keywords)}
  </section>`;
}

function cmRenderSeoTrafficTable(terms) {
  const list = Array.isArray(terms) ? terms : [];
  const maxVolume = Math.max(...list.map(row => row.volume || 0), 1);
  if (list.length === 0) return '<p class="cm-muted">暂无 SEO 关键词数据</p>';
  return `<div class="cm-seo-table-wrap">
    <div class="cm-seo-table">
      <div class="cm-seo-row cm-seo-head">
        <span>关键词</span>
        <span>月搜索量</span>
        <span>自然排名</span>
        <span>广告位</span>
        <span>转化率</span>
      </div>
      ${list.map(row => {
        const volume = row.volume || 0;
        const percent = Math.max(8, Math.round((volume / maxVolume) * 100));
        const rankClass = (row.organicRank || 99) <= 10 ? 'up' : 'down';
        return `<div class="cm-seo-row">
          <strong>${cmEscapeHtml(row.keyword)}</strong>
          <div class="cm-seo-volume">
            <span>${volume.toLocaleString()}</span>
            <i><b style="width:${percent}%"></b></i>
          </div>
          <span class="cm-seo-rank ${rankClass}">#${row.organicRank || '-'}</span>
          <span>${row.adRank ? `#${row.adRank}` : '-'}</span>
          <span>${cmEscapeHtml(row.conversion || '-')}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function cmRenderSeoAbaTerms(terms) {
  const list = Array.isArray(terms) ? terms : [];
  if (list.length === 0) return '<p class="cm-muted">暂无 ABA 搜索词数据</p>';
  return `<div class="cm-seo-aba-grid">
    ${list.map(row => `<article class="cm-seo-aba-card">
      <span>Search Frequency Rank #${row.freqRank || '-'}</span>
      <h6>${cmEscapeHtml(row.keyword)}</h6>
      <div>
        <em>点击份额 <strong>${cmEscapeHtml(row.clickShare || '-')}</strong></em>
        <em>转化份额 <strong>${cmEscapeHtml(row.conversionShare || '-')}</strong></em>
      </div>
    </article>`).join('')}
  </div>`;
}

function cmRenderSeoGap(gap) {
  const groups = [
    ['covered', '竞品已覆盖', '已在竞品 Listing / 广告中形成稳定露出'],
    ['uncovered', '本品未覆盖', '本品当前表达薄弱，容易漏掉搜索流量'],
    ['opportunity', '建议抢占', '优先补进 Title、Bullet、图片或广告词包'],
  ];
  return `<div class="cm-seo-gap-grid">
    ${groups.map(([key, title, note]) => {
      const list = cmEnsureArray(gap && gap[key], []);
      return `<article class="cm-seo-gap-card ${key}">
        <div>
          <h6>${title}</h6>
          <p>${note}</p>
        </div>
        ${list.length === 0 ? '<p class="cm-muted">暂无数据</p>' : `<ul class="cm-intel-list">${list.map(text => `<li>${cmEscapeHtml(text)}</li>`).join('')}</ul>`}
      </article>`;
    }).join('')}
  </div>`;
}

function cmRenderSeoTab(item) {
  const seo = item.seoKeywords || {};
  return `<section class="cm-tabpanel-section">
    <div class="cm-overview-block cm-section-card">
      <header>
        <h5>核心流量词</h5>
        <p>从搜索量、自然排名、广告位和转化率判断竞品 SEO 流量来源。</p>
      </header>
      ${cmRenderSeoTrafficTable(seo.trafficTerms)}
    </div>

    <div class="cm-overview-block cm-section-card">
      <header>
        <h5>ABA 搜索词</h5>
        <p>模拟 Amazon Brand Analytics 口径，观察搜索频率、点击份额和转化份额。</p>
      </header>
      ${cmRenderSeoAbaTerms(seo.abaTerms)}
    </div>

    <div class="cm-overview-block cm-section-card">
      <header>
        <h5>关键词覆盖 Gap</h5>
        <p>把竞品已覆盖词、本品未覆盖词和建议抢占词拆开，方便转成 Listing 与广告优化动作。</p>
      </header>
      ${cmRenderSeoGap(seo.gap)}
    </div>
  </section>`;
}

function cmRenderDrawerTabPanel(item, tabId) {
  const listing = item.listing || {};
  const product = item.productAnalysis || {};
  const user = item.userAnalysis || {};
  const summary = item.aiSummary || {};
  const skuBindings = competitorBindings.filter(b => b.asin === item.asin);
  switch (tabId) {
    case 'static':   return cmRenderStaticTab(item, listing, skuBindings);
    case 'dynamic':  return cmRenderDynamicTab(item);
    case 'analysis': return cmRenderAnalysisTab(item, product, user, summary);
    case 'keywords': return cmRenderKeywordsTab(item);
    case 'seo':      return cmRenderSeoTab(item);
    case 'overview':
    default:         return cmRenderOverviewTab(item);
  }
}

function cmRenderDetailBackBar(item) {
  const prev = cmGetDrawerNavSibling(-1);
  const next = cmGetDrawerNavSibling(1);
  const prevDisabled = prev ? '' : 'disabled';
  const nextDisabled = next ? '' : 'disabled';
  const prevTitle = prev ? `上一个：${prev}` : '已是第一个';
  const nextTitle = next ? `下一个：${next}` : '已是最后一个';
  const navList = competitorMgrState.drawerNavList || [];
  const idx = navList.indexOf(item.asin);
  const indicator = idx >= 0 && navList.length > 1
    ? `<span class="cm-detail-nav-indicator">${idx + 1} / ${navList.length}</span>`
    : '';
  return `<div class="cm-detail-back-bar">
    <div class="cm-detail-back-left">
      <button type="button" class="cm-detail-back-btn" onclick="cmBackToCompetitorList()">
        <span aria-hidden="true">←</span> 返回竞品列表
      </button>
      <div class="cm-detail-crumbs">
        <span>${cmEscapeHtml(item.brand)}</span>
        <i>·</i>
        <span>${cmEscapeHtml(item.asin)}</span>
        <i>·</i>
        <span>${cmEscapeHtml(item.site)}</span>
      </div>
    </div>
    <div class="cm-detail-back-right">
      <div class="cm-detail-back-tools">
        <a class="cm-detail-back-link" href="${item.link || '#'}" target="_blank" rel="noopener">打开 Amazon</a>
        <button type="button" onclick="cmOpenCompetitorEditor('${item.asin}')">编辑</button>
        <button type="button" onclick="cmToast('加入 SKU 绑定弹窗规划中，已提示设计同学')">加入 SKU</button>
      </div>
      <span class="cm-detail-back-divider" aria-hidden="true"></span>
      <div class="cm-detail-back-nav">
        ${indicator}
        <button type="button" class="cm-detail-nav-btn" ${prevDisabled} title="${prevTitle}" onclick="cmDrawerNavTo(-1)">‹ 上一个</button>
        <button type="button" class="cm-detail-nav-btn" ${nextDisabled} title="${nextTitle}" onclick="cmDrawerNavTo(1)">下一个 ›</button>
      </div>
    </div>
  </div>`;
}

function cmRenderCompetitorDetailPage(item) {
  const skuBindings = competitorBindings.filter(b => b.asin === item.asin);
  const summary = item.aiSummary || {};
  const skuBindingText = skuBindings.length === 0
    ? '尚未绑定 SKU'
    : skuBindings.map(b => `${b.sku} · ${b.level}`).join('｜');
  return `<section class="cm-detail-page" data-asin="${cmEscapeAttr(item.asin)}">
    ${cmRenderDetailBackBar(item)}

    <div class="cm-drawer-hero cm-detail-hero">
      ${cmDrawerImage(item)}
      <div class="cm-drawer-hero-info">
        <div class="cm-detail-hero-titlerow">
          <h2>${cmEscapeHtml(item.title)}</h2>
          ${cmThreatBadge(summary.threatLevel)}
        </div>
        <div class="cm-drawer-tags">${cmTag(item.tier)} ${cmStatus(item.status)}</div>
        <div class="cm-drawer-identity cm-detail-identity">
          <div><span>品牌</span><strong>${cmEscapeHtml(item.brand)}</strong></div>
          <div><span>ASIN</span><strong>${cmEscapeHtml(item.asin)}</strong></div>
          <div><span>站点</span><strong>${cmEscapeHtml(item.site)}</strong></div>
          <div><span>子品类</span><strong>${cmEscapeHtml(cmGetSubcategoryName(item.subcategory))}</strong></div>
          <div><span>来源</span><strong>${cmEscapeHtml(item.source || '市场月报 · 2026-04')}</strong></div>
          <div><span>绑定 SKU</span><strong title="${cmEscapeAttr(skuBindingText)}">${skuBindings.length} 个 SKU</strong></div>
          <div><span>维护人</span><strong>${cmEscapeHtml(item.owner || '-')}</strong></div>
          <div><span>更新时间</span><strong>${cmEscapeHtml(item.updated || '-')}</strong></div>
        </div>
      </div>
    </div>

    <div class="cm-section-card cm-metrics-card">
      <div class="cm-section-card-head">
        <div>
          <h5>关键指标 · 30 天走势</h5>
          <p>售价 / 评分 / 月销估算 / BSR 小类，sparkline 反映近 30 天波动。</p>
        </div>
      </div>
      ${cmRenderKeyMetricsWithSpark(item)}
    </div>

    ${cmRenderDrawerTabsNav()}

    <div class="cm-drawer-tabpanel" id="cm-drawer-tabpanel">
      ${cmRenderDrawerTabPanel(item, competitorMgrState.drawerTab)}
    </div>
  </section>`;
}

function cmOpenCompetitor(asin, options) {
  const item = competitorRecords.find(record => record.asin === asin);
  if (!item) return;
  const keepTab = options && options.keepTab;
  if (!keepTab) competitorMgrState.drawerTab = 'overview';
  competitorMgrState.drawerExpanded = {};
  competitorMgrState.drawerActiveSample = '';
  cmDrawerNavSnapshot(asin);
  competitorMgrState.viewMode = 'detail';
  competitorMgrState.detailAsin = asin;
  renderCompetitorMgrView();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function cmBackToCompetitorList() {
  competitorMgrState.viewMode = 'list';
  competitorMgrState.detailAsin = '';
  renderCompetitorMgrView();
}

function cmRenderCompetitorEditorPage(item) {
  const asin = item.asin;
  const statusOptions = ['有效', '待复核', '下架', '已归档'];
  const tierOptions = ['头部竞品', '直接竞品', '新兴竞品', '标杆竞品', '替代竞品'];
  const ownerOptions = ['Mason', 'Ida', 'Brian', 'Suki'];
  const siteOptions = ['US', 'UK', 'DE', 'JP'];
  const skuBindings = competitorBindings.filter(b => b.asin === asin);

  return `<section class="cm-detail-page cm-detail-page-editor" data-asin="${cmEscapeAttr(asin)}">
    <div class="cm-detail-back-bar">
      <div class="cm-detail-back-left">
        <button type="button" class="cm-detail-back-btn" onclick="cmBackToCompetitorList()">
          <span aria-hidden="true">←</span> 返回竞品列表
        </button>
        <div class="cm-detail-crumbs">
          <span>编辑竞品</span><i>·</i>
          <span>${cmEscapeHtml(item.brand)}</span><i>·</i>
          <span>${cmEscapeHtml(item.asin)}</span>
        </div>
      </div>
    </div>

    <form id="cm-edit-form" class="cm-edit-form" onsubmit="event.preventDefault(); cmSaveCompetitorEdit('${asin}')">
      <section class="cm-edit-section">
        <h4>基础信息</h4>
        <p>用于识别竞品唯一身份。</p>
        <div class="cm-edit-grid">
          ${cmEditInput('ASIN *', 'asin', item.asin)}
          ${cmEditSelect('站点 *', 'site', item.site, siteOptions)}
          ${cmEditInput('品牌 *', 'brand', item.brand)}
          ${cmEditInput('Amazon 链接', 'link', item.link, true)}
          ${cmEditInput('产品图 URL', 'image', item.image, true)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>Listing 信息</h4>
        <p>维护竞品 Title、TD、A+ 和 FAQ 摘要，每行一条。</p>
        <div class="cm-edit-grid">
          ${cmEditTextarea('Listing Title', 'listing.title', item.listing.title || item.title, true)}
          ${cmEditArrayTextarea('TD / Bullet Points', 'listing.bullets', item.listing.bullets)}
          ${cmEditArrayTextarea('A+ 页面摘要', 'listing.aplus', item.listing.aplus)}
          ${cmEditArrayTextarea('FAQ 摘要', 'listing.faq', item.listing.faq)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>维护信息</h4>
        <p>用于管理竞品状态、定位、负责人和数据来源。</p>
        <div class="cm-edit-grid">
          ${cmEditSelect('竞品状态 *', 'status', item.status, statusOptions)}
          ${cmEditSelect('竞品定位 *', 'tier', item.tier, tierOptions)}
          ${cmEditSelect('维护人', 'owner', item.owner, ownerOptions)}
          ${cmEditInput('更新时间', 'updated', item.updated)}
          ${cmEditInput('数据来源', 'source', item.source || '市场月报 · 2026-04', true)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>销售与表现</h4>
        <p>用于维护价格、销量、评分等市场表现数据。</p>
        <div class="cm-edit-grid">
          ${cmEditInput('售价', 'price', item.price)}
          ${cmEditInput('优惠', 'coupon', item.coupon)}
          ${cmEditInput('月销量', 'monthSales', item.monthSales)}
          ${cmEditInput('评分', 'rating', item.rating)}
          ${cmEditInput('Review 数', 'reviews', item.reviews)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>类目排名</h4>
        <p>用于维护竞品类目位置和生命周期信息。</p>
        <div class="cm-edit-grid">
          ${cmEditInput('上市日期', 'listedDate', item.listedDate)}
          ${cmEditInput('BSR 大类', 'bsrMain', item.bsrMain, true)}
          ${cmEditInput('BSR 小类', 'bsrSub', item.bsrSub, true)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>收录原因</h4>
        <p>说明为什么这个竞品值得持续跟踪。</p>
        <div class="cm-edit-grid">
          ${cmEditTextarea('收录原因', 'reason', item.reason || '', true)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>动态记录</h4>
        <p>记录价格、图片、Review、排名等变化，每行一条。</p>
        <div class="cm-edit-grid">
          ${cmEditTextarea('动态记录（每行一条）', 'changes', (item.changes || []).join('\n'), true)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>使用场景</h4>
        <p>使用人群、触发购买情境和可用于图片/A+的视频场景，每行一条。</p>
        <div class="cm-edit-grid">
          ${cmEditArrayTextarea('使用场景（每行一条）', 'scenarios', item.scenarios)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>产品分析</h4>
        <p>拆解竞品功能、优劣势、机会点和可借鉴内容。</p>
        <div class="cm-edit-grid">
          ${cmEditArrayTextarea('核心功能', 'productAnalysis.functions', item.productAnalysis.functions)}
          ${cmEditArrayTextarea('产品优势', 'productAnalysis.advantages', item.productAnalysis.advantages)}
          ${cmEditArrayTextarea('产品弱点', 'productAnalysis.weaknesses', item.productAnalysis.weaknesses)}
          ${cmEditArrayTextarea('差异化机会', 'productAnalysis.opportunities', item.productAnalysis.opportunities)}
          ${cmEditArrayTextarea('可借鉴点', 'productAnalysis.references', item.productAnalysis.references)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>用户分析</h4>
        <p>按好评、差评、未满足需求和决策顾虑维护用户洞察。</p>
        <div class="cm-edit-grid">
          ${cmEditArrayTextarea('好评关注点', 'userAnalysis.positive', item.userAnalysis.positive)}
          ${cmEditArrayTextarea('差评 / 客诉点', 'userAnalysis.negative', item.userAnalysis.negative)}
          ${cmEditArrayTextarea('未满足需求', 'userAnalysis.unmetNeeds', item.userAnalysis.unmetNeeds)}
          ${cmEditArrayTextarea('用户决策顾虑', 'userAnalysis.concerns', item.userAnalysis.concerns)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>AI 总结</h4>
        <p>沉淀 AI 对竞品威胁、内容策略、风险和运营动作的结构化结论。</p>
        <div class="cm-edit-grid">
          ${cmEditTextarea('一句话结论', 'aiSummary.conclusion', item.aiSummary.conclusion, true)}
          ${cmEditInput('威胁等级', 'aiSummary.threatLevel', item.aiSummary.threatLevel)}
          ${cmEditArrayTextarea('可复制内容策略', 'aiSummary.contentStrategy', item.aiSummary.contentStrategy)}
          ${cmEditArrayTextarea('需要规避的风险', 'aiSummary.risks', item.aiSummary.risks)}
          ${cmEditArrayTextarea('建议运营动作', 'aiSummary.actions', item.aiSummary.actions)}
        </div>
      </section>

      <section class="cm-edit-section">
        <h4>SKU 绑定情况</h4>
        <p>绑定关系只读展示，请在竞品主数据列表或 SKU 绑定页维护。</p>
        <div class="cm-edit-readonly">
          ${skuBindings.length === 0 ? '<span class="cm-muted">暂无绑定 SKU</span>' :
            skuBindings.map(b => `<span class="cm-bind-pill">${b.sku} · ${b.level}</span>`).join('')}
        </div>
      </section>

      <div class="cm-drawer-actions cm-edit-actions">
        <button type="button" onclick="cmBackToCompetitorList()">取消</button>
        <button type="submit" class="cm-btn-primary">保存</button>
      </div>
    </form>
  </section>`;
}

function cmOpenCompetitorEditor(asin) {
  const item = competitorRecords.find(record => record.asin === asin);
  if (!item) return;
  competitorMgrState.viewMode = 'editor';
  competitorMgrState.detailAsin = asin;
  renderCompetitorMgrView();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function cmCloseDrawer() {
  cmBackToCompetitorList();
}

// ============================================
//  小工具 / 操作
// ============================================
function cmSaveCompetitorEdit(originalAsin) {
  const item = competitorRecords.find(record => record.asin === originalAsin);
  const form = document.getElementById('cm-edit-form');
  if (!item || !form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const nextAsin = (data.asin || '').trim();
  if (!nextAsin) {
    cmToast('ASIN 不能为空');
    return;
  }
  if (!(data['listing.title'] || '').trim()) {
    cmToast('Listing Title 不能为空');
    return;
  }
  if (nextAsin !== originalAsin && competitorRecords.some(record => record.asin === nextAsin)) {
    cmToast(`ASIN ${nextAsin} 已存在`);
    return;
  }

  const existingGallery = cmNormalizeSellingImages(item.listing || {}, item);
  Object.assign(item, {
    asin: nextAsin,
    brand: (data.brand || '').trim(),
    site: data.site || '',
    link: (data.link || '').trim(),
    image: (data.image || '').trim(),
    title: (data['listing.title'] || '').trim(),
    source: (data.source || '').trim(),
    monthSales: (data.monthSales || '').trim(),
    price: (data.price || '').trim(),
    coupon: (data.coupon || '').trim(),
    listedDate: (data.listedDate || '').trim(),
    status: data.status || '待复核',
    tier: data.tier || '参考竞品',
    bsrMain: (data.bsrMain || '').trim(),
    bsrSub: (data.bsrSub || '').trim(),
    rating: Number.parseFloat(data.rating) || 0,
    reviews: Number.parseInt(String(data.reviews || '').replace(/,/g, ''), 10) || 0,
    owner: data.owner || '',
    updated: (data.updated || '').trim(),
    reason: (data.reason || '').trim(),
    bullets: cmSplitTextareaLines(data['listing.bullets']),
    listing: {
      title: (data['listing.title'] || '').trim(),
      bullets: cmSplitTextareaLines(data['listing.bullets']),
      aplus: cmSplitTextareaLines(data['listing.aplus']),
      faq: cmSplitTextareaLines(data['listing.faq']),
      gallery: existingGallery,
    },
    scenarios: cmSplitTextareaLines(data.scenarios),
    productAnalysis: {
      functions: cmSplitTextareaLines(data['productAnalysis.functions']),
      advantages: cmSplitTextareaLines(data['productAnalysis.advantages']),
      weaknesses: cmSplitTextareaLines(data['productAnalysis.weaknesses']),
      opportunities: cmSplitTextareaLines(data['productAnalysis.opportunities']),
      references: cmSplitTextareaLines(data['productAnalysis.references']),
    },
    userAnalysis: {
      positive: cmSplitTextareaLines(data['userAnalysis.positive']),
      negative: cmSplitTextareaLines(data['userAnalysis.negative']),
      unmetNeeds: cmSplitTextareaLines(data['userAnalysis.unmetNeeds']),
      concerns: cmSplitTextareaLines(data['userAnalysis.concerns']),
    },
    aiSummary: {
      conclusion: (data['aiSummary.conclusion'] || '').trim(),
      threatLevel: (data['aiSummary.threatLevel'] || '').trim(),
      contentStrategy: cmSplitTextareaLines(data['aiSummary.contentStrategy']),
      risks: cmSplitTextareaLines(data['aiSummary.risks']),
      actions: cmSplitTextareaLines(data['aiSummary.actions']),
    },
    changes: cmSplitTextareaLines(data.changes),
  });

  if (nextAsin !== originalAsin) {
    competitorBindings.forEach(binding => {
      if (binding.asin === originalAsin) binding.asin = nextAsin;
    });
    competitorMgrState.selectedAsins = competitorMgrState.selectedAsins.map(asin => asin === originalAsin ? nextAsin : asin);
  }

  cmToast(`已保存竞品 ${nextAsin}`);
  cmCloseDrawer();
  refreshCompetitorMgr();
}

function cmSplitTextareaLines(value) {
  return String(value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function cmEditInput(label, name, value, isWide = false) {
  return `
    <label class="${isWide ? 'cm-edit-wide' : ''}">
      <span>${label}</span>
      <input name="${name}" value="${cmEscapeAttr(value)}" />
    </label>`;
}

function cmEditSelect(label, name, value, options) {
  return `
    <label>
      <span>${label}</span>
      <select name="${name}">
        ${options.map(option => `<option value="${cmEscapeAttr(option)}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
      </select>
    </label>`;
}

function cmEditTextarea(label, name, value, isWide = false) {
  return `
    <label class="${isWide ? 'cm-edit-wide' : ''}">
      <span>${label}</span>
      <textarea name="${name}">${cmEscapeHtml(value)}</textarea>
    </label>`;
}

function cmEditArrayTextarea(label, name, value) {
  const lines = (value || []).map(item => {
    if (item && typeof item === 'object') {
      const q = item.q || item.question || '';
      const a = item.a || item.answer || '';
      return q || a ? `Q: ${q} A: ${a}` : '';
    }
    return item;
  }).filter(Boolean);
  return `
    <label class="cm-edit-wide">
      <span>${label}</span>
      <textarea class="cm-edit-textarea-tall" name="${name}">${cmEscapeHtml(lines.join('\n'))}</textarea>
    </label>`;
}

function cmEscapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cmEscapeAttr(value) {
  return cmEscapeHtml(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderAlertList(alerts) {
  return `<div class="cm-alert-list">${alerts.map(alert => `
    <div class="cm-alert ${alert.level}">
      <b>${alert.title}</b>
      <p>${alert.detail}</p>
      <span>${alert.time}</span>
    </div>
  `).join('')}</div>`;
}

function cmBuildAdditionalCompetitors() {
  const groups = [
    {
      subcategory: 'woundPatch',
      type: '伤口贴',
      site: 'US',
      brands: ['Band-Aid', 'Nexcare', 'Care Science', 'Curad', 'Welly', 'All-Health', 'Medline', 'Solimo', 'Healqu', 'CooKote', 'HSAND', 'SLOCBBL'],
      titles: ['Flexible Fabric Adhesive Bandages', 'Waterproof Clear Bandages', 'Hydrocolloid Blister Bandages', 'Kids Assorted Bandage Pack'],
      count: 14,
      prefix: 'B0WP',
    },
    {
      subcategory: 'dressing',
      type: '敷料',
      site: 'US',
      brands: ['3M', 'MedVance', 'Dimora', 'JJ Care', 'Dealmed', 'Dynarex', 'McKesson'],
      titles: ['Sterile Gauze Pads for Wound Care', 'Transparent Film Dressing', 'Island Dressing Adhesive Pads'],
      count: 8,
      prefix: 'B0DR',
    },
    {
      subcategory: 'painReliefPatch',
      type: '外用止痛药线',
      site: 'US',
      brands: ['Salonpas', 'Icy Hot', 'Biofreeze', 'Bengay', 'Tiger Balm', 'Raelief'],
      titles: ['Pain Relieving Patches for Back and Neck', 'Lidocaine Pain Relief Patch', 'Cooling Gel Pain Patch'],
      count: 8,
      prefix: 'B0PR',
    },
    {
      subcategory: 'pillbox',
      type: '药物管理',
      site: 'US',
      brands: ['EZY DOSE', 'Sukuos', 'Daviky', 'BUG HULL', 'Mossime', 'Fullicon'],
      titles: ['Weekly Pill Organizer Large Compartments', 'Travel Pill Case with Moisture Seal', 'AM PM Pill Box 7 Day Organizer'],
      count: 6,
      prefix: 'B0PM',
    },
    {
      subcategory: 'therapy',
      type: '电疗/热疗',
      site: 'US',
      brands: ['iReliev', 'Compex', 'Belifu', 'TechCare', 'NURSAL', 'AUVON'],
      titles: ['TENS Unit Muscle Stimulator', 'Heating Pad for Neck and Shoulder', 'Wireless Electrotherapy Massager'],
      count: 8,
      prefix: 'B0TH',
    },
    {
      subcategory: 'oximeter',
      type: '血糖线',
      site: 'UK',
      brands: ['Zacurate', 'AccuMed', 'Metene', 'CareSens', 'Kinetik'],
      titles: ['Blood Glucose Monitoring Kit', 'Fingertip Pulse Oximeter', 'Diabetes Testing Kit with Strips'],
      count: 6,
      prefix: 'B0BG',
    },
  ];

  return groups.flatMap(group => Array.from({ length: group.count }, (_, idx) => {
    const brand = group.brands[idx % group.brands.length];
    const asin = `${group.prefix}${String(idx + 1).padStart(4, '0')}`;
    const sales = [174, 340, 915, 1194, 1342, 1725, 3566, 8120, 11840, 17135][idx % 10];
    const price = (6.99 + (idx % 8) * 1.75).toFixed(2);
    const rating = (4.1 + (idx % 7) * 0.1).toFixed(1);
    const reviews = 680 + idx * 947;
    const year = 2019 + (idx % 7);
    const month = String((idx % 12) + 1).padStart(2, '0');
    const record = {
      asin,
      title: `${brand} ${group.titles[idx % group.titles.length]}`,
      brand,
      site: group.site,
      subcategory: group.subcategory,
      link: `https://www.amazon.com/dp/${asin}`,
      image: `https://picsum.photos/seed/${asin}/120/120`,
      source: `市场月报 · 2026-${idx % 2 === 0 ? '04' : '05'}`,
      productType: group.type,
      tier: ['头部竞品', '直接竞品', '新兴竞品', '标杆竞品', '替代竞品'][idx % 5],
      status: idx % 11 === 0 ? '待复核' : '有效',
      price: group.site === 'UK' ? `£${price}` : `$${price}`,
      coupon: idx % 3 === 0 ? '10% coupon' : '无',
      rating: Number(rating),
      reviews,
      monthSales: sales >= 1000 ? `${Math.round(sales / 100) / 10}k+` : String(sales),
      listedDate: `${year}-${month}`,
      bsrMain: `#${120 + idx * 37} Health & Household`,
      bsrSub: `#${3 + idx} ${group.type}`,
      bullets: ['核心关键词排名靠前', '价格带接近本品', '图片结构可参考'],
      owner: ['Mason', 'Ida', 'Brian', 'Suki'][idx % 4],
      updated: idx < 3 ? '今天' : `${idx + 1}天前`,
      reason: `${group.type}品类下的典型对标 ASIN，适合用于价格、卖点和图片表达参考。`,
      changes: ['Review 稳定增长', '主图近期更新', '价格波动需关注'],
    };
    if (asin === 'B0WP0001') {
      return { ...record, ...cmAmazonSnapshotByAsin.B0F48MH6WK };
    }
    return record;
  }));
}

function cmTag(text) {
  return `<span class="cm-tag">${text}</span>`;
}

function cmStatus(text) {
  const cls = text.includes('有效') ? 'ok' : (text.includes('下架') || text.includes('驳回')) ? 'danger' : 'warn';
  return `<span class="cm-status ${cls}">${text}</span>`;
}

function cmSwitchTab(tab) {
  competitorMgrState.tab = tab;
  refreshCompetitorMgr();
}

function cmJumpToPool(subcatId) {
  competitorMgrState.subcategory = subcatId;
  const matchedCategory = cmFindTreeCategoryBySubcategory(subcatId);
  if (matchedCategory) {
    competitorMgrState.category = matchedCategory;
    cmEnsureTreeParentExpanded(matchedCategory);
  }
  competitorMgrState.tab = 'pool';
  refreshCompetitorMgr();
}

function cmSelectSubcategory(id) {
  competitorMgrState.subcategory = id;
  const matchedCategory = cmFindTreeCategoryBySubcategory(id);
  if (matchedCategory) {
    competitorMgrState.category = matchedCategory;
    cmEnsureTreeParentExpanded(matchedCategory);
  }
  // 切换子品类时，自动选择第一个该子品类下的 SKU
  const firstSku = competitorSkus.find(s => s.subcategory === id);
  if (firstSku) competitorMgrState.sku = firstSku.id;
  refreshCompetitorMgr();
}

function renderCompetitorCategoryTree() {
  if (competitorMgrState.sidebarCollapsed) {
    return `
      <button class="cm-sidebar-expand" onclick="cmToggleSidebar()" title="展开品类目录">›</button>
    `;
  }
  const categories = cmGetFilteredCategories();
  return `
    <div class="cm-category-tree">
      <div class="cm-category-tools">
        <input class="cm-category-search" type="text" placeholder="搜索品类" value="${competitorMgrState.categoryKw || ''}" oninput="cmUpdateCategorySearch(this.value)" />
        <button type="button" onclick="cmToggleSidebar()" title="收起品类目录">‹</button>
      </div>
      <div class="cm-tree-flat-list">
        ${categories.map(parent => {
          const expanded = cmIsTreeParentExpanded(parent);
          const active = cmTreeParentHasActiveChild(parent);
          const total = cmGetTreeCount(parent.id);
          return `
            <div class="cm-tree-group ${expanded ? 'expanded' : ''} ${active ? 'has-active' : ''}">
              <button class="cm-tree-parent ${active ? 'active' : ''}" onclick="cmToggleTreeCategory('${parent.id}')">
                <span class="cm-tree-arrow">${expanded ? '▾' : '▸'}</span>
                <strong>${cmEscapeHtml(parent.name)}</strong>
                <em class="cm-tree-count">${total}</em>
              </button>
              <div class="cm-tree-children ${expanded ? 'show' : ''}">
                ${(parent.children || []).map(child => {
                  const childTotal = cmGetTreeCount(child.id);
                  return `
                  <button class="cm-tree-child ${competitorMgrState.category === child.id ? 'active' : ''} ${childTotal === 0 ? 'is-empty' : ''}" onclick="cmSelectTreeCategory('${child.id}')">
                    <span>${cmEscapeHtml(child.name)}</span>
                    <em class="cm-tree-count">${childTotal}</em>
                  </button>`;
                }).join('')}
              </div>
            </div>`;
        }).join('') || '<div class="cm-tree-empty">暂无匹配品类</div>'}
      </div>
    </div>`;
}

function cmToggleSidebar() {
  competitorMgrState.sidebarCollapsed = !competitorMgrState.sidebarCollapsed;
  renderCompetitorPool();
}

function cmUpdateCategorySearch(value) {
  competitorMgrState.categoryKw = value || '';
  renderCompetitorPool();
  setTimeout(() => {
    const input = document.querySelector('#competitor-mgr-view .cm-category-search');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 0);
}

function cmToggleTreeCategory(parentId) {
  competitorMgrState.expandedCategories = competitorMgrState.expandedCategories || {};
  competitorMgrState.expandedCategories[parentId] = !competitorMgrState.expandedCategories[parentId];
  renderCompetitorPool();
}

function cmGetFilteredCategories() {
  const kw = (competitorMgrState.categoryKw || '').trim().toLowerCase();
  if (!kw) return competitorCategoryTree;
  return competitorCategoryTree.map(parent => {
    const parentMatched = cmTreeNodeMatches(parent, kw);
    const matchedChildren = (parent.children || []).filter(child => cmTreeNodeMatches(child, kw));
    if (!parentMatched && matchedChildren.length === 0) return null;
    return {
      ...parent,
      children: parentMatched ? (parent.children || []) : matchedChildren,
    };
  }).filter(Boolean);
}

function cmTreeNodeMatches(node, kw) {
  return (node.name || '').toLowerCase().includes(kw) || (node.id || '').toLowerCase().includes(kw);
}

function cmIsTreeParentExpanded(parent) {
  const kw = (competitorMgrState.categoryKw || '').trim();
  if (kw) return true;
  if (cmTreeParentHasActiveChild(parent)) return true;
  return Boolean(competitorMgrState.expandedCategories && competitorMgrState.expandedCategories[parent.id]);
}

function cmTreeParentHasActiveChild(parent) {
  return (parent.children || []).some(child => child.id === competitorMgrState.category);
}

function cmGetLeafTreeCategories() {
  return competitorCategoryTree.flatMap(parent => (parent.children || []).map(child => ({
    ...child,
    parentId: parent.id,
    parentName: parent.name,
  })));
}

function cmFindTreeNode(categoryId) {
  const parent = competitorCategoryTree.find(item => item.id === categoryId);
  if (parent) return { node: parent, parent: null };
  for (const group of competitorCategoryTree) {
    const child = (group.children || []).find(item => item.id === categoryId);
    if (child) return { node: child, parent: group };
  }
  return { node: null, parent: null };
}

function cmEnsureTreeParentExpanded(categoryId) {
  const { parent } = cmFindTreeNode(categoryId);
  if (!parent) return;
  competitorMgrState.expandedCategories = competitorMgrState.expandedCategories || {};
  competitorMgrState.expandedCategories[parent.id] = true;
}

function cmSelectTreeCategory(categoryId) {
  competitorMgrState.category = categoryId;
  cmEnsureTreeParentExpanded(categoryId);
  const resolved = cmResolveSubcategory(categoryId);
  competitorMgrState.subcategory = resolved || '';
  const firstSku = resolved ? competitorSkus.find(s => s.subcategory === resolved) : null;
  competitorMgrState.sku = firstSku ? firstSku.id : '';
  cmResetPagination();
  renderCompetitorPool();
}

function cmSelectSkuCategory(categoryId) {
  competitorMgrState.category = categoryId;
  cmEnsureTreeParentExpanded(categoryId);
  const resolved = cmResolveSubcategory(categoryId);
  competitorMgrState.subcategory = resolved || '';
  const firstSku = resolved ? competitorSkus.find(s => s.subcategory === resolved) : null;
  competitorMgrState.sku = firstSku ? firstSku.id : '';
  refreshCompetitorMgr();
}

function cmResolveSubcategory(childId) {
  const { node } = cmFindTreeNode(childId);
  return node && node.subcategory ? node.subcategory : (competitorCategoryMap[childId] || null);
}

function cmGetTreeCount(childId) {
  const { node } = cmFindTreeNode(childId);
  if (node && Array.isArray(node.children)) {
    return node.children.reduce((sum, child) => sum + cmGetTreeCount(child.id), 0);
  }
  const subcategory = cmResolveSubcategory(childId);
  if (!subcategory) return 0;
  return competitorRecords.filter(r => r.subcategory === subcategory).length;
}

function cmGetTreeCategoryName(childId) {
  const { node } = cmFindTreeNode(childId);
  if (node) return node.name;
  return '未分类';
}

function cmFindTreeCategoryBySubcategory(subcategory) {
  const matched = cmGetLeafTreeCategories().find(item => item.subcategory === subcategory);
  if (matched) return matched.id;
  const entries = Object.entries(competitorCategoryMap).filter(([, value]) => value === subcategory);
  return entries.length > 0 ? entries[0][0] : '';
}

function cmGetFilteredPoolRecords() {
  const resolvedSubcategory = cmResolveSubcategory(competitorMgrState.category);
  const f = competitorMgrState.poolFilter;
  return competitorRecords.filter(r => {
    if (!resolvedSubcategory || r.subcategory !== resolvedSubcategory) return false;
    if (f.site && r.site !== f.site) return false;
    if (f.tier && r.tier !== f.tier) return false;
    if (f.status && r.status !== f.status) return false;
    if (f.kw) {
      const kw = f.kw.toLowerCase();
      return r.asin.toLowerCase().includes(kw) || r.brand.toLowerCase().includes(kw) || r.title.toLowerCase().includes(kw);
    }
    return true;
  });
}

function cmSelectPoolSku(id) {
  competitorMgrState.sku = id || '';
  competitorMgrState.selectedAsins = [];
  renderCompetitorPool();
}

function cmGetCurrentPoolBinding(asin) {
  if (!competitorMgrState.sku) return null;
  return competitorBindings.find(b => b.sku === competitorMgrState.sku && b.asin === asin) || null;
}

function cmRenderBindingStatus(asin) {
  if (!competitorMgrState.sku) return '<span class="cm-bind-state muted">请先选择 SKU</span>';
  const binding = cmGetCurrentPoolBinding(asin);
  if (!binding) return '<span class="cm-bind-state">未绑定</span>';
  return `<span class="cm-bind-state active">已绑定 · ${binding.level}</span>`;
}

function cmRenderPoolRowActions(asin) {
  const binding = cmGetCurrentPoolBinding(asin);
  if (!competitorMgrState.sku) {
    return `
      <button class="cm-link-btn" onclick="cmOpenCompetitor('${asin}')">查看</button>
      <button class="cm-link-btn" onclick="cmOpenCompetitorEditor('${asin}')">编辑</button>
    `;
  }
  if (binding) {
    return `
      <button class="cm-link-btn" onclick="cmOpenCompetitor('${asin}')">查看</button>
      <button class="cm-link-btn" onclick="cmOpenCompetitorEditor('${asin}')">编辑</button>
      <button class="cm-link-btn cm-link-btn-warn" onclick="cmUnbindCompetitor('${binding.sku}','${asin}')">解绑</button>
    `;
  }
  return `
    <button class="cm-link-btn" onclick="cmOpenCompetitor('${asin}')">查看</button>
    <button class="cm-link-btn" onclick="cmOpenCompetitorEditor('${asin}')">编辑</button>
  `;
}

function cmTogglePoolSelection(asin, checked) {
  const set = new Set(competitorMgrState.selectedAsins);
  if (checked) {
    set.add(asin);
  } else {
    set.delete(asin);
  }
  competitorMgrState.selectedAsins = Array.from(set);
  renderCompetitorPool();
}

function cmTogglePageSelection(checked) {
  const records = cmGetFilteredPoolRecords();
  const { page, pageSize } = competitorMgrState.pagination;
  const pageAsins = records.slice((page - 1) * pageSize, page * pageSize).map(item => item.asin);
  const set = new Set(competitorMgrState.selectedAsins);
  pageAsins.forEach(asin => {
    if (checked) {
      set.add(asin);
    } else {
      set.delete(asin);
    }
  });
  competitorMgrState.selectedAsins = Array.from(set);
  renderCompetitorPool();
}

function cmSetBatchLevel(level) {
  competitorMgrState.batchLevel = level || '核心竞品';
}

function cmClearPoolSelection() {
  competitorMgrState.selectedAsins = [];
  renderCompetitorPool();
}

function cmRenderBatchBindBar() {
  const selected = competitorMgrState.selectedAsins;
  if (selected.length === 0) return '';
  return `
    <div class="cm-batch-bind-bar">
      <span>已选择 <strong>${selected.length}</strong> 个竞品</span>
      <span>绑定到：<strong>${competitorMgrState.sku || '未选择 SKU'}</strong></span>
      <label>绑定级别
        <select class="cm-mini-select" onchange="cmSetBatchLevel(this.value)">
          ${['核心竞品','参考竞品','观察竞品'].map(lv => `<option value="${lv}" ${competitorMgrState.batchLevel === lv ? 'selected' : ''}>${lv}</option>`).join('')}
        </select>
      </label>
      <button class="cm-btn cm-btn-primary cm-btn-sm" onclick="cmBatchBindFromPool()" ${competitorMgrState.sku ? '' : 'disabled'}>确认绑定</button>
      <button class="cm-btn cm-btn-secondary cm-btn-sm" onclick="cmClearPoolSelection()">清空选择</button>
    </div>`;
}

function cmSelectSku(id) {
  competitorMgrState.sku = id;
  refreshCompetitorMgr();
}

function cmUpdatePoolFilter(key, value) {
  competitorMgrState.poolFilter[key] = value;
  cmResetPagination();
  renderCompetitorPool();
}

function cmResetPagination() {
  competitorMgrState.pagination.page = 1;
}

function cmSetPage(page) {
  const next = Number(page);
  if (!Number.isFinite(next) || next < 1) return;
  competitorMgrState.pagination.page = next;
  renderCompetitorPool();
}

function cmSetPageSize(size) {
  const next = Number(size);
  if (![10, 20, 50].includes(next)) return;
  competitorMgrState.pagination.pageSize = next;
  cmResetPagination();
  renderCompetitorPool();
}

function cmRenderPagination(total) {
  const { page, pageSize } = competitorMgrState.pagination;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return `
    <div class="list-pagination cm-list-pagination">
      <span>共 <strong>${total}</strong> 条</span>
      <span class="cm-page-range">${start}-${end}</span>
      <button class="pg-btn" onclick="cmSetPage(${page - 1})" ${page <= 1 ? 'disabled' : ''}>‹</button>
      <button class="pg-btn active">${page}</button>
      <span>/ ${totalPages}</span>
      <button class="pg-btn" onclick="cmSetPage(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>›</button>
      <select class="pg-size" onchange="cmSetPageSize(this.value)">
        ${[10, 20, 50].map(size => `<option value="${size}" ${pageSize === size ? 'selected' : ''}>${size}条/页</option>`).join('')}
      </select>
    </div>`;
}

function cmOpenAddDialog() {
  const modal = document.getElementById('cm-add-modal');
  if (modal) modal.classList.add('show');
}

function cmCloseAddDialog() {
  const modal = document.getElementById('cm-add-modal');
  if (modal) modal.classList.remove('show');
}

function cmSubmitCompetitor() {
  cmCloseAddDialog();
  cmToast('已提交审核：新增竞品进入待审核队列');
}

function cmExportPool() {
  cmToast('已模拟：导出主数据 CSV');
}

function cmArchiveCompetitor(asin) {
  const item = competitorRecords.find(r => r.asin === asin);
  if (item) item.status = '已归档';
  cmToast(`已归档竞品 ${asin}`);
  refreshCompetitorMgr();
}

function cmBindCompetitor() {
  const candEl = document.getElementById('cm-bind-candidate');
  const lvlEl  = document.getElementById('cm-bind-level');
  if (!candEl || !lvlEl || !candEl.value) {
    cmToast('请选择待绑定的竞品');
    return;
  }
  competitorBindings.push({
    sku: competitorMgrState.sku,
    asin: candEl.value,
    level: lvlEl.value,
    boundBy: 'Mason',
    boundAt: new Date().toISOString().slice(0, 10),
  });
  cmToast(`已绑定 ${candEl.value} 至 ${competitorMgrState.sku}`);
  renderCompetitorSku();
}

function cmUnbindCompetitor(sku, asin) {
  const idx = competitorBindings.findIndex(b => b.sku === sku && b.asin === asin);
  if (idx >= 0) competitorBindings.splice(idx, 1);
  competitorMgrState.selectedAsins = competitorMgrState.selectedAsins.filter(item => item !== asin);
  cmToast(`已解绑 ${asin}`);
  refreshCompetitorMgr();
}

function cmChangeBindLevel(sku, asin, level) {
  const b = competitorBindings.find(x => x.sku === sku && x.asin === asin);
  if (b) b.level = level;
  cmToast(`绑定级别已更新为 ${level}`);
  refreshCompetitorMgr();
}

function cmToast(text) {
  if (typeof showToast === 'function') {
    showToast(text, 'success');
    return;
  }
  console.log(text);
}

function getCurrentSubcategory() {
  return competitorSubcategories.find(item => item.id === competitorMgrState.subcategory) || competitorSubcategories[0];
}

function getCurrentSku() {
  return competitorSkus.find(item => item.id === competitorMgrState.sku) || competitorSkus[0];
}

// ============================================
//  产品管理 - 品牌 + 站点 + SKU 基础资料
// ============================================

const productMgrState = {
  tab: 'library',
  selectedSku: 'PO17X4011',
  filters: { brand: '', site: '', subcategory: '', completeness: '', kw: '' },
};

const productMasterTabs = [
  ['library', '产品资料库'],
  ['review', '资料变更审核'],
  ['dashboard', '数据概览'],
];

const productMasterRecords = [
  {
    brand: 'AUVON',
    site: 'US',
    sku: 'PO17X4011',
    name: 'AUVON 7格便携药盒 全黑款',
    subcategory: 'pillbox',
    status: '在售',
    owner: 'Mason',
    completeness: 94,
    updated: '2026-05-18',
    positioning: '面向中老年慢病人群和长期补剂用户的一周用药管理方案，强调大容量、清晰分区与出行便携。',
    scenes: ['居家一周配药', '短途旅行携带', '慢病药物管理'],
    priceBand: '$9-$12',
    intro: {
      competitorCompare: '同类竞品多强调 7 天分装，本品更突出 7 格大容量、黑色专业外观和 AUVON 品牌信任。',
      advantages: ['容量表达更清晰', '黑色外观更专业', '隔层更适合多药/补剂用户'],
    },
    packingList: ['7格药盒 x1', '外包装彩盒 x1', '使用说明卡 x1'],
    images: [
      { label: '主图', url: 'https://picsum.photos/seed/product-pill-main/220/160' },
      { label: '场景图', url: 'https://picsum.photos/seed/product-pill-scene/220/160' },
      { label: '结构图', url: 'https://picsum.photos/seed/product-pill-detail/220/160' },
      { label: '包装图', url: 'https://picsum.photos/seed/product-pill-pack/220/160' },
    ],
    competitorComplaints: ['盖子开合不顺', '隔层容量偏小', '旅行时密封性不足'],
    riskPoints: ['需避免“100% 防水”绝对化表达', '不应承诺药物治疗效果', '容量表达需与实物图一致'],
    usp: '一周用药一次配齐，兼顾居家管理与旅行携带。',
    ksp: ['7 格清晰分区', '大容量隔层', '便携黑色外观', 'AUVON 品牌背书'],
    osp: ['易清洁材质', '适配药片/维生素/补剂', '适合放入随身包'],
    sellingSummary: '围绕“一周配药、容量清晰、出行便携、专业可信”四个方向组织文案。',
    parameters: [
      ['尺寸', '约 10.8 x 3.2 x 2.4 cm'],
      ['材质', 'BPA-Free PP'],
      ['容量', '7 格独立分区'],
      ['颜色', 'Black'],
      ['适用对象', '药片、维生素、补剂'],
    ],
    audience: ['慢病长期用药人群', '老年用户照护者', '经常出差/旅行用户', '每日补剂用户'],
    historyCopies: ['新品 Listing 2026-02 已通过', '7 张图文案 2026-03 已通过', 'FAQ 2026-04 已通过'],
  },
  {
    brand: 'AUVON',
    site: 'US',
    sku: 'PO20A1101',
    name: 'AUVON 智能温控药盒',
    subcategory: 'pillbox',
    status: '新品筹备',
    owner: 'Ida',
    completeness: 78,
    updated: '2026-05-14',
    positioning: '面向需要提醒和温控保护的高频用药用户，强调智能提醒、温度监测与便携收纳。',
    scenes: ['日常提醒服药', '需避光/温控药物收纳', '长辈用药提醒'],
    priceBand: '$19-$29',
    intro: {
      competitorCompare: '竞品多停留在普通收纳，本品增加提醒和温控卖点，适合做智能化差异。',
      advantages: ['提醒功能', '温度监测', '适合长辈照护'],
    },
    packingList: ['智能药盒 x1', 'Type-C 线 x1', '说明书 x1'],
    images: [
      { label: '主图', url: 'https://picsum.photos/seed/product-smart-main/220/160' },
      { label: '细节图', url: 'https://picsum.photos/seed/product-smart-detail/220/160' },
    ],
    competitorComplaints: ['提醒声音小', '电池续航短', 'App 连接复杂'],
    riskPoints: ['温控不等于药效保障', '提醒功能需避免医疗承诺'],
    usp: '把药品收纳、服药提醒和温度感知合在一个便携设备里。',
    ksp: ['智能提醒', '温度显示', '便携设计'],
    osp: ['Type-C 充电', '大屏显示', '长辈友好'],
    sellingSummary: '重点突出智能提醒和长辈照护价值，图片文案需强化使用场景。',
    parameters: [
      ['电源', 'Type-C 充电'],
      ['显示', 'LED 数显'],
      ['颜色', 'White'],
    ],
    audience: ['长辈照护家庭', '多药管理用户', '智能健康设备用户'],
    historyCopies: ['新品 Listing 草稿待审核'],
  },
  {
    brand: 'AUVON',
    site: 'US',
    sku: 'PO21C3301',
    name: 'AUVON 加热颈椎理疗仪',
    subcategory: 'therapy',
    status: '在售',
    owner: 'Brian',
    completeness: 88,
    updated: '2026-05-10',
    positioning: '面向久坐办公和颈肩不适用户的居家放松设备，强调热敷、模式调节和便携使用。',
    scenes: ['办公室久坐放松', '居家颈肩护理', '运动后肌肉放松'],
    priceBand: '$35-$49',
    intro: {
      competitorCompare: '同类竞品多强调模式数量，本品更适合突出加热舒适度和轻量便携。',
      advantages: ['热敷体感明确', '佩戴轻便', '操作简单'],
    },
    packingList: ['理疗仪 x1', '遥控器 x1', '充电线 x1', '说明书 x1'],
    images: [
      { label: '主图', url: 'https://picsum.photos/seed/product-therapy-main/220/160' },
      { label: '场景图', url: 'https://picsum.photos/seed/product-therapy-scene/220/160' },
      { label: '功能图', url: 'https://picsum.photos/seed/product-therapy-feature/220/160' },
    ],
    competitorComplaints: ['刺激感过强', '佩戴不贴合', '加热速度慢'],
    riskPoints: ['不能表达治疗疾病', '需提示特殊人群谨慎使用'],
    usp: '用轻量佩戴和热敷放松帮助用户在家完成日常颈肩舒缓。',
    ksp: ['热敷放松', '多模式调节', '轻量佩戴'],
    osp: ['遥控操作', '可充电', '适合办公室和家庭'],
    sellingSummary: '内容要弱化医疗治疗，强化日常放松、舒缓和使用便利。',
    parameters: [
      ['模式', '6 种模式'],
      ['温度', '3 档热敷'],
      ['供电', '内置锂电池'],
    ],
    audience: ['办公室人群', '低头族', '居家护理用户'],
    historyCopies: ['老品 Listing 优化 2026-01 已通过', '操作视频脚本 2026-03 已通过'],
  },
];

const productChangeRequests = [
  {
    id: 'PCR-001',
    sku: 'PO17X4011',
    field: '卖点总概',
    before: '突出 7 天分装和便携。',
    after: '突出一周配药、大容量、黑色专业外观和旅行携带。',
    reason: '图片文案审核中发现“专业外观”能更好区隔彩色竞品。',
    submitter: 'Jessi',
    reviewer: 'Mason',
    status: '待审核',
    impact: '后续 Listing、图片文案、FAQ 均会引用。',
  },
  {
    id: 'PCR-002',
    sku: 'PO20A1101',
    field: '产品实物图',
    before: '缺少场景图',
    after: '新增长辈用药提醒场景图',
    reason: '新品 Listing 生成需要补足使用场景。',
    submitter: 'Ida',
    reviewer: 'Brian',
    status: '待审核',
    impact: '影响新品图片文案和 Listing。',
  },
  {
    id: 'PCR-003',
    sku: 'PO21C3301',
    field: '合规风险',
    before: '不可宣传治疗疾病',
    after: '不可宣传治疗疾病；避免 cure、medical treatment 等词。',
    reason: '文案审核补充合规禁用词。',
    submitter: 'Brian',
    reviewer: 'Suki',
    status: '已通过',
    impact: '影响 AI 生成前合规约束。',
  },
];

function renderProductMgrView() {
  const v = document.getElementById('product-mgr-view');
  if (!v) return;
  if (!_productMgrRendered) {
    _productMgrRendered = true;
    v.innerHTML = buildProductMgrHtml();
  }
  refreshProductMgr();
}

function buildProductMgrHtml() {
  return `
<div class="cm-app">
  <header class="cm-top cm-product-top cm-top-compact">
    <div>
      <span class="cm-eyebrow">Product Master Data</span>
      <h1>产品基础数据管理</h1>
      <p>按品牌 + 站点 + SKU 维护产品定位、介绍、USP/KSP/OSP、参数、用户群体和绑定竞品，创建文案需求时直接复用。</p>
    </div>
    <div class="cm-top-actions">
      <button class="cm-btn cm-btn-secondary" onclick="pmToast('已模拟：导出产品资料')">导出资料</button>
      <button class="cm-btn cm-btn-primary" onclick="pmToast('已模拟：新增 SKU 产品资料')">新增产品</button>
    </div>
  </header>

  <nav class="cm-tabs" id="pm-tabs"></nav>
  <main class="cm-tab-body">
    <section class="cm-tab-pane" id="pm-pane-library"></section>
    <section class="cm-tab-pane" id="pm-pane-review"></section>
    <section class="cm-tab-pane" id="pm-pane-dashboard"></section>
  </main>
</div>

<div class="cm-drawer-mask" id="pm-drawer-mask" onclick="pmCloseProductDetail()"></div>
<aside class="cm-drawer pm-drawer" id="pm-drawer"></aside>`;
}

function refreshProductMgr() {
  renderProductTabs();
  renderProductDashboard();
  renderProductLibrary();
  renderProductReviewQueue();
  document.querySelectorAll('#product-mgr-view .cm-tab-pane').forEach(el => el.classList.remove('active'));
  const active = document.getElementById(`pm-pane-${productMgrState.tab}`);
  if (active) active.classList.add('active');
}

function renderProductTabs() {
  const nav = document.getElementById('pm-tabs');
  if (!nav) return;
  nav.innerHTML = productMasterTabs.map(([id, name]) => `
    <button class="cm-tab ${productMgrState.tab === id ? 'active' : ''}" onclick="pmSwitchTab('${id}')">${name}</button>
  `).join('');
}

function renderProductDashboard() {
  const el = document.getElementById('pm-pane-dashboard');
  if (!el) return;
  const avgCompleteness = Math.round(productMasterRecords.reduce((sum, item) => sum + item.completeness, 0) / productMasterRecords.length);
  const boundSkuCount = productMasterRecords.filter(item => competitorBindings.some(b => b.sku === item.sku)).length;
  const pending = productChangeRequests.filter(item => item.status === '待审核').length;
  const kpis = [
    { label: 'SKU 产品资料', value: productMasterRecords.length + 126, desc: '品牌 + 站点 + SKU 唯一' },
    { label: '平均完整度', value: `${avgCompleteness}%`, desc: '定位 / 参数 / 图片 / 卖点' },
    { label: '待补充 SKU', value: productMasterRecords.filter(item => item.completeness < 85).length + 18, desc: '低于 85% 需补资料', warn: true },
    { label: '待审核写回', value: pending, desc: '从需求创建沉淀回公共库', warn: pending > 0 },
    { label: '竞品绑定覆盖率', value: `${Math.round(boundSkuCount / productMasterRecords.length * 100)}%`, desc: '至少绑定 1 个竞品' },
    { label: '本周更新', value: 24, desc: '产品资料字段级更新' },
  ];
  const recent = productMasterRecords.slice().sort((a, b) => b.updated.localeCompare(a.updated));

  el.innerHTML = `
    <div class="cm-kpi-grid">
      ${kpis.map(k => `
        <div class="cm-kpi-card ${k.warn ? 'warn' : ''}">
          <span>${k.label}</span>
          <strong>${k.value}</strong>
          <p>${k.desc}</p>
        </div>
      `).join('')}
    </div>

    <div class="pm-dashboard-grid">
      <div class="cm-panel">
        <div class="cm-panel-head"><h3>资料完整度分布</h3><span>按 SKU 维度</span></div>
        <div class="pm-completeness-list">
          ${productMasterRecords.map(item => `
            <button onclick="pmOpenProductDetail('${item.sku}')">
              <span><strong>${item.sku}</strong><em>${item.brand} · ${item.site} · ${item.name}</em></span>
              <i><b style="width:${item.completeness}%"></b></i>
              <small>${item.completeness}%</small>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="cm-panel">
        <div class="cm-panel-head"><h3>最近更新 SKU</h3><span>基础资料变更</span></div>
        <div class="pm-recent-list">
          ${recent.map(item => `
            <button onclick="pmOpenProductDetail('${item.sku}')">
              <strong>${item.sku} · ${item.name}</strong>
              <span>${item.owner} · ${item.updated} · 完整度 ${item.completeness}%</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="cm-panel">
        <div class="cm-panel-head"><h3>待审核写回</h3><span>${pending} 条待处理</span></div>
        <div class="pm-review-mini">
          ${productChangeRequests.map(item => `
            <button onclick="pmSwitchTab('review')">
              <strong>${item.id} · ${item.sku}</strong>
              <span>${item.field} · ${item.status}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>`;
}

function renderProductLibrary() {
  const el = document.getElementById('pm-pane-library');
  if (!el) return;
  const f = productMgrState.filters;
  const records = productMasterRecords.filter(item => {
    if (f.brand && item.brand !== f.brand) return false;
    if (f.site && item.site !== f.site) return false;
    if (f.subcategory && item.subcategory !== f.subcategory) return false;
    if (f.completeness === 'low' && item.completeness >= 85) return false;
    if (f.completeness === 'high' && item.completeness < 85) return false;
    if (f.kw) {
      const kw = f.kw.toLowerCase();
      if (!(item.sku.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw) || item.owner.toLowerCase().includes(kw))) return false;
    }
    return true;
  });
  const brands = Array.from(new Set(productMasterRecords.map(item => item.brand)));
  const sites = Array.from(new Set(productMasterRecords.map(item => item.site)));
  const subcats = Array.from(new Set(productMasterRecords.map(item => item.subcategory)));

  el.innerHTML = `
    <div class="cm-filter-row">
      <label>品牌
        <select onchange="pmUpdateFilter('brand', this.value)">
          <option value="">全部</option>
          ${brands.map(b => `<option value="${b}" ${f.brand===b?'selected':''}>${b}</option>`).join('')}
        </select>
      </label>
      <label>站点
        <select onchange="pmUpdateFilter('site', this.value)">
          <option value="">全部</option>
          ${sites.map(s => `<option value="${s}" ${f.site===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </label>
      <label>子品类
        <select onchange="pmUpdateFilter('subcategory', this.value)">
          <option value="">全部</option>
          ${subcats.map(s => `<option value="${s}" ${f.subcategory===s?'selected':''}>${cmGetSubcategoryName(s)}</option>`).join('')}
        </select>
      </label>
      <label>完整度
        <select onchange="pmUpdateFilter('completeness', this.value)">
          <option value="">全部</option>
          <option value="high" ${f.completeness==='high'?'selected':''}>≥85%</option>
          <option value="low" ${f.completeness==='low'?'selected':''}>低于85%</option>
        </select>
      </label>
      <label class="cm-filter-grow">关键词
        <input type="text" value="${f.kw || ''}" placeholder="SKU / 产品名 / 负责人" oninput="pmUpdateFilter('kw', this.value)" />
      </label>
      <div class="cm-filter-summary">共 <strong>${records.length}</strong> 个 SKU</div>
    </div>

    <div class="cm-table-wrap cm-pool-table-wrap">
      <table class="cm-data-table pm-product-table">
        <thead>
          <tr>
            <th>品牌</th>
            <th>站点</th>
            <th>SKU</th>
            <th>产品名称</th>
            <th>子品类</th>
            <th>产品状态</th>
            <th>负责人</th>
            <th>资料完整度</th>
            <th>竞品绑定数</th>
            <th>最近更新</th>
            <th class="cm-col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(item => {
            const boundCount = competitorBindings.filter(b => b.sku === item.sku).length;
            return `
              <tr>
                <td><strong>${item.brand}</strong></td>
                <td>${item.site}</td>
                <td><span class="pm-sku-code">${item.sku}</span></td>
                <td class="cm-cell-title" title="${item.name}">${item.name}</td>
                <td>${cmGetSubcategoryName(item.subcategory)}</td>
                <td>${pmStatus(item.status)}</td>
                <td>${item.owner}</td>
                <td>
                  <div class="pm-mini-progress"><b style="width:${item.completeness}%"></b></div>
                  <span class="pm-progress-text">${item.completeness}%</span>
                </td>
                <td>${boundCount} 个</td>
                <td>${item.updated}</td>
                <td class="cm-col-actions">
                  <button class="cm-link-btn" onclick="pmOpenProductDetail('${item.sku}')">详情</button>
                  <button class="cm-link-btn" onclick="pmToast('已模拟：进入编辑 ${item.sku}')">编辑</button>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderProductReviewQueue() {
  const el = document.getElementById('pm-pane-review');
  if (!el) return;
  el.innerHTML = `
    <div class="cm-table-wrap cm-pool-table-wrap">
      <table class="cm-data-table pm-review-table">
        <thead>
          <tr>
            <th>变更单</th>
            <th>SKU</th>
            <th>变更字段</th>
            <th>变更前</th>
            <th>变更后</th>
            <th>变更原因</th>
            <th>影响范围</th>
            <th>提交人</th>
            <th>审核人</th>
            <th>状态</th>
            <th class="cm-col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          ${productChangeRequests.map(item => `
            <tr>
              <td><strong>${item.id}</strong></td>
              <td>${item.sku}</td>
              <td>${item.field}</td>
              <td class="pm-diff-cell">${item.before}</td>
              <td class="pm-diff-cell">${item.after}</td>
              <td class="pm-diff-cell">${item.reason}</td>
              <td class="pm-diff-cell">${item.impact}</td>
              <td>${item.submitter}</td>
              <td>${item.reviewer}</td>
              <td>${pmStatus(item.status)}</td>
              <td class="cm-col-actions">
                <button class="cm-link-btn" onclick="pmApproveChange('${item.id}')" ${item.status !== '待审核' ? 'disabled' : ''}>通过</button>
                <button class="cm-link-btn cm-link-btn-warn" onclick="pmRejectChange('${item.id}')" ${item.status !== '待审核' ? 'disabled' : ''}>驳回</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function pmOpenProductDetail(sku) {
  const item = productMasterRecords.find(record => record.sku === sku);
  const drawer = document.getElementById('pm-drawer');
  const mask = document.getElementById('pm-drawer-mask');
  if (!item || !drawer || !mask) return;
  productMgrState.selectedSku = sku;
  const bindings = competitorBindings.filter(b => b.sku === sku);
  const boundRecords = bindings.map(b => ({ bind: b, record: competitorRecords.find(r => r.asin === b.asin) })).filter(x => x.record);

  drawer.innerHTML = `
    <div class="cm-drawer-head">
      <div>
        <span>${item.brand} · ${item.site} · ${cmGetSubcategoryName(item.subcategory)}</span>
        <h3>${item.sku} · ${item.name}</h3>
      </div>
      <button onclick="pmCloseProductDetail()">×</button>
    </div>

    <div class="pm-detail-summary">
      <div><span>产品状态</span><strong>${item.status}</strong></div>
      <div><span>负责人</span><strong>${item.owner}</strong></div>
      <div><span>资料完整度</span><strong>${item.completeness}%</strong></div>
      <div><span>最近更新</span><strong>${item.updated}</strong></div>
    </div>

    ${pmDetailSection('产品定位', `
      <p>${item.positioning}</p>
      <div class="pm-meta-row">
        <span>价格带：${item.priceBand}</span>
        <span>场景：${item.scenes.join(' / ')}</span>
      </div>
    `)}

    ${pmDetailSection('产品介绍：竞争对手对比 / 优势差异点', `
      <p>${item.intro.competitorCompare}</p>
      <ul>${item.intro.advantages.map(x => `<li>${x}</li>`).join('')}</ul>
    `)}

    ${pmDetailSection('出货清单', `<div class="pm-pill-list">${item.packingList.map(x => `<span>${x}</span>`).join('')}</div>`)}

    ${pmDetailSection('产品实物图', `
      <div class="pm-image-grid">
        ${item.images.map(img => `<figure><img src="${img.url}" alt="${img.label}" loading="lazy" /><figcaption>${img.label}</figcaption></figure>`).join('')}
      </div>
    `)}

    ${pmDetailSection('竞对主要客诉点', `<ul>${item.competitorComplaints.map(x => `<li>${x}</li>`).join('')}</ul>`)}
    ${pmDetailSection('产品潜在客诉风险', `<ul>${item.riskPoints.map(x => `<li>${x}</li>`).join('')}</ul>`)}

    ${pmDetailSection('USP / KSP / OSP', `
      <div class="pm-selling-grid">
        <div><b>USP</b><p>${item.usp}</p></div>
        <div><b>KSP</b><p>${item.ksp.join('；')}</p></div>
        <div><b>OSP</b><p>${item.osp.join('；')}</p></div>
      </div>
    `)}

    ${pmDetailSection('卖点总概', `<p>${item.sellingSummary}</p>`)}

    ${pmDetailSection('产品参数', `
      <table class="pm-param-table">
        ${item.parameters.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
      </table>
    `)}

    ${pmDetailSection('用户群体', `<div class="pm-pill-list">${item.audience.map(x => `<span>${x}</span>`).join('')}</div>`)}

    ${pmDetailSection('绑定竞品', `
      ${boundRecords.length === 0 ? '<p class="cm-muted">该 SKU 暂未绑定竞品。</p>' : `
        <div class="pm-bound-list">
          ${boundRecords.map(({ bind, record }) => `
            <div>
              <img src="${record.image}" alt="${record.brand}" />
              <span><strong>${record.asin} · ${record.brand}</strong><em>${bind.level} · ${record.price} · ${record.bsrSub}</em></span>
            </div>
          `).join('')}
        </div>
      `}
    `)}

    ${pmDetailSection('历史文案资产', `<ul>${item.historyCopies.map(x => `<li>${x}</li>`).join('')}</ul>`)}

    <div class="cm-drawer-actions">
      <button onclick="pmToast('已模拟：编辑 ${item.sku}')">编辑资料</button>
      <button onclick="pmToast('已模拟：创建文案需求并带出资料')">创建需求</button>
      <button onclick="pmCloseProductDetail()">关闭</button>
    </div>`;
  drawer.classList.add('show');
  mask.classList.add('show');
}

function pmDetailSection(title, body) {
  return `<div class="cm-drawer-section pm-detail-section"><h4>${title}</h4>${body}</div>`;
}

function pmCloseProductDetail() {
  const drawer = document.getElementById('pm-drawer');
  const mask = document.getElementById('pm-drawer-mask');
  if (drawer) drawer.classList.remove('show');
  if (mask) mask.classList.remove('show');
}

function pmSwitchTab(tab) {
  productMgrState.tab = tab;
  refreshProductMgr();
}

function pmUpdateFilter(key, value) {
  productMgrState.filters[key] = value;
  renderProductLibrary();
}

function pmApproveChange(id) {
  const item = productChangeRequests.find(record => record.id === id);
  if (item) item.status = '已通过';
  pmToast(`已通过变更单 ${id}`);
  renderProductReviewQueue();
  renderProductDashboard();
}

function pmRejectChange(id) {
  const item = productChangeRequests.find(record => record.id === id);
  if (item) item.status = '已驳回';
  pmToast(`已驳回变更单 ${id}`);
  renderProductReviewQueue();
  renderProductDashboard();
}

function pmStatus(text) {
  const cls = text.includes('在售') || text.includes('已通过') ? 'ok' : (text.includes('驳回') || text.includes('停用')) ? 'danger' : 'warn';
  return `<span class="cm-status ${cls}">${text}</span>`;
}

function pmToast(text) {
  cmToast(text);
}

// ============================================
//  洞察报告 - 品类 / 子品类四维洞察
// ============================================

const insightReportState = {
  category: 'pillbox',
  expandedCategories: { medicineManagementLine: true },
  categoryKw: '',
  reportId: 'category-encyclopedia',
};

function insightCurrentCategory() {
  const { node } = cmFindTreeNode(insightReportState.category);
  return node || cmFindTreeNode('pillbox').node || cmGetLeafTreeCategories()[0];
}

function irGetFilteredCategories() {
  const kw = (insightReportState.categoryKw || '').trim().toLowerCase();
  if (!kw) return competitorCategoryTree;
  return competitorCategoryTree.map(parent => {
    const parentMatched = cmTreeNodeMatches(parent, kw);
    const matchedChildren = (parent.children || []).filter(child => cmTreeNodeMatches(child, kw));
    if (!parentMatched && matchedChildren.length === 0) return null;
    return {
      ...parent,
      children: parentMatched ? (parent.children || []) : matchedChildren,
    };
  }).filter(Boolean);
}

function irParentHasActiveChild(parent) {
  return (parent.children || []).some(child => child.id === insightReportState.category);
}

function irIsParentExpanded(parent) {
  const kw = (insightReportState.categoryKw || '').trim();
  if (kw) return true;
  if (irParentHasActiveChild(parent)) return true;
  return Boolean(insightReportState.expandedCategories && insightReportState.expandedCategories[parent.id]);
}

function irEnsureParentExpanded(categoryId) {
  const { parent } = cmFindTreeNode(categoryId);
  if (!parent) return;
  insightReportState.expandedCategories = insightReportState.expandedCategories || {};
  insightReportState.expandedCategories[parent.id] = true;
}

function irToggleCategory(parentId) {
  insightReportState.expandedCategories = insightReportState.expandedCategories || {};
  insightReportState.expandedCategories[parentId] = !insightReportState.expandedCategories[parentId];
  renderInsightReportView();
}

function irSelectCategory(categoryId) {
  insightReportState.category = categoryId;
  irEnsureParentExpanded(categoryId);
  renderInsightReportView();
}

function irUpdateCategorySearch(value) {
  insightReportState.categoryKw = value || '';
  renderInsightReportView();
  setTimeout(() => {
    const input = document.querySelector('#insight-report-view .cm-category-search');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 0);
}

function renderInsightCategoryTree() {
  const categories = irGetFilteredCategories();
  return `<div class="cm-category-tree">
    <div class="cm-category-tools">
      <input class="cm-category-search" type="text" placeholder="搜索品类" value="${insightReportState.categoryKw || ''}" oninput="irUpdateCategorySearch(this.value)" />
    </div>
    <div class="cm-tree-flat-list">
      ${categories.map(parent => {
        const expanded = irIsParentExpanded(parent);
        const active = irParentHasActiveChild(parent);
        return `<div class="cm-tree-group ${expanded ? 'expanded' : ''} ${active ? 'has-active' : ''}">
          <button class="cm-tree-parent ${active ? 'active' : ''}" onclick="irToggleCategory('${parent.id}')">
            <span class="cm-tree-arrow">${expanded ? '▾' : '▸'}</span>
            <strong>${cmEscapeHtml(parent.name)}</strong>
          </button>
          <div class="cm-tree-children ${expanded ? 'show' : ''}">
            ${(parent.children || []).map(child => {
              const childTotal = cmGetTreeCount(child.id);
              return `<button class="cm-tree-child ${insightReportState.category === child.id ? 'active' : ''} ${childTotal === 0 ? 'is-empty' : ''}" onclick="irSelectCategory('${child.id}')">
                <span>${cmEscapeHtml(child.name)}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('') || '<div class="cm-tree-empty">暂无匹配品类</div>'}
    </div>
  </div>`;
}

function irReportDocs() {
  return Array.isArray(window.insightReportMarkdownDocs) ? window.insightReportMarkdownDocs : [];
}

function irCurrentReport() {
  const docs = irReportDocs();
  return docs.find(doc => doc.id === insightReportState.reportId) || docs[0] || {
    id: 'empty',
    label: '报告内容',
    filename: '',
    title: '暂无报告内容',
    content: '',
  };
}

function irSelectReport(reportId) {
  insightReportState.reportId = reportId;
  renderInsightReportView();
}

function irScrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function irExtractReportToc(markdown) {
  const toc = [];
  let headingIndex = 0;
  String(markdown || '').split(/\r?\n/).forEach(line => {
    const matched = line.match(/^(#{1,4})\s+(.+)$/);
    if (!matched) return;
    headingIndex += 1;
    if (matched[1].length > 3) return;
    toc.push({
      id: `ir-md-section-${headingIndex}`,
      level: matched[1].length,
      title: matched[2].trim().replace(/\*\*/g, ''),
    });
  });
  return toc;
}

function irRenderInlineMarkdown(value) {
  return cmEscapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function irParseTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
}

function irIsTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function irRenderMarkdownTable(lines) {
  if (lines.length < 2 || !irIsTableDivider(lines[1])) {
    return `<p>${irRenderInlineMarkdown(lines.join(' '))}</p>`;
  }
  const headers = irParseTableRow(lines[0]);
  const rows = lines.slice(2).map(irParseTableRow);
  return `<div class="ir-md-table-wrap"><table>
    <thead><tr>${headers.map(cell => `<th>${irRenderInlineMarkdown(cell)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(row => `<tr>${headers.map((_, idx) => `<td>${irRenderInlineMarkdown(row[idx] || '')}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function irRenderMarkdown(markdown) {
  const lines = String(markdown || '').split(/\r?\n/);
  const html = [];
  let index = 0;
  let headingIndex = 0;

  const collect = (start, test) => {
    const bucket = [];
    let cursor = start;
    while (cursor < lines.length && test(lines[cursor])) {
      bucket.push(lines[cursor]);
      cursor += 1;
    }
    return { bucket, cursor };
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      headingIndex += 1;
      const level = Math.min(heading[1].length, 4);
      const tag = `h${level}`;
      const id = `ir-md-section-${headingIndex}`;
      html.push(`<${tag} id="${id}">${irRenderInlineMarkdown(heading[2].trim())}</${tag}>`);
      index += 1;
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      const { bucket, cursor } = collect(index, item => /^\s*\|.+\|\s*$/.test(item));
      html.push(irRenderMarkdownTable(bucket));
      index = cursor;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const { bucket, cursor } = collect(index, item => /^>\s?/.test(item.trim()));
      const text = bucket.map(item => irRenderInlineMarkdown(item.trim().replace(/^>\s?/, ''))).join('<br>');
      html.push(`<blockquote>${text}</blockquote>`);
      index = cursor;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const { bucket, cursor } = collect(index, item => /^[-*]\s+/.test(item.trim()));
      html.push(`<ul>${bucket.map(item => `<li>${irRenderInlineMarkdown(item.trim().replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`);
      index = cursor;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const { bucket, cursor } = collect(index, item => /^\d+\.\s+/.test(item.trim()));
      html.push(`<ol>${bucket.map(item => `<li>${irRenderInlineMarkdown(item.trim().replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`);
      index = cursor;
      continue;
    }

    const { bucket, cursor } = collect(index, item => {
      const value = item.trim();
      return value && !/^(#{1,4})\s+/.test(value) && !/^-{3,}$/.test(value) && !/^\s*\|.+\|\s*$/.test(item) && !/^>\s?/.test(value) && !/^[-*]\s+/.test(value) && !/^\d+\.\s+/.test(value);
    });
    html.push(`<p>${irRenderInlineMarkdown(bucket.map(item => item.trim()).join(' '))}</p>`);
    index = cursor;
  }

  return html.join('');
}

function renderInsightMarkdownPanel(current, data) {
  const docs = irReportDocs();
  const report = irCurrentReport();
  const toc = irExtractReportToc(report.content);
  return `<main class="ir-report-panel">
    <section class="ir-report-head">
      <div class="ir-report-title">
        <span>当前子品类洞察报告</span>
        <h2>${cmEscapeHtml(current.name)}</h2>
      </div>
    </section>

    <section class="ir-report-tabs" aria-label="洞察报告类型">
      ${docs.map(doc => `<button class="${report.id === doc.id ? 'active' : ''}" onclick="irSelectReport('${cmEscapeAttr(doc.id)}')">
        <span>${cmEscapeHtml(doc.label)}</span>
      </button>`).join('')}
    </section>

    <section class="ir-reader-shell">
      <aside class="ir-reader-toc">
        <div class="ir-toc-title">章节目录</div>
        <div class="ir-toc-list">
          ${toc.map(item => `<button class="level-${item.level}" onclick="irScrollToSection('${item.id}')">${cmEscapeHtml(item.title)}</button>`).join('') || '<span>暂无目录</span>'}
        </div>
      </aside>
      <article class="ir-md-doc">
        <div class="ir-md-doc-head">
          <span>${cmEscapeHtml(report.label)}</span>
          <h3>${cmEscapeHtml(report.title)}</h3>
          <p>${cmEscapeHtml(report.filename)} · 已按 Markdown 自动排版</p>
        </div>
        <div class="ir-md-content">${irRenderMarkdown(report.content)}</div>
      </article>
    </section>
  </main>`;
}

function insightReportData(subcategory) {
  const productCount = subcategory ? productMasterRecords.filter(item => item.subcategory === subcategory).length : 0;
  const competitorCount = competitorRecords.filter(item => item.subcategory === subcategory || (subcategory === 'therapy' && cmIsElectrotherapyItem(item))).length;
  const base = {
    pillbox: {
      trend: '稳定增长',
      market: ['一周用药管理、旅行携带和长辈照护是当前搜索与评论里的主场景。', '用户更关注容量是否清楚、开合是否顺手、药片是否会混在一起。', '价格带集中在 $8-$15，品牌信任和外观专业感开始影响转化。'],
      product: ['产品表达建议围绕“7 格清晰分区 + 大容量 + 便携”组织。', '黑色专业外观适合做品牌差异，避免只说普通收纳。', '图片需要补足尺寸参照、开盖结构和一周配药场景。'],
      competition: ['头部竞品主打 waterproof、travel、large compartment 等关键词。', '低价竞品多用多件套拉转化，但评论里容量和耐用性争议较多。', '可借竞品差评反推“开合顺滑、隔层够大、旅行不散药”的证明点。'],
      user: ['核心用户是慢病长期用药者、每日补剂用户和照护者。', '购买前最担心尺寸不符、装不下大药片和卡扣松动。', 'FAQ 应优先回答容量、材质安全、是否适合旅行携带。'],
      actions: ['补充主图尺寸对比', '强化一周配药场景', '把卡扣结构加入图文案'],
    },
    therapy: {
      trend: '需求升温',
      market: ['TENS/EMS、颈肩放松和居家护理搜索热度持续增加。', '用户偏好便携、模式简单、刺激强度可控的日常放松设备。', '合规表达需要从“治疗”转向“舒缓、放松、日常护理”。'],
      product: ['产品内容应突出热敷舒适度、模式调节和轻量佩戴。', '需要明确适用场景：办公室、居家、运动后放松。', '说明书和 FAQ 要降低第一次使用门槛。'],
      competition: ['竞品多强调模式数量和强刺激，本品可强调温和舒适和易用。', '差评常见于佩戴不贴合、刺激过强、说明不清。', 'SEO 可围绕 tens unit、muscle stimulator、pain relief device 做覆盖。'],
      user: ['核心用户是久坐办公人群、低头族和居家护理用户。', '用户担心刺激是否安全、热敷是否明显、特殊人群能否使用。', '评论内容更适合提炼成风险提示和使用指导。'],
      actions: ['弱化医疗承诺', '补充首次使用指引', '增加场景化对比图'],
    },
    woundPatch: {
      trend: '稳定增长',
      market: ['防水、透明和敏感肌场景是伤口贴品类的主要搜索入口。', '用户对粘性、揭除疼痛和洗澡防水表现高度敏感。', '价格带竞争激烈，但品牌信任和材质安全仍影响复购。'],
      product: ['内容应突出防水测试、贴合舒适度和不同伤口尺寸适配。', '主图建议强化透明材质和洗澡场景，不只展示包装。', 'Bullet 需要明确数量、尺寸和适用场景，减少购买前不确定性。'],
      competition: ['竞品高频表达集中在 waterproof、clear、adhesive、flexible。', '差评多来自脱落、皮肤刺激、尺寸偏小。', '可从“敏感肌友好”和“强粘不伤肤”两个方向找差异化。'],
      user: ['核心用户是家庭常备、儿童护理、运动/户外轻伤处理人群。', '购买顾虑集中在防水是否真实、粘性是否持久、是否适合敏感肌。', 'FAQ 应优先解释防水时长、材质、尺寸和揭除体验。'],
      actions: ['补充防水场景图', '明确尺寸和数量', '把敏感肌问题写入 FAQ'],
    },
    painReliefPatch: {
      trend: '待观察',
      market: ['外用止痛贴用户主要围绕肩颈、腰背和运动后不适搜索。', '用户更关注贴敷舒适度、气味、持续时间和成分安全。', '合规表达需避免治疗承诺，聚焦日常舒缓和使用体验。'],
      product: ['产品内容建议突出使用部位、贴合度和温和体感。', '图片需要清楚说明贴片尺寸、适用场景和使用步骤。', '成分类表达需要谨慎，避免医疗功效暗示。'],
      competition: ['竞品通常强调 long lasting、odorless、flexible 和 targeted relief。', '差评常见于刺激感、气味、贴不牢和残胶。', '可从“低刺激、易揭除、日常使用”建立差异点。'],
      user: ['核心用户是办公室久坐人群、运动人群和中老年腰背不适人群。', '用户担心过敏、气味重、贴片太小或脱落。', 'FAQ 优先回答使用时长、皮肤敏感、能否运动时使用。'],
      actions: ['弱化功效承诺', '补充使用步骤图', '梳理敏感肌 FAQ'],
    },
    oximeter: {
      trend: '待观察',
      market: ['健康监测类用户关注读数速度、准确性和家庭备用场景。', '用户常搜索便携、老人友好和大屏显示。', '信任背书和参数解释会直接影响购买决策。'],
      product: ['内容应突出读数清晰、操作简单和便携收纳。', '图片需要解释指标含义，降低首次使用门槛。', '说明书和 FAQ 应覆盖电池、读数误差和适用对象。'],
      competition: ['竞品多围绕 accurate、fast reading、OLED display 展开。', '差评多来自读数不稳定、说明不清、电池问题。', '可通过清晰说明和场景图提高信任感。'],
      user: ['核心用户是家庭健康监测、老人照护和运动健康关注人群。', '用户担心不会用、读数不准、屏幕看不清。', 'FAQ 应优先解释读数方法和异常读数处理建议。'],
      actions: ['补充读数步骤图', '优化参数解释', '加入老人友好场景'],
    },
  };
  const fallback = {
    trend: '待观察',
    market: ['品类需求处于持续采集中，建议先关注搜索量、价格带和评论增长。', '用户对安全性、易用性和售后稳定性敏感。', '新进入品类应先建立基础关键词和竞品样本池。'],
    product: ['优先补齐定位、核心卖点、参数和使用场景。', '产品内容应聚焦一个主购买理由，避免信息分散。', '图片文案建议围绕场景、规格和信任背书展开。'],
    competition: ['建议先圈定 3-5 个核心竞品进行跟踪。', '拆解竞品 Title、Bullet、主图和 Review 痛点。', '关注低价竞品是否通过套装、优惠或关键词获得流量。'],
    user: ['先从评论、客服问题和退货原因里抽取高频顾虑。', 'FAQ 优先回答尺寸、材质、适用对象和使用限制。', '区分购买者、使用者和照护者三类决策视角。'],
    actions: ['建立竞品样本池', '补齐关键词清单', '沉淀用户高频问题'],
  };
  const data = base[subcategory] || fallback;
  return {
    ...data,
    productCount: productCount || Math.max(1, productMasterRecords.length),
    competitorCount: competitorCount || Math.max(3, competitorRecords.slice(0, 6).length),
  };
}

function renderInsightReportView() {
  const v = document.getElementById('insight-report-view');
  if (!v) return;
  const current = insightCurrentCategory();
  const resolvedSubcategory = cmResolveSubcategory(current.id);
  const data = insightReportData(resolvedSubcategory);
  v.innerHTML = `
    <div class="cm-app ir-app">
      <header class="cm-top cm-top-compact ir-top">
        <div>
          <span class="cm-eyebrow">Insight Report</span>
          <h1>洞察报告</h1>
          <p>按品类和子品类沉淀市场、产品、竞争与用户洞察，帮助文案、产品和运营形成一致判断。</p>
        </div>
        <div class="cm-top-actions">
          <button class="cm-btn cm-btn-primary" onclick="cmToast('已模拟：刷新洞察数据')">刷新数据</button>
        </div>
      </header>

      <div class="ir-master-layout">
        <aside class="ir-master-sidebar cm-master-sidebar">
          ${renderInsightCategoryTree()}
        </aside>

        ${renderInsightMarkdownPanel(current, data)}
      </div>
    </div>`;
}


function renderInsightDimension(title, subtitle, items, tone) {
  return `<article class="ir-dimension-card cm-section-card ${tone}">
    <header>
      <span>${cmEscapeHtml(subtitle)}</span>
      <h3>${cmEscapeHtml(title)}</h3>
    </header>
    <ul>${items.map(item => `<li>${cmEscapeHtml(item)}</li>`).join('')}</ul>
  </article>`;
}

function insightSelectSubcategory(id) {
  irSelectCategory(id);
}

function cmGetSubcategoryName(id) {
  const item = competitorSubcategories.find(s => s.id === id);
  if (item) return item.name;
  const treeItem = competitorCategoryTree.find(category => cmResolveSubcategory(category.id) === id);
  return treeItem ? treeItem.name : id;
}

function cmBindFromPool(asin) {
  if (!competitorMgrState.sku) {
    cmToast('请先选择要绑定的 SKU');
    return;
  }
  const levelEl = document.getElementById(`cm-pool-level-${asin}`);
  const level = levelEl ? levelEl.value : '参考竞品';
  const exists = competitorBindings.find(b => b.sku === competitorMgrState.sku && b.asin === asin);
  if (exists) {
    exists.level = level;
  } else {
    competitorBindings.push({
      sku: competitorMgrState.sku,
      asin,
      level,
      boundBy: 'Mason',
      boundAt: new Date().toISOString().slice(0, 10),
    });
  }
  competitorMgrState.selectedAsins = competitorMgrState.selectedAsins.filter(item => item !== asin);
  cmToast(`已将 ${asin} 绑定到 ${competitorMgrState.sku}`);
  renderCompetitorPool();
}

function cmBatchBindFromPool() {
  if (!competitorMgrState.sku) {
    cmToast('请先选择要绑定的 SKU');
    return;
  }
  const selected = competitorMgrState.selectedAsins.slice();
  if (selected.length === 0) {
    cmToast('请先勾选要绑定的竞品');
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  selected.forEach(asin => {
    const existing = competitorBindings.find(b => b.sku === competitorMgrState.sku && b.asin === asin);
    if (existing) {
      existing.level = competitorMgrState.batchLevel;
    } else {
      competitorBindings.push({
        sku: competitorMgrState.sku,
        asin,
        level: competitorMgrState.batchLevel,
        boundBy: 'Mason',
        boundAt: today,
      });
    }
  });
  competitorMgrState.selectedAsins = [];
  cmToast(`已将 ${selected.length} 个竞品绑定到 ${competitorMgrState.sku}`);
  renderCompetitorPool();
}

/* ============================================
   GEO 模块：品牌总看板 + 其余子页占位
   ============================================ */

const GEO_PAGES = {
  'geo-brand-board': { title: '品牌总看板', desc: '品牌曝光、AI 引用与竞品共现总览' },
  'geo-alexa-board': { title: 'Alexa看板', desc: 'Alexa 排名与品类流量趋势' },
  'geo-sentiment': { title: '舆情监控', desc: '社媒/评论声量与情绪追踪' },
  'geo-ad-spa': { title: '广告SPA', desc: '广告投放与 SPA 效果监控' },
  'geo-qa': { title: 'QA管理', desc: 'GEO 问答与内容质检工单' },
};

const GEO_RANGE_LABELS = {
  '7d': '近 7 天',
  '30d': '近 30 天',
  '90d': '近 90 天',
};

const GEO_LAYER_NAV = [
  { id: 'judge', name: '判断' },
  { id: 'engine', name: '引擎' },
  { id: 'compete', name: '竞品' },
  { id: 'question', name: '问题' },
  { id: 'traffic', name: '流量' },
];

const geoState = {
  pageId: 'geo-brand-board',
  brand: 'AUVON',
  category: '理疗仪',
  range: '30d',
  activeCompetitor: 'AUVON',
  expandedQuestion: '',
};

const GEO_DATA_UPDATED_AT = '2026-08-18 06:00';

const GEO_ENGINE_COLORS = {
  Alexa: '#2563eb',
  ChatGPT: '#10b981',
  Claude: '#8b5cf6',
  'Google AI': '#f59e0b',
};

/** 指标口径：better 决定涨跌和目标进度的好坏方向，target 对 low 型指标是上限 */
const GEO_KPI_DEFS = [
  { key: 'exposure', label: '品牌曝光率', better: 'high', target: 40 },
  { key: 'cite', label: 'AI 引用率', better: 'high', target: 50 },
  { key: 'coexist', label: '竞品共现率', better: 'low', target: 25 },
  { key: 'coverage', label: '目标问题覆盖率', better: 'high', target: 60 },
];

/** 品牌强弱系数：越小代表露出越弱、被竞品捆绑共现越多 */
const GEO_BRAND_FACTORS = {
  AUVON: 1,
  ZIKEE: 0.74,
  AMOOS: 0.88,
};

const GEO_RANGE_FACTORS = {
  '7d': { value: 0.94, delta: 0.4 },
  '30d': { value: 1, delta: 1 },
  '90d': { value: 1.08, delta: 1.8 },
};

const GEO_CATEGORY_PROFILES = {
  理疗仪: {
    base: { exposure: 36.8, cite: 34.9, coexist: 30.9 },
    deltas: { exposure: 2.1, cite: 4.6, coexist: -1.2, coverage: 8 },
    totalCites: 476,
    engines: [
      { name: 'Alexa', share: 39.1, vsPrev: 3.2, vsComp: 8.4 },
      { name: 'ChatGPT', share: 21.2, vsPrev: 1.4, vsComp: 2.1 },
      { name: 'Claude', share: 18.6, vsPrev: 0.8, vsComp: -0.6 },
      { name: 'Google AI', share: 7.9, vsPrev: -1.1, vsComp: -6.8 },
    ],
    competitors: [
      { brand: 'Beurer', exposure: 28.4, cite: 26.1, coexist: 34, rank: 1 },
      { brand: 'Compex', exposure: 18.2, cite: 16.4, coexist: 22, rank: 0 },
      { brand: 'iReliev', exposure: 12.6, cite: 11, coexist: 15, rank: -1 },
      { brand: 'HealthmateForever', exposure: 9.8, cite: 8.1, coexist: 12, rank: -1 },
    ],
    themes: [
      { name: '机器/功能优势', value: 38, delta: 3.1 },
      { name: '外观/设计', value: 22, delta: 0.6 },
      { name: '品牌认知', value: 21, delta: -1.4 },
      { name: '性价比/口碑', value: 19, delta: 2 },
    ],
    questions: [
      { text: 'best TENS unit for back pain', status: 'covered' },
      { text: 'TENS unit vs EMS difference', status: 'covered' },
      { text: 'TENS unit for sciatica', status: 'missing', action: '补对比表与适应症 FAQ，优先投 Google AI。' },
      { text: 'best TENS pads replacement', status: 'covered' },
      { text: 'TENS unit for arthritis', status: 'missing', action: '补关节使用场景评测，引导 ChatGPT / Claude 引用。' },
      { text: 'portable TENS for travel', status: 'covered' },
      { text: 'TENS unit FDA cleared', status: 'missing', action: '把认证信息写进产品页与问答，缩小与头部竞品差距。' },
      { text: 'how to use TENS unit at home', status: 'covered' },
    ],
    keyword: {
      term: 'tens unit',
      grounds: ['Alexa 搜索推荐', 'Amazon 评测与 Q&A', 'Reddit 经验帖'],
      next: ['Google AI 对比问答', '关节 / 坐骨神经场景', '认证与安全性内容'],
    },
    traffic: [
      { channel: 'Amazon', type: 'Organic', sessions: 12640, users: 9820, orders: 186 },
      { channel: 'Google', type: 'Organic', sessions: 8640, users: 7012, orders: 94 },
      { channel: 'Alexa', type: 'Referral', sessions: 4320, users: 3601, orders: 41 },
      { channel: 'YouTube', type: 'Referral', sessions: 3180, users: 2744, orders: 22 },
      { channel: 'Reddit', type: 'Referral', sessions: 2460, users: 2190, orders: 15 },
      { channel: 'Direct', type: 'Direct', sessions: 5120, users: 4011, orders: 63 },
    ],
  },
  伤口贴: {
    base: { exposure: 24.5, cite: 21.8, coexist: 38.4 },
    deltas: { exposure: -1.4, cite: 0.9, coexist: 2.6, coverage: 4 },
    totalCites: 288,
    engines: [
      { name: 'Alexa', share: 22.4, vsPrev: -0.9, vsComp: -3.2 },
      { name: 'ChatGPT', share: 28.6, vsPrev: 2.4, vsComp: 5.1 },
      { name: 'Claude', share: 15.2, vsPrev: 0.4, vsComp: -1.1 },
      { name: 'Google AI', share: 11.8, vsPrev: 1.2, vsComp: 0.6 },
    ],
    competitors: [
      { brand: 'Band-Aid', exposure: 41.2, cite: 38.6, coexist: 46, rank: 0 },
      { brand: 'Nexcare', exposure: 26.8, cite: 24.1, coexist: 31, rank: 1 },
      { brand: 'Curad', exposure: 17.4, cite: 15.2, coexist: 20, rank: -1 },
      { brand: 'Medihoney', exposure: 8.6, cite: 7.4, coexist: 11, rank: 0 },
    ],
    themes: [
      { name: '粘性/防水', value: 41, delta: 2.4 },
      { name: '规格与数量', value: 24, delta: 1.1 },
      { name: '敏感肌友好', value: 20, delta: 3.6 },
      { name: '性价比/口碑', value: 15, delta: -0.8 },
    ],
    questions: [
      { text: 'best waterproof bandages', status: 'covered' },
      { text: 'hydrocolloid vs regular bandage', status: 'missing', action: '补敷料类型科普长文，抢 ChatGPT 解释类引用。' },
      { text: 'bandages for sensitive skin', status: 'covered' },
      { text: 'how long to keep a bandage on', status: 'missing', action: '补护理步骤 FAQ，覆盖 Google AI 操作类问答。' },
      { text: 'best bandages for kids', status: 'missing', action: '补儿童场景内容与安全说明。' },
      { text: 'bandage size guide', status: 'covered' },
    ],
    keyword: {
      term: 'waterproof bandages',
      grounds: ['ChatGPT 使用建议', 'Amazon Q&A', '母婴类博客'],
      next: ['Alexa 搜索推荐位', '敏感肌 / 儿童场景', '敷料类型科普'],
    },
    traffic: [
      { channel: 'Amazon', type: 'Organic', sessions: 7420, users: 6120, orders: 118 },
      { channel: 'Google', type: 'Organic', sessions: 5180, users: 4260, orders: 61 },
      { channel: 'ChatGPT', type: 'Referral', sessions: 2240, users: 1980, orders: 26 },
      { channel: 'Pinterest', type: 'Referral', sessions: 1640, users: 1420, orders: 12 },
      { channel: 'Reddit', type: 'Referral', sessions: 1180, users: 1024, orders: 7 },
      { channel: 'Direct', type: 'Direct', sessions: 3260, users: 2610, orders: 38 },
    ],
  },
  药盒: {
    base: { exposure: 31.6, cite: 28.4, coexist: 22.6 },
    deltas: { exposure: 3.4, cite: 2.8, coexist: -2.4, coverage: 12 },
    totalCites: 342,
    engines: [
      { name: 'Alexa', share: 31.6, vsPrev: 2.6, vsComp: 6.1 },
      { name: 'ChatGPT', share: 18.9, vsPrev: 1.1, vsComp: 1.4 },
      { name: 'Claude', share: 12.4, vsPrev: -0.4, vsComp: -2.2 },
      { name: 'Google AI', share: 9.2, vsPrev: 0.6, vsComp: -1.8 },
    ],
    competitors: [
      { brand: 'Sukuos', exposure: 22.4, cite: 20.1, coexist: 26, rank: 0 },
      { brand: 'MEACOLIA', exposure: 16.8, cite: 14.6, coexist: 19, rank: 1 },
      { brand: 'Zannaki', exposure: 11.2, cite: 9.8, coexist: 13, rank: -1 },
      { brand: 'AUVON Care', exposure: 7.4, cite: 6.2, coexist: 9, rank: 0 },
    ],
    themes: [
      { name: '容量与格数', value: 36, delta: 2.8 },
      { name: '密封/防潮', value: 27, delta: 4.1 },
      { name: '便携性', value: 22, delta: 1.2 },
      { name: '性价比/口碑', value: 15, delta: -1.1 },
    ],
    questions: [
      { text: 'best weekly pill organizer', status: 'covered' },
      { text: 'large pill box for big vitamins', status: 'covered' },
      { text: 'moisture proof pill container', status: 'covered' },
      { text: 'pill organizer for travel TSA', status: 'missing', action: '补出行合规与安检说明，覆盖 Google AI 问答。' },
      { text: 'am pm pill organizer 7 day', status: 'covered' },
      { text: 'pill box for seniors easy open', status: 'missing', action: '补老年易开启场景评测，引导 Claude 引用。' },
    ],
    keyword: {
      term: 'pill organizer',
      grounds: ['Alexa 搜索推荐', 'Amazon 评测', '慢病管理社区'],
      next: ['Claude 场景推荐', '老年易用场景', '出行合规内容'],
    },
    traffic: [
      { channel: 'Amazon', type: 'Organic', sessions: 9860, users: 8140, orders: 152 },
      { channel: 'Google', type: 'Organic', sessions: 6240, users: 5120, orders: 78 },
      { channel: 'Alexa', type: 'Referral', sessions: 3480, users: 2960, orders: 34 },
      { channel: 'YouTube', type: 'Referral', sessions: 2140, users: 1860, orders: 16 },
      { channel: 'Facebook', type: 'Referral', sessions: 1420, users: 1210, orders: 9 },
      { channel: 'Direct', type: 'Direct', sessions: 4180, users: 3320, orders: 49 },
    ],
  },
};

function geoGetRangeLabel() {
  return GEO_RANGE_LABELS[geoState.range] || '近 30 天';
}

function geoFormatDelta(value) {
  return `${value > 0 ? '+' : value < 0 ? '' : '±'}${value.toFixed(1)}%`;
}

/** 涨跌好坏由指标方向决定：共现率下降是好事 */
function geoDeltaTone(delta, better) {
  if (!delta) return 'flat';
  const rising = delta > 0;
  return (better === 'low' ? !rising : rising) ? 'good' : 'bad';
}

function geoBuildEngineTrend(share, vsPrev) {
  const step = vsPrev / 5;
  return Array.from({ length: 6 }, (_, index) => +(share - step * (5 - index)).toFixed(1));
}

function geoGetBoardData() {
  const { brand, category, range } = geoState;
  const rangeLabel = geoGetRangeLabel();
  const profile = GEO_CATEGORY_PROFILES[category] || GEO_CATEGORY_PROFILES.理疗仪;
  const factor = GEO_BRAND_FACTORS[brand] ?? 1;
  const rangeFactor = GEO_RANGE_FACTORS[range] || GEO_RANGE_FACTORS['30d'];

  const questions = profile.questions.map((item, index) => ({ ...item, id: `q${index + 1}` }));
  // 弱品牌覆盖更少：从后往前把已覆盖翻成缺失，保证列表与覆盖率永远一致
  const baseCovered = questions.filter(item => item.status === 'covered').length;
  let toFlip = baseCovered - Math.max(1, Math.round(baseCovered * factor));
  for (let i = questions.length - 1; i >= 0 && toFlip > 0; i -= 1) {
    if (questions[i].status !== 'covered') continue;
    questions[i] = {
      ...questions[i],
      status: 'missing',
      action: `${brand} 在该问题下暂无引用，先补品牌自有场景内容。`,
    };
    toFlip -= 1;
  }
  const coveredCount = questions.filter(item => item.status === 'covered').length;
  const coverage = +(coveredCount / questions.length * 100).toFixed(1);

  // 弱品牌露出更低、被竞品捆绑共现更高，所以 coexist 反向缩放
  const values = {
    exposure: +(profile.base.exposure * factor * rangeFactor.value).toFixed(1),
    cite: +(profile.base.cite * factor * rangeFactor.value).toFixed(1),
    coexist: +(profile.base.coexist / factor).toFixed(1),
    coverage,
  };

  const kpis = GEO_KPI_DEFS.map(def => {
    const value = values[def.key];
    const delta = +((profile.deltas[def.key] ?? 0) * rangeFactor.delta).toFixed(1);
    const isLow = def.better === 'low';
    const overTarget = isLow ? value > def.target : value < def.target;
    return {
      ...def,
      value,
      delta: geoFormatDelta(delta),
      tone: geoDeltaTone(delta, def.better),
      targetLabel: `${isLow ? '上限' : '目标'} ${def.target}%`,
      progress: Math.min(100, Math.round(value / def.target * 100)),
      overTarget,
    };
  });

  const engines = profile.engines.map(item => {
    const share = +(item.share * factor).toFixed(1);
    const vsComp = +(item.vsComp * factor).toFixed(1);
    const role = vsComp >= 2 ? '优势' : vsComp <= -2 ? '劣势' : '持平';
    return {
      ...item,
      share,
      cites: Math.round(profile.totalCites * factor * share / 100),
      vsPrev: geoFormatDelta(+(item.vsPrev * rangeFactor.delta).toFixed(1)),
      vsComp: geoFormatDelta(vsComp),
      role,
      tone: role === '优势' ? 'ok' : role === '劣势' ? 'danger' : 'muted',
      trend: geoBuildEngineTrend(share, item.vsPrev),
    };
  });

  const mix = engines.map(item => ({
    name: item.name,
    value: item.share,
    color: GEO_ENGINE_COLORS[item.name] || '#94a3b8',
  }));

  const rivals = profile.competitors.map(item => ({ ...item, own: false }));
  const competitors = [
    { brand, exposure: values.exposure, cite: values.cite, coexist: values.coexist, rank: 0, own: true },
    ...rivals,
  ];

  const maxShare = Math.max(...engines.map(item => item.share));
  const matrixEngines = engines.map(item => item.name);
  const matrix = rivals.map(rival => ({
    brand: rival.brand,
    values: engines.map(engine => Math.round(rival.coexist * (0.7 + engine.share / maxShare * 0.6))),
  }));

  const strongEngine = engines.reduce((max, item) => (item.share > max.share ? item : max), engines[0]);
  const weakEngine = engines.reduce((min, item) => (item.share < min.share ? item : min), engines[0]);
  const topCoexist = rivals.reduce((max, item) => (item.coexist > max.coexist ? item : max), rivals[0]);
  const citeDelta = kpis.find(item => item.key === 'cite');
  const coexistDelta = kpis.find(item => item.key === 'coexist');
  const missCount = kpis.filter(item => item.overTarget).length;
  const verdict = {
    tone: missCount === 0 ? 'ok' : missCount >= 3 ? 'danger' : 'warn',
    label: missCount === 0 ? '稳' : missCount >= 3 ? '风险' : '关注',
    text: `${brand} · ${category} ${rangeLabel}：引用${citeDelta.tone === 'good' ? '上升' : '走弱'}，`
      + `${weakEngine.name} 露出最低 ${weakEngine.share}%，`
      + `${topCoexist.brand} 共现 ${topCoexist.coexist}% 最高。`,
  };

  const badges = [
    { text: citeDelta.tone === 'good' ? '引用上升' : '引用走弱', tone: citeDelta.tone === 'good' ? 'ok' : 'danger' },
    { text: coexistDelta.tone === 'good' ? '竞品共现回落' : '竞品共现上升', tone: coexistDelta.tone === 'good' ? 'ok' : 'warn' },
    { text: `${missCount} 项未达标`, tone: missCount ? 'warn' : 'muted' },
  ];

  const searchTrend = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    series: [
      { name: 'Organic', color: '#2563eb', base: [42, 46, 44, 51, 55, 58] },
      { name: 'Direct', color: '#10b981', base: [28, 27, 29, 31, 30, 33] },
      { name: 'Referral', color: '#f59e0b', base: [16, 18, 17, 19, 21, 20] },
    ].map(item => ({
      name: item.name,
      color: item.color,
      values: item.base.map(value => Math.round(value * factor)),
    })),
  };

  const traffic = profile.traffic.map(item => {
    const sessions = Math.round(item.sessions * factor);
    const orders = Math.round(item.orders * factor);
    return {
      ...item,
      sessions,
      users: Math.round(item.users * factor),
      orders,
      conv: `${(orders / sessions * 100).toFixed(1)}%`,
    };
  });

  return {
    verdict,
    badges,
    kpis,
    mix,
    engines,
    engineNote: `${strongEngine.name} 是当前主阵地（${strongEngine.share}%）；${weakEngine.name} 引用份额最低（${weakEngine.share}%），是主要缺口。`,
    competitors,
    matrixEngines,
    matrix,
    themes: profile.themes.map(item => ({
      ...item,
      deltaText: geoFormatDelta(item.delta),
      tone: item.delta >= 0 ? 'up' : 'down',
    })),
    questionSummary: { covered: coveredCount, total: questions.length },
    questions,
    keyword: profile.keyword,
    searchTrend,
    traffic,
  };
}

function renderGeoView(pageId) {
  const resolvedId = GEO_PAGES[pageId] ? pageId : geoState.pageId;
  geoState.pageId = resolvedId;
  const page = GEO_PAGES[resolvedId];
  const el = document.getElementById('geo-view');
  if (!el) return;

  if (resolvedId === 'geo-brand-board') {
    el.innerHTML = renderGeoBrandBoard();
    return;
  }

  const iconHtml = typeof I === 'function' ? I('insight', 32) : '';
  el.innerHTML = `
    <div class="geo-page">
      <header class="geo-head">
        <span class="geo-eyebrow">GEO</span>
        <h1>${page.title}</h1>
        <p>${page.desc}</p>
      </header>
      <div class="geo-empty">
        <div class="geo-empty-icon">${iconHtml}</div>
        <strong>该模块待建设</strong>
        <p>后续将在此展示 ${page.title} 相关数据与操作入口。</p>
      </div>
    </div>
  `;
}

function renderGeoBrandBoard() {
  return `
    <div class="geo-page geo-brand-page">
      ${renderGeoBrandFilters()}
      <section class="geo-layer" id="geo-layer-judge">${renderGeoLayerJudge()}</section>
      <section class="geo-layer" id="geo-layer-engine">${renderGeoLayerEngine()}</section>
      <section class="geo-layer" id="geo-layer-compete">${renderGeoLayerCompete()}</section>
      <section class="geo-layer" id="geo-layer-question">${renderGeoLayerQuestion()}</section>
      <section class="geo-layer" id="geo-layer-traffic">${renderGeoLayerTraffic()}</section>
    </div>
  `;
}

function renderGeoBrandFilters() {
  const brands = ['AUVON', 'ZIKEE', 'AMOOS'];
  const categories = ['理疗仪', '伤口贴', '药盒'];
  const ranges = [
    { id: '7d', name: '近 7 天' },
    { id: '30d', name: '近 30 天' },
    { id: '90d', name: '近 90 天' },
  ];
  return `
    <div class="geo-filter-bar">
      <strong class="geo-filter-title">GEO · 品牌总看板</strong>
      <label>品牌
        <select onchange="geoUpdateBrandFilter('brand', this.value)">
          ${brands.map(item => `<option value="${item}" ${geoState.brand === item ? 'selected' : ''}>${item}</option>`).join('')}
        </select>
      </label>
      <label>品类
        <select onchange="geoUpdateBrandFilter('category', this.value)">
          ${categories.map(item => `<option value="${item}" ${geoState.category === item ? 'selected' : ''}>${item}</option>`).join('')}
        </select>
      </label>
      <label>时间
        <select onchange="geoUpdateBrandFilter('range', this.value)">
          ${ranges.map(item => `<option value="${item.id}" ${geoState.range === item.id ? 'selected' : ''}>${item.name}</option>`).join('')}
        </select>
      </label>
      <nav class="geo-layer-nav">
        ${GEO_LAYER_NAV.map(item => `
          <button type="button" onclick="geoScrollLayer('${item.id}')">${item.name}</button>
        `).join('')}
      </nav>
      <span class="geo-updated">数据截至 ${GEO_DATA_UPDATED_AT}</span>
    </div>
  `;
}

function renderGeoLayerHead(kicker, title, desc) {
  return `
    <header class="geo-layer-head">
      <span>${kicker}</span>
      <h2>${title}</h2>
      <p>${desc}</p>
    </header>
  `;
}

function renderGeoLayerJudge() {
  const data = geoGetBoardData();
  const mixTotal = data.mix.reduce((sum, item) => sum + item.value, 0);
  return `
    ${renderGeoLayerHead('L1 判断', '好不好', '先看结论和核心指标')}
    <section class="geo-verdict geo-verdict-${data.verdict.tone}">
      <div class="geo-verdict-copy">
        <span class="geo-tag ${data.verdict.tone}">${data.verdict.label}</span>
        <p>${data.verdict.text}</p>
      </div>
      <div class="geo-badge-row">
        ${data.badges.map(item => `<span class="geo-tag ${item.tone}">${item.text}</span>`).join('')}
      </div>
    </section>
    <div class="geo-kpi-row">
      ${data.kpis.map(item => `
        <article class="geo-kpi-card">
          <span>${item.label}<i class="geo-dir">${item.better === 'low' ? '越低越好' : '越高越好'}</i></span>
          <strong>${item.value.toFixed(1)}%</strong>
          <em class="${item.tone}">${item.delta}</em>
          <div class="geo-target">
            <div class="geo-bar"><i class="${item.overTarget ? 'over' : ''}" style="width:${item.progress}%"></i></div>
            <small>${item.targetLabel}${item.overTarget ? ' · 未达标' : ''}</small>
          </div>
        </article>
      `).join('')}
    </div>
    <div class="geo-module">
      <header class="geo-module-head">
        <h3>引擎占比</h3>
        <p>各生成式引擎中的品牌出现占比</p>
      </header>
      <div class="geo-mix-bar">
        ${data.mix.map(item => `
          <i style="width:${(item.value / mixTotal * 100).toFixed(1)}%;background:${item.color}" title="${item.name} ${item.value}%"></i>
        `).join('')}
      </div>
      <div class="geo-mix-legend">
        ${data.mix.map(item => `
          <span><i style="background:${item.color}"></i>${item.name} ${item.value}%</span>
        `).join('')}
      </div>
    </div>
  `;
}

function renderGeoSparkline(values, color) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 80;
    const y = 22 - ((value - min) / (max - min || 1)) * 18;
    return `${x},${y}`;
  }).join(' ');
  return `<svg class="geo-spark" viewBox="0 0 80 24" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}

function renderGeoLayerEngine() {
  const data = geoGetBoardData();
  return `
    ${renderGeoLayerHead('L2 引擎', '在哪被提到', '四个引擎的引用与相对强弱')}
    <p class="geo-layer-note">${data.engineNote}</p>
    <div class="geo-engine-grid">
      ${data.engines.map(item => `
        <article class="geo-engine-card">
          <div class="geo-engine-top">
            <strong>${item.name}</strong>
            <span class="geo-tag ${item.tone}">${item.role}</span>
          </div>
          <b>${item.cites}</b>
          <em>引用 ${item.share}%</em>
          ${renderGeoSparkline(item.trend, item.tone === 'danger' ? '#d97706' : '#2563eb')}
          <p>本期 vs 上期 <strong class="${item.vsPrev.startsWith('-') ? 'down' : 'up'}">${item.vsPrev}</strong></p>
          <p>品牌 vs 竞品均 <strong class="${item.vsComp.startsWith('-') ? 'down' : 'up'}">${item.vsComp}</strong></p>
        </article>
      `).join('')}
    </div>
  `;
}

function renderGeoScatter(competitors) {
  const maxX = Math.max(...competitors.map(item => item.exposure)) * 1.15;
  const maxY = Math.max(...competitors.map(item => item.cite)) * 1.15;
  return `
    <div class="geo-scatter" aria-hidden="true">
      <span class="geo-scatter-y">引用份额</span>
      <span class="geo-scatter-x">曝光份额</span>
      ${competitors.map(item => `
        <button type="button" class="geo-scatter-dot ${item.own ? 'is-own' : ''} ${geoState.activeCompetitor === item.brand ? 'is-active' : ''}"
          style="left:${(item.exposure / maxX * 100).toFixed(1)}%;bottom:${(item.cite / maxY * 100).toFixed(1)}%"
          onclick="geoSelectCompetitor('${item.brand}')"
          title="${item.brand}">
          <i></i><span>${item.brand}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderGeoLayerCompete() {
  const data = geoGetBoardData();
  return `
    ${renderGeoLayerHead('L3 竞品', '跟谁抢', '曝光、引用与共现')}
    <div class="geo-split">
      <article class="geo-module">
        <header class="geo-module-head">
          <h3>曝光 × 引用</h3>
          <p>点表行或散点可互相对齐</p>
        </header>
        ${renderGeoScatter(data.competitors)}
      </article>
      <article class="geo-module">
        <header class="geo-module-head">
          <h3>竞品表</h3>
          <p>我方置顶</p>
        </header>
        <div class="geo-table-wrap">
          <table class="geo-table">
            <thead>
              <tr>
                <th>品牌</th>
                <th>曝光</th>
                <th>引用</th>
                <th>共现</th>
                <th>名次</th>
              </tr>
            </thead>
            <tbody>
              ${data.competitors.map(item => `
                <tr class="${item.own ? 'is-own' : ''} ${geoState.activeCompetitor === item.brand ? 'is-active' : ''}"
                  onclick="geoSelectCompetitor('${item.brand}')">
                  <td><strong>${item.brand}</strong>${item.own ? '<small>我方</small>' : ''}</td>
                  <td>${item.exposure}%</td>
                  <td>${item.cite}%</td>
                  <td>${item.coexist}%</td>
                  <td>${item.rank > 0 ? `↑${item.rank}` : item.rank < 0 ? `↓${Math.abs(item.rank)}` : '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
    </div>
    <article class="geo-module">
      <header class="geo-module-head">
        <h3>共现矩阵</h3>
        <p>我方与竞品在各引擎中一起出现的比例</p>
      </header>
      <div class="geo-table-wrap">
        <table class="geo-table geo-matrix">
          <thead>
            <tr>
              <th>竞品</th>
              ${data.matrixEngines.map(name => `<th>${name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.matrix.map(row => `
              <tr>
                <td><strong>${row.brand}</strong></td>
                ${row.values.map(value => `<td>${value}%</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderGeoLayerQuestion() {
  const data = geoGetBoardData();
  return `
    ${renderGeoLayerHead('L4 内容与问题', '该补什么', '主题提及与高频问题覆盖')}
    <div class="geo-split">
      <article class="geo-module">
        <header class="geo-module-head">
          <h3>主题提及</h3>
          <p>AI 内容里被提到的能力维度</p>
        </header>
        <div class="geo-theme-list">
          ${data.themes.map(item => `
            <div class="geo-theme-row">
              <strong>${item.name}</strong>
              <div class="geo-bar"><i style="width:${item.value}%"></i></div>
              <span>${item.value}%</span>
              <em class="${item.tone}">${item.deltaText}</em>
            </div>
          `).join('')}
        </div>
      </article>
      <article class="geo-module">
        <header class="geo-module-head">
          <h3>高频问题覆盖</h3>
          <p>${data.questionSummary.total} 个高频问题中覆盖 ${data.questionSummary.covered} 个。点缺失项看建议。</p>
        </header>
        <div class="geo-question-list">
          ${data.questions.map(item => {
            const open = geoState.expandedQuestion === item.id;
            const missing = item.status === 'missing';
            return `
              <button type="button" class="geo-question ${missing ? 'is-missing' : ''} ${open ? 'is-open' : ''}"
                ${missing ? `onclick="geoToggleQuestion('${item.id}')"` : 'disabled'}>
                <span class="geo-tag ${missing ? 'danger' : 'ok'}">${missing ? '缺失' : '已覆盖'}</span>
                <p>${item.text}</p>
                ${open && item.action ? `<small>${item.action}</small>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </article>
    </div>
  `;
}

function renderGeoLineChart(trend) {
  const width = 520;
  const height = 160;
  const pad = 24;
  const all = trend.series.flatMap(item => item.values);
  const max = Math.max(...all);
  const min = Math.min(...all);
  const toX = index => pad + (index / (trend.labels.length - 1)) * (width - pad * 2);
  const toY = value => height - pad - ((value - min) / (max - min || 1)) * (height - pad * 2);
  return `
    <svg class="geo-line" viewBox="0 0 ${width} ${height}" aria-hidden="true">
      ${trend.series.map(item => {
        const d = item.values.map((value, index) => `${index ? 'L' : 'M'}${toX(index)},${toY(value)}`).join(' ');
        return `<path d="${d}" fill="none" stroke="${item.color}" stroke-width="2"/>`;
      }).join('')}
      ${trend.labels.map((label, index) => `<text x="${toX(index)}" y="${height - 6}" text-anchor="middle">${label}</text>`).join('')}
    </svg>
    <div class="geo-mix-legend">
      ${trend.series.map(item => `<span><i style="background:${item.color}"></i>${item.name}</span>`).join('')}
    </div>
  `;
}

function renderGeoLayerTraffic() {
  const data = geoGetBoardData();
  return `
    ${renderGeoLayerHead('L5 关键词与流量', '从哪来', '主词与渠道明细')}
    <div class="geo-split">
      <article class="geo-module">
        <header class="geo-module-head">
          <h3>主词 ${data.keyword.term}</h3>
          <p>当前流量主阵地 / 潜在发力点</p>
        </header>
        <div class="geo-keyword-cols">
          <div>
            <strong>当前流量主阵地</strong>
            <ul>${data.keyword.grounds.map(item => `<li>${item}</li>`).join('')}</ul>
          </div>
          <div>
            <strong>潜在发力点</strong>
            <ul>${data.keyword.next.map(item => `<li>${item}</li>`).join('')}</ul>
          </div>
        </div>
      </article>
      <article class="geo-module">
        <header class="geo-module-head">
          <h3>搜索量趋势</h3>
          <p>近 6 周渠道拆分</p>
        </header>
        ${renderGeoLineChart(data.searchTrend)}
      </article>
    </div>
    <article class="geo-module">
      <header class="geo-module-head">
        <h3>流量明细</h3>
        <p>渠道、类型、会话、用户、订单、转化率</p>
      </header>
      <div class="geo-table-wrap">
        <table class="geo-table">
          <thead>
            <tr>
              <th>渠道</th>
              <th>类型</th>
              <th>会话</th>
              <th>用户</th>
              <th>订单</th>
              <th>转化率</th>
            </tr>
          </thead>
          <tbody>
            ${data.traffic.map(item => `
              <tr>
                <td><strong>${item.channel}</strong></td>
                <td>${item.type}</td>
                <td>${item.sessions.toLocaleString()}</td>
                <td>${item.users.toLocaleString()}</td>
                <td>${item.orders}</td>
                <td>${item.conv}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function geoScrollLayer(id) {
  const el = document.getElementById(`geo-layer-${id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function geoSelectCompetitor(brand) {
  geoState.activeCompetitor = brand;
  renderGeoView('geo-brand-board');
}

function geoToggleQuestion(id) {
  geoState.expandedQuestion = geoState.expandedQuestion === id ? '' : id;
  renderGeoView('geo-brand-board');
}

function geoUpdateBrandFilter(key, value) {
  if (!['brand', 'category', 'range'].includes(key)) return;
  geoState[key] = value;
  if (key === 'brand') geoState.activeCompetitor = value;
  geoState.expandedQuestion = '';
  renderGeoView('geo-brand-board');
}

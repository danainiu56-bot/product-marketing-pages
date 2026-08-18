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

const GEO_BRAND_TABS = [
  { id: 'overview', name: '概览' },
  { id: 'channel', name: '渠道与声量' },
  { id: 'compete', name: '竞品对比' },
  { id: 'detail', name: '评论与明细' },
];

const geoState = {
  pageId: 'geo-brand-board',
  brandTab: 'overview',
  brand: 'AUVON',
  category: '理疗仪',
  range: '30d',
};

const GEO_BRAND_MOCK = {
  platforms: [
    { name: 'Alexa', value: '39.1%' },
    { name: 'ChatGPT', value: '21.2%' },
    { name: 'Claude', value: '18.6%' },
    { name: 'Google AI', value: '5.8%' },
  ],
  kpis: [
    { label: '品牌曝光率', value: '21.5%', delta: '+2.1%', tone: 'up' },
    { label: 'AI 引用率', value: '25.3%', delta: '+4.6%', tone: 'up' },
    { label: '竞品共现率', value: '15.4%', delta: '-1.2%', tone: 'down' },
    { label: '目标问题覆盖率', value: '50.0%', delta: '+8.0%', tone: 'up' },
  ],
  insights: [
    { tag: '正向', tone: 'ok', text: 'ChatGPT / Claude 对「best TENS unit」类问题开始稳定引用 AUVON。' },
    { tag: '关注', tone: 'warn', text: 'Google AI 曝光仍低，目标问题覆盖不足，建议补 FAQ 与对比表内容。' },
    { tag: '风险', tone: 'danger', text: '竞品 Beurer 在 Reddit / Quora 共现上升，差异化卖点未被引用。' },
  ],
  channels: [
    { name: 'Reddit', share: 28, volume: 1260 },
    { name: 'Quora', share: 21, volume: 940 },
    { name: 'YouTube', share: 18, volume: 810 },
    { name: 'Amazon Q&A', share: 16, volume: 720 },
    { name: '博客/评测', share: 17, volume: 760 },
  ],
  trend: [
    { label: 'W1', value: 42 },
    { label: 'W2', value: 48 },
    { label: 'W3', value: 45 },
    { label: 'W4', value: 58 },
  ],
  competitors: [
    { brand: 'AUVON', exposure: '21.5%', cite: '25.3%', coexist: '—', gap: '基准' },
    { brand: 'Beurer', exposure: '18.2%', cite: '19.0%', coexist: '34%', gap: '价格/认证' },
    { brand: 'TENS 7000', exposure: '12.6%', cite: '11.4%', coexist: '22%', gap: '专业向人群' },
    { brand: 'Comfytemp', exposure: '9.8%', cite: '8.1%', coexist: '15%', gap: '便携场景' },
  ],
  strengths: [
    { name: '外观 / 设计', score: 78 },
    { name: '性能 / 功能', score: 84 },
    { name: '性价比', score: 71 },
  ],
  sentiments: [
    { name: '正面', value: 62, tone: 'ok' },
    { name: '中性', value: 24, tone: 'muted' },
    { name: '负面', value: 14, tone: 'danger' },
  ],
  records: [
    { channel: 'Reddit', user: 'u/painrelief', content: 'Looking for a TENS unit that is easy for daily back pain.', date: '2026-08-12', status: '正面' },
    { channel: 'Quora', user: 'Helen K.', content: 'AUVON vs Beurer for home physical therapy?', date: '2026-08-11', status: '中性' },
    { channel: 'Amazon Q&A', user: 'Buyer', content: 'Does it work for sciatica? Any side effects?', date: '2026-08-10', status: '关注' },
    { channel: 'YouTube', user: 'FitReview', content: 'Compared 3 TENS brands, AUVON mentioned for pad comfort.', date: '2026-08-08', status: '正面' },
  ],
};

function renderGeoView(pageId) {
  const resolvedId = GEO_PAGES[pageId] ? pageId : geoState.pageId;
  geoState.pageId = resolvedId;
  const page = GEO_PAGES[resolvedId];
  const el = document.getElementById('geo-view');
  if (!el) return;

  if (resolvedId === 'geo-brand-board') {
    el.innerHTML = renderGeoBrandBoard(page);
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

function renderGeoBrandBoard(page) {
  const tab = GEO_BRAND_TABS.some(item => item.id === geoState.brandTab)
    ? geoState.brandTab
    : 'overview';
  geoState.brandTab = tab;
  return `
    <div class="geo-page geo-brand-page">
      <header class="geo-head">
        <span class="geo-eyebrow">GEO</span>
        <h1>${page.title}</h1>
        <p>${page.desc}</p>
      </header>
      ${renderGeoBrandFilters()}
      <nav class="geo-tabs">
        ${GEO_BRAND_TABS.map(item => `
          <button type="button" class="geo-tab ${item.id === tab ? 'active' : ''}" onclick="geoSwitchBrandTab('${item.id}')">${item.name}</button>
        `).join('')}
      </nav>
      <div class="geo-tab-body">
        ${renderGeoBrandTab(tab)}
      </div>
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
      <span class="geo-filter-scope">当前：${geoState.brand} · ${geoState.category} · ${ranges.find(item => item.id === geoState.range)?.name || '近 30 天'}</span>
    </div>
  `;
}

function renderGeoBrandTab(tab) {
  if (tab === 'channel') return renderGeoChannelTab();
  if (tab === 'compete') return renderGeoCompeteTab();
  if (tab === 'detail') return renderGeoDetailTab();
  return renderGeoOverviewTab();
}

function renderGeoOverviewTab() {
  const data = GEO_BRAND_MOCK;
  return `
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>平台曝光</h3>
        <p>各生成式引擎中的品牌出现占比</p>
      </header>
      <div class="geo-platform-row">
        ${data.platforms.map(item => `
          <article class="geo-platform-card">
            <span>${item.name}</span>
            <strong>${item.value}</strong>
          </article>
        `).join('')}
      </div>
    </section>
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>核心指标</h3>
        <p>品牌曝光、AI 引用、竞品共现与目标问题覆盖</p>
      </header>
      <div class="geo-kpi-row">
        ${data.kpis.map(item => `
          <article class="geo-kpi-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <em class="${item.tone}">${item.delta}</em>
          </article>
        `).join('')}
      </div>
    </section>
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>核心观点</h3>
        <p>基于当前筛选范围的判断摘要</p>
      </header>
      <ul class="geo-insight-list">
        ${data.insights.map(item => `
          <li>
            <span class="geo-tag ${item.tone}">${item.tag}</span>
            <p>${item.text}</p>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderGeoChannelTab() {
  const data = GEO_BRAND_MOCK;
  const maxShare = Math.max(...data.channels.map(item => item.share));
  const maxTrend = Math.max(...data.trend.map(item => item.value));
  return `
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>渠道分布</h3>
        <p>引用来源占比与声量</p>
      </header>
      <div class="geo-channel-list">
        ${data.channels.map(item => `
          <div class="geo-channel-row">
            <strong>${item.name}</strong>
            <div class="geo-bar"><i style="width:${Math.round(item.share / maxShare * 100)}%"></i></div>
            <span>${item.share}%</span>
            <em>${item.volume.toLocaleString()}</em>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>声量趋势</h3>
        <p>近 4 周品牌被提及次数变化</p>
      </header>
      <div class="geo-trend">
        ${data.trend.map(item => `
          <div class="geo-trend-col">
            <div class="geo-trend-bar" style="height:${Math.round(item.value / maxTrend * 100)}%"></div>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderGeoCompeteTab() {
  const data = GEO_BRAND_MOCK;
  return `
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>品牌对比</h3>
        <p>曝光、引用与共现差距</p>
      </header>
      <div class="geo-table-wrap">
        <table class="geo-table">
          <thead>
            <tr>
              <th>品牌</th>
              <th>曝光率</th>
              <th>AI 引用率</th>
              <th>共现率</th>
              <th>主要差距</th>
            </tr>
          </thead>
          <tbody>
            ${data.competitors.map(item => `
              <tr>
                <td><strong>${item.brand}</strong></td>
                <td>${item.exposure}</td>
                <td>${item.cite}</td>
                <td>${item.coexist}</td>
                <td>${item.gap}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>产品力分析</h3>
        <p>评论中被提及的能力维度</p>
      </header>
      <div class="geo-strength-list">
        ${data.strengths.map(item => `
          <div class="geo-strength-row">
            <strong>${item.name}</strong>
            <div class="geo-bar"><i style="width:${item.score}%"></i></div>
            <span>${item.score}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderGeoDetailTab() {
  const data = GEO_BRAND_MOCK;
  return `
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>舆情分类</h3>
        <p>当前范围内的情绪结构</p>
      </header>
      <div class="geo-sentiment-row">
        ${data.sentiments.map(item => `
          <article class="geo-sentiment-card ${item.tone}">
            <span>${item.name}</span>
            <strong>${item.value}%</strong>
          </article>
        `).join('')}
      </div>
    </section>
    <section class="geo-module">
      <header class="geo-module-head">
        <h3>评论明细</h3>
        <p>代表性引用与问答记录</p>
      </header>
      <div class="geo-table-wrap">
        <table class="geo-table">
          <thead>
            <tr>
              <th>渠道</th>
              <th>用户</th>
              <th>内容</th>
              <th>日期</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${data.records.map(item => `
              <tr>
                <td>${item.channel}</td>
                <td>${item.user}</td>
                <td>${item.content}</td>
                <td>${item.date}</td>
                <td>${item.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function geoSwitchBrandTab(tab) {
  geoState.brandTab = tab;
  renderGeoView('geo-brand-board');
}

function geoUpdateBrandFilter(key, value) {
  if (!['brand', 'category', 'range'].includes(key)) return;
  geoState[key] = value;
  renderGeoView('geo-brand-board');
}

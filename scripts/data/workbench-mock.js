/**
 * 工作台 mock 数据 + 聚合函数
 *
 * 设计：
 * - 一份月级 mock（2025-01 ~ 2026-12 共 24 个月），数据通过种子函数生成，2026-05 用基线手填以保持当前视觉一致
 * - getWorkbenchData(state) 根据 granularity (month/quarter/year) + year + month/quarter 返回聚合后的看板数据
 * - getTrendSeries(state, opts) 根据当前粒度 + 趋势子控件状态（metric / splitBy）返回时间序列
 *
 * 不引入图表库，纯数据。
 */

const WB_BU_LIST = ['物理治疗', '慢病耗材', '家居关怀', '北美市场', '健康家访'];
const WB_BU_HINT = {
  '物理治疗': '新品 Listing 集中，关注审核排期',
  '慢病耗材': '资料缺失较多，先补齐输入质量',
  '家居关怀': '图片文案积压，建议协调生成资源',
  '北美市场': '新品占比高，需提前锁定开卖节奏',
  '健康家访': '交付稳定，保持当前节奏',
};

const WB_TYPE_LIST = ['新品 Listing', 'Listing 图片文案', '说明书', '视频脚本文案', 'FAQ'];
const WB_TYPE_HINT = {
  '新品 Listing': '关联开卖时间，需提前预警',
  'Listing 图片文案': '风险最高，优先看审核队列',
  '说明书': '资料完整性影响交付质量',
  '视频脚本文案': '生成周期偏长，关注产能占用',
  'FAQ': '低风险，可作为弹性承接类型',
};
const WB_TYPE_BU_MATCH = {
  '新品 Listing': '物理治疗,北美市场',
  'Listing 图片文案': '家居关怀,北美市场',
  '说明书': '慢病耗材,物理治疗',
  '视频脚本文案': '家居关怀,慢病耗材',
  'FAQ': '健康家访,家居关怀',
};

const WB_TEAM_LIST = ['Mason', 'Yumi', 'Brian', 'Suki'];
const WB_TEAM_HINT = {
  Mason: '高负载，少接急单',
  Yumi: '可承接 FAQ',
  Brian: '一稿偏低，暂缓复杂需求',
  Suki: '可承接慢病耗材',
};

const WB_SALES_LIST = ['Jessi', 'Liz', 'Tina', 'Sam', 'Kevin'];
const WB_SALES_META = {
  Jessi: { bu: '物理治疗', buLead: 'Suki' },
  Liz:   { bu: '北美市场', buLead: 'Suki' },
  Tina:  { bu: '北美市场', buLead: 'Suki' },
  Sam:   { bu: '家居关怀', buLead: 'Suki' },
  Kevin: { bu: '慢病耗材', buLead: 'Suki' },
};
const WB_SALES_HINT = {
  Jessi: '驳回偏高，提交前核对 SKU 与开卖时间',
  Liz:   '提交量最高，注意资料完整性',
  Tina:  '跨 BU 提交较多，建议按事业部拆分排期',
  Sam:   '通过率稳定，可承接新品 Listing',
  Kevin: '通过率偏低，暂缓复杂类型需求',
};

const WB_QUALITY_LIST = ['信息错误', '因果链不完整', '卖点表达不清', 'GEO/本地化不匹配', 'SEO 覆盖不足'];

// 简单可重复的伪随机：基于种子的线性同余
function wbSeedRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** 经营健康度状态（PRD §1.2.5）：仅依据 total、overdue */
function wbComputeHealthStatus(total, overdue) {
  if (!total) return '暂无数据';
  if (overdue === 0) return '正常';
  if (overdue <= 2) return '需关注';
  return '高风险';
}

function wbTopTypeRisk(type, typeRisk) {
  let top = null;
  let topScore = 0;
  Object.keys(type || {}).forEach(name => {
    const r = typeRisk[name] || {};
    const score = (r.danger || 0) * 2 + (r.warn || 0);
    if (score > topScore) {
      topScore = score;
      top = name;
    }
  });
  return top;
}

/** 健康度摘要规则引擎（PRD §1.2.6） */
function wbBuildHealthSummary({ total, overdue, willOverdue, type, typeRisk, kpi }) {
  if (!total) return '当前统计范围内暂无需求，无法评估经营健康度。';

  const risk = overdue + willOverdue;
  const topType = wbTopTypeRisk(type, typeRisk);
  const deliveryOk = kpi && kpi.delivery >= 0.9;
  const draftOk = kpi && kpi.draft >= 0.9;
  const parts = [];

  if (overdue >= 3) {
    parts.push(`已有 ${overdue} 个需求逾期，超出安全线，需立即协调处理。`);
  } else if (overdue >= 1) {
    parts.push(`存在 ${overdue} 个已逾期需求，建议优先清欠。`);
  } else if (willOverdue >= 5) {
    parts.push(`${willOverdue} 个需求即将逾期，需提前排期。`);
  } else if (risk === 0) {
    parts.push('当前无逾期风险，交付节奏稳定。');
  } else {
    parts.push('整体交付节奏可控，但仍有部分需求需关注时效。');
  }

  if (deliveryOk && draftOk) {
    parts.push('准时交付与一稿通过率均达标。');
  } else if (!deliveryOk && !draftOk) {
    parts.push('准时交付与一稿通过率均低于 90% 目标，需复盘流程。');
  } else if (!deliveryOk) {
    parts.push('准时交付率低于 90% 目标，需关注产能与排期。');
  } else if (!draftOk) {
    parts.push('一稿通过率低于 90% 目标，需加强需求理解质检。');
  }

  if (topType) {
    const tr = typeRisk[topType] || {};
    if (tr.danger >= 2 || (overdue >= 2 && tr.danger >= 1)) {
      parts.push(`建议控制 ${topType} 积压（${tr.danger || 0} 已逾期、${tr.warn || 0} 即将逾期）。`);
    } else if (tr.warn >= 3 && willOverdue >= 3) {
      parts.push(`${topType} 即将逾期较多，建议提前协调资源。`);
    }
  }

  return parts.join('');
}

function wbApplyHealth(m) {
  m.health = {
    status: wbComputeHealthStatus(m.total, m.overdue),
    summary: wbBuildHealthSummary({
      total: m.total,
      overdue: m.overdue,
      willOverdue: m.willOverdue,
      type: m.type,
      typeRisk: m.typeRisk,
      kpi: m.kpi,
    }),
  };
  return m;
}

// 一个月条目结构
function buildMonthly(year, month) {
  const seed = year * 100 + month;
  // total 在 60-100 间波动
  const total = 60 + Math.floor(wbSeedRand(seed) * 35);
  const completed = Math.round(total * (0.6 + wbSeedRand(seed + 1) * 0.2));
  const overdue = Math.round(total * (0.02 + wbSeedRand(seed + 2) * 0.06));
  const willOverdue = Math.round(total * (0.06 + wbSeedRand(seed + 3) * 0.08));

  // BU 分配（百分比和约 100%）
  const buShare = [0.30, 0.21, 0.20, 0.16, 0.13];
  const bu = {};
  const buRisk = {};
  WB_BU_LIST.forEach((name, i) => {
    const v = Math.max(2, Math.round(total * buShare[i] * (0.85 + wbSeedRand(seed + i + 10) * 0.3)));
    bu[name] = v;
    const dangerCnt = Math.round(v * (0.04 + wbSeedRand(seed + i + 20) * 0.08));
    const warnCnt = Math.round(v * (0.10 + wbSeedRand(seed + i + 30) * 0.15));
    buRisk[name] = { warn: warnCnt, danger: dangerCnt };
  });

  // 类型分配
  const typeShare = [0.28, 0.16, 0.10, 0.08, 0.07];
  const type = {};
  const typeRisk = {};
  WB_TYPE_LIST.forEach((name, i) => {
    const v = Math.max(2, Math.round(total * typeShare[i] * (0.85 + wbSeedRand(seed + i + 50) * 0.3)));
    type[name] = v;
    const dangerCnt = Math.round(v * (0.05 + wbSeedRand(seed + i + 60) * 0.1));
    const warnCnt = Math.round(v * (0.12 + wbSeedRand(seed + i + 70) * 0.15));
    typeRisk[name] = { warn: warnCnt, danger: dangerCnt };
  });

  // 人员
  const teamBase = {
    Mason: { grammar: 0.98, draft: 0.88, ai: 0.80, status: '高负载' },
    Yumi:  { grammar: 0.97, draft: 0.84, ai: 0.76, status: '正常' },
    Brian: { grammar: 0.94, draft: 0.76, ai: 0.68, status: '需关注' },
    Suki:  { grammar: 0.96, draft: 0.82, ai: 0.74, status: '可承接' },
  };
  const teamLoadShare = { Mason: 0.21, Yumi: 0.18, Brian: 0.14, Suki: 0.12 };
  const team = WB_TEAM_LIST.map((name, i) => {
    const base = teamBase[name];
    const drift = (wbSeedRand(seed + i + 100) - 0.5) * 0.02;
    return {
      name,
      grammar: Math.min(0.999, Math.max(0.85, base.grammar + drift)),
      draft: Math.min(0.99, Math.max(0.5, base.draft + drift * 2)),
      ai: Math.min(0.99, Math.max(0.5, base.ai + drift * 2)),
      load: Math.max(4, Math.round(total * teamLoadShare[name])),
      status: base.status,
    };
  });

  const salesShare = { Jessi: 0.28, Liz: 0.26, Tina: 0.18, Sam: 0.16, Kevin: 0.12 };
  const salesPassBase = { Jessi: 0.82, Liz: 0.88, Tina: 0.85, Sam: 0.90, Kevin: 0.76 };
  const salesTeam = WB_SALES_LIST.map((name, i) => {
    const meta = WB_SALES_META[name];
    const submitCount = Math.max(3, Math.round(total * salesShare[name] * (0.85 + wbSeedRand(seed + i + 400) * 0.3)));
    const drift = (wbSeedRand(seed + i + 410) - 0.5) * 0.06;
    const passRate = Math.min(0.99, Math.max(0.55, salesPassBase[name] + drift));
    const passedCount = Math.round(submitCount * passRate);
    const rejectedCount = Math.max(0, submitCount - passedCount - Math.max(1, Math.round(submitCount * 0.12)));
    return {
      name,
      bu: meta.bu,
      buLead: meta.buLead,
      submitCount,
      passedCount,
      rejectedCount,
      passRate: submitCount ? passedCount / submitCount : 0,
      hint: WB_SALES_HINT[name],
    };
  });

  // 质量分布（百分比和 = 100）
  const qpct = [38, 24, 18, 12, 8].map((v, i) => Math.max(2, v + Math.round((wbSeedRand(seed + i + 200) - 0.5) * 6)));
  const qsum = qpct.reduce((a, b) => a + b, 0);
  const quality = WB_QUALITY_LIST.map((label, i) => ({
    label,
    pct: Math.round(qpct[i] * 100 / qsum),
  }));

  const riskCount = Object.values(buRisk).reduce((acc, r) => acc + r.warn + r.danger, 0);

  // 关注项
  const focus = [
    overdue > 0 ? `Listing 图片文案有 ${overdue} 个已逾期，建议优先协调审核资源。` : '近期无逾期需求，节奏稳定。',
    'Brian 一稿通过率低于团队均值，需要复盘需求理解偏差。',
    'Mason 当前负载最高，后续新增需求建议分流给 Suki。',
    'FAQ 与新闻稿交付稳定，可保持当前节奏。',
  ];

  const entry = {
    ym: `${year}-${String(month).padStart(2, '0')}`,
    year, month,
    total, completed, overdue, willOverdue,
    riskCount,
    bu, buRisk,
    type, typeRisk,
    team,
    salesTeam,
    quality,
    focus,
    kpi: {
      delivery: 0.88 + wbSeedRand(seed + 300) * 0.07,
      draft: 0.78 + wbSeedRand(seed + 301) * 0.10,
      grammar: 0.95 + wbSeedRand(seed + 302) * 0.03,
      ai: 0.70 + wbSeedRand(seed + 303) * 0.10,
    },
  };
  return wbApplyHealth(entry);
}

// 基线月（2026-05）：覆盖原 HTML 中那套数字，保持视觉一致
function applyBaselineMay2026(m) {
  if (m.ym !== '2026-05') return m;
  m.total = 86;
  m.completed = 63;
  m.overdue = 3;
  m.willOverdue = 9;
  m.bu = { '物理治疗': 26, '慢病耗材': 18, '家居关怀': 17, '北美市场': 14, '健康家访': 11 };
  m.buRisk = {
    '物理治疗': { warn: 4, danger: 2 },
    '慢病耗材': { warn: 3, danger: 2 },
    '家居关怀': { warn: 4, danger: 1 },
    '北美市场': { warn: 3, danger: 1 },
    '健康家访': { warn: 2, danger: 0 },
  };
  m.type = { '新品 Listing': 24, 'Listing 图片文案': 13, '说明书': 7, '视频脚本文案': 6, 'FAQ': 5 };
  m.typeRisk = {
    '新品 Listing': { warn: 4, danger: 2 },
    'Listing 图片文案': { warn: 3, danger: 2 },
    '说明书': { warn: 1, danger: 1 },
    '视频脚本文案': { warn: 2, danger: 0 },
    'FAQ': { warn: 1, danger: 0 },
  };
  m.team = [
    { name: 'Mason', grammar: 0.98, draft: 0.88, ai: 0.80, load: 18, status: '高负载' },
    { name: 'Yumi',  grammar: 0.97, draft: 0.84, ai: 0.76, load: 15, status: '正常' },
    { name: 'Brian', grammar: 0.94, draft: 0.76, ai: 0.68, load: 12, status: '需关注' },
    { name: 'Suki',  grammar: 0.96, draft: 0.82, ai: 0.74, load: 10, status: '可承接' },
  ];
  m.salesTeam = [
    { name: 'Jessi', bu: '物理治疗', buLead: 'Suki', submitCount: 28, passedCount: 24, rejectedCount: 2, passRate: 24 / 28, hint: WB_SALES_HINT.Jessi },
    { name: 'Liz',   bu: '北美市场', buLead: 'Suki', submitCount: 22, passedCount: 20, rejectedCount: 1, passRate: 20 / 22, hint: WB_SALES_HINT.Liz },
    { name: 'Tina',  bu: '北美市场', buLead: 'Suki', submitCount: 14, passedCount: 12, rejectedCount: 1, passRate: 12 / 14, hint: WB_SALES_HINT.Tina },
    { name: 'Sam',   bu: '家居关怀', buLead: 'Suki', submitCount: 12, passedCount: 11, rejectedCount: 0, passRate: 11 / 12, hint: WB_SALES_HINT.Sam },
    { name: 'Kevin', bu: '慢病耗材', buLead: 'Suki', submitCount: 10, passedCount: 7,  rejectedCount: 2, passRate: 7 / 10,  hint: WB_SALES_HINT.Kevin },
  ];
  m.quality = [
    { label: '信息错误', pct: 38 },
    { label: '因果链不完整', pct: 24 },
    { label: '卖点表达不清', pct: 18 },
    { label: 'GEO/本地化不匹配', pct: 12 },
    { label: 'SEO 覆盖不足', pct: 8 },
  ];
  m.kpi = { delivery: 0.92, draft: 0.84, grammar: 0.968, ai: 0.76 };
  return wbApplyHealth(m);
}

const WB_MONTHLY = (function () {
  const arr = [];
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      arr.push(applyBaselineMay2026(buildMonthly(y, m)));
    }
  }
  return arr;
})();

function wbFindMonth(year, month) {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  return WB_MONTHLY.find(m => m.ym === ym) || null;
}

function wbMonthsInQuarter(year, quarter) {
  const startM = (quarter - 1) * 3 + 1;
  const arr = [];
  for (let m = startM; m < startM + 3; m++) {
    const month = wbFindMonth(year, m);
    if (month) arr.push(month);
  }
  return arr;
}

function wbMonthsInYear(year) {
  return WB_MONTHLY.filter(m => m.year === year);
}

// 聚合一组月数据
function wbAggregateMonths(months) {
  if (!months.length) return null;
  const last = months[months.length - 1];
  const sum = (key) => months.reduce((acc, m) => acc + (m[key] || 0), 0);
  const sumMap = (key) => {
    const out = {};
    months.forEach(m => {
      Object.entries(m[key] || {}).forEach(([k, v]) => {
        out[k] = (out[k] || 0) + v;
      });
    });
    return out;
  };
  const sumRisk = (key) => {
    const out = {};
    months.forEach(m => {
      Object.entries(m[key] || {}).forEach(([k, v]) => {
        if (!out[k]) out[k] = { warn: 0, danger: 0 };
        out[k].warn += v.warn || 0;
        out[k].danger += v.danger || 0;
      });
    });
    return out;
  };
  const avgTeam = () => {
    const map = {};
    months.forEach(m => {
      m.team.forEach(t => {
        if (!map[t.name]) map[t.name] = { name: t.name, grammar: 0, draft: 0, ai: 0, loadAcc: 0, status: t.status, n: 0 };
        const s = map[t.name];
        s.grammar += t.grammar;
        s.draft += t.draft;
        s.ai += t.ai;
        s.loadAcc += t.load;
        s.n++;
      });
    });
    const lastTeam = last.team;
    return WB_TEAM_LIST.map(name => {
      const s = map[name];
      const lastT = lastTeam.find(t => t.name === name) || {};
      return {
        name,
        grammar: s ? s.grammar / s.n : (lastT.grammar || 0),
        draft: s ? s.draft / s.n : (lastT.draft || 0),
        ai: s ? s.ai / s.n : (lastT.ai || 0),
        load: lastT.load || 0,
        status: lastT.status || '正常',
      };
    });
  };
  const avgSalesTeam = () => {
    const map = {};
    months.forEach(m => {
      (m.salesTeam || []).forEach(s => {
        if (!map[s.name]) map[s.name] = { submitAcc: 0, passedAcc: 0, rejectedAcc: 0 };
        const a = map[s.name];
        a.submitAcc += s.submitCount;
        a.passedAcc += s.passedCount;
        a.rejectedAcc += s.rejectedCount;
      });
    });
    const lastSales = last.salesTeam || [];
    return WB_SALES_LIST.map(name => {
      const a = map[name];
      const lastS = lastSales.find(s => s.name === name) || {};
      const meta = WB_SALES_META[name];
      const submitCount = a ? a.submitAcc : (lastS.submitCount || 0);
      const passedCount = a ? a.passedAcc : (lastS.passedCount || 0);
      const rejectedCount = a ? a.rejectedAcc : (lastS.rejectedCount || 0);
      return {
        name,
        bu: lastS.bu || meta.bu,
        buLead: lastS.buLead || meta.buLead,
        submitCount,
        passedCount,
        rejectedCount,
        passRate: submitCount ? passedCount / submitCount : 0,
        hint: WB_SALES_HINT[name],
      };
    });
  };
  const total = sum('total');
  const completed = sum('completed');
  const overdue = sum('overdue');
  const willOverdue = sum('willOverdue');
  const bu = sumMap('bu');
  const buRisk = sumRisk('buRisk');
  const type = sumMap('type');
  const typeRisk = sumRisk('typeRisk');
  const kpi = {
    delivery: months.reduce((a, m) => a + m.kpi.delivery, 0) / months.length,
    draft:    months.reduce((a, m) => a + m.kpi.draft, 0) / months.length,
    grammar:  months.reduce((a, m) => a + m.kpi.grammar, 0) / months.length,
    ai:       months.reduce((a, m) => a + m.kpi.ai, 0) / months.length,
  };
  return wbApplyHealth({
    ym: months.length === 1 ? last.ym : `${last.ym} 聚合`,
    total, completed, overdue, willOverdue,
    bu,
    buRisk,
    type,
    typeRisk,
    team: avgTeam(),
    salesTeam: avgSalesTeam(),
    quality: last.quality,
    focus: last.focus,
    kpi,
  });
}

// 主聚合函数：根据当前选择返回看板数据
function getWorkbenchData(state) {
  const { granularity, year, month, quarter } = state;
  if (granularity === 'month') {
    const m = wbFindMonth(year, month);
    return m ? Object.assign({}, m) : null;
  }
  if (granularity === 'quarter') {
    return wbAggregateMonths(wbMonthsInQuarter(year, quarter));
  }
  if (granularity === 'year') {
    return wbAggregateMonths(wbMonthsInYear(year));
  }
  return null;
}

/**
 * 趋势序列
 * - granularity=month：返回锚点年份的 1-12 月（如选 2026-5，返回 2026 全 12 月）
 * - granularity=quarter：返回近 8 个季度（含锚点季度，向前数 7 个）
 * - granularity=year：返回 2024/2025/2026 三年（数据不足从 2025 起）
 *
 * metric: 'total' | 'completed' | 'overdue'
 * splitBy: 'none' | 'bu' | 'type'
 */
function getTrendSeries(state, opts) {
  const { granularity, year, quarter } = state;
  const metric = opts.metric || 'total';
  const splitBy = opts.splitBy || 'none';

  // 生成时间桶
  const buckets = [];
  if (granularity === 'month') {
    for (let m = 1; m <= 12; m++) {
      const monthData = wbFindMonth(year, m);
      buckets.push({ label: `${m}月`, agg: monthData ? Object.assign({}, monthData) : null });
    }
  } else if (granularity === 'quarter') {
    // 近 8 个季度
    const list = [];
    let y = year, q = quarter;
    for (let i = 0; i < 8; i++) {
      list.unshift({ y, q });
      q--;
      if (q < 1) { q = 4; y--; }
    }
    list.forEach(({ y, q }) => {
      const months = wbMonthsInQuarter(y, q);
      const agg = months.length ? wbAggregateMonths(months) : null;
      buckets.push({ label: `${y} Q${q}`, agg });
    });
  } else if (granularity === 'year') {
    [2025, 2026].forEach(y => {
      const months = wbMonthsInYear(y);
      const agg = months.length ? wbAggregateMonths(months) : null;
      buckets.push({ label: `${y}年`, agg });
    });
  }

  const xLabels = buckets.map(b => b.label);

  if (splitBy === 'none') {
    const values = buckets.map(b => (b.agg ? (b.agg[metric] || 0) : 0));
    return {
      xLabels,
      series: [{ name: getMetricLabel(metric), values }],
    };
  }

  // 按 BU 或类型拆分
  const isOverdue = metric === 'overdue';
  const keys = splitBy === 'bu' ? WB_BU_LIST : WB_TYPE_LIST;
  const series = keys.map(k => ({
    name: k,
    values: buckets.map(b => {
      if (!b.agg) return 0;
      if (metric === 'total') {
        return (splitBy === 'bu' ? b.agg.bu[k] : b.agg.type[k]) || 0;
      }
      if (metric === 'completed') {
        // 用 total * 完成率近似（按整体 completed/total 比例分配）
        const map = splitBy === 'bu' ? b.agg.bu : b.agg.type;
        const v = map[k] || 0;
        const ratio = b.agg.total ? (b.agg.completed / b.agg.total) : 0;
        return Math.round(v * ratio);
      }
      if (isOverdue) {
        const risk = splitBy === 'bu' ? b.agg.buRisk[k] : b.agg.typeRisk[k];
        return risk ? (risk.danger || 0) : 0;
      }
      return 0;
    }),
  }));

  return { xLabels, series };
}

function getMetricLabel(metric) {
  return ({ total: '需求总量', completed: '完成量', overdue: '逾期数' })[metric] || metric;
}

// 质量问题下钻：带分类的驳回明细（生产对齐 review_record.reject_category）
const WB_QUALITY_REJECTS = [
  { category: '信息错误', type: '新品Listing', sku: 'PO17X4011', name: '银色 TENS 套装', bu: '北美市场', writer: 'Yumi', reviewer: 'Suki', review_time: '2026/05/08 10:08:55', reason: 'SKU 与站点子品类不一致，需核对 US 药盒类目。', review_key: '7|PO17X4011|新品Listing|2026/02/09 13:42:08' },
  { category: '信息错误', type: '老品TD', sku: 'PO19B5621', name: '理疗仪豪华版', bu: '北美市场', writer: 'Lucy', reviewer: 'Tammy', review_time: '2026/05/07 09:48:21', reason: '产品参数描述不准确，需核实 TENS 频率范围与 FDA 认证编号。', review_key: '8|PO19B5621|老品TD|2026/02/11 15:33:04' },
  { category: '信息错误', type: '新品 Listing', sku: 'PO17X4011', name: '7格弹跳药盒', bu: '物理治疗', writer: 'Yumi', reviewer: 'Suki', review_time: '2026/05/06 14:20:00', reason: '开卖时间与 SKU 基础信息不匹配。', review_key: '' },
  { category: '信息错误', type: 'Listing 图片文案', sku: 'PO17X4011', name: '黑色外壳药盒', bu: '家居关怀', writer: 'Brian', reviewer: 'Susie', review_time: '2026/05/05 11:15:00', reason: '图3 文案与主图容量表达冲突。', review_key: '' },
  { category: '信息错误', type: '说明书', sku: 'PO19A2210', name: '7格旅行药盒', bu: '物理治疗', writer: 'Lucy', reviewer: 'Suki', review_time: '2026/05/04 16:30:00', reason: '出货清单字段与产品资料不一致。', review_key: '' },
  { category: '信息错误', type: 'FAQ', sku: 'PO17X4011', name: '针形贴片 20pack', bu: '物理治疗', writer: 'Yumi', reviewer: 'Mason', review_time: '2026/05/03 09:00:00', reason: 'FAQ 答案引用了错误 ASIN。', review_key: '' },
  { category: '信息错误', type: '新品 Listing', sku: 'PO17X4011', name: '背光小夜灯', bu: '北美市场', writer: 'Brian', reviewer: 'Suki', review_time: '2026/05/02 13:45:00', reason: '品牌名拼写与主数据不一致。', review_key: '' },
  { category: '信息错误', type: '视频脚本文案', sku: 'PO19B5621', name: '理疗仪豪华版', bu: '慢病耗材', writer: 'Lucy', reviewer: 'Tammy', review_time: '2026/05/01 10:20:00', reason: '脚本中规格参数与 K 号信息不符。', review_key: '' },
  { category: '因果链不完整', type: '新品 Listing', sku: 'PO17X4011', name: '7格大容量粉色', bu: '物理治疗', writer: 'Yumi', reviewer: 'Susie', review_time: '2026/05/09 15:22:10', reason: 'Bullet 1 未建立「容量→防洒→便携」因果链。', review_key: '7|PO17X4011|新品Listing|2026/02/09 13:42:08' },
  { category: '因果链不完整', type: 'Listing 图片文案', sku: 'PO17X4011', name: '7格便携药盒', bu: '物理治疗', writer: 'Mason', reviewer: 'Suki', review_time: '2026/05/08 11:00:00', reason: '图2 只描述功能，缺少用户痛点到解决方案的推导。', review_key: '' },
  { category: '因果链不完整', type: '新品 Listing', sku: 'PO17X4011', name: '透明外壳药盒', bu: '物理治疗', writer: 'Yumi', reviewer: 'Mason', review_time: '2026/05/07 16:18:00', reason: 'TD2 与 TD3 逻辑跳跃，缺少场景承接。', review_key: '' },
  { category: '因果链不完整', type: 'FAQ', sku: 'PO17X4011', name: '医疗款 TENS', bu: '北美市场', writer: 'Brian', reviewer: 'Susie', review_time: '2026/05/06 09:30:00', reason: 'FAQ 回答未解释「为什么需要 7 天分区」。', review_key: '' },
  { category: '因果链不完整', type: '说明书', sku: 'PO19A2210', name: '7格旅行药盒（粉色）', bu: '物理治疗', writer: 'Lucy', reviewer: 'Suki', review_time: '2026/05/05 14:00:00', reason: '使用步骤缺少「先规划再分装」的前置说明。', review_key: '' },
  { category: '卖点表达不清', type: '新品 Listing', sku: 'PO17X4011', name: '7格弹跳药盒', bu: '家居关怀', writer: 'Brian', reviewer: 'Susie', review_time: '2026/05/10 09:41:33', reason: 'TD 描述缺少场景化表达，卖点过于抽象。', review_key: '' },
  { category: '卖点表达不清', type: 'Listing 图片文案', sku: 'PO17X4011', name: '图3 卡扣结构', bu: '家居关怀', writer: 'Mason', reviewer: 'Suki', review_time: '2026/05/09 10:00:00', reason: '主卖点「防洒便携」未在图位文案中显性表达。', review_key: '' },
  { category: '卖点表达不清', type: '视频脚本文案', sku: 'PO17X4011', name: '7格药盒开箱', bu: '北美市场', writer: 'Lucy', reviewer: 'Tammy', review_time: '2026/05/08 17:30:00', reason: 'USP 与 KSP 混排，用户 3 秒内无法 get 核心差异。', review_key: '' },
  { category: '卖点表达不清', type: '新品 Listing', sku: 'PO19A2210', name: '7格旅行药盒', bu: '物理治疗', writer: 'Yumi', reviewer: 'Mason', review_time: '2026/05/07 11:20:00', reason: 'Bullet 偏功能罗列，未优先回答购买决策问题。', review_key: '' },
  { category: 'GEO/本地化不匹配', type: '新品 Listing', sku: 'PO17X4011', name: '银色 TENS 套装', bu: '北美市场', writer: 'Yumi', reviewer: 'Suki', review_time: '2026/05/11 10:08:55', reason: 'Title 未使用 US 用户习惯的 pill organizer 表达。', review_key: '7|PO17X4011|新品Listing|2026/02/09 13:42:08' },
  { category: 'GEO/本地化不匹配', type: '老品TD', sku: 'PO19B5621', name: '理疗仪豪华版', bu: '北美市场', writer: 'Lucy', reviewer: 'Suki', review_time: '2026/05/10 11:15:08', reason: 'UK 站点文案混用美式/英式单位。', review_key: '8|PO19B5621|老品TD|2026/02/11 15:33:04' },
  { category: 'GEO/本地化不匹配', type: 'FAQ', sku: 'PO17X4011', name: '背光小夜灯', bu: '家居关怀', writer: 'Brian', reviewer: 'Susie', review_time: '2026/05/09 08:45:00', reason: 'DE 站点 FAQ 仍保留 US 合规表述。', review_key: '' },
  { category: 'SEO 覆盖不足', type: '新品 Listing', sku: 'PO17X4011', name: '7格大容量粉色', bu: '物理治疗', writer: 'Yumi', reviewer: 'Suki', review_time: '2026/05/12 10:00:00', reason: 'Title 前 80 字符未覆盖 weekly pill organizer。', review_key: '7|PO17X4011|新品Listing|2026/02/09 13:42:08' },
  { category: 'SEO 覆盖不足', type: '新品 Listing', sku: 'PO17X4011', name: '黑色外壳药盒', bu: '家居关怀', writer: 'Brian', reviewer: 'Mason', review_time: '2026/05/11 14:32:00', reason: '核心词 travel pill case 仅在 Bullet 5 出现。', review_key: '' },
];

function wbRejectInScope(reviewTime, state) {
  if (!reviewTime || !state) return true;
  const m = String(reviewTime).match(/(\d{4})\/(\d{1,2})/);
  if (!m) return true;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  if (state.granularity === 'month') return y === state.year && mo === state.month;
  if (state.granularity === 'quarter') {
    const q = Math.ceil(mo / 3);
    return y === state.year && q === state.quarter;
  }
  if (state.granularity === 'year') return y === state.year;
  return true;
}

function wbQualityTopN(records, field, total) {
  const map = {};
  records.forEach(r => {
    const k = r[field] || '—';
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      count,
      pct: total ? Math.round(count * 100 / total) : 0,
    }));
}

function getQualityRejectDetails(state, category) {
  const scoped = WB_QUALITY_REJECTS.filter(r => wbRejectInScope(r.review_time, state));
  const records = scoped.filter(r => r.category === category);
  const allCount = scoped.length;
  const count = records.length;
  const demandKeys = new Set(records.map(r => r.review_key || `${r.sku}|${r.type}|${r.name}`));
  const highlights = [];
  records.forEach(r => {
    if (highlights.length < 3 && !highlights.includes(r.reason)) highlights.push(r.reason);
  });
  return {
    category,
    summary: {
      count,
      pct: allCount ? Math.round(count * 100 / allCount) : 0,
      demandCount: demandKeys.size,
    },
    byBu: wbQualityTopN(records, 'bu', count),
    byType: wbQualityTopN(records, 'type', count),
    byWriter: wbQualityTopN(records, 'writer', count),
    highlights,
    records,
  };
}

// 暴露到全局
window.WB_BU_LIST = WB_BU_LIST;
window.WB_BU_HINT = WB_BU_HINT;
window.WB_TYPE_LIST = WB_TYPE_LIST;
window.WB_TYPE_HINT = WB_TYPE_HINT;
window.WB_TYPE_BU_MATCH = WB_TYPE_BU_MATCH;
window.WB_TEAM_LIST = WB_TEAM_LIST;
window.WB_TEAM_HINT = WB_TEAM_HINT;
window.WB_SALES_LIST = WB_SALES_LIST;
window.WB_SALES_META = WB_SALES_META;
window.WB_SALES_HINT = WB_SALES_HINT;
window.WB_QUALITY_LIST = WB_QUALITY_LIST;
window.WB_QUALITY_REJECTS = WB_QUALITY_REJECTS;
window.WB_MONTHLY = WB_MONTHLY;
window.getWorkbenchData = getWorkbenchData;
window.getTrendSeries = getTrendSeries;
window.getMetricLabel = getMetricLabel;
window.getQualityRejectDetails = getQualityRejectDetails;

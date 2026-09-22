/* ============================================
   文案管理列表（独立筛选与渲染，所有函数前缀 cf*）
   applyCopyFilters / renderCopyListTable / renderCopyRowActions / Cf 前缀的 SKU 下拉
   抽取自 创建需求-上传页面.html line 2886-3157
   ============================================ */

// ===== 文案管理 列表（独立筛选与渲染）=====
let cfFilterSkuValue = '';
let cfFilterSkuQuery = '';
const COPY_ANALYSIS_STATE_KEY = '__cursor_copy_analysis_state';

function getCopyRowDraftKey(row) {
  return [row.sku, row.type, row.submit_time].join('|');
}

function readCopyAnalysisStates() {
  try {
    const raw = sessionStorage.getItem(COPY_ANALYSIS_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeCopyAnalysisStates(data) {
  try { sessionStorage.setItem(COPY_ANALYSIS_STATE_KEY, JSON.stringify(data || {})); } catch (e) {}
}

function getCopyRowAnalysisStatus(row) {
  if (!row) return 'ready';
  const key = getCopyRowDraftKey(row);
  const stored = readCopyAnalysisStates()[key];
  if (stored && stored.status) return stored.status;
  return row.analysis_status || 'ready';
}

function isCopyAnalysisBlockingGenerate(row) {
  const status = getCopyRowAnalysisStatus(row);
  return status === 'timeout' || status === 'running';
}

function findCopyListRowByDraftKey(encodedKey) {
  const key = decodeURIComponent(encodedKey || '');
  const list = typeof COPY_LIST_DATA !== 'undefined' ? COPY_LIST_DATA : [];
  return list.find(row => getCopyRowDraftKey(row) === key) || null;
}

function setCopyRowAnalysisStatus(row, status) {
  const states = readCopyAnalysisStates();
  states[getCopyRowDraftKey(row)] = { status, time: new Date().toLocaleString('zh-CN') };
  writeCopyAnalysisStates(states);
  if (row) row.analysis_status = status;
}

function retryCopyAnalysis(encodedKey) {
  const row = findCopyListRowByDraftKey(encodedKey);
  if (!row) {
    showToast('未找到对应文案需求', 'warning');
    return;
  }
  if (getCopyRowAnalysisStatus(row) === 'running') return;
  setCopyRowAnalysisStatus(row, 'running');
  if (typeof applyCopyFilters === 'function') applyCopyFilters();
  showToast('正在重试分析数据…', 'success');
  setTimeout(() => {
    setCopyRowAnalysisStatus(row, 'ready');
    if (typeof applyCopyFilters === 'function') applyCopyFilters();
    showToast('分析完成，可以开始文案生成', 'success');
  }, 2500);
}

function onCfPersonTypeChange() {
  const type = document.getElementById('cf-person-type').value;
  renderCfPersonValueOptions(type);
  applyCopyFilters();
}

function renderCfPersonValueOptions(type) {
  const sel = document.getElementById('cf-person-value');
  if (!sel) return;
  const opt = PERSON_OPTIONS[type] || PERSON_OPTIONS.writer;
  sel.innerHTML = `<option value="">全部</option>` +
    opt.items.map(it => `<option value="${it}">${it}</option>`).join('');
}

// SKU 下拉
function toggleCfFilterSkuDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('cf-sku-dropdown');
  if (dd.classList.contains('show')) closeCfFilterSkuDropdown();
  else openCfFilterSkuDropdown();
}
function openCfFilterSkuDropdown() {
  document.getElementById('cf-sku-dropdown').classList.add('show');
  document.getElementById('cf-sku-total').textContent = FILTER_SKU_POOL.length;
  renderCfFilterSkuList();
  setTimeout(() => {
    const search = document.getElementById('cf-sku-search');
    if (search) search.focus();
  }, 50);
}
function closeCfFilterSkuDropdown() {
  const dd = document.getElementById('cf-sku-dropdown');
  if (dd) dd.classList.remove('show');
}
function filterCfSkuDropdownOptions() {
  cfFilterSkuQuery = document.getElementById('cf-sku-search').value.trim().toLowerCase();
  renderCfFilterSkuList();
}
function renderCfFilterSkuList() {
  const list = document.getElementById('cf-sku-list');
  if (!list) return;
  const q = cfFilterSkuQuery;
  const filtered = q
    ? FILTER_SKU_POOL.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : FILTER_SKU_POOL;
  if (!filtered.length) {
    list.innerHTML = `<div class="f-sku-empty">没有匹配的 SKU</div>`;
    return;
  }
  list.innerHTML = filtered.map(s => `
    <div class="f-sku-item ${cfFilterSkuValue === s.code ? 'selected' : ''}" onclick="selectCfFilterSku('${s.code}')">
      <div class="f-sku-radio"></div>
      <div class="f-sku-info">
        <div class="f-sku-code">${s.code}</div>
        <div class="f-sku-name">${s.name}</div>
      </div>
    </div>
  `).join('');
}
function selectCfFilterSku(code) {
  cfFilterSkuValue = code;
  updateCfFilterSkuTrigger();
  closeCfFilterSkuDropdown();
  applyCopyFilters();
}
function clearCfFilterSku(e) {
  if (e) e.stopPropagation();
  cfFilterSkuValue = '';
  cfFilterSkuQuery = '';
  const search = document.getElementById('cf-sku-search');
  if (search) search.value = '';
  updateCfFilterSkuTrigger();
  renderCfFilterSkuList();
  applyCopyFilters();
}
function updateCfFilterSkuTrigger() {
  const text = document.getElementById('cf-sku-text');
  if (!text) return;
  if (cfFilterSkuValue) {
    const sku = FILTER_SKU_POOL.find(s => s.code === cfFilterSkuValue);
    text.className = 'f-sku-selected';
    text.innerHTML = `<span style="font-family:'SF Mono',Monaco,monospace;">${cfFilterSkuValue}</span>`
      + (sku ? `<span style="color:var(--text-muted);font-size:11px;">${sku.name}</span>` : '');
  } else {
    text.className = 'f-sku-placeholder';
    text.textContent = 'SKU';
  }
}

function applyCopyFilters() {
  const personType  = document.getElementById('cf-person-type') ? document.getElementById('cf-person-type').value : 'writer';
  const personValue = document.getElementById('cf-person-value') ? document.getElementById('cf-person-value').value : '';
  copyCurrentFilters = {
    type:   document.getElementById('cf-req-type').value,
    site:   document.getElementById('cf-site').value,
    brand:  document.getElementById('cf-brand').value,
    sub:    document.getElementById('cf-subcategory').value,
    sku:    cfFilterSkuValue,
    person: personValue,
    personType: personType,
    status: document.getElementById('cf-status').value,
  };
  copyCurrentListData = COPY_LIST_DATA.filter(row => {
    const f = copyCurrentFilters;
    if (f.type   && row.type   !== f.type)   return false;
    if (f.site   && row.site   !== f.site)   return false;
    if (f.brand  && row.brand  !== f.brand)  return false;
    if (f.sub    && row.sub    !== f.sub)    return false;
    if (f.sku    && row.sku    !== f.sku)    return false;
    if (f.person) {
      if (personType === 'writer'  && row.writer !== f.person) return false;
      if (personType === 'op'      && row.op     !== f.person) return false;
      if (personType === 'bu'      && (row.bu      || '') !== f.person) return false;
      if (personType === 'bu_lead' && (row.bu_lead || '') !== f.person) return false;
    }
    if (f.status && row.status !== f.status) return false;
    return true;
  });
  // 按状态固定顺序排序：待处理 → 待审核 → 已驳回 → 已通过
  const CF_STATUS_ORDER = { '待处理': 1, '待审核': 2, '已驳回': 3, '已通过': 4 };
  copyCurrentListData.sort((a, b) => {
    const oa = CF_STATUS_ORDER[a.status] || 99;
    const ob = CF_STATUS_ORDER[b.status] || 99;
    return oa - ob;
  });
  renderCopyListTable();
  renderCopyAppliedFilters();
}

function resetCopyFilters() {
  ['cf-req-type','cf-site','cf-brand','cf-subcategory','cf-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  cfFilterSkuValue = '';
  cfFilterSkuQuery = '';
  const sk = document.getElementById('cf-sku-search');
  if (sk) sk.value = '';
  updateCfFilterSkuTrigger();
  const pt = document.getElementById('cf-person-type');
  if (pt) pt.value = 'writer';
  renderCfPersonValueOptions('writer');
  const pv = document.getElementById('cf-person-value');
  if (pv) pv.value = '';
  applyCopyFilters();
}

function renderCopyAppliedFilters() {
  const wrap = document.getElementById('cf-applied');
  if (!wrap) return;
  const labels = {
    type: '需求类型', site: '站点', brand: '品牌', sub: '子品类',
    sku: 'SKU', status: '状态'
  };
  const chips = [];
  Object.keys(labels).forEach(k => {
    if (copyCurrentFilters[k]) {
      chips.push(`<span class="filter-chip">
        <span class="chip-label">${labels[k]}：</span>
        <span class="chip-val">${copyCurrentFilters[k]}</span>
        <span class="chip-close" onclick="clearCopyFilter('${k}')">×</span>
      </span>`);
    }
  });
  if (copyCurrentFilters.person) {
    const typeLabel = (PERSON_OPTIONS[copyCurrentFilters.personType] || {}).label || '人员';
    chips.push(`<span class="filter-chip">
      <span class="chip-label">${typeLabel}：</span>
      <span class="chip-val">${copyCurrentFilters.person}</span>
      <span class="chip-close" onclick="clearCopyFilter('person')">×</span>
    </span>`);
  }
  if (chips.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  chips.push(`<a class="chip-clear-all" onclick="resetCopyFilters()">清除全部</a>`);
  wrap.innerHTML = chips.join('');
}

function clearCopyFilter(key) {
  if (key === 'sku') {
    clearCfFilterSku();
    return;
  }
  if (key === 'person') {
    const pv = document.getElementById('cf-person-value');
    if (pv) pv.value = '';
    applyCopyFilters();
    return;
  }
  const idMap = {
    type: 'cf-req-type', site: 'cf-site', brand: 'cf-brand', sub: 'cf-subcategory', status: 'cf-status'
  };
  const el = document.getElementById(idMap[key]);
  if (el) el.value = '';
  applyCopyFilters();
}


function renderCopyRowActions(r) {
  const sku = r.sku;
  const draftKey = encodeURIComponent([r.sku, r.type, r.submit_time].join('|'));
  const copyRowIdx = (typeof COPY_LIST_DATA !== 'undefined') ? COPY_LIST_DATA.indexOf(r) : -1;
  const div = `<span class="row-action-divider"></span>`;
  // 颜色规则：
  //   详情      → 默认（紫，主色）
  //   文案生成  → warn（橙，强调"开始动作"）
  //   查看文案  → success（绿，强调"已完成可查看"）
  //   驳回记录  → danger（红）
  const detail   = `<button class="row-action-btn" onclick="event.stopPropagation();showToast('查看详情：${sku}','success')">详情</button>`;
  const reject   = `<button class="row-action-btn danger" onclick="event.stopPropagation();openCopyAuditRecordBySku('${sku}','${r.status}')">驳回记录</button>`;
  const generate = `<button class="row-action-btn warn" onclick="event.stopPropagation();openCopyDraftPicker('${draftKey}')">文案生成</button>`;
  const generateDisabled = `<button type="button" class="row-action-btn warn disabled" disabled title="分析数据超时，请先点击「重试」">文案生成</button>`;
  const retryAnalysis = `<button class="row-action-btn" onclick="event.stopPropagation();retryCopyAnalysis('${draftKey}')">重试</button>`;
  const retryRunning = `<button type="button" class="row-action-btn disabled" disabled>分析中…</button>`;
  const manual   = `<button class="row-action-btn" onclick="event.stopPropagation();openManualCopySubmit('${draftKey}')">手动提交</button>`;
  const view     = `<button class="row-action-btn success" onclick="event.stopPropagation();openViewCopyModalFromCopyList(${copyRowIdx})">查看文案</button>`;
  let extra = '';
  switch (r.status) {
    case '待处理': {
      if (isCopyAnalysisBlockingGenerate(r)) {
        const running = getCopyRowAnalysisStatus(r) === 'running';
        extra = `${generateDisabled}${div}${running ? retryRunning : retryAnalysis}${div}${manual}`;
      } else {
        extra = `${generate}${div}${manual}`;
      }
      break;
    }
    case '待审核': extra = `${detail}${div}${reject}`;   break;
    case '已驳回': extra = reject;   break;
    case '已通过': extra = `${view}${div}${reject}`;     break;
    default:       extra = detail;
  }
  return `<div class="row-actions">${extra}</div>`;
}

function openViewCopyModalFromCopyList(idx) {
  const row = (typeof COPY_LIST_DATA !== 'undefined' && idx >= 0) ? COPY_LIST_DATA[idx] : null;
  if (row && typeof openViewCopyModal === 'function') {
    openViewCopyModal(row);
  } else {
    showToast('暂无已生成的文案', 'warning');
  }
}

function renderCopyListTable() {
  const tbody = document.getElementById('cf-tbody');
  if (!tbody) return;
  if (copyCurrentListData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;padding:60px 16px;color:var(--text-light);">
      <div style="font-size:28px;margin-bottom:8px;">📭</div>
      <div>没有匹配的数据</div>
    </td></tr>`;
    document.getElementById('cf-pg-total').textContent = 0;
    return;
  }
  tbody.innerHTML = copyCurrentListData.map(r => {
    const typeCls = REQ_TYPE_STYLES[r.type] || 'req-type-listing';
    const brandCls = r.brand === 'ZIKEE' ? 'brand-zikee' : (r.brand === 'AMOOS' ? 'brand-amoos' : '');
    const statusCls = CF_STATUS_CLS[r.status] || 'status-doing';
    return `<tr onclick="onCopyRowClick('${r.sku}')">
      <td><span class="req-type-pill ${typeCls}">${r.type}</span></td>
      <td>${r.site}</td>
      <td><span class="brand-tag ${brandCls}">${r.brand}</span></td>
      <td>${r.sub}</td>
      <td title="${r.name}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">${r.name}</td>
      <td><span class="sku-cell">${r.sku}</span></td>
      <td>${renderPriorityTag(r)}</td>
      <td><span class="person-cell">${r.op}</span></td>
      <td><span class="person-cell">${r.writer}</span></td>
      <td><span class="submit-time-cell">${(r.submit_time || '—').split(' ')[0]}</span></td>
      <td>${renderLaunchDate(r)}</td>
      <td>${r.date}</td>
      <td><span class="submit-time-cell">${r.review_time || '—'}</span></td>
      <td><span class="status-pill ${statusCls}">${r.status || '—'}</span></td>
      <td onclick="event.stopPropagation()">${renderCopyRowActions(r)}</td>
    </tr>`;
  }).join('');
  document.getElementById('cf-pg-total').textContent = copyCurrentListData.length || COPY_LIST_DATA.length;
}

function onCopyRowClick(sku) {
  showToast(`查看详情：${sku}`, 'success');
}

const MANUAL_PACKAGE_FACES = ['正面主视觉', '正面 Slogan', '背面卖点', '背面使用简述', '左侧参数 / 认证', '右侧警示 / 制造商', '顶面', '底面'];
const MANUAL_MANUAL_SECTIONS = ['封面与型号', '安全须知', '包装内容', '快速开始', '详细使用步骤', '清洁与维护', '故障排查', '技术参数', '保修与联系方式', '合规声明'];
const MANUAL_IMAGE_LABELS = ['主图', '图2', '图3', '图4', '图5', '图6', '图7'];

let copyManualSubmitState = { row: null, kind: 'listing', tab: 'demand', draft: null };

function copyManualEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function getManualCopyKind(type) {
  const t = String(type || '');
  if (/图片文案|卖点图片/.test(t)) return 'image';
  if (/FAQ/i.test(t)) return 'faq';
  if (/视频/.test(t)) return 'video';
  if (/包装/.test(t)) return 'package';
  if (/说明书/.test(t)) return 'manual';
  if (/Title/.test(t) && !/TD/.test(t) && !/Listing/i.test(t)) return 'title';
  if (/\bTD\b/.test(t) && !/Title/.test(t) && !/Listing/i.test(t)) return 'td';
  return 'listing';
}

function getManualCopyKindMeta(kind) {
  const map = {
    listing: { title: 'Listing 文案', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
    title: { title: 'Title 文案', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
    td: { title: 'TD 文案', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
    image: { title: '图片文案', hint: '与文案生成后的提交审核一致：按图标注、填历史对比文案和修改说明' },
    faq: { title: 'FAQ 文案', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
    video: { title: '卖点视频', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
    package: { title: '包装文案', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
    manual: { title: '说明书', hint: '与文案生成后的提交审核一致：可标注、填历史对比文案和修改说明' },
  };
  return map[kind] || { title: '文案', hint: '可标注新增/调整，并填写历史对比文案与修改说明' };
}

function getManualDemandTemplateKey(type) {
  const t = String(type || '');
  if (/图片文案|卖点图片/.test(t)) return /老品/.test(t) ? 'A_OPT' : 'A';
  if (/FAQ/i.test(t)) return 'D';
  if (/视频/.test(t)) return 'C';
  if (/Listing|Title|TD/i.test(t)) return 'B';
  return 'E';
}

function createManualDraft(kind) {
  const blanks = n => Array.from({ length: n }, () => '');
  if (kind === 'title') return { title: '', titleHistory: '', titleNote: '' };
  if (kind === 'td') return { tds: blanks(5), tdTitles: ['TD-1', 'TD-2', 'TD-3', 'TD-4', 'TD-5'], tdHistories: blanks(5), tdNotes: blanks(5) };
  if (kind === 'listing') return { title: '', tds: blanks(5), tdTitles: ['TD-1', 'TD-2', 'TD-3', 'TD-4', 'TD-5'], titleHistory: '', titleNote: '', tdHistories: blanks(5), tdNotes: blanks(5) };
  if (kind === 'image') return { images: [{ label: '主图', productPoint: '', imageCopy: '', historyCopy: '', note: '' }], richText: '', richTextNote: '' };
  if (kind === 'faq') return { faqs: [{ title: 'FAQ 1', q: '', a: '', history: '', note: '' }] };
  if (kind === 'video') return { scenes: [{ title: '分镜 1', point: '', copy: '', visual: '', history: '', note: '' }] };
  if (kind === 'package') return { faces: MANUAL_PACKAGE_FACES.map(face => ({ face, text: '', history: '', note: '' })) };
  if (kind === 'manual') return { sections: MANUAL_MANUAL_SECTIONS.map(title => ({ title, text: '', history: '', note: '' })) };
  return { body: '', history: '', note: '' };
}

function renderManualCopyContext(row, opts = {}) {
  const addLabel = opts.showAdd ? getManualAddLabel(opts.kind) : '';
  const addBtn = addLabel
    ? `<button type="button" class="btn btn-secondary copy-manual-add" onclick="addManualRepeatItem()">${copyManualEsc(addLabel)}</button>`
    : '';
  return `<div class="aichat-submit-context">
    <span>需求类型：${copyManualEsc(row.type || '')}</span>
    <span>SKU：${copyManualEsc(row.sku || '')}</span>
    <span>产品：${copyManualEsc(row.name || '')}</span>
    <span>站点：${copyManualEsc(row.site || '')}</span>
    ${addBtn}
  </div>`;
}

function renderManualField(id, label, rows, placeholder, value) {
  return `<div class="aichat-submit-field">
    <label for="${id}">${copyManualEsc(label)}</label>
    <textarea id="${id}" rows="${rows || 3}" placeholder="${copyManualEsc(placeholder || '')}">${copyManualEsc(value || '')}</textarea>
  </div>`;
}

function renderManualRepeatHead(title, idx, canRemove, titleInputId) {
  const titleHtml = titleInputId
    ? `<input class="copy-manual-name-input copy-manual-row-title" id="${titleInputId}" value="${copyManualEsc(title)}" placeholder="行标题">`
    : `<strong>${copyManualEsc(title)}</strong>`;
  return `<div class="copy-manual-repeat-head">
    ${titleHtml}
    ${canRemove ? `<button type="button" class="copy-manual-remove" onclick="removeManualRepeatItem(${idx})">删除</button>` : ''}
  </div>`;
}

function getManualAddLabel(kind) {
  const map = {
    listing: '+ 增加',
    td: '+ 增加',
    image: '+ 增加图片',
    faq: '+ 增加 FAQ',
    video: '+ 增加分镜',
    package: '+ 增加包装面',
    manual: '+ 增加章节',
  };
  return map[kind] || '';
}

function renderManualTagTools(field, textareaId) {
  return typeof renderAiSubmitTagTools === 'function' ? renderAiSubmitTagTools(field, textareaId) : '';
}

function renderManualHistoryAndNote(historyId, historyVal, noteId, noteVal) {
  return `
    <label for="${historyId}">历史对比文案</label>
    <textarea id="${historyId}" class="aichat-submit-history-copy-input" rows="2" placeholder="填写上一版或竞品对比文案，便于审核对比本次改动">${copyManualEsc(historyVal || '')}</textarea>
    <label class="aichat-submit-note-label" for="${noteId}">修改说明<span class="required">*</span></label>
    <textarea id="${noteId}" class="aichat-submit-note-input" rows="2" placeholder="填写本次修改说明" required>${copyManualEsc(noteVal || '')}</textarea>`;
}

function renderManualTaggedTextarea(id, field, rows, placeholder, value, withOverlay) {
  const oninput = `typeof renderAiSubmitTagPreview==='function'&&renderAiSubmitTagPreview('${field}', '${id}')`;
  if (withOverlay) {
    const overlayId = `submit-tag-overlay-${typeof aiSubmitTagFieldKey === 'function' ? aiSubmitTagFieldKey(field) : field}`;
    return `<div class="aichat-annotated-textarea-wrap">
      <div class="aichat-annotated-layer" id="${overlayId}" aria-hidden="true"></div>
      <textarea id="${id}" class="aichat-annotated-textarea" rows="${rows}" placeholder="${copyManualEsc(placeholder || '')}" oninput="${oninput}" onscroll="typeof syncAiSubmitTagOverlayScroll==='function'&&syncAiSubmitTagOverlayScroll('${field}', '${id}')">${copyManualEsc(value || '')}</textarea>
    </div>`;
  }
  return `<textarea id="${id}" rows="${rows}" placeholder="${copyManualEsc(placeholder || '')}" oninput="${oninput}">${copyManualEsc(value || '')}</textarea>`;
}

function persistManualSubmitTags() {
  if (typeof aiSubmitModalState !== 'undefined' && Array.isArray(aiSubmitModalState.textTags)) {
    copyManualSubmitState.textTags = aiSubmitModalState.textTags.slice();
  }
}

function bindManualSubmitTags() {
  window.aiSubmitModalState = window.aiSubmitModalState || {};
  aiSubmitModalState.textTags = copyManualSubmitState.textTags || [];
  const body = document.getElementById('copy-manual-body');
  if (!body || typeof renderAiSubmitTagPreview !== 'function') return;
  body.querySelectorAll('.aichat-submit-tag-tools').forEach(tool => {
    const fieldBox = tool.closest('.aichat-submit-field');
    const textarea = fieldBox
      ? fieldBox.querySelector('textarea[id]:not(.aichat-submit-note-input):not(.aichat-submit-history-copy-input)')
      : null;
    const field = tool.getAttribute('data-tag-field');
    if (textarea && textarea.id && field) {
      renderAiSubmitTagPreview(field, textarea.id);
      if (typeof renderAiSubmitTagList === 'function') renderAiSubmitTagList(field);
    }
  });
}

function collectManualTextTags(fieldTextMap) {
  persistManualSubmitTags();
  if (typeof collectAiSubmitTextTags !== 'function') return copyManualSubmitState.textTags || [];
  window.aiSubmitModalState = window.aiSubmitModalState || {};
  aiSubmitModalState.textTags = copyManualSubmitState.textTags || [];
  return collectAiSubmitTextTags(fieldTextMap);
}

function renderManualCopyFields(kind, draft) {
  draft = draft || {};
  if (kind === 'title') {
    return `<div class="aichat-submit-field">
      <label for="manual-title">Title</label>
      ${renderManualTaggedTextarea('manual-title', 'Title', 3, '填写 Title', draft.title, true)}
      ${renderManualTagTools('Title', 'manual-title')}
      ${renderManualHistoryAndNote('manual-title-history', draft.titleHistory, 'manual-title-note', draft.titleNote)}
    </div>`;
  }
  if (kind === 'td' || kind === 'listing') {
    const tds = draft.tds || [''];
    const tdBlock = tds.map((td, i) => {
      const heading = (draft.tdTitles && draft.tdTitles[i]) || `TD-${i + 1}`;
      return `
      <div class="aichat-submit-field">
        ${renderManualRepeatHead(heading, i, tds.length > 1, `manual-td-title-${i}`)}
        ${renderManualTaggedTextarea(`manual-td-${i}`, heading, 4, `填写 ${heading}`, td, false)}
        ${renderManualTagTools(heading, `manual-td-${i}`)}
        ${renderManualHistoryAndNote(`manual-td-history-${i}`, (draft.tdHistories || [])[i], `manual-td-note-${i}`, (draft.tdNotes || [])[i])}
      </div>`;
    }).join('');
    if (kind === 'td') return tdBlock;
    return `<div class="aichat-submit-field">
      <label for="manual-title">Title</label>
      ${renderManualTaggedTextarea('manual-title', 'Title', 3, '填写 Title', draft.title, true)}
      ${renderManualTagTools('Title', 'manual-title')}
      ${renderManualHistoryAndNote('manual-title-history', draft.titleHistory, 'manual-title-note', draft.titleNote)}
    </div>` + tdBlock;
  }
  if (kind === 'image') {
    const images = draft.images || [];
    const row = copyManualSubmitState.row || {};
    return `<div class="aichat-submit-image-list">${images.map((it, idx) => {
      const field = `${it.label || (idx === 0 ? '主图' : `图${idx + 1}`)}-图片文案`;
      const refHtml = typeof renderAiSubmitRefField === 'function'
        ? `<div class="aichat-submit-field"><label>参考图</label>${renderAiSubmitRefField(idx, it.referenceImage || row.productImage || '')}</div>`
        : '';
      return `
      <div class="aichat-submit-image-card">
        <div class="aichat-submit-image-head">
          <input class="copy-manual-name-input copy-manual-row-title" id="manual-image-label-${idx}" value="${copyManualEsc(it.label || `图${idx + 1}`)}" placeholder="图标题">
          ${images.length > 1 ? `<button type="button" class="copy-manual-remove" onclick="removeManualRepeatItem(${idx})">删除</button>` : ''}
        </div>
        ${refHtml}
        ${renderManualField(`manual-image-point-${idx}`, '卖点内容', 2, '这张图要强调的卖点', it.productPoint)}
        <div class="aichat-submit-field">
          <label for="manual-image-copy-${idx}">图片文案</label>
          ${renderManualTaggedTextarea(`manual-image-copy-${idx}`, field, 3, '英文/目标站点图片文案', it.imageCopy, false)}
          ${renderManualTagTools(field, `manual-image-copy-${idx}`)}
          ${renderManualHistoryAndNote(`manual-image-history-${idx}`, it.historyCopy, `manual-image-note-${idx}`, it.note)}
        </div>
      </div>`;
    }).join('')}</div>`
      + `<div class="aichat-submit-field aichat-submit-richtext-field">
          <label for="manual-image-richtext">富文本</label>
          ${renderManualTaggedTextarea('manual-image-richtext', '富文本', 6, 'A+ / 富文本段落', draft.richText, false)}
          ${renderManualTagTools('富文本', 'manual-image-richtext')}
          ${renderManualHistoryAndNote('manual-image-richtext-history', draft.richTextHistory, 'manual-image-richtext-note', draft.richTextNote)}
        </div>`;
  }
  if (kind === 'faq') {
    const faqs = draft.faqs || [{ q: '', a: '' }];
    return faqs.map((it, i) => {
      const heading = it.title || `FAQ ${i + 1}`;
      return `
      <div class="aichat-submit-field">
        ${renderManualRepeatHead(heading, i, faqs.length > 1, `manual-faq-title-${i}`)}
        <textarea id="manual-faq-q-${i}" rows="2" placeholder="问题 Q">${copyManualEsc(it.q)}</textarea>
        <label for="manual-faq-a-${i}" style="margin-top:8px;">回答 A</label>
        ${renderManualTaggedTextarea(`manual-faq-a-${i}`, heading, 3, '回答 A', it.a, false)}
        ${renderManualTagTools(heading, `manual-faq-a-${i}`)}
        ${renderManualHistoryAndNote(`manual-faq-history-${i}`, it.history, `manual-faq-note-${i}`, it.note)}
      </div>`;
    }).join('');
  }
  if (kind === 'video') {
    const scenes = draft.scenes || [{ point: '', copy: '', visual: '' }];
    return scenes.map((it, i) => {
      const heading = it.title || `分镜 ${i + 1}`;
      return `
      <div class="aichat-submit-field">
        ${renderManualRepeatHead(heading, i, scenes.length > 1, `manual-video-title-${i}`)}
        <textarea id="manual-video-point-${i}" rows="2" placeholder="卖点">${copyManualEsc(it.point)}</textarea>
        <label for="manual-video-copy-${i}" style="margin-top:8px;">口播 / 字幕文案</label>
        ${renderManualTaggedTextarea(`manual-video-copy-${i}`, heading, 2, '口播 / 字幕文案', it.copy, false)}
        ${renderManualTagTools(heading, `manual-video-copy-${i}`)}
        <textarea id="manual-video-visual-${i}" rows="2" placeholder="画面说明" style="margin-top:8px;">${copyManualEsc(it.visual)}</textarea>
        ${renderManualHistoryAndNote(`manual-video-history-${i}`, it.history, `manual-video-note-${i}`, it.note)}
      </div>`;
    }).join('');
  }
  if (kind === 'package') {
    const faces = draft.faces || [];
    return faces.map((it, i) => `
      <div class="aichat-submit-field">
        ${renderManualRepeatHead(`包装面 ${i + 1}`, i, faces.length > 1)}
        <input class="copy-manual-name-input" id="manual-package-name-${i}" value="${copyManualEsc(it.face)}" placeholder="面名称">
        ${renderManualTaggedTextarea(`manual-package-${i}`, it.face || `包装面 ${i + 1}`, 3, '填写该面印刷文案', it.text, false)}
        ${renderManualTagTools(it.face || `包装面 ${i + 1}`, `manual-package-${i}`)}
        ${renderManualHistoryAndNote(`manual-package-history-${i}`, it.history, `manual-package-note-${i}`, it.note)}
      </div>
    `).join('');
  }
  if (kind === 'manual') {
    const sections = draft.sections || [];
    return sections.map((it, i) => `
      <div class="aichat-submit-field">
        ${renderManualRepeatHead(`章节 ${i + 1}`, i, sections.length > 1)}
        <input class="copy-manual-name-input" id="manual-section-name-${i}" value="${copyManualEsc(it.title)}" placeholder="章节名称">
        ${renderManualTaggedTextarea(`manual-section-${i}`, it.title || `章节 ${i + 1}`, 3, '填写该章节正文', it.text, false)}
        ${renderManualTagTools(it.title || `章节 ${i + 1}`, `manual-section-${i}`)}
        ${renderManualHistoryAndNote(`manual-section-history-${i}`, it.history, `manual-section-note-${i}`, it.note)}
      </div>
    `).join('');
  }
  return `<div class="aichat-submit-field">
    <label for="manual-body">正文</label>
    ${renderManualTaggedTextarea('manual-body', '正文', 8, '填写文案正文', draft.body, false)}
    ${renderManualTagTools('正文', 'manual-body')}
    ${renderManualHistoryAndNote('manual-body-history', draft.history, 'manual-body-note', draft.note)}
  </div>`;
}

function renderManualTabs(tab) {
  return `<div class="copy-manual-tabs" role="tablist" aria-label="手动提交">
    <button type="button" class="copy-manual-tab ${tab === 'demand' ? 'is-active' : ''}" role="tab" aria-selected="${tab === 'demand'}" onclick="switchManualCopyTab('demand')">需求清单</button>
    <button type="button" class="copy-manual-tab ${tab === 'submit' ? 'is-active' : ''}" role="tab" aria-selected="${tab === 'submit'}" onclick="switchManualCopyTab('submit')">提交审核</button>
  </div>`;
}

function buildManualDemandSheetSections(row) {
  const sections = [{
    name: '基础信息',
    rows: [
      ['需求类型', row.type],
      ['SKU', row.sku],
      ['产品', row.name],
      ['站点', row.site],
      ['品牌', row.brand],
      ['子品类', row.sub],
    ],
  }];
  const tplKey = getManualDemandTemplateKey(row.type);
  const sheets = (typeof INPUT_TEMPLATES !== 'undefined' && INPUT_TEMPLATES[tplKey]) || [];
  sheets.forEach(sh => {
    sections.push({
      name: sh.name,
      rows: (sh.rows || []).map(r => [r.label, r.example || '']),
    });
  });
  return sections;
}

function renderManualDemandSheet(row) {
  const sections = buildManualDemandSheetSections(row);
  return `<div class="copy-manual-sheet">
    ${renderManualDemandLinks(row)}
    ${sections.map(s => `
      <section class="copy-manual-sheet-section">
        <h4>${copyManualEsc(s.name)}</h4>
        <table>
          <thead><tr><th>字段</th><th>内容</th></tr></thead>
          <tbody>
            ${s.rows.map(([k, v]) => {
              const empty = !String(v || '').trim();
              return `<tr class="${empty ? 'is-empty' : ''}">
                <th>${copyManualEsc(k)}</th>
                <td>${empty ? '未填' : copyManualEsc(v)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </section>
    `).join('')}
  </div>`;
}

function getManualDemandAttachment(row) {
  if (row && row.attachment) return row.attachment;
  const list = (typeof LIST_DATA !== 'undefined') ? LIST_DATA : [];
  const hit = list.find(item =>
    item.sku === row.sku && item.type === row.type && item.name === row.name && item.attachment
  );
  return (hit && hit.attachment) || null;
}

function getManualDemandFeishuUrls(attachment) {
  if (!attachment || attachment.kind !== 'feishu') return [];
  const urls = attachment.urls || attachment.links || [];
  return urls.map(item => typeof item === 'string' ? item : (item && item.url)).filter(Boolean);
}

function renderManualDemandLinks(row) {
  const att = getManualDemandAttachment(row);
  const urls = getManualDemandFeishuUrls(att);
  if (urls.length) {
    return `<div class="copy-manual-sheet-summary">
      <div class="copy-manual-link-label">提交需求时填写的飞书链接</div>
      <div class="copy-manual-link-list">
        ${urls.map((url, i) => {
          const info = (typeof getFeishuDocType === 'function' && getFeishuDocType(url)) || { label: '飞书文档', icon: '📄' };
          const name = `${info.icon || '📄'} ${info.label}${urls.length > 1 ? ` ${i + 1}` : ''}`;
          return `<a class="copy-manual-feishu-link" href="${copyManualEsc(url)}" target="_blank" rel="noopener noreferrer">
            <span>${copyManualEsc(name)}</span>
            <span class="copy-manual-feishu-url">${copyManualEsc(url)}</span>
          </a>`;
        }).join('')}
      </div>
    </div>`;
  }
  if (att && att.kind === 'file' && att.fileName) {
    return `<div class="copy-manual-sheet-summary">提交需求时上传的文件：${copyManualEsc(att.fileName)}</div>`;
  }
  return `<div class="copy-manual-sheet-summary">提交需求时未填写飞书链接</div>`;
}

function renderManualCopyPage() {
  const { row, kind, tab, draft } = copyManualSubmitState;
  if (!row) return;
  const meta = getManualCopyKindMeta(kind);
  const title = document.getElementById('copy-manual-title');
  const subtitle = document.getElementById('copy-manual-subtitle');
  const body = document.getElementById('copy-manual-body');
  const foot = document.getElementById('copy-manual-foot');
  if (title) title.textContent = `手动提交 · ${row.type || meta.title}`;
  if (subtitle) subtitle.textContent = meta.hint;
  if (body) {
    body.innerHTML = renderManualTabs(tab)
      + renderManualCopyContext(row, { showAdd: tab === 'submit', kind })
      + (tab === 'submit'
        ? renderManualCopyFields(kind, draft)
        : renderManualDemandSheet(row));
  }
  if (foot) {
    foot.innerHTML = tab === 'submit'
      ? `<button type="button" class="btn btn-secondary" onclick="closeManualCopySubmit()">取消</button>
         <button type="button" class="btn btn-primary" onclick="confirmManualCopySubmit()">确认提交审核</button>`
      : `<button type="button" class="btn btn-secondary" onclick="closeManualCopySubmit()">取消</button>
         <button type="button" class="btn btn-primary" onclick="switchManualCopyTab('submit')">去填写提交审核</button>`;
  }
  if (tab === 'submit') bindManualSubmitTags();
}

function switchManualCopyTab(tab) {
  if (copyManualSubmitState.tab === 'submit') {
    syncManualDraftFromDom();
    persistManualSubmitTags();
  }
  copyManualSubmitState.tab = tab === 'submit' ? 'submit' : 'demand';
  renderManualCopyPage();
}

function syncManualDraftFromDom() {
  const { kind, draft } = copyManualSubmitState;
  if (!draft) return;
  persistManualSubmitTags();
  if (kind === 'title' || kind === 'listing') {
    draft.title = valOf('manual-title');
    draft.titleHistory = valOf('manual-title-history');
    draft.titleNote = valOf('manual-title-note');
  }
  if (kind === 'td' || kind === 'listing') {
    draft.tds = (draft.tds || []).map((_, i) => valOf(`manual-td-${i}`));
    draft.tdTitles = (draft.tds || []).map((_, i) => valOf(`manual-td-title-${i}`) || `TD-${i + 1}`);
    draft.tdHistories = (draft.tds || []).map((_, i) => valOf(`manual-td-history-${i}`));
    draft.tdNotes = (draft.tds || []).map((_, i) => valOf(`manual-td-note-${i}`));
  }
  if (kind === 'image') {
    draft.images = (draft.images || []).map((it, i) => ({
      label: valOf(`manual-image-label-${i}`) || it.label,
      productPoint: valOf(`manual-image-point-${i}`),
      imageCopy: valOf(`manual-image-copy-${i}`),
      historyCopy: valOf(`manual-image-history-${i}`),
      note: valOf(`manual-image-note-${i}`),
      referenceImage: it.referenceImage,
    }));
    draft.richText = valOf('manual-image-richtext');
    draft.richTextHistory = valOf('manual-image-richtext-history');
    draft.richTextNote = valOf('manual-image-richtext-note');
  }
  if (kind === 'faq') {
    draft.faqs = (draft.faqs || []).map((it, i) => ({
      title: valOf(`manual-faq-title-${i}`) || it.title || `FAQ ${i + 1}`,
      q: valOf(`manual-faq-q-${i}`),
      a: valOf(`manual-faq-a-${i}`),
      history: valOf(`manual-faq-history-${i}`),
      note: valOf(`manual-faq-note-${i}`),
    }));
  }
  if (kind === 'video') {
    draft.scenes = (draft.scenes || []).map((it, i) => ({
      title: valOf(`manual-video-title-${i}`) || it.title || `分镜 ${i + 1}`,
      point: valOf(`manual-video-point-${i}`),
      copy: valOf(`manual-video-copy-${i}`),
      visual: valOf(`manual-video-visual-${i}`),
      history: valOf(`manual-video-history-${i}`),
      note: valOf(`manual-video-note-${i}`),
    }));
  }
  if (kind === 'package') {
    draft.faces = (draft.faces || []).map((it, i) => ({
      face: valOf(`manual-package-name-${i}`) || it.face,
      text: valOf(`manual-package-${i}`),
      history: valOf(`manual-package-history-${i}`),
      note: valOf(`manual-package-note-${i}`),
    }));
  }
  if (kind === 'manual') {
    draft.sections = (draft.sections || []).map((it, i) => ({
      title: valOf(`manual-section-name-${i}`) || it.title,
      text: valOf(`manual-section-${i}`),
      history: valOf(`manual-section-history-${i}`),
      note: valOf(`manual-section-note-${i}`),
    }));
  }
  if (!['title', 'td', 'listing', 'image', 'faq', 'video', 'package', 'manual'].includes(kind)) {
    draft.body = valOf('manual-body');
    draft.history = valOf('manual-body-history');
    draft.note = valOf('manual-body-note');
  }
}

function addManualRepeatItem() {
  syncManualDraftFromDom();
  const { kind, draft } = copyManualSubmitState;
  if (!draft) return;
  if (kind === 'listing' || kind === 'td') {
    if (draft.tds.length >= 8) {
      showToast('最多 8 条 TD', 'warning');
      return;
    }
    draft.tds.push('');
    draft.tdTitles = draft.tdTitles || [];
    draft.tdHistories = draft.tdHistories || [];
    draft.tdNotes = draft.tdNotes || [];
    draft.tdTitles.push(`TD-${draft.tds.length}`);
    draft.tdHistories.push('');
    draft.tdNotes.push('');
  } else if (kind === 'image') {
    if (draft.images.length >= 7) {
      showToast('最多 7 张图', 'warning');
      return;
    }
    draft.images.push({
      label: MANUAL_IMAGE_LABELS[draft.images.length] || `图${draft.images.length + 1}`,
      productPoint: '',
      imageCopy: '',
      historyCopy: '',
      note: '',
    });
  } else if (kind === 'faq') {
    if (draft.faqs.length >= 12) {
      showToast('最多 12 组 FAQ', 'warning');
      return;
    }
    draft.faqs.push({ title: `FAQ ${draft.faqs.length + 1}`, q: '', a: '', history: '', note: '' });
  } else if (kind === 'video') {
    if (draft.scenes.length >= 12) {
      showToast('最多 12 个分镜', 'warning');
      return;
    }
    draft.scenes.push({ title: `分镜 ${draft.scenes.length + 1}`, point: '', copy: '', visual: '', history: '', note: '' });
  } else if (kind === 'package') {
    draft.faces.push({ face: `自定义面 ${draft.faces.length + 1}`, text: '', history: '', note: '' });
  } else if (kind === 'manual') {
    draft.sections.push({ title: `自定义章节 ${draft.sections.length + 1}`, text: '', history: '', note: '' });
  }
  renderManualCopyPage();
}

function removeManualRepeatItem(idx) {
  syncManualDraftFromDom();
  const { kind, draft } = copyManualSubmitState;
  if (!draft) return;
  const minOne = (arr, name) => {
    if (!arr || arr.length <= 1) {
      showToast(`至少保留 1 条${name}`, 'warning');
      return;
    }
    arr.splice(idx, 1);
  };
  if (kind === 'listing' || kind === 'td') {
    const before = (draft.tds || []).length;
    minOne(draft.tds, 'TD');
    if ((draft.tds || []).length < before) {
      if (Array.isArray(draft.tdTitles)) draft.tdTitles.splice(idx, 1);
      if (Array.isArray(draft.tdHistories)) draft.tdHistories.splice(idx, 1);
      if (Array.isArray(draft.tdNotes)) draft.tdNotes.splice(idx, 1);
    }
  }
  else if (kind === 'image') minOne(draft.images, '图片');
  else if (kind === 'faq') minOne(draft.faqs, 'FAQ');
  else if (kind === 'video') minOne(draft.scenes, '分镜');
  else if (kind === 'package') minOne(draft.faces, '包装面');
  else if (kind === 'manual') minOne(draft.sections, '章节');
  renderManualCopyPage();
}

function openManualCopySubmit(encodedKey) {
  const row = typeof findCopyDraftRow === 'function'
    ? findCopyDraftRow(encodedKey)
    : ((typeof COPY_LIST_DATA !== 'undefined' ? COPY_LIST_DATA : []).find(item =>
        encodeURIComponent([item.sku, item.type, item.submit_time].join('|')) === encodedKey
      ) || null);
  if (!row) {
    showToast('未找到对应文案需求', 'warning');
    return;
  }
  const kind = getManualCopyKind(row.type);
  copyManualSubmitState = { row, kind, tab: 'demand', draft: createManualDraft(kind), textTags: [] };
  renderManualCopyPage();
  const modal = document.getElementById('copy-manual-submit-modal');
  if (modal) modal.classList.add('show');
}

function closeManualCopySubmit() {
  const modal = document.getElementById('copy-manual-submit-modal');
  if (modal) modal.classList.remove('show');
  copyManualSubmitState = { row: null, kind: 'listing', tab: 'demand', draft: null, textTags: [] };
}

function valOf(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function collectManualCopyPayload(kind, draft) {
  draft = draft || copyManualSubmitState.draft || {};
  if (kind === 'title') {
    const title = String(draft.title || '').trim();
    if (!title) return { error: '请填写 Title' };
    if (!String(draft.titleNote || '').trim()) return { error: '请填写 Title 的修改说明' };
    return {
      payload: {
        type: 'listing',
        title,
        tds: [],
        titleNote: String(draft.titleNote || '').trim(),
        titleHistory: String(draft.titleHistory || '').trim(),
        textTags: collectManualTextTags({ Title: title }),
      },
    };
  }
  if (kind === 'td') {
    const tds = (draft.tds || []).map(td => String(td || '').trim());
    if (!tds.some(Boolean)) return { error: '请至少填写一条 TD' };
    const tdNotes = tds.map((_, i) => String((draft.tdNotes || [])[i] || '').trim());
    const emptyNote = tds.findIndex((td, i) => td && !tdNotes[i]);
    if (emptyNote >= 0) {
      const heading = String((draft.tdTitles || [])[emptyNote] || '').trim() || `TD-${emptyNote + 1}`;
      return { error: `请填写 ${heading} 的修改说明` };
    }
    const fieldTextMap = {};
    tds.forEach((td, i) => {
      const heading = String((draft.tdTitles || [])[i] || '').trim() || `TD-${i + 1}`;
      fieldTextMap[heading] = td;
    });
    return {
      payload: {
        type: 'listing',
        title: '',
        tds,
        titleNote: '',
        tdNotes,
        tdHistories: tds.map((_, i) => String((draft.tdHistories || [])[i] || '').trim()),
        textTags: collectManualTextTags(fieldTextMap),
      },
    };
  }
  if (kind === 'listing') {
    const title = String(draft.title || '').trim();
    const tds = (draft.tds || []).map(td => String(td || '').trim());
    if (!title) return { error: '请填写 Title' };
    if (!tds.some(Boolean)) return { error: '请至少填写一条 TD' };
    if (!String(draft.titleNote || '').trim()) return { error: '请填写 Title 的修改说明' };
    const tdNotes = tds.map((_, i) => String((draft.tdNotes || [])[i] || '').trim());
    const emptyNote = tds.findIndex((td, i) => td && !tdNotes[i]);
    if (emptyNote >= 0) {
      const heading = String((draft.tdTitles || [])[emptyNote] || '').trim() || `TD-${emptyNote + 1}`;
      return { error: `请填写 ${heading} 的修改说明` };
    }
    const fieldTextMap = tds.reduce((acc, td, i) => {
      acc[String((draft.tdTitles || [])[i] || '').trim() || `TD-${i + 1}`] = td;
      return acc;
    }, { Title: title });
    return {
      payload: {
        type: 'listing',
        title,
        tds,
        titleNote: String(draft.titleNote || '').trim(),
        titleHistory: String(draft.titleHistory || '').trim(),
        tdNotes,
        tdHistories: tds.map((_, i) => String((draft.tdHistories || [])[i] || '').trim()),
        textTags: collectManualTextTags(fieldTextMap),
      },
    };
  }
  if (kind === 'image') {
    const imageCopies = (draft.images || []).map(it => ({
      image: it.label,
      productPoint: String(it.productPoint || '').trim(),
      imageCopy: String(it.imageCopy || '').trim(),
      historyCopy: String(it.historyCopy || '').trim(),
      note: String(it.note || '').trim(),
      referenceImage: it.referenceImage || '',
    }));
    const richText = String(draft.richText || '').trim();
    if (!imageCopies.some(it => it.imageCopy || it.productPoint) && !richText) {
      return { error: '请至少填写一张图的文案或富文本' };
    }
    const emptyNote = imageCopies.findIndex(it => (it.imageCopy || it.productPoint) && !it.note);
    if (emptyNote >= 0) return { error: `请填写${imageCopies[emptyNote].image || '图片'}的修改说明` };
    if (richText && !String(draft.richTextNote || '').trim()) return { error: '请填写富文本的修改说明' };
    const fieldTextMap = imageCopies.reduce((acc, item) => {
      acc[`${item.image}-图片文案`] = item.imageCopy;
      return acc;
    }, { '富文本': richText });
    return {
      payload: {
        type: 'imageCopy',
        imageCopies,
        richText,
        richTextNote: String(draft.richTextNote || '').trim(),
        richTextHistory: String(draft.richTextHistory || '').trim(),
        textTags: collectManualTextTags(fieldTextMap),
      },
    };
  }
  if (kind === 'faq') {
    const faqs = (draft.faqs || [])
      .map(it => ({
        q: String(it.q || '').trim(),
        a: String(it.a || '').trim(),
        history: String(it.history || '').trim(),
        note: String(it.note || '').trim(),
      }))
      .filter(it => it.q || it.a);
    if (!faqs.length) return { error: '请至少填写一组 FAQ 问答' };
    const emptyNote = faqs.findIndex(it => !it.note);
    if (emptyNote >= 0) return { error: `请填写 FAQ ${emptyNote + 1} 的修改说明` };
    const fieldTextMap = {};
    faqs.forEach((it, i) => { fieldTextMap[`FAQ ${i + 1}`] = it.a; });
    return { payload: { type: 'faq', faqs, textTags: collectManualTextTags(fieldTextMap) } };
  }
  if (kind === 'video') {
    const scenes = (draft.scenes || [])
      .map(it => ({
        point: String(it.point || '').trim(),
        copy: String(it.copy || '').trim(),
        visual: String(it.visual || '').trim(),
        history: String(it.history || '').trim(),
        note: String(it.note || '').trim(),
      }))
      .filter(it => it.point || it.copy || it.visual);
    if (!scenes.length) return { error: '请至少填写一个分镜' };
    const emptyNote = scenes.findIndex(it => !it.note);
    if (emptyNote >= 0) return { error: `请填写分镜 ${emptyNote + 1} 的修改说明` };
    const fieldTextMap = {};
    scenes.forEach((it, i) => { fieldTextMap[`分镜 ${i + 1}`] = it.copy; });
    return { payload: { type: 'video', scenes, textTags: collectManualTextTags(fieldTextMap) } };
  }
  if (kind === 'package') {
    const faces = (draft.faces || [])
      .map(it => ({
        face: String(it.face || '').trim(),
        text: String(it.text || '').trim(),
        history: String(it.history || '').trim(),
        note: String(it.note || '').trim(),
      }))
      .filter(it => it.text);
    if (!faces.length) return { error: '请至少填写一个包装面文案' };
    const emptyNote = faces.findIndex(it => !it.note);
    if (emptyNote >= 0) return { error: `请填写${faces[emptyNote].face || '包装面'}的修改说明` };
    const fieldTextMap = {};
    faces.forEach(it => { fieldTextMap[it.face || '包装面'] = it.text; });
    return { payload: { type: 'package', faces, textTags: collectManualTextTags(fieldTextMap) } };
  }
  if (kind === 'manual') {
    const sections = (draft.sections || [])
      .map(it => ({
        title: String(it.title || '').trim(),
        text: String(it.text || '').trim(),
        history: String(it.history || '').trim(),
        note: String(it.note || '').trim(),
      }))
      .filter(it => it.text);
    if (!sections.length) return { error: '请至少填写一个说明书章节' };
    const emptyNote = sections.findIndex(it => !it.note);
    if (emptyNote >= 0) return { error: `请填写${sections[emptyNote].title || '章节'}的修改说明` };
    const fieldTextMap = {};
    sections.forEach(it => { fieldTextMap[it.title || '章节'] = it.text; });
    return { payload: { type: 'manual', sections, textTags: collectManualTextTags(fieldTextMap) } };
  }
  const body = String(draft.body || '').trim();
  if (!body) return { error: '请填写文案正文' };
  if (!String(draft.note || '').trim()) return { error: '请填写正文的修改说明' };
  return {
    payload: {
      type: 'plain',
      body,
      history: String(draft.history || '').trim(),
      note: String(draft.note || '').trim(),
      textTags: collectManualTextTags({ '正文': body }),
    },
  };
}

function formatManualCopyTime(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function storeManualCopyNotes(row, payload) {
  window.AI_SUBMIT_REVIEW_NOTES = window.AI_SUBMIT_REVIEW_NOTES || {};
  const key = [row.sku || '', row.type || '', row.name || ''].join('|');
  window.AI_SUBMIT_REVIEW_NOTES[key] = payload;
}

function confirmManualCopySubmit() {
  const row = copyManualSubmitState.row;
  const kind = copyManualSubmitState.kind;
  if (!row) {
    showToast('未找到对应文案需求', 'warning');
    return;
  }
  if (copyManualSubmitState.tab !== 'submit') {
    switchManualCopyTab('submit');
    showToast('请填写终稿后提交审核', 'warning');
    return;
  }
  syncManualDraftFromDom();
  const collected = collectManualCopyPayload(kind, copyManualSubmitState.draft);
  if (collected.error) {
    showToast(collected.error, 'warning');
    return;
  }
  const payload = collected.payload;
  const now = formatManualCopyTime(new Date());
  row.status = '待审核';
  row.review_time = '—';
  row.manualSubmit = true;
  row.listingDraft = payload.type === 'listing'
    ? { title: payload.title, bullet1: (payload.tds || [])[0], bullet2: (payload.tds || [])[1], bullet3: (payload.tds || [])[2], td: (payload.tds || [])[3] }
    : row.listingDraft;
  storeManualCopyNotes(row, payload);
  if (typeof COPY_REVIEW_LIST_DATA !== 'undefined') {
    COPY_REVIEW_LIST_DATA.unshift({
      type: row.type,
      site: row.site,
      brand: row.brand,
      sub: row.sub,
      name: row.name,
      sku: row.sku,
      productImage: row.productImage || 'assets/product-pill-box-black.png',
      productImageAlt: row.name || row.sku,
      review_status: '待审核',
      source: 'manual',
      bu: row.bu,
      bu_lead: row.bu_lead,
      op: row.op,
      writer: row.writer,
      launch_date: row.launch_date,
      date: row.date,
      submit_time: now,
      review_time: '—',
    });
  }
  if (typeof applyCopyFilters === 'function') applyCopyFilters();
  closeManualCopySubmit();
  showToast('已提交审核，可在文案审核中查看', 'success');
}

// =============================================================
//  AI 文案对话页
// =============================================================

// =============================================================
//  AI 文案对话页
// =============================================================

// 背景知识库：分类码（单层，可折叠展开示意）

let bgKnowledgeQuery = '';

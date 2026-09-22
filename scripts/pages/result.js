/* ============================================
   解析结果页（8 个模块的 render + 详情弹窗 + 提交/导出）
   函数前缀: render* (Basic/Product/SEO/Competitor/Selling/Audience/Pain/STP) / openDetailModal / submitRequirement
   抽取自 创建需求-上传页面.html line 1868-2509
   ============================================ */

let confirmedModules = new Set();

function showResultPage() {
  // 标记步骤 3 完成
  [1,2].forEach(i => {
    const ind = document.getElementById(`step-indicator-${i}`);
    ind.classList.remove('active');
    ind.classList.add('completed');
  });
  const step3 = document.getElementById('step-indicator-3');
  if (step3) step3.classList.add('active');

  // 隐藏向导，显示结果
  document.getElementById('wizard-main').style.display = 'none';
  const rm = document.getElementById('result-main');
  rm.style.display = 'block';
  rm.classList.add('fade-in-up');
  setTimeout(() => rm.classList.remove('fade-in-up'), 500);

  // 重置状态
  confirmedModules = new Set();

  const submitBtn = document.getElementById('result-footer-submit-btn');
  if (submitBtn) {
    const label = isOptimizationImageDemand()
      ? '确认并提交优化需求'
      : '确认提交审核';
    submitBtn.innerHTML = typeof I === 'function'
      ? `${I('check', 14)}<span>${label}</span>`
      : label;
  }

  // 渲染左侧导航
  renderResultNav();

  // 渲染主内容
  renderResultContent();

  const layout = document.querySelector('#result-main .result-layout');
  if (layout) layout.classList.toggle('result-layout-compact', isOptimizationImageDemand());

  // 注册滚动监听
  if (!isOptimizationImageDemand()) setupScrollSpy();
  else if (window.__resultScroll) window.removeEventListener('scroll', window.__resultScroll);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (typeof renderResultReuseBanner === 'function') renderResultReuseBanner();
  // 持久化视图
  if (typeof saveView === 'function') {
    saveView('result');
    if (typeof saveStep1Form === 'function') saveStep1Form();
  }
}

function renderResultNav() {
  const nav = document.getElementById('result-nav-list');
  const modules = getActiveResultModules();
  nav.innerHTML = modules.map((m, i) => `
    <li class="result-nav-item ${i === 0 ? 'active' : ''}" data-target="${m.id}" onclick="scrollToModule('${m.id}')">
      <span class="nav-icon ${m.iconBg || ''}">${I(m.iconKey, 14)}</span>
      <span class="nav-label">${m.title}</span>
    </li>
  `).join('');
}

function renderResultContent() {
  const c = document.getElementById('result-content');
  c.innerHTML = getActiveResultModules().map(m => renderModuleCard(m)).join('');
  initProductImageUploads(c);
  if (isOptimizationImageDemand()) {
    initOptCreativeAccordion(c);
    initOptRichTextAccordion(c);
  } else if (isSellingPointImageDemand()) {
    initCreativeAccordion(c);
    initRichTextAccordion(c);
  }
}

function getCurrentResultType() {
  const key = document.getElementById('req-type') ? document.getElementById('req-type').value : '';
  if (!key) return { key: '', stage: currentStage || 'new', biz: currentBiz || '', sub: currentSub || '' };
  const [stage, biz, sub] = key.split('-');
  return { key, stage, biz, sub: sub || '' };
}

function isSellingPointImageDemand() {
  return getCurrentResultType().biz === 'listing7';
}

function isFaqDemand() {
  return getCurrentResultType().biz === 'faq';
}

function isSellingVideoDemand() {
  const { biz, sub } = getCurrentResultType();
  return biz === 'video' && sub === 'selling';
}

function isOperationVideoDemand() {
  const { biz, sub } = getCurrentResultType();
  return biz === 'video' && sub === 'operation';
}

function isOptimizationListingDemand() {
  const { stage, biz, sub } = getCurrentResultType();
  return stage === 'old' && biz === 'titletd' && ['title', 'td', 'titletd'].includes(sub);
}

function isOptimizationImageDemand() {
  const { stage, biz } = getCurrentResultType();
  return stage === 'old' && biz === 'listing7';
}

function isPackageDemand() {
  return getCurrentResultType().biz === 'package';
}

function isManualDemand() {
  return getCurrentResultType().biz === 'manual';
}

function getActiveResultModules() {
  const { biz, sub } = getCurrentResultType();
  if (isPackageDemand()) {
    return ['mod-basic', 'mod-package-faces'].map(id => RESULT_MODULES.find(m => m.id === id)).filter(Boolean);
  }
  if (isManualDemand()) {
    return ['mod-basic', 'mod-manual-sections'].map(id => RESULT_MODULES.find(m => m.id === id)).filter(Boolean);
  }
  const listingModules = ['mod-basic', 'mod-product', 'mod-seo', 'mod-competitor', 'mod-selling', 'mod-audience', 'mod-pain', 'mod-stp'];
  if (isOptimizationImageDemand()) {
    return ['mod-basic', 'mod-image-opt-creative', 'mod-richtext-opt-info'].map(id => RESULT_MODULES.find(m => m.id === id)).filter(Boolean);
  }
  if (isSellingVideoDemand()) return ['mod-basic', 'mod-competitor', 'mod-selling', 'mod-video-display'].map(id => RESULT_MODULES.find(m => m.id === id)).filter(Boolean);
  if (isOperationVideoDemand()) return ['mod-basic', 'mod-competitor', 'mod-video-display'].map(id => RESULT_MODULES.find(m => m.id === id)).filter(Boolean);
  const moduleMap = {
    title: listingModules,
    td: listingModules,
    titletd: listingModules,
    listing7: ['mod-basic', 'mod-product', 'mod-prod-comp', 'mod-selling', 'mod-image-creative', 'mod-richtext-info'],
    video: ['mod-basic', 'mod-product', 'mod-selling', 'mod-audience', 'mod-pain'],
    package: ['mod-basic', 'mod-package-faces'],
    manual: ['mod-basic', 'mod-manual-sections'],
    faq: ['mod-basic', 'mod-product', 'mod-audience', 'mod-pain', 'mod-selling', 'mod-competitor', 'mod-faq-extra'],
    ad: ['mod-basic', 'mod-product', 'mod-seo', 'mod-selling', 'mod-audience'],
    grass: ['mod-basic', 'mod-product', 'mod-selling', 'mod-audience', 'mod-pain'],
    news: ['mod-basic', 'mod-product', 'mod-selling', 'mod-audience'],
  };
  const profile = biz === 'titletd' ? sub : biz;
  const ids = [...(moduleMap[profile] || moduleMap.titletd)];
  if (isOptimizationListingDemand()) ids.splice(1, 0, 'mod-optimization');
  return ids.map(id => RESULT_MODULES.find(m => m.id === id)).filter(Boolean);
}

function getResultModuleById(id) {
  return getActiveResultModules().find(x => x.id === id) || RESULT_MODULES.find(x => x.id === id);
}

function getCurrentRequirementLabel() {
  const key = document.getElementById('req-type') ? document.getElementById('req-type').value : '';
  return (typeof reqTypeLabels !== 'undefined' && reqTypeLabels[key]) || buildReqTypeLabel() || '新品 · Listing';
}

function getCurrentResultPriority() {
  const label = getCurrentRequirementLabel().replace(/\s*·\s*/g, '');
  return typeof getRowPriority === 'function' ? getRowPriority({ type: label }) : 'P1';
}

function getResultBasicRows() {
  const siteVal = document.getElementById('site') ? document.getElementById('site').value : '';
  const subSel = document.getElementById('subcategory');
  const subValue = subSel ? subSel.value : '';
  const subLabel = subValue
    ? (typeof getSubcategoryLabel === 'function' ? getSubcategoryLabel(subValue) : subValue)
    : 'Pill Organizers';
  const skuCode = skuList[0] || 'PO17X4011';
  const skuInfo = (typeof allSkusData !== 'undefined' ? allSkusData : []).find(s => s.code === skuCode);
  const productName = skuInfo ? skuInfo.name : '7格便携药盒';
  const brand = /ZIKEE/i.test(productName) ? 'ZIKEE' : (/AMOOS/i.test(productName) ? 'AMOOS' : 'AUVON');
  const rows = [
    { label: '文案需求类型', value: getCurrentRequirementLabel() },
    { label: '站点',         value: (typeof siteLabels !== 'undefined' && siteLabels[siteVal]) || 'Amazon US' },
    { label: '品牌',         value: brand },
    { label: '子品类',       value: subValue ? subLabel : 'Pill Organizers' },
    { label: 'SKU',          value: skuCode },
    { label: '优先级',       value: getCurrentResultPriority() },
    { label: '文案人员',     value: 'Mason' },
  ];
  const deliveryEl = document.getElementById('delivery-date');
  if (deliveryEl && deliveryEl.value) {
    rows.push({ label: '预期文案交付', value: deliveryEl.value });
  }
  if (typeof isDesignDeptEnabled === 'function' && isDesignDeptEnabled()) {
    rows.push({ label: '设计协同', value: '同步提给设计部' });
    rows.push({
      label: '设计预期交付',
      value: (typeof getDesignDeliveryDate === 'function' && getDesignDeliveryDate()) || '—',
    });
  }
  return rows;
}

function renderModuleCard(m) {
  let bodyHtml = '';
  switch (m.id) {
    case 'mod-basic':      bodyHtml = renderBasic(); break;
    case 'mod-optimization': bodyHtml = renderOptimization(); break;
    case 'mod-image-opt-creative': bodyHtml = renderOptimizationImageCreative(); break;
    case 'mod-richtext-opt-info': bodyHtml = renderOptimizationRichTextInfo(); break;
    case 'mod-product':    bodyHtml = renderProduct(); break;
    case 'mod-prod-comp':  bodyHtml = renderProdComp(); break;
    case 'mod-seo':        bodyHtml = renderSEO(); break;
    case 'mod-competitor': bodyHtml = renderCompetitor(); break;
    case 'mod-selling':    bodyHtml = renderSelling(); break;
    case 'mod-video-display': bodyHtml = renderVideoDisplay(); break;
    case 'mod-audience':   bodyHtml = renderAudience(); break;
    case 'mod-pain':       bodyHtml = renderPain(); break;
    case 'mod-stp':        bodyHtml = renderSTP(); break;
    case 'mod-image-creative': bodyHtml = renderImageCreative(); break;
    case 'mod-richtext-info': bodyHtml = renderRichTextInfo(); break;
    case 'mod-faq-extra':  bodyHtml = renderFaqExtra(); break;
    case 'mod-package-faces': bodyHtml = renderPackageFaces(); break;
    case 'mod-manual-sections': bodyHtml = renderManualSections(); break;
  }
  const meta = getModuleMeta(m.id);
  return `
    <section class="module-card" id="${m.id}">
      <div class="module-card-header" onclick="toggleModule('${m.id}', event)">
        <div class="module-icon-wrap ${m.iconBg || ''}">${IL(m.iconKey, 18)}</div>
        <div class="module-header-info">
          <div class="module-card-title">${m.title}</div>
          <div class="module-card-meta">
            <span>${m.desc}</span>
            ${meta.map(t => `<span class="module-meta-tag ${t.cls || ''}">${t.text}</span>`).join('')}
          </div>
        </div>
        <div class="module-actions" onclick="event.stopPropagation()">
          <button class="module-collapse-btn" onclick="toggleModule('${m.id}', event)" title="折叠/展开">▼</button>
        </div>
      </div>
      <div class="module-card-body">${bodyHtml}</div>
    </section>
  `;
}

function getModuleMeta(id) {
  switch (id) {
    case 'mod-basic':      return [{ text: `${getResultBasicRows().length} 字段`, cls: 'ok' }];
    case 'mod-optimization': return [{ text: '3 类信息', cls: 'ok' }, { text: '仅优化需求', cls: '' }];
    case 'mod-image-opt-creative': {
      const n = (MOCK_DATA.optimizationImageCreative.gallery || []).length;
      return [{ text: `${n} 张待优化`, cls: 'ok' }];
    }
    case 'mod-richtext-opt-info': {
      const n = (MOCK_DATA.optimizationRichText.blocks || []).length;
      return [{ text: `${n} 段富文本`, cls: 'ok' }];
    }
    case 'mod-product':
      if (isFaqDemand()) return [{ text: '2 类资料', cls: 'ok' }];
      if (isSellingPointImageDemand()) return [{ text: '4 类资料', cls: 'ok' }];
      return [{ text: `${MOCK_DATA.product.credentials.length} 项资质`, cls: 'ok' }, { text: `${MOCK_DATA.product.indications.length} 个适用病症`, cls: '' }];
    case 'mod-prod-comp': {
      const n = (MOCK_DATA.product.productCompetitors || []).length;
      return [{ text: `${n} 个竞品`, cls: 'ok' }];
    }
    case 'mod-seo': {
      const total = MOCK_DATA.seo.rows.length;
      const strong = MOCK_DATA.seo.rows.filter(r => r.relevance === '强').length;
      return [{ text: `${total} 个关键词`, cls: '' }, { text: `${strong} 个强相关`, cls: 'ok' }];
    }
    case 'mod-competitor':
      if (isFaqDemand()) return [{ text: `${MOCK_DATA.faqCompetitors.length} 个来源`, cls: 'ok' }, { text: '每个 5 条 FQA', cls: '' }];
      if (isSellingVideoDemand() || isOperationVideoDemand()) return [{ text: `${MOCK_DATA.sellingVideo.competitors.length} 个参考链接`, cls: 'ok' }, { text: `${MOCK_DATA.sellingVideo.models.length} 条模特建议`, cls: '' }];
      return [{ text: `${MOCK_DATA.competitor.length} 个竞品`, cls: '' }];
    case 'mod-selling': {
      if (isSellingVideoDemand()) {
        const sv = MOCK_DATA.sellingVideo;
        return [
          { text: `USP ${sv.usp.length}`, cls: 'ok' },
          { text: `KSP ${sv.ksp.length}`, cls: 'warn' },
          { text: `OSP ${sv.osp.length}`, cls: '' },
        ];
      }
      const s = MOCK_DATA.selling;
      return [
        { text: `USP ${s.usp.length}`, cls: 'ok' },
        { text: `KSP ${s.ksp.length}`, cls: 'warn' },
        { text: `OSP ${s.osp.length}`, cls: '' },
      ];
    }
    case 'mod-audience':   return [{ text: '4 项画像', cls: 'ok' }, { text: `${MOCK_DATA.audience.userInfo.length} 项用户信息`, cls: '' }];
    case 'mod-pain':       return [{ text: `${MOCK_DATA.pain.length} 个痛点`, cls: '' }];
    case 'mod-stp':        return [{ text: `${MOCK_DATA.stp.columns.length - 1} 个竞品`, cls: 'ok' }, { text: `${MOCK_DATA.stp.rows.length} 项拼比`, cls: '' }];
    case 'mod-image-creative': return [{ text: `${MOCK_DATA.imageCreative.gallery.length} 张图`, cls: 'ok' }];
    case 'mod-richtext-info': {
      const n = (MOCK_DATA.imageCreative.richTextBlocks || []).length;
      return [{ text: `${n} 段富文本`, cls: 'ok' }];
    }
    case 'mod-video-display': return [{ text: `${MOCK_DATA.sellingVideo.displays.length} 个展示镜头`, cls: 'ok' }];
    case 'mod-faq-extra':  return [{ text: `${(MOCK_DATA.faqSupplement.screenshots || []).length} 张截图`, cls: 'ok' }];
    case 'mod-package-faces': {
      const n = (MOCK_DATA.packageCopy && MOCK_DATA.packageCopy.faces) ? MOCK_DATA.packageCopy.faces.length : 0;
      return [{ text: `${n} 面文案`, cls: 'ok' }, { text: '含引用', cls: '' }];
    }
    case 'mod-manual-sections': {
      const n = (MOCK_DATA.manualCopy && MOCK_DATA.manualCopy.sections) ? MOCK_DATA.manualCopy.sections.length : 0;
      return [{ text: `${n} 章节`, cls: 'ok' }, { text: '含引用', cls: '' }];
    }
    default: return [];
  }
}

// ===== 通用：可编辑字段工具 =====
// path 形如 "basic.0.value" 或 "product.name" / "seo.title"
// 内联可编辑字段渲染：单击编辑，失焦保存

// ===== 产品图：带上传 / 删除功能 =====
function renderProductImageUpload(imgSrc, imgAlt, imgKey, extraCls = '') {
  const hasImg = !!imgSrc;
  return `
    <div class="product-image-wrap prod-img-upload ${extraCls}" data-img-key="${imgKey}" tabindex="0" title="支持点击、拖拽或粘贴上传图片">
      ${hasImg ? `
        <img class="product-image" src="${imgSrc}" alt="${imgAlt || ''}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
        <div class="product-image-fallback" style="display:none;">暂无产品图</div>
        <div class="prod-img-overlay">
          <label class="prod-img-btn" title="替换图片" onclick="event.stopPropagation()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            替换
            <input type="file" accept="image/*" style="display:none;" onchange="onProductImgChange(event,'${imgKey}')">
          </label>
          <button class="prod-img-btn prod-img-del" title="删除图片" onclick="onProductImgDelete('${imgKey}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            删除
          </button>
        </div>
      ` : `
        <label class="prod-img-upload-zone" title="点击、拖拽或粘贴上传图片">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>点击 / 拖拽 / 粘贴上传</span>
          <input type="file" accept="image/*" style="display:none;" onchange="onProductImgChange(event,'${imgKey}')">
        </label>
      `}
    </div>`;
}

function getProductImgExtraCls(wrap) {
  if (!wrap) return '';
  return wrap.className
    .split(/\s+/)
    .filter(c => c && !['product-image-wrap', 'prod-img-upload', 'is-dragover'].includes(c))
    .join(' ');
}

function applyProductImgFile(file, imgKey) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    if (typeof showToast === 'function') showToast('请上传图片文件', 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const keys = imgKey.split('.');
    let obj = MOCK_DATA;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = e.target.result;
    const wrap = document.querySelector(`.prod-img-upload[data-img-key="${imgKey}"]`);
    if (!wrap) return;
    const extraCls = getProductImgExtraCls(wrap);
    wrap.outerHTML = renderProductImageUpload(e.target.result, '', imgKey, extraCls);
    initProductImageUploads();
  };
  reader.readAsDataURL(file);
}

function onProductImgChange(event, imgKey) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  applyProductImgFile(file, imgKey);
  event.target.value = '';
}

function onProductImgDelete(imgKey) {
  const wrap = document.querySelector(`.prod-img-upload[data-img-key="${imgKey}"]`);
  if (!wrap) return;
  const extraCls = getProductImgExtraCls(wrap);
  const keys = imgKey.split('.');
  let obj = MOCK_DATA;
  for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
  obj[keys[keys.length - 1]] = '';
  wrap.outerHTML = renderProductImageUpload('', '', imgKey, extraCls);
  initProductImageUploads();
}

function initProductImageUploads(root = document) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('.prod-img-upload:not([data-upload-init])').forEach(wrap => {
    wrap.dataset.uploadInit = '1';
    if (!wrap.hasAttribute('tabindex')) wrap.setAttribute('tabindex', '0');

    wrap.addEventListener('dragover', (e) => {
      e.preventDefault();
      wrap.classList.add('is-dragover');
    });
    wrap.addEventListener('dragleave', (e) => {
      if (!wrap.contains(e.relatedTarget)) wrap.classList.remove('is-dragover');
    });
    wrap.addEventListener('drop', (e) => {
      e.preventDefault();
      wrap.classList.remove('is-dragover');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) applyProductImgFile(file, wrap.dataset.imgKey);
    });

    wrap.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type && item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) applyProductImgFile(file, wrap.dataset.imgKey);
          break;
        }
      }
    });
  });
}

// ===== IPD 包装 / 说明书引用式文案 =====
function renderCitedParagraph(text, citations, pending) {
  const citeHtml = (citations || []).map(c =>
    `<span class="cite-chip" onclick="showCitationDetail('${c.ref}','${String(c.fileId || '').replace(/'/g, "\\'")}',${c.page || 0},'${String(c.quote || '').replace(/'/g, "\\'")}')" title="${String(c.quote || '').replace(/"/g, '&quot;')}">[${c.ref}]</span>`
  ).join('');
  const pendingHtml = pending ? '<span class="cite-pending">待确认</span>' : '';
  return `${text}${citeHtml}${pendingHtml}`;
}

function showCitationDetail(ref, fileId, page, quote) {
  showToast(`[${ref}] ${fileId} p.${page} — ${quote}`, 'success', 6000);
}

function renderPackageFaces() {
  const faces = (MOCK_DATA.packageCopy && MOCK_DATA.packageCopy.faces) || [];
  return `<div class="ipd-copy-list">
    ${faces.map(f => `
      <div class="ipd-copy-block">
        <div class="ipd-copy-face">${f.face}</div>
        <div class="ipd-copy-text">${renderCitedParagraph(f.text, f.citations, f.pending)}</div>
      </div>`).join('')}
  </div>`;
}

function renderManualSections() {
  const sections = (MOCK_DATA.manualCopy && MOCK_DATA.manualCopy.sections) || [];
  return `<div class="ipd-copy-list">
    ${sections.map(s => `
      <div class="ipd-copy-block">
        <div class="ipd-copy-face">${s.title}</div>
        <div class="ipd-copy-text">${renderCitedParagraph(s.text, s.citations, s.pending)}</div>
      </div>`).join('')}
  </div>`;
}

// ===== 1. 基础信息 =====
function renderBasic() {
  const rows = getResultBasicRows();
  return `<div class="info-grid-2">
    ${rows.map(b =>
      `<div class="info-grid-item">
        <div class="label">${b.label}</div>
        <div class="value">${b.value}</div>
      </div>`
    ).join('')}
  </div>`;
}

// ===== 1.1 优化信息 =====
function renderOptimization() {
  const manual = MOCK_DATA.optimization.manual;
  return `
    <div class="optimization-manual-form">
      <div class="optimization-panel">
        <div class="prod-section-label">优化的原文</div>
        <div class="optimization-input editable">${editableField('optimization.manual.original', manual.original, { cls: 'edit-block', multiline: true, placeholder: ' ' })}</div>
      </div>
      <div class="optimization-panel">
        <div class="prod-section-label">优化的理由</div>
        <div class="optimization-input editable">${editableField('optimization.manual.reason', manual.reason, { cls: 'edit-block', multiline: true, placeholder: ' ' })}</div>
      </div>
      <div class="optimization-panel">
        <div class="prod-section-label">优化的地方</div>
        <div class="optimization-input editable">${editableField('optimization.manual.area', manual.area, { cls: 'edit-block', multiline: true, placeholder: ' ' })}</div>
      </div>
    </div>
  `;
}

// ===== 优化卖点图片：卖点图 + 富文本 =====
function renderOptCreativeRefImages(galleryIdx) {
  const imgs = (MOCK_DATA.optimizationImageCreative.gallery[galleryIdx] || {}).referenceImages || [];
  const maxRefImgs = 3;
  return imgs.map((img, j) => `
    <figure class="creative-ref-item">
      <img class="creative-ref-img" src="${img.url}" alt="${img.caption || ''}" loading="lazy"
           onclick="window.open('${img.url}','_blank')">
      <div class="creative-ref-overlay">
        <label class="creative-ref-ol-btn" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          替换
          <input type="file" accept="image/*" style="display:none" onchange="onOptCreativeRefImgReplace(event,${galleryIdx},${j})">
        </label>
        <button class="creative-ref-ol-btn" onclick="event.stopPropagation();onOptCreativeRefImgDelete(${galleryIdx},${j})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          删除
        </button>
      </div>
      ${img.caption ? `<figcaption class="creative-ref-caption">${img.caption}</figcaption>` : ''}
    </figure>
  `).join('') + (imgs.length < maxRefImgs ? `
    <div class="creative-ref-add" onclick="event.stopPropagation();this.querySelector('input').click()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>添加</span>
      <input type="file" accept="image/*" style="display:none" onchange="onOptCreativeRefImgAdd(event,${galleryIdx})">
    </div>
  ` : '');
}

function onOptCreativeRefImgReplace(event, galleryIdx, imgIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = MOCK_DATA.optimizationImageCreative.gallery[galleryIdx].referenceImages;
    if (arr && arr[imgIdx]) {
      arr[imgIdx].url = e.target.result;
      arr[imgIdx].caption = file.name.replace(/\.[^.]+$/, '');
    }
    refreshOptCreativeRefImages(galleryIdx);
  };
  reader.readAsDataURL(file);
}

function onOptCreativeRefImgDelete(galleryIdx, imgIdx) {
  const arr = MOCK_DATA.optimizationImageCreative.gallery[galleryIdx].referenceImages;
  if (arr) arr.splice(imgIdx, 1);
  refreshOptCreativeRefImages(galleryIdx);
}

function onOptCreativeRefImgAdd(event, galleryIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const gallery = MOCK_DATA.optimizationImageCreative.gallery[galleryIdx];
  if (!gallery.referenceImages) gallery.referenceImages = [];
  if (gallery.referenceImages.length >= 3) {
    showToast('每张创意卡片最多 3 张参考图', 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    gallery.referenceImages.push({
      url: e.target.result,
      caption: file.name.replace(/\.[^.]+$/, ''),
    });
    refreshOptCreativeRefImages(galleryIdx);
  };
  reader.readAsDataURL(file);
}

function refreshOptCreativeRefImages(galleryIdx) {
  const module = document.getElementById('mod-image-opt-creative');
  const containers = module ? module.querySelectorAll('.creative-ref-images') : [];
  if (containers[galleryIdx]) {
    containers[galleryIdx].innerHTML = renderOptCreativeRefImages(galleryIdx);
  }
}

function collapseAllOptCreativeCards(exceptIdx) {
  document.querySelectorAll('#mod-image-opt-creative .creative-card').forEach((el, i) => {
    el.classList.toggle('expanded', exceptIdx === i);
    el.classList.toggle('collapsed', exceptIdx !== i);
  });
}

function syncOptCreativeChipActive(idx) {
  const bar = document.getElementById('opt-creative-chip-bar');
  if (!bar) return;
  bar.querySelectorAll('.creative-chip').forEach(c => c.classList.remove('active'));
  const target = bar.querySelector(`.creative-chip[data-opt-creative-idx="${idx}"]`);
  if (target) target.classList.add('active');
}

function toggleOptCreativeCard(idx, event) {
  if (event && event.target.closest('[contenteditable="true"], .creative-card-delete, button')) return;
  const card = document.getElementById('opt-creative-card-' + idx);
  if (!card) return;
  const willExpand = !card.classList.contains('expanded');
  if (willExpand) {
    collapseAllOptCreativeCards(idx);
    syncOptCreativeChipActive(idx);
  } else {
    card.classList.remove('expanded');
    card.classList.add('collapsed');
  }
}

function scrollToOptCreativeCard(idx) {
  const card = document.getElementById('opt-creative-card-' + idx);
  const module = document.getElementById('mod-image-opt-creative');
  if (!card || !module) return;
  collapseAllOptCreativeCards(idx);
  syncOptCreativeChipActive(idx);
  const bar = document.getElementById('opt-creative-chip-bar');
  const offset = bar ? bar.offsetHeight + 12 : 12;
  const top = card.getBoundingClientRect().top + window.scrollY - offset - 80;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function initOptCreativeAccordion(root, expandIdx) {
  if (window.__optCreativeScrollObserver) {
    window.__optCreativeScrollObserver.disconnect();
    window.__optCreativeScrollObserver = null;
  }
  const scope = root || document;
  const module = scope.querySelector('#mod-image-opt-creative');
  if (!module) return;

  const idx = expandIdx != null ? expandIdx : 0;
  collapseAllOptCreativeCards(idx);
  syncOptCreativeChipActive(idx);

  const targets = [...module.querySelectorAll('.creative-card')].filter(Boolean);
  if (!targets.length) return;

  window.__optCreativeScrollObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const i = visible.target.dataset.optCreativeIdx;
      if (i != null) syncOptCreativeChipActive(i);
    },
    { root: null, rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
  );
  targets.forEach(el => window.__optCreativeScrollObserver.observe(el));
}

function refreshOptCreativeModule(expandIdx) {
  const cfg = getResultModuleById('mod-image-opt-creative');
  const module = document.getElementById('mod-image-opt-creative');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  initOptCreativeAccordion(document, expandIdx);
}

function addOptGalleryItem() {
  if (!MOCK_DATA.optimizationImageCreative.gallery) MOCK_DATA.optimizationImageCreative.gallery = [];
  MOCK_DATA.optimizationImageCreative.gallery.push({
    image: '图位' + (MOCK_DATA.optimizationImageCreative.gallery.length + 1),
    productPoint: '',
    designRequirement: '',
    imageCopy: '',
    referenceImages: [],
  });
  refreshOptCreativeModule(MOCK_DATA.optimizationImageCreative.gallery.length - 1);
}

function removeOptGalleryItem(idx) {
  const gallery = MOCK_DATA.optimizationImageCreative.gallery || [];
  if (gallery.length <= 1) {
    showToast('至少保留 1 张待优化图', 'warning');
    return;
  }
  gallery.splice(idx, 1);
  refreshOptCreativeModule(Math.min(idx, gallery.length - 1));
}

function renderOptimizationImageCreative() {
  const gallery = (MOCK_DATA.optimizationImageCreative && MOCK_DATA.optimizationImageCreative.gallery) || [];
  return `
    <div class="creative-module-wrap">
      <div class="creative-chip-bar" id="opt-creative-chip-bar">
        ${gallery.map((it, i) => `
          <button type="button" class="creative-chip ${i === 0 ? 'active' : ''}" data-opt-creative-idx="${i}" onclick="scrollToOptCreativeCard(${i})">${it.image || ('图位' + (i + 1))}</button>
        `).join('')}
        <button type="button" class="creative-chip-add" onclick="addOptGalleryItem()">+ 新增图位</button>
      </div>
      <div class="creative-gallery-list">
        ${gallery.map((it, i) => `
          <div class="creative-card ${i === 0 ? 'expanded' : 'collapsed'}" id="opt-creative-card-${i}" data-opt-creative-idx="${i}">
            <div class="creative-card-head" onclick="toggleOptCreativeCard(${i}, event)">
              <div class="creative-card-head-left">
                <span class="creative-card-label">${editableField(`optimizationImageCreative.gallery.${i}.image`, it.image, { cls: 'edit-inline-value' })}</span>
                <span class="creative-card-summary">${creativeEscSummary(it.productPoint)}</span>
              </div>
              <div class="creative-card-head-actions" onclick="event.stopPropagation()">
                ${gallery.length > 1 ? `<button type="button" class="creative-card-delete" title="删除图位" onclick="removeOptGalleryItem(${i})">×</button>` : ''}
                <span class="creative-card-chevron" aria-hidden="true">▼</span>
              </div>
            </div>
            <div class="creative-brief-body">
              ${renderCreativeBriefFields(`optimizationImageCreative.gallery.${i}`, it, renderOptCreativeRefImages(i))}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderOptRichTextRefImages(blockIdx) {
  const imgs = (MOCK_DATA.optimizationRichText.blocks[blockIdx] || {}).referenceImages || [];
  const maxRefImgs = 3;
  return imgs.map((img, j) => `
    <figure class="creative-ref-item">
      <img class="creative-ref-img" src="${img.url}" alt="${img.caption || ''}" loading="lazy"
           onclick="window.open('${img.url}','_blank')">
      <div class="creative-ref-overlay">
        <label class="creative-ref-ol-btn" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          替换
          <input type="file" accept="image/*" style="display:none" onchange="onOptRichTextRefImgReplace(event,${blockIdx},${j})">
        </label>
        <button class="creative-ref-ol-btn" onclick="event.stopPropagation();onOptRichTextRefImgDelete(${blockIdx},${j})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          删除
        </button>
      </div>
      ${img.caption ? `<figcaption class="creative-ref-caption">${img.caption}</figcaption>` : ''}
    </figure>
  `).join('') + (imgs.length < maxRefImgs ? `
    <div class="creative-ref-add" onclick="event.stopPropagation();this.querySelector('input').click()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>添加</span>
      <input type="file" accept="image/*" style="display:none" onchange="onOptRichTextRefImgAdd(event,${blockIdx})">
    </div>
  ` : '');
}

function onOptRichTextRefImgReplace(event, blockIdx, imgIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = MOCK_DATA.optimizationRichText.blocks[blockIdx].referenceImages;
    if (arr && arr[imgIdx]) {
      arr[imgIdx].url = e.target.result;
      arr[imgIdx].caption = file.name.replace(/\.[^.]+$/, '');
    }
    refreshOptRichTextRefImages(blockIdx);
  };
  reader.readAsDataURL(file);
}

function onOptRichTextRefImgDelete(blockIdx, imgIdx) {
  const arr = MOCK_DATA.optimizationRichText.blocks[blockIdx].referenceImages;
  if (arr) arr.splice(imgIdx, 1);
  refreshOptRichTextRefImages(blockIdx);
}

function onOptRichTextRefImgAdd(event, blockIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const block = MOCK_DATA.optimizationRichText.blocks[blockIdx];
  if (!block.referenceImages) block.referenceImages = [];
  if (block.referenceImages.length >= 3) {
    showToast('每段富文本最多 3 张参考图', 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    block.referenceImages.push({
      url: e.target.result,
      caption: file.name.replace(/\.[^.]+$/, ''),
    });
    refreshOptRichTextRefImages(blockIdx);
  };
  reader.readAsDataURL(file);
}

function refreshOptRichTextRefImages(blockIdx) {
  const module = document.getElementById('mod-richtext-opt-info');
  const containers = module ? module.querySelectorAll('.creative-ref-images') : [];
  if (containers[blockIdx]) {
    containers[blockIdx].innerHTML = renderOptRichTextRefImages(blockIdx);
  }
}

function syncOptRichTextBlockTitles() {
  const blocks = (MOCK_DATA.optimizationRichText && MOCK_DATA.optimizationRichText.blocks) || [];
  blocks.forEach((b, i) => { b.title = getRichTextBlockLabel(i); });
}

function getOptRichTextBlocks() {
  const rt = MOCK_DATA.optimizationRichText || {};
  if (Array.isArray(rt.blocks) && rt.blocks.length) return rt.blocks;
  return [{
    title: getRichTextBlockLabel(0),
    productPoint: '',
    designRequirement: '',
    imageCopy: '',
    referenceImages: [],
  }];
}

function collapseAllOptRichTextCards(exceptIdx) {
  document.querySelectorAll('#mod-richtext-opt-info .creative-card').forEach((el, i) => {
    el.classList.toggle('expanded', exceptIdx === i);
    el.classList.toggle('collapsed', exceptIdx !== i);
  });
}

function syncOptRichTextChipActive(idx) {
  const bar = document.getElementById('opt-richtext-chip-bar');
  if (!bar) return;
  bar.querySelectorAll('.creative-chip').forEach(c => c.classList.remove('active'));
  const target = bar.querySelector(`.creative-chip[data-opt-richtext-idx="${idx}"]`);
  if (target) target.classList.add('active');
}

function toggleOptRichTextCard(idx, event) {
  if (event && event.target.closest('[contenteditable="true"], .creative-card-delete, button')) return;
  const card = document.getElementById('opt-richtext-card-' + idx);
  if (!card) return;
  const willExpand = !card.classList.contains('expanded');
  if (willExpand) {
    collapseAllOptRichTextCards(idx);
    syncOptRichTextChipActive(idx);
  } else {
    card.classList.remove('expanded');
    card.classList.add('collapsed');
  }
}

function scrollToOptRichTextCard(idx) {
  const card = document.getElementById('opt-richtext-card-' + idx);
  const module = document.getElementById('mod-richtext-opt-info');
  if (!card || !module) return;
  collapseAllOptRichTextCards(idx);
  syncOptRichTextChipActive(idx);
  const bar = document.getElementById('opt-richtext-chip-bar');
  const offset = bar ? bar.offsetHeight + 12 : 12;
  const top = card.getBoundingClientRect().top + window.scrollY - offset - 80;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function initOptRichTextAccordion(root, expandIdx) {
  if (window.__optRichtextScrollObserver) {
    window.__optRichtextScrollObserver.disconnect();
    window.__optRichtextScrollObserver = null;
  }
  const scope = root || document;
  const module = scope.querySelector('#mod-richtext-opt-info');
  if (!module) return;

  const idx = expandIdx != null ? expandIdx : 0;
  collapseAllOptRichTextCards(idx);
  syncOptRichTextChipActive(idx);

  const targets = [...module.querySelectorAll('.creative-card')].filter(Boolean);
  if (!targets.length) return;

  window.__optRichtextScrollObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const i = visible.target.dataset.optRichtextIdx;
      if (i != null) syncOptRichTextChipActive(i);
    },
    { root: null, rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
  );
  targets.forEach(el => window.__optRichtextScrollObserver.observe(el));
}

function refreshOptRichTextModule(expandIdx) {
  const cfg = getResultModuleById('mod-richtext-opt-info');
  const module = document.getElementById('mod-richtext-opt-info');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  initOptRichTextAccordion(document, expandIdx);
}

function addOptRichTextBlock() {
  if (!MOCK_DATA.optimizationRichText.blocks) MOCK_DATA.optimizationRichText.blocks = [];
  MOCK_DATA.optimizationRichText.blocks.push({
    title: '',
    productPoint: '',
    designRequirement: '',
    imageCopy: '',
    referenceImages: [],
  });
  syncOptRichTextBlockTitles();
  refreshOptRichTextModule(MOCK_DATA.optimizationRichText.blocks.length - 1);
}

function removeOptRichTextBlock(idx) {
  const blocks = MOCK_DATA.optimizationRichText.blocks || [];
  if (blocks.length <= 1) {
    showToast('至少保留 1 段富文本', 'warning');
    return;
  }
  blocks.splice(idx, 1);
  syncOptRichTextBlockTitles();
  refreshOptRichTextModule(Math.min(idx, blocks.length - 1));
}

function renderOptimizationRichTextInfo() {
  const blocks = getOptRichTextBlocks();
  if (!MOCK_DATA.optimizationRichText.blocks) MOCK_DATA.optimizationRichText.blocks = blocks;
  syncOptRichTextBlockTitles();
  return `
    <div class="creative-module-wrap">
      <div class="creative-chip-bar richtext-chip-bar" id="opt-richtext-chip-bar">
        ${blocks.map((it, i) => `
          <button type="button" class="creative-chip ${i === 0 ? 'active' : ''}" data-opt-richtext-idx="${i}" onclick="scrollToOptRichTextCard(${i})">${getRichTextBlockLabel(i)}</button>
        `).join('')}
        <button type="button" class="creative-chip-add" onclick="addOptRichTextBlock()">+ 新增段落</button>
      </div>
      <div class="creative-gallery-list">
        ${blocks.map((it, i) => `
          <div class="creative-card ${i === 0 ? 'expanded' : 'collapsed'}" id="opt-richtext-card-${i}" data-opt-richtext-idx="${i}">
            <div class="creative-card-head" onclick="toggleOptRichTextCard(${i}, event)">
              <div class="creative-card-head-left">
                <span class="creative-card-label">${getRichTextBlockLabel(i)}</span>
                <span class="creative-card-summary">${creativeEscSummary(it.productPoint)}</span>
              </div>
              <div class="creative-card-head-actions" onclick="event.stopPropagation()">
                ${blocks.length > 1 ? `<button type="button" class="creative-card-delete" title="删除段落" onclick="removeOptRichTextBlock(${i})">×</button>` : ''}
                <span class="creative-card-chevron" aria-hidden="true">▼</span>
              </div>
            </div>
            <div class="creative-brief-body">
              ${renderCreativeBriefFields(`optimizationRichText.blocks.${i}`, it, renderOptRichTextRefImages(i))}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ===== 2. 产品信息 =====
function getMockPath(path) {
  const parts = path.split('.');
  let obj = MOCK_DATA;
  for (const part of parts) {
    if (!obj) return null;
    obj = isNaN(part) ? obj[part] : obj[parseInt(part)];
  }
  return obj;
}

function refreshProductModule(focusPath = '') {
  const module = document.getElementById('mod-product');
  const cfg = getActiveResultModules().find(m => m.id === 'mod-product');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  const nextModule = document.getElementById('mod-product');
  if (typeof initProductImageUploads === 'function') initProductImageUploads(nextModule || document);
  if (focusPath) {
    setTimeout(() => {
      const el = document.querySelector(`[data-path="${focusPath}"]`);
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }, 0);
  }
}

function cloneProductTemplate(template) {
  return typeof template === 'function'
    ? template()
    : JSON.parse(JSON.stringify(template));
}

function addProductArrayItem(path, template, focusSuffix = '') {
  const arr = getMockPath(path);
  if (!Array.isArray(arr)) return;
  arr.push(cloneProductTemplate(template));
  const focusPath = `${path}.${arr.length - 1}${focusSuffix ? `.${focusSuffix}` : ''}`;
  refreshProductModule(focusPath);
}

function removeProductArrayItem(path, index, label) {
  const arr = getMockPath(path);
  if (!Array.isArray(arr) || !arr[index]) return;
  arr.splice(index, 1);
  refreshProductModule();
  if (typeof showToast === 'function') showToast(`已删除${label} ${index + 1}`, 'success');
}

function renderEditableSectionLabel(label, count, onAdd, unit = '项') {
  return `<div class="prod-section-label prod-section-label-action">
    <span>${label} <span class="prod-section-hint">(${count} ${unit})</span></span>
    <button type="button" class="prod-section-add" onclick="${onAdd}">+ 新增</button>
  </div>`;
}

function addProductCredential() {
  addProductArrayItem('product.credentials', { label: '', value: '' }, 'label');
}
function addProductIndication() {
  addProductArrayItem('product.indications', '', '');
}
function addProductKInfo() {
  addProductArrayItem('product.kInfo', { label: '新字段', value: '' }, 'label');
}
function addProductTd() {
  addProductArrayItem('product.td', '', '');
}
function addImageComplaint() {
  addProductArrayItem('imageProduct.complaints', '', '');
}
function addImagePackingItem() {
  addProductArrayItem('imageProduct.packingList', '', '');
}

function renderProduct() {
  if (isFaqDemand()) return renderFaqProduct();
  if (isSellingPointImageDemand()) return renderImageProduct();
  const p = MOCK_DATA.product;
  return `
    <div class="prod-section">
      <div class="prod-section-label">产品图</div>
      ${renderProductImageUpload(p.image, p.imageAlt || '', 'product.image')}
    </div>
    <div class="prod-section">
      <div class="prod-section-label">产品定位</div>
      <div class="text-block editable">${editableField('product.positioning', p.positioning, { cls: 'edit-block', multiline: true })}</div>
    </div>
    <div class="prod-section">
      ${renderEditableSectionLabel('产品信用状', p.credentials.length, 'addProductCredential()')}
      <table class="compact-table">
        <thead><tr><th style="width:200px;">证书 / 资质</th><th>编号 / 说明</th><th class="prod-table-action">操作</th></tr></thead>
        <tbody>
          ${p.credentials.map((c, i) => `
            <tr>
              <td>${editableField(`product.credentials.${i}.label`, c.label, { cls: 'edit-inline-value' })}</td>
              <td>${editableField(`product.credentials.${i}.value`, c.value, { cls: 'edit-inline-value' })}</td>
              <td class="prod-table-action"><button type="button" class="prod-table-delete prod-row-delete" title="删除" onclick="removeProductArrayItem('product.credentials', ${i}, '产品信用状')">×</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="prod-section">
      ${renderEditableSectionLabel('适用病症', p.indications.length, 'addProductIndication()')}
      <div class="feature-tags">
        ${p.indications.map((it, i) => `
          <span class="feature-tag feature-tag-editable">
            ${editableField(`product.indications.${i}`, it, { cls: 'edit-tag' })}
            <button type="button" class="feature-tag-delete" title="删除" onclick="removeProductArrayItem('product.indications', ${i}, '适用病症')">×</button>
          </span>
        `).join('')}
      </div>
    </div>
    <div class="prod-section">
      ${renderEditableSectionLabel('K 号信息', p.kInfo.length, 'addProductKInfo()')}
      <div class="info-grid-2">
        ${p.kInfo.map((k, i) => `
          <div class="info-grid-item prod-info-editable-item">
            <div class="label">${editableField(`product.kInfo.${i}.label`, k.label, { cls: 'edit-inline-value' })}</div>
            <div class="value">${editableField(`product.kInfo.${i}.value`, k.value, { cls: 'edit-inline-value' })}</div>
            <button type="button" class="prod-row-delete prod-info-delete" title="删除" onclick="removeProductArrayItem('product.kInfo', ${i}, 'K 号信息')">×</button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderProdComp() {
  const pc = (MOCK_DATA.product && MOCK_DATA.product.productCompetitors) || [];
  if (!pc.length) return '<div style="color:var(--text-muted);">暂无竞品信息</div>';
  return `
    <div class="prod-comp-grid">
      ${pc.map((c, i) => `
        <div class="prod-comp-card">
          ${renderProductImageUpload(c.image, c.name, 'product.productCompetitors.' + i + '.image', 'prod-comp-img')}
          <div class="prod-comp-info">
            <div class="prod-comp-name">
              <span class="prod-comp-index">竞对${['一','二','三','四','五'][i] || i + 1}</span>
              <strong>${editableField('product.productCompetitors.' + i + '.name', c.name, { cls: 'edit-inline-value' })}</strong>
            </div>
            <div class="prod-comp-field">
              <span class="prod-comp-label">ASIN</span>
              <code>${editableField('product.productCompetitors.' + i + '.asin', c.asin, { cls: 'edit-inline-value' })}</code>
            </div>
            <div class="prod-comp-field">
              <span class="prod-comp-label">链接</span>
              <a href="${c.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="prod-comp-link">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Amazon
              </a>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderFaqProduct() {
  const p = MOCK_DATA.product;
  return `
    <div class="image-product-grid faq-product-grid">
      <div class="prod-section image-product-main">
        <div class="prod-section-label">产品图</div>
        ${renderProductImageUpload(p.image, p.imageAlt || '', 'product.image')}
        <div class="image-product-position">
          <div class="prod-section-label">产品定位</div>
          <div class="text-block editable">${editableField('product.positioning', p.positioning, { cls: 'edit-block', multiline: true })}</div>
        </div>
        <div class="image-product-position">
          <div class="prod-section-label">Title</div>
          <div class="text-block editable">${editableField('product.title', p.title, { cls: 'edit-block', multiline: true })}</div>
        </div>
        <div class="image-product-position">
          ${renderEditableSectionLabel('TD', p.td.length, 'addProductTd()')}
          <div class="td-list">
            ${p.td.map((t, i) => `
              <div class="td-item">
                <span class="td-index">TD ${i + 1}</span>
                <div class="td-text">${editableField(`product.td.${i}`, t, { cls: 'edit-block', multiline: true })}</div>
                <button type="button" class="prod-row-delete td-item-delete" title="删除" onclick="removeProductArrayItem('product.td', ${i}, 'TD')">×</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function renderImageProduct() {
  const p = MOCK_DATA.product;
  const img = MOCK_DATA.imageProduct;
  return `
    <div class="image-product-grid">
      <div class="prod-section image-product-main">
        <div class="prod-section-label">产品图</div>
        ${renderProductImageUpload(p.image, p.imageAlt || '', 'product.image')}
        <div class="image-product-position">
          <div class="prod-section-label">产品定位</div>
          <div class="text-block editable">${editableField('product.positioning', p.positioning, { cls: 'edit-block', multiline: true })}</div>
        </div>
      </div>
    </div>
    <div class="prod-section">
      ${renderEditableSectionLabel('竞对主要客诉点', img.complaints.length, 'addImageComplaint()', '条')}
      <div class="pain-list pain-list-simple">
        ${img.complaints.map((text, i) => `
          <div class="pain-row">
            <div class="pain-row-num">${i + 1}</div>
            <div class="pain-row-body">
              <div class="pain-row-label">客诉 ${i + 1}</div>
              <div class="pain-row-text">${editableField(`imageProduct.complaints.${i}`, text, { cls: 'edit-inline-value', multiline: true })}</div>
            </div>
            <button type="button" class="pain-row-delete" title="删除" onclick="removeProductArrayItem('imageProduct.complaints', ${i}, '客诉点')">×</button>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="prod-section">
      ${renderEditableSectionLabel('出货清单', img.packingList.length, 'addImagePackingItem()')}
      <div class="feature-tags">
        ${img.packingList.map((it, i) => `
          <span class="feature-tag feature-tag-editable">
            ${editableField(`imageProduct.packingList.${i}`, it, { cls: 'edit-tag' })}
            <button type="button" class="feature-tag-delete" title="删除" onclick="removeProductArrayItem('imageProduct.packingList', ${i}, '出货清单')">×</button>
          </span>
        `).join('')}
      </div>
    </div>`;
}

// ===== 3. SEO 信息 =====
function renderSEO() {
  const s = MOCK_DATA.seo;
  const relevanceCls = (r) => r === '强' ? 'rel-strong' : (r === '中' ? 'rel-mid' : 'rel-weak');
  return `
    <table class="compact-table seo-table">
      <thead>
        <tr>
          <th>SEO</th>
          <th style="width:200px;">Search Frequency Rank</th>
          <th style="width:120px;">相关性</th>
        </tr>
      </thead>
      <tbody>
        ${s.rows.map((r, i) => `
          <tr>
            <td>${editableField(`seo.rows.${i}.keyword`, r.keyword, { cls: 'edit-inline-value' })}</td>
            <td>${editableField(`seo.rows.${i}.rank`, r.rank, { cls: 'edit-inline-value' })}</td>
            <td><span class="rel-pill ${relevanceCls(r.relevance)}">${editableField(`seo.rows.${i}.relevance`, r.relevance, { cls: 'edit-inline-value' })}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

// ===== 4. 竞对信息 =====
function renderCompetitor() {
  if (isFaqDemand()) return renderFaqCompetitor();
  if (isSellingVideoDemand() || isOperationVideoDemand()) return renderVideoCompetitor();
  return `<div class="competitor-list">
    ${MOCK_DATA.competitor.map((c, i) => `
      <div class="competitor-card">
        <div class="competitor-card-head">
          ${renderProductImageUpload(c.image, c.brand, `competitor.${i}.image`, 'compact')}
          <div class="competitor-meta">
            <div class="competitor-brand">
              <span class="competitor-index">竞品 ${i + 1}</span>
              <strong>${editableField(`competitor.${i}.brand`, c.brand, { cls: 'edit-inline-value' })}</strong>
            </div>
            <div class="competitor-asin">
              ASIN：<code>${editableField(`competitor.${i}.asin`, c.asin, { cls: 'edit-inline-value' })}</code>
            </div>
            <div class="competitor-stats">
              <div class="competitor-stat"><div class="label">销售大类排名</div><div class="value">${editableField(`competitor.${i}.rankBig`, c.rankBig, { cls: 'edit-inline-value' })}</div></div>
              <div class="competitor-stat"><div class="label">销售小类排名</div><div class="value">${editableField(`competitor.${i}.rankSmall`, c.rankSmall, { cls: 'edit-inline-value' })}</div></div>
              <div class="competitor-stat"><div class="label">总变体销量</div><div class="value">${editableField(`competitor.${i}.totalVariantSales`, c.totalVariantSales, { cls: 'edit-inline-value' })}</div></div>
              <div class="competitor-stat"><div class="label">主体销量</div><div class="value">${editableField(`competitor.${i}.mainSales`, c.mainSales, { cls: 'edit-inline-value' })}</div></div>
            </div>
          </div>
        </div>
        <div class="competitor-section">
          <div class="competitor-section-label">Title</div>
          <div class="text-block editable">${editableField(`competitor.${i}.title`, c.title, { cls: 'edit-block', multiline: true })}</div>
        </div>
        <div class="competitor-section">
          <div class="competitor-section-label">TD <span class="prod-section-hint">(${c.tds.length} 条)</span></div>
          <ol class="competitor-td-list">
            ${c.tds.map((t, ti) => `
              <li>${editableField(`competitor.${i}.tds.${ti}`, t, { cls: 'edit-block', multiline: true })}</li>
            `).join('')}
          </ol>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function renderVideoCompetitor() {
  const data = MOCK_DATA.sellingVideo;
  return `
    <div class="video-ref-grid">
      <div class="video-ref-panel">
        <div class="video-section-title">参考链接</div>
        <div class="video-ref-list">
          ${data.competitors.map((it, i) => `
            <div class="video-ref-item">
              <div class="video-ref-head">
                <span>${it.label}</span>
              </div>
              <a href="${it.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${editableField(`sellingVideo.competitors.${i}.link`, it.link, { cls: 'edit-inline-value' })}</a>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="video-model-panel">
        <div class="video-section-title">模特</div>
        <div class="video-model-list">
          ${data.models.map((it, i) => `
            <div class="video-model-item">
              <span>${String(i + 1).padStart(2, '0')}</span>
              <div>${editableField(`sellingVideo.models.${i}`, it, { cls: 'edit-inline-value', multiline: true })}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderFaqCompetitor() {
  return `<div class="faq-competitor-list">
    ${MOCK_DATA.faqCompetitors.map((c, i) => `
      <div class="faq-competitor-card">
        <div class="faq-competitor-side">
          <span>${editableField(`faqCompetitors.${i}.label`, c.label, { cls: 'edit-inline-value' })}</span>
          ${renderProductImageUpload(c.image, c.brand, `faqCompetitors.${i}.image`, 'faq-img')}
          <strong>${editableField(`faqCompetitors.${i}.brand`, c.brand, { cls: 'edit-inline-value' })}</strong>
          <a href="${c.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${editableField(`faqCompetitors.${i}.link`, c.link, { cls: 'edit-inline-value' })}</a>
        </div>
        <div class="faq-question-list">
          ${c.faqs.map((item, fi) => {
            const aIdx = item.search(/ A: /);
            const q = aIdx > -1 ? item.slice(0, aIdx).replace(/^Q\d+:\s*/, '') : item;
            const a = aIdx > -1 ? item.slice(aIdx + 4) : '';
            return `
            <div class="faq-question-item">
              <b>FQA${fi + 1}</b>
              <div class="faq-qa-body">
                <div class="faq-q">${editableField(`faqCompetitors.${i}.faqs.${fi}#q`, q, { cls: 'edit-inline-value', multiline: true })}</div>
                ${a ? `<div class="faq-a">${editableField(`faqCompetitors.${i}.faqs.${fi}#a`, a, { cls: 'edit-inline-value', multiline: true })}</div>` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ===== 5. 卖点信息 =====
const SELLING_GROUPS = [
  { key: 'usp', code: 'USP', name: '独特卖点', cls: 'sell-usp' },
  { key: 'ksp', code: 'KSP', name: '核心卖点', cls: 'sell-ksp' },
  { key: 'osp', code: 'OSP', name: '补充卖点', cls: 'sell-osp' },
];

function refreshSellingModule(focusPath = '') {
  const module = document.getElementById('mod-selling');
  const cfg = getActiveResultModules().find(m => m.id === 'mod-selling');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  if (focusPath) {
    setTimeout(() => {
      const el = document.querySelector(`[data-path="${focusPath}"]`);
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }, 0);
  }
}

function addSellingItem(root, group) {
  const list = MOCK_DATA[root] && MOCK_DATA[root][group];
  if (!Array.isArray(list)) return;
  list.push({ title: '' });
  const focusPath = `${root}.${group}.${list.length - 1}.title`;
  refreshSellingModule(focusPath);
}

function removeSellingItem(root, group, index) {
  const list = MOCK_DATA[root] && MOCK_DATA[root][group];
  if (!Array.isArray(list) || !list[index]) return;
  const groupMeta = SELLING_GROUPS.find(g => g.key === group);
  list.splice(index, 1);
  refreshSellingModule();
  if (typeof showToast === 'function') {
    showToast(`已删除 ${groupMeta ? groupMeta.code : group.toUpperCase()} 第 ${index + 1} 条`, 'success');
  }
}

function renderSellingGroup(root, data) {
  const groups = [
    { key: 'usp', code: 'USP', name: '独特卖点', cls: 'sell-usp' },
    { key: 'ksp', code: 'KSP', name: '核心卖点', cls: 'sell-ksp' },
    { key: 'osp', code: 'OSP', name: '补充卖点', cls: 'sell-osp' },
  ];
  return `<div class="sell-groups">
    ${groups.map(g => `
      <div class="sell-group ${g.cls}">
        <div class="sell-group-head">
          <div class="sell-group-badge">${g.code}</div>
          <div class="sell-group-meta">
            <div class="sell-group-name">${g.name} <span class="prod-section-hint">(${data[g.key].length} 条)</span></div>
          </div>
          <button type="button" class="sell-group-add" onclick="addSellingItem('${root}', '${g.key}')">+ 新增</button>
        </div>
        <div class="selling-list">
          ${data[g.key].map((it, i) => `
            <div class="selling-item">
              <div class="selling-num">${String(i+1).padStart(2,'0')}</div>
              <div class="selling-body">
                <span class="selling-title">${editableField(`${root}.${g.key}.${i}.title`, it.title, { cls: 'edit-inline-value' })}</span>
              </div>
              <button type="button" class="selling-item-delete" title="删除" onclick="removeSellingItem('${root}', '${g.key}', ${i})">×</button>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  `;
}

function renderSelling() {
  if (isSellingVideoDemand()) return renderVideoSelling();
  return renderSellingGroup('selling', MOCK_DATA.selling);
}

function renderVideoSelling() {
  return renderSellingGroup('sellingVideo', MOCK_DATA.sellingVideo);
}

function renderVideoDisplay() {
  const hidePoint = isOperationVideoDemand();
  return `<div class="video-display-list">
    ${MOCK_DATA.sellingVideo.displays.map((it, i) => `
      <div class="video-display-card">
        <div class="video-display-no">${String(it.no).padStart(2, '0')}</div>
        <div class="video-display-content ${hidePoint ? 'no-point' : ''}">
          ${hidePoint ? '' : `
          <div class="video-display-point">
            <label>卖点</label>
            <strong>${editableField(`sellingVideo.displays.${i}.point`, it.point, { cls: 'edit-inline-value' })}</strong>
          </div>`}
          <div class="video-display-visual">
            <label>画面展示</label>
            <div>${editableField(`sellingVideo.displays.${i}.visual`, it.visual, { cls: 'edit-inline-value', multiline: true })}</div>
          </div>
          <div class="video-display-copy">
            <label>中文文案</label>
            <div>${editableField(`sellingVideo.displays.${i}.copy`, it.copy, { cls: 'edit-inline-value', multiline: true })}</div>
          </div>
          <div class="video-display-time">
            <label>时间戳</label>
            <strong>${editableField(`sellingVideo.displays.${i}.timestamp`, it.timestamp, { cls: 'edit-inline-value' })}</strong>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function renderCreativeRefImages(galleryIdx) {
  const imgs = (MOCK_DATA.imageCreative.gallery[galleryIdx] || {}).referenceImages || [];
  const maxRefImgs = 3;
  return imgs.map((img, j) => `
    <figure class="creative-ref-item">
      <img class="creative-ref-img" src="${img.url}" alt="${img.caption || ''}" loading="lazy"
           onclick="window.open('${img.url}','_blank')">
      <div class="creative-ref-overlay">
        <label class="creative-ref-ol-btn" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          替换
          <input type="file" accept="image/*" style="display:none" onchange="onRefImgReplace(event,${galleryIdx},${j})">
        </label>
        <button class="creative-ref-ol-btn" onclick="event.stopPropagation();onRefImgDelete(${galleryIdx},${j})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          删除
        </button>
      </div>
      ${img.caption ? `<figcaption class="creative-ref-caption">${img.caption}</figcaption>` : ''}
    </figure>
  `).join('') + (imgs.length < maxRefImgs ? `
    <div class="creative-ref-add" onclick="event.stopPropagation();this.querySelector('input').click()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>添加</span>
      <input type="file" accept="image/*" style="display:none" onchange="onRefImgAdd(event,${galleryIdx})">
    </div>
  ` : '');
}

function onRefImgReplace(event, galleryIdx, imgIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = MOCK_DATA.imageCreative.gallery[galleryIdx].referenceImages;
    if (arr && arr[imgIdx]) {
      arr[imgIdx].url = e.target.result;
      arr[imgIdx].caption = file.name.replace(/\.[^.]+$/, '');
    }
    refreshCreativeRefImages(galleryIdx);
  };
  reader.readAsDataURL(file);
}

function onRefImgDelete(galleryIdx, imgIdx) {
  const arr = MOCK_DATA.imageCreative.gallery[galleryIdx].referenceImages;
  if (arr) arr.splice(imgIdx, 1);
  refreshCreativeRefImages(galleryIdx);
}

function onRefImgAdd(event, galleryIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const gallery = MOCK_DATA.imageCreative.gallery[galleryIdx];
  if (!gallery.referenceImages) gallery.referenceImages = [];
  if (gallery.referenceImages.length >= 3) {
    showToast('每张创意卡片最多 3 张参考图', 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    gallery.referenceImages.push({
      url: e.target.result,
      caption: file.name.replace(/\.[^.]+$/, ''),
    });
    refreshCreativeRefImages(galleryIdx);
  };
  reader.readAsDataURL(file);
}

function refreshCreativeRefImages(galleryIdx) {
  const module = document.getElementById('mod-image-creative');
  const containers = module ? module.querySelectorAll('.creative-ref-images') : [];
  if (containers[galleryIdx]) {
    containers[galleryIdx].innerHTML = renderCreativeRefImages(galleryIdx);
  }
}

function renderCreativeBriefFields(pathPrefix, item, refImagesHtml) {
  return `
    <div class="creative-field creative-field-primary">
      <label>卖点展示</label>
      <div class="creative-main-text">${editableField(`${pathPrefix}.productPoint`, item.productPoint, { cls: 'edit-inline-value', multiline: true })}</div>
    </div>
    <div class="creative-field creative-field-design">
      <label>图片</label>
      <div class="creative-card-text">${editableField(`${pathPrefix}.designRequirement`, item.designRequirement || '', { cls: 'edit-inline-value', multiline: true })}</div>
    </div>
    <div class="creative-field creative-field-copy">
      <label>文案</label>
      <div class="creative-card-text">${editableField(`${pathPrefix}.imageCopy`, item.imageCopy || '', { cls: 'edit-inline-value', multiline: true })}</div>
    </div>
    <div class="creative-field">
      <label>参考图</label>
      <div class="creative-ref-images">${refImagesHtml}</div>
    </div>`;
}

function creativeEscSummary(s) {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return typeof escapeAiHtml === 'function' ? escapeAiHtml(t) : t;
}

function collapseAllCreativeCards(exceptIdx) {
  document.querySelectorAll('#mod-image-creative .creative-card').forEach((el, i) => {
    el.classList.toggle('expanded', exceptIdx === i);
    el.classList.toggle('collapsed', exceptIdx !== i);
  });
}

function syncCreativeChipActive(idx) {
  const bar = document.getElementById('creative-chip-bar');
  if (!bar) return;
  bar.querySelectorAll('.creative-chip').forEach(c => c.classList.remove('active'));
  const target = bar.querySelector(`.creative-chip[data-creative-idx="${idx}"]`);
  if (target) target.classList.add('active');
}

function toggleCreativeCard(idx, event) {
  if (event && event.target.closest('[contenteditable="true"], .creative-card-delete, button')) return;
  const card = document.getElementById('creative-card-' + idx);
  if (!card) return;
  const willExpand = !card.classList.contains('expanded');
  if (willExpand) {
    collapseAllCreativeCards(idx);
    syncCreativeChipActive(idx);
  } else {
    card.classList.remove('expanded');
    card.classList.add('collapsed');
  }
}

function scrollToCreativeCard(idx) {
  const card = document.getElementById('creative-card-' + idx);
  const module = document.getElementById('mod-image-creative');
  if (!card || !module) return;
  collapseAllCreativeCards(idx);
  syncCreativeChipActive(idx);
  const bar = document.getElementById('creative-chip-bar');
  const offset = bar ? bar.offsetHeight + 12 : 12;
  const top = card.getBoundingClientRect().top + window.scrollY - offset - 80;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function getGalleryImageLabel(i) {
  return i === 0 ? '主图' : ('图' + (i + 1));
}

function syncGalleryImageLabels() {
  const gallery = (MOCK_DATA.imageCreative && MOCK_DATA.imageCreative.gallery) || [];
  gallery.forEach((item, i) => { item.image = getGalleryImageLabel(i); });
}

function refreshCreativeModule(expandIdx) {
  const cfg = getResultModuleById('mod-image-creative');
  const module = document.getElementById('mod-image-creative');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  initCreativeAccordion(document, expandIdx);
}

function addGalleryItem() {
  if (!MOCK_DATA.imageCreative.gallery) MOCK_DATA.imageCreative.gallery = [];
  MOCK_DATA.imageCreative.gallery.push({
    image: '',
    benchmark: '',
    referenceImages: [],
    competitorPoint: '',
    productPoint: '',
    designRequirement: '',
    advantage: '',
    imageCopy: '',
  });
  syncGalleryImageLabels();
  refreshCreativeModule(MOCK_DATA.imageCreative.gallery.length - 1);
}

function removeGalleryItem(idx) {
  const gallery = MOCK_DATA.imageCreative.gallery || [];
  if (idx === 0) {
    showToast('主图不可删除', 'warning');
    return;
  }
  if (gallery.length <= 1) {
    showToast('至少保留 1 张图', 'warning');
    return;
  }
  gallery.splice(idx, 1);
  syncGalleryImageLabels();
  refreshCreativeModule(Math.min(idx, gallery.length - 1));
}

function initCreativeAccordion(root, expandIdx) {
  if (window.__creativeScrollObserver) {
    window.__creativeScrollObserver.disconnect();
    window.__creativeScrollObserver = null;
  }
  const scope = root || document;
  const module = scope.querySelector('#mod-image-creative');
  if (!module) return;

  const targets = [...module.querySelectorAll('.creative-card')].filter(Boolean);
  if (!targets.length) return;

  window.__creativeScrollObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const idx = visible.target.dataset.creativeIdx;
      if (idx != null) syncCreativeChipActive(idx);
    },
    { root: null, rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
  );
  targets.forEach(el => window.__creativeScrollObserver.observe(el));

  const idx = expandIdx != null ? expandIdx : 0;
  collapseAllCreativeCards(idx);
  syncCreativeChipActive(idx);
}

function renderImageCreative() {
  const data = MOCK_DATA.imageCreative;
  syncGalleryImageLabels();
  const gallery = data.gallery || [];
  return `
    <div class="creative-module-wrap">
      <div class="creative-chip-bar" id="creative-chip-bar">
        ${gallery.map((it, i) => `
          <button type="button" class="creative-chip ${i === 0 ? 'active' : ''}" data-creative-idx="${i}" onclick="scrollToCreativeCard(${i})">${it.image || getGalleryImageLabel(i)}</button>
        `).join('')}
        <button type="button" class="creative-chip-add" onclick="addGalleryItem()">+ 新增图位</button>
      </div>
      <div class="creative-gallery-list">
        ${gallery.map((it, i) => `
          <div class="creative-card ${i === 0 ? 'primary expanded' : 'collapsed'}" id="creative-card-${i}" data-creative-idx="${i}">
            <div class="creative-card-head" onclick="toggleCreativeCard(${i}, event)">
              <div class="creative-card-head-left">
                <span class="creative-card-label">${editableField(`imageCreative.gallery.${i}.image`, it.image, { cls: 'edit-inline-value' })}</span>
                ${i === 0 ? '<em class="creative-primary-badge">核心主图</em>' : ''}
                <span class="creative-card-summary">${creativeEscSummary(it.productPoint)}</span>
              </div>
              <div class="creative-card-head-actions" onclick="event.stopPropagation()">
                ${i > 0 ? `<button type="button" class="creative-card-delete" title="删除图位" onclick="removeGalleryItem(${i})">×</button>` : ''}
                <span class="creative-card-chevron" aria-hidden="true">▼</span>
              </div>
            </div>
            <div class="creative-brief-body">
              ${renderCreativeBriefFields(`imageCreative.gallery.${i}`, it, renderCreativeRefImages(i))}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderRichTextRefImages(blockIdx) {
  const imgs = (MOCK_DATA.imageCreative.richTextBlocks[blockIdx] || {}).referenceImages || [];
  const maxRefImgs = 3;
  return imgs.map((img, j) => `
    <figure class="creative-ref-item">
      <img class="creative-ref-img" src="${img.url}" alt="${img.caption || ''}" loading="lazy"
           onclick="window.open('${img.url}','_blank')">
      <div class="creative-ref-overlay">
        <label class="creative-ref-ol-btn" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          替换
          <input type="file" accept="image/*" style="display:none" onchange="onRichTextRefImgReplace(event,${blockIdx},${j})">
        </label>
        <button class="creative-ref-ol-btn" onclick="event.stopPropagation();onRichTextRefImgDelete(${blockIdx},${j})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          删除
        </button>
      </div>
      ${img.caption ? `<figcaption class="creative-ref-caption">${img.caption}</figcaption>` : ''}
    </figure>
  `).join('') + (imgs.length < maxRefImgs ? `
    <div class="creative-ref-add" onclick="event.stopPropagation();this.querySelector('input').click()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>添加</span>
      <input type="file" accept="image/*" style="display:none" onchange="onRichTextRefImgAdd(event,${blockIdx})">
    </div>
  ` : '');
}

function onRichTextRefImgReplace(event, blockIdx, imgIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = MOCK_DATA.imageCreative.richTextBlocks[blockIdx].referenceImages;
    if (arr && arr[imgIdx]) {
      arr[imgIdx].url = e.target.result;
      arr[imgIdx].caption = file.name.replace(/\.[^.]+$/, '');
    }
    refreshRichTextRefImages(blockIdx);
  };
  reader.readAsDataURL(file);
}

function onRichTextRefImgDelete(blockIdx, imgIdx) {
  const arr = MOCK_DATA.imageCreative.richTextBlocks[blockIdx].referenceImages;
  if (arr) arr.splice(imgIdx, 1);
  refreshRichTextRefImages(blockIdx);
}

function onRichTextRefImgAdd(event, blockIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const block = MOCK_DATA.imageCreative.richTextBlocks[blockIdx];
  if (!block.referenceImages) block.referenceImages = [];
  if (block.referenceImages.length >= 3) {
    showToast('每段富文本最多 3 张参考图', 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    block.referenceImages.push({
      url: e.target.result,
      caption: file.name.replace(/\.[^.]+$/, ''),
    });
    refreshRichTextRefImages(blockIdx);
  };
  reader.readAsDataURL(file);
}

function refreshRichTextRefImages(blockIdx) {
  const module = document.getElementById('mod-richtext-info');
  const containers = module ? module.querySelectorAll('.creative-ref-images') : [];
  if (containers[blockIdx]) {
    containers[blockIdx].innerHTML = renderRichTextRefImages(blockIdx);
  }
}

const RICHTEXT_CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

function getRichTextBlockLabel(i) {
  const n = i + 1;
  if (n <= RICHTEXT_CN_NUM.length) return '富文本' + RICHTEXT_CN_NUM[n - 1];
  return '富文本' + n;
}

function syncRichTextBlockTitles() {
  const blocks = (MOCK_DATA.imageCreative && MOCK_DATA.imageCreative.richTextBlocks) || [];
  blocks.forEach((b, i) => { b.title = getRichTextBlockLabel(i); });
}

function getRichTextBlocks() {
  const ic = MOCK_DATA.imageCreative || {};
  if (Array.isArray(ic.richTextBlocks) && ic.richTextBlocks.length) return ic.richTextBlocks;
  const legacy = ic.richText || [];
  const legacyImgs = ic.richTextImages || [];
  return legacy.map((it, i) => ({
    title: getRichTextBlockLabel(i),
    productPoint: it.content || '',
    designRequirement: (legacyImgs[i] && legacyImgs[i].image) || '',
    imageCopy: '',
    referenceImages: [],
  }));
}

function collapseAllRichTextCards(exceptIdx) {
  document.querySelectorAll('#mod-richtext-info .creative-card').forEach((el, i) => {
    el.classList.toggle('expanded', exceptIdx === i);
    el.classList.toggle('collapsed', exceptIdx !== i);
  });
}

function syncRichTextChipActive(idx) {
  const bar = document.getElementById('richtext-chip-bar');
  if (!bar) return;
  bar.querySelectorAll('.creative-chip').forEach(c => c.classList.remove('active'));
  const target = bar.querySelector(`.creative-chip[data-richtext-idx="${idx}"]`);
  if (target) target.classList.add('active');
}

function toggleRichTextCard(idx, event) {
  if (event && event.target.closest('[contenteditable="true"], .creative-card-delete, button')) return;
  const card = document.getElementById('richtext-card-' + idx);
  if (!card) return;
  const willExpand = !card.classList.contains('expanded');
  if (willExpand) {
    collapseAllRichTextCards(idx);
    syncRichTextChipActive(idx);
  } else {
    card.classList.remove('expanded');
    card.classList.add('collapsed');
  }
}

function scrollToRichTextCard(idx) {
  const card = document.getElementById('richtext-card-' + idx);
  const module = document.getElementById('mod-richtext-info');
  if (!card || !module) return;
  collapseAllRichTextCards(idx);
  syncRichTextChipActive(idx);
  const bar = document.getElementById('richtext-chip-bar');
  const offset = bar ? bar.offsetHeight + 12 : 12;
  const top = card.getBoundingClientRect().top + window.scrollY - offset - 80;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function initRichTextAccordion(root, expandIdx) {
  if (window.__richtextScrollObserver) {
    window.__richtextScrollObserver.disconnect();
    window.__richtextScrollObserver = null;
  }
  const scope = root || document;
  const module = scope.querySelector('#mod-richtext-info');
  if (!module) return;

  const idx = expandIdx != null ? expandIdx : 0;
  collapseAllRichTextCards(idx);
  syncRichTextChipActive(idx);

  const targets = [...module.querySelectorAll('.creative-card')].filter(Boolean);
  if (!targets.length) return;

  window.__richtextScrollObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const i = visible.target.dataset.richtextIdx;
      if (i != null) syncRichTextChipActive(i);
    },
    { root: null, rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
  );
  targets.forEach(el => window.__richtextScrollObserver.observe(el));
}

function refreshRichTextModule(expandIdx) {
  const cfg = getResultModuleById('mod-richtext-info');
  const module = document.getElementById('mod-richtext-info');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  initRichTextAccordion(document, expandIdx);
}

function addRichTextBlock() {
  if (!MOCK_DATA.imageCreative.richTextBlocks) MOCK_DATA.imageCreative.richTextBlocks = [];
  MOCK_DATA.imageCreative.richTextBlocks.push({
    title: '',
    productPoint: '',
    designRequirement: '',
    imageCopy: '',
    referenceImages: [],
  });
  syncRichTextBlockTitles();
  refreshRichTextModule(MOCK_DATA.imageCreative.richTextBlocks.length - 1);
}

function removeRichTextBlock(idx) {
  const blocks = MOCK_DATA.imageCreative.richTextBlocks || [];
  if (blocks.length <= 1) {
    showToast('至少保留 1 段富文本', 'warning');
    return;
  }
  blocks.splice(idx, 1);
  syncRichTextBlockTitles();
  refreshRichTextModule(Math.min(idx, blocks.length - 1));
}

function renderRichTextInfo() {
  const blocks = getRichTextBlocks();
  if (!MOCK_DATA.imageCreative.richTextBlocks) MOCK_DATA.imageCreative.richTextBlocks = blocks;
  syncRichTextBlockTitles();
  return `
    <div class="creative-module-wrap">
      <div class="creative-chip-bar richtext-chip-bar" id="richtext-chip-bar">
        ${blocks.map((it, i) => `
          <button type="button" class="creative-chip ${i === 0 ? 'active' : ''}" data-richtext-idx="${i}" onclick="scrollToRichTextCard(${i})">${getRichTextBlockLabel(i)}</button>
        `).join('')}
        <button type="button" class="creative-chip-add" onclick="addRichTextBlock()">+ 新增段落</button>
      </div>
      <div class="creative-gallery-list">
        ${blocks.map((it, i) => `
          <div class="creative-card ${i === 0 ? 'expanded' : 'collapsed'}" id="richtext-card-${i}" data-richtext-idx="${i}">
            <div class="creative-card-head" onclick="toggleRichTextCard(${i}, event)">
              <div class="creative-card-head-left">
                <span class="creative-card-label">${getRichTextBlockLabel(i)}</span>
                <span class="creative-card-summary">${creativeEscSummary(it.productPoint)}</span>
              </div>
              <div class="creative-card-head-actions" onclick="event.stopPropagation()">
                ${blocks.length > 1 ? `<button type="button" class="creative-card-delete" title="删除段落" onclick="removeRichTextBlock(${i})">×</button>` : ''}
                <span class="creative-card-chevron" aria-hidden="true">▼</span>
              </div>
            </div>
            <div class="creative-brief-body">
              ${renderCreativeBriefFields(`imageCreative.richTextBlocks.${i}`, it, renderRichTextRefImages(i))}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderFaqExtra() {
  return `
    <div class="faq-shot-board-v2">
      <div class="faq-shot-grid" id="faq-shot-grid">
        ${renderFaqShots()}
      </div>
    </div>`;
}

function renderFaqShots() {
  const arr = (MOCK_DATA.faqSupplement && MOCK_DATA.faqSupplement.screenshots) || [];
  const max = 12;
  return arr.map((img, j) => `
    <figure class="faq-shot-item">
      <img class="faq-shot-img" src="${img.url}" alt="${img.caption || ''}" loading="lazy"
           onclick="window.open('${img.url}','_blank')">
      <div class="faq-shot-overlay">
        <label class="faq-shot-ol-btn" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          替换
          <input type="file" accept="image/*" style="display:none" onchange="onFaqShotReplace(event,${j})">
        </label>
        <button class="faq-shot-ol-btn" onclick="event.stopPropagation();onFaqShotDelete(${j})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          删除
        </button>
      </div>
      <figcaption class="faq-shot-caption">${editableField(`faqSupplement.screenshots.${j}.caption`, img.caption || '', { cls: 'edit-inline-value' })}</figcaption>
    </figure>
  `).join('') + (arr.length < max ? `
    <div class="faq-shot-add" onclick="event.stopPropagation();this.querySelector('input').click()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>添加截图</span>
      <input type="file" accept="image/*" style="display:none" onchange="onFaqShotAdd(event)">
    </div>` : '');
}

function onFaqShotReplace(event, idx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const arr = MOCK_DATA.faqSupplement.screenshots;
    if (arr && arr[idx]) {
      arr[idx].url = e.target.result;
      arr[idx].caption = arr[idx].caption || file.name.replace(/\.[^.]+$/, '');
    }
    refreshFaqShots();
  };
  reader.readAsDataURL(file);
}

function onFaqShotDelete(idx) {
  const arr = MOCK_DATA.faqSupplement.screenshots;
  if (arr) arr.splice(idx, 1);
  refreshFaqShots();
}

function onFaqShotAdd(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const arr = MOCK_DATA.faqSupplement.screenshots = MOCK_DATA.faqSupplement.screenshots || [];
  if (arr.length >= 12) { showToast('最多上传 12 张截图', 'warning'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    arr.push({ url: e.target.result, caption: file.name.replace(/\.[^.]+$/, '') });
    refreshFaqShots();
  };
  reader.readAsDataURL(file);
}

function refreshFaqShots() {
  const grid = document.getElementById('faq-shot-grid');
  if (grid) grid.innerHTML = renderFaqShots();
}

// ===== 6. 目标人群 =====
function renderAudience() {
  const a = MOCK_DATA.audience;
  return `
    <div class="info-grid-2">
      ${[
        { label: '性别',      path: 'audience.gender',       val: a.gender },
        { label: '年龄',      path: 'audience.age',          val: a.age },
        { label: '社会地位',  path: 'audience.socialStatus', val: a.socialStatus },
        { label: '身份认同',  path: 'audience.identity',     val: a.identity },
      ].map(item =>
        `<div class="info-grid-item">
          <div class="label">${item.label}</div>
          <div class="value">${editableField(item.path, item.val, { cls: 'edit-inline-value', multiline: true })}</div>
        </div>`
      ).join('')}
    </div>
    <div class="prod-section" style="margin-top:16px;">
      <div class="prod-section-label">用户信息 <span class="prod-section-hint">(${a.userInfo.length} 项；如不同记忆棉产品可按身高 / 体重等维度推荐使用人群)</span></div>
      <table class="compact-table">
        <thead><tr><th style="width:160px;">维度</th><th>说明</th></tr></thead>
        <tbody>
          ${a.userInfo.map((u, i) => `
            <tr>
              <td>${editableField(`audience.userInfo.${i}.label`, u.label, { cls: 'edit-inline-value' })}</td>
              <td>${editableField(`audience.userInfo.${i}.value`, u.value, { cls: 'edit-inline-value', multiline: true })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ===== 7. 用户痛点 =====
function refreshPainModule(focusPath = '') {
  const module = document.getElementById('mod-pain');
  const cfg = getActiveResultModules().find(m => m.id === 'mod-pain');
  if (!module || !cfg) return;
  module.outerHTML = renderModuleCard(cfg);
  if (focusPath) {
    setTimeout(() => {
      const el = document.querySelector(`[data-path="${focusPath}"]`);
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }, 0);
  }
}

function addPainItem() {
  if (!Array.isArray(MOCK_DATA.pain)) MOCK_DATA.pain = [];
  MOCK_DATA.pain.push({ pain: '' });
  refreshPainModule(`pain.${MOCK_DATA.pain.length - 1}.pain`);
}

function removePainItem(index) {
  if (!Array.isArray(MOCK_DATA.pain) || !MOCK_DATA.pain[index]) return;
  MOCK_DATA.pain.splice(index, 1);
  refreshPainModule();
  if (typeof showToast === 'function') showToast(`已删除痛点 ${index + 1}`, 'success');
}

function renderPain() {
  return `<div class="pain-module-tools">
    <button type="button" class="pain-add-btn" onclick="addPainItem()">+ 新增痛点</button>
  </div>
  <div class="pain-list pain-list-simple">
    ${MOCK_DATA.pain.map((p, i) => `
      <div class="pain-row">
        <div class="pain-row-num">${i + 1}</div>
        <div class="pain-row-body">
          <div class="pain-row-label">痛点 ${i + 1}</div>
          <div class="pain-row-text">${editableField(`pain.${i}.pain`, p.pain, { cls: 'edit-inline-value', multiline: true })}</div>
        </div>
        <button type="button" class="pain-row-delete" title="删除" onclick="removePainItem(${i})">×</button>
      </div>
    `).join('')}
  </div>`;
}

// ===== 8. 产品 STP（关键拼比表）=====
function renderSTP() {
  const stp = MOCK_DATA.stp;
  return `<div class="stp-compare-wrap">
    <table class="compact-table stp-compare-table">
      <thead>
        <tr>
          <th class="stp-col-key">关键拼比项</th>
          ${stp.columns.map((c, ci) => `
            <th class="${ci === 0 ? 'stp-col-self' : ''}">
              <div class="stp-col-name">${editableField(`stp.columns.${ci}.name`, c.name, { cls: 'edit-inline-value' })}</div>
              ${c.sub ? `<div class="stp-col-sub">${editableField(`stp.columns.${ci}.sub`, c.sub, { cls: 'edit-inline-value' })}</div>` : ''}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="stp-col-key">图片</td>
          ${stp.columns.map((c, ci) => `
            <td class="${ci === 0 ? 'stp-col-self' : ''} stp-img-cell">
              ${renderProductImageUpload(c.image, c.name, `stp.columns.${ci}.image`, 'compact')}
            </td>
          `).join('')}
        </tr>
        ${stp.rows.map((r, ri) => `
          <tr>
            <td class="stp-col-key">${editableField(`stp.rows.${ri}.label`, r.label, { cls: 'edit-inline-value' })}</td>
            ${r.values.map((v, ci) => `
              <td class="${ci === 0 ? 'stp-col-self' : ''}">${editableField(`stp.rows.${ri}.values.${ci}`, v, { cls: 'edit-inline-value' })}</td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

// ===== 结果页交互 =====
function scrollToModule(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // 高亮闪一下
  target.style.transition = 'box-shadow 0.4s ease';
  target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.3)';
  setTimeout(() => { target.style.boxShadow = ''; }, 1200);
}

function setupScrollSpy() {
  const items = document.querySelectorAll('.result-nav-item');
  const sections = getActiveResultModules().map(m => document.getElementById(m.id));
  const onScroll = () => {
    const offset = 200;
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top <= offset) {
        activeIdx = i;
      }
    }
    items.forEach((it, i) => it.classList.toggle('active', i === activeIdx));
  };
  window.removeEventListener('scroll', window.__resultScroll);
  window.__resultScroll = onScroll;
  window.addEventListener('scroll', onScroll);
}

function toggleModule(id, e) {
  if (e) e.stopPropagation();
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.toggle('collapsed');
}

function toggleAllSections() {
  const cards = document.querySelectorAll('.module-card');
  const allCollapsed = Array.from(cards).every(c => c.classList.contains('collapsed'));
  cards.forEach(c => c.classList.toggle('collapsed', !allCollapsed));
  document.getElementById('toggle-all-text').textContent = allCollapsed ? '折叠全部' : '展开全部';
}

function confirmModule(id) {
  const btn = document.getElementById(`confirm-${id}`);
  const card = document.getElementById(id);
  if (confirmedModules.has(id)) {
    confirmedModules.delete(id);
    if (btn)  btn.classList.remove('confirmed');
    if (card) card.classList.remove('confirmed');
    showToast('已取消确认', 'warning');
  } else {
    confirmedModules.add(id);
    if (btn)  btn.classList.add('confirmed');
    if (card) card.classList.add('confirmed');
    showToast('已确认采纳', 'success');
  }
}

function copyModule(id) {
  const m = getResultModuleById(id);
  showToast(`「${m ? m.title : '内容'}」已复制到剪贴板`, 'success');
  try { navigator.clipboard.writeText(`【${m.title}】内容`); } catch (e) {}
}


function regenerateModule(id) {
  const m = getResultModuleById(id);
  showToast(`正在重新生成「${m.title}」...`, 'success');
  const card = document.getElementById(id);
  if (card) {
    card.style.opacity = '0.5';
    setTimeout(() => {
      card.style.opacity = '1';
      showToast(`「${m.title}」已重新生成`, 'success');
    }, 1500);
  }
}

function previewImage(name) {
  showToast(`预览图片：${name}`, 'success');
}

// ===== 详情弹窗 =====
let modalCurrentContent = '';
function openDetailModal(id) {
  const m = getResultModuleById(id);
  if (!m) return;
  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-subtitle').textContent = m.desc;
  let html = '';
  let copyText = '';
  switch (id) {
    case 'mod-basic':
      html = `<table class="compact-table"><tbody>
        ${getResultBasicRows().map(b => `<tr><td style="width:40%;color:var(--text-muted);">${b.label}</td><td><strong>${b.value}</strong></td></tr>`).join('')}
      </tbody></table>`;
      copyText = getResultBasicRows().map(b => `${b.label}: ${b.value}`).join('\n');
      break;
    case 'mod-optimization': {
      const data = MOCK_DATA.optimization;
      const originals = getOptimizationOriginals();
      html = `
        <p><strong>优化目标：</strong>${data.summary.target}</p>
        <p style="margin-top:8px;"><strong>优化范围：</strong>${data.summary.scope}</p>
        <p style="margin-top:12px;"><strong>优化的原文：</strong></p>
        <table class="compact-table"><tbody>
          ${originals.items.map(item => `<tr><td style="width:32%;color:var(--text-muted);">${item.label}</td><td>${item.value}</td></tr>`).join('')}
        </tbody></table>
        <p style="margin-top:12px;"><strong>优化的理由：</strong></p>
        <ol style="padding-left:20px;line-height:1.7;">${data.reasons.map(t => `<li>${t}</li>`).join('')}</ol>
        <p style="margin-top:12px;"><strong>优化的地方：</strong>${data.areas.join('、')}</p>
        <p style="margin-top:12px;"><strong>如何优化：</strong></p>
        <table class="compact-table">
          <thead><tr><th>问题</th><th>优化动作</th><th>预期效果</th></tr></thead>
          <tbody>${data.actions.map(a => `<tr><td>${a.problem}</td><td>${a.action}</td><td>${a.effect}</td></tr>`).join('')}</tbody>
        </table>`;
      copyText = [
        `优化目标：${data.summary.target}`,
        `优化范围：${data.summary.scope}`,
        `优化的原文：${originals.items.map(item => `${item.label}: ${item.value}`).join('；')}`,
        `优化的理由：${data.reasons.join('；')}`,
        `优化的地方：${data.areas.join('、')}`,
        `如何优化：${data.actions.map(a => `${a.problem} -> ${a.action} -> ${a.effect}`).join('；')}`,
      ].join('\n');
      break;
    }
    case 'mod-image-opt-creative': {
      const gallery = (MOCK_DATA.optimizationImageCreative && MOCK_DATA.optimizationImageCreative.gallery) || [];
      html = gallery.map(it => `
          <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
            <p><strong>${it.image || ''}</strong></p>
            <p style="margin-top:6px;"><strong>卖点展示：</strong>${it.productPoint || ''}</p>
            <p><strong>图片：</strong>${it.designRequirement || ''}</p>
            <p><strong>文案：</strong>${it.imageCopy || ''}</p>
          </div>
        `).join('');
      copyText = gallery.map(it => `${it.image}\n卖点展示：${it.productPoint || ''}\n图片：${it.designRequirement || ''}\n文案：${it.imageCopy || ''}`).join('\n\n');
      break;
    }
    case 'mod-richtext-opt-info': {
      const blocks = getOptRichTextBlocks();
      html = blocks.map((it, i) => `
          <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
            <p><strong>${getRichTextBlockLabel(i)}</strong></p>
            <p style="margin-top:6px;"><strong>卖点展示：</strong>${it.productPoint || ''}</p>
            <p><strong>图片：</strong>${it.designRequirement || ''}</p>
            <p><strong>文案：</strong>${it.imageCopy || ''}</p>
          </div>
        `).join('');
      copyText = blocks.map((it, i) => `${getRichTextBlockLabel(i)}\n卖点展示：${it.productPoint || ''}\n图片：${it.designRequirement || ''}\n文案：${it.imageCopy || ''}`).join('\n\n');
      break;
    }
    case 'mod-product': {
      const p = MOCK_DATA.product;
      if (isSellingPointImageDemand()) {
        const img = MOCK_DATA.imageProduct;
        html = `
          ${p.image ? `<p><img src="${p.image}" alt="${p.imageAlt||''}" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" /></p>` : ''}
          <p style="margin-top:8px;"><strong>产品定位：</strong>${p.positioning}</p>
          <p style="margin-top:12px;"><strong>竞对主要客诉点：</strong></p>
          <ol style="padding-left:20px;line-height:1.7;">${img.complaints.map(t => `<li>${t}</li>`).join('')}</ol>
          <p style="margin-top:12px;"><strong>出货清单：</strong>${img.packingList.join('、')}</p>`;
        copyText = `${p.positioning}\n\n客诉点：${img.complaints.join('；')}\n\n出货清单：${img.packingList.join('、')}`;
        break;
      }
      html = `
        ${p.image ? `<p><img src="${p.image}" alt="${p.imageAlt||''}" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" /></p>` : ''}
        <p style="margin-top:8px;"><strong>产品定位：</strong></p>
        <p style="line-height:1.7;">${p.positioning}</p>
        <p style="margin-top:12px;"><strong>产品信用状：</strong></p>
        <table class="compact-table">
          <tbody>${p.credentials.map(c => `<tr><td style="width:40%;color:var(--text-muted);">${c.label}</td><td>${c.value}</td></tr>`).join('')}</tbody>
        </table>
        <p style="margin-top:12px;"><strong>适用病症：</strong>${p.indications.join('、')}</p>
        <p style="margin-top:12px;"><strong>K 号信息：</strong></p>
        <table class="compact-table">
          <tbody>${p.kInfo.map(k => `<tr><td style="width:40%;color:var(--text-muted);">${k.label}</td><td>${k.value}</td></tr>`).join('')}</tbody>
        </table>`;
      copyText = `${p.positioning}\n\n适用病症：${p.indications.join('、')}`;
      break;
    }
    case 'mod-seo': {
      const s = MOCK_DATA.seo;
      html = `<table class="compact-table">
        <thead><tr><th>SEO</th><th style="width:200px;">Search Frequency Rank</th><th style="width:80px;">相关性</th></tr></thead>
        <tbody>
          ${s.rows.map(r => `<tr><td>${r.keyword}</td><td>${r.rank}</td><td>${r.relevance}</td></tr>`).join('')}
        </tbody>
      </table>`;
      copyText = s.rows.map(r => `${r.keyword}\t${r.rank}\t${r.relevance}`).join('\n');
      break;
    }
    case 'mod-competitor':
      html = MOCK_DATA.competitor.map((c, i) => `
        <div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid var(--border);">
          <p><strong>竞品 ${i + 1}：${c.brand}</strong> · ASIN: <code>${c.asin}</code></p>
          <p style="margin-top:6px;">大类：${c.rankBig} ｜ 小类：${c.rankSmall}</p>
          <p>总变体销量：${c.totalVariantSales} ｜ 主体销量：${c.mainSales}</p>
          <p style="margin-top:8px;"><strong>Title：</strong>${c.title}</p>
          <p style="margin-top:8px;"><strong>TD：</strong></p>
          <ol style="padding-left:20px;line-height:1.7;">${c.tds.map(t => `<li>${t}</li>`).join('')}</ol>
        </div>
      `).join('');
      break;
    case 'mod-selling': {
      const sd = MOCK_DATA.selling;
      const sec = (label, items) => `
        <p style="margin-top:10px;"><strong style="color:var(--primary);">[${label}]</strong></p>
        ${items.map((s, i) => `<p style="margin:4px 0 6px 12px;"><strong>${i+1}. ${s.title}</strong></p>`).join('')}
      `;
      html = sec('USP 独特卖点', sd.usp) + sec('KSP 核心卖点', sd.ksp) + sec('OSP 补充卖点', sd.osp);
      break;
    }
    case 'mod-audience': {
      const a = MOCK_DATA.audience;
      html = `
        <p><strong>性别：</strong>${a.gender}</p>
        <p><strong>年龄：</strong>${a.age}</p>
        <p><strong>社会地位：</strong>${a.socialStatus}</p>
        <p><strong>身份认同：</strong>${a.identity}</p>
        <p style="margin-top:10px;"><strong>用户信息：</strong></p>
        <table class="compact-table">
          <tbody>${a.userInfo.map(u => `<tr><td style="width:40%;color:var(--text-muted);">${u.label}</td><td>${u.value}</td></tr>`).join('')}</tbody>
        </table>`;
      break;
    }
    case 'mod-pain':
      html = MOCK_DATA.pain.map((p, i) => `<p style="margin-bottom:8px;"><strong style="color:#ef4444;">痛点 ${i+1}：</strong>${p.pain}</p>`).join('');
      break;
    case 'mod-stp': {
      const s = MOCK_DATA.stp;
      html = `<table class="compact-table">
        <thead><tr><th>关键拼比项</th>${s.columns.map(c => `<th>${c.name}${c.sub ? `<br><small style="color:var(--text-light);">${c.sub}</small>` : ''}</th>`).join('')}</tr></thead>
        <tbody>${s.rows.map(r => `<tr><td>${r.label}</td>${r.values.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
      break;
    }
    case 'mod-image-creative': {
      const c = MOCK_DATA.imageCreative;
      html = c.gallery.map((it, i) => `
          <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
            <p><strong>${it.image}${i === 0 ? '（核心主图）' : ''}</strong></p>
            <p style="margin-top:6px;"><strong>卖点展示：</strong>${it.productPoint || ''}</p>
            <p><strong>图片：</strong>${it.designRequirement || ''}</p>
            <p><strong>文案：</strong>${it.imageCopy || ''}</p>
          </div>
        `).join('');
      copyText = c.gallery.map(it => `${it.image}\n卖点展示：${it.productPoint || ''}\n图片：${it.designRequirement || ''}\n文案：${it.imageCopy || ''}`).join('\n\n');
      break;
    }
    case 'mod-richtext-info': {
      const blocks = getRichTextBlocks();
      html = blocks.map((it, i) => `
          <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
            <p><strong>${getRichTextBlockLabel(i)}</strong></p>
            <p style="margin-top:6px;"><strong>卖点展示：</strong>${it.productPoint || ''}</p>
            <p><strong>图片：</strong>${it.designRequirement || ''}</p>
            <p><strong>文案：</strong>${it.imageCopy || ''}</p>
          </div>
        `).join('');
      copyText = blocks.map((it, i) => `${getRichTextBlockLabel(i)}\n卖点展示：${it.productPoint || ''}\n图片：${it.designRequirement || ''}\n文案：${it.imageCopy || ''}`).join('\n\n');
      break;
    }
    default:
      html = `<p style="color:var(--text-muted);">该模块的详细预览（${m.title}）...</p>`;
  }
  modalCurrentContent = copyText || m.title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('detail-modal').classList.add('show');
}

function closeDetailModal(e) {
  if (e && e.target.id !== 'detail-modal') return;
  document.getElementById('detail-modal').classList.remove('show');
}

function copyModalContent() {
  showToast('内容已复制', 'success');
  try { navigator.clipboard.writeText(modalCurrentContent || '内容已复制'); } catch (e) {}
}

// ===== 结果页操作 =====
function renderResultReuseBanner() {
  const el = document.getElementById('result-reuse-banner');
  if (!el) return;
  const pack = (typeof skuPackReuseMode !== 'undefined' && skuPackReuseMode && typeof getSkuParsedPack === 'function')
    ? getSkuParsedPack(typeof skuList !== 'undefined' ? skuList[0] : '')
    : null;
  if (!pack) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  const sku = (typeof skuList !== 'undefined' && skuList[0]) || '';
  el.style.display = '';
  el.innerHTML = `已沿用 SKU <strong>${sku}</strong> 于 ${pack.parsedAt} 解析的资料（来源：${pack.sourceType}）。如与本次需求不符，请返回上一步重新上传。`;
}

function backToWizard() {
  skuPackReuseMode = false;
  forceReparse = true;
  document.getElementById('result-main').style.display = 'none';
  document.getElementById('wizard-main').style.display = 'block';
  setStep(2);
  if (typeof syncStep2ReparseUi === 'function') syncStep2ReparseUi();
  if (window.__resultScroll) window.removeEventListener('scroll', window.__resultScroll);
}

function exportResult() {
  showToast('结果导出中... (Excel + 图片打包)', 'success');
  setTimeout(() => showToast('已导出至下载文件夹', 'success'), 1200);
}

function getDesignDemandCanonicalType() {
  const { stage, biz } = getCurrentResultType();
  if (biz === 'listing7') return stage === 'old' ? '优化卖点图片' : '新品图片文案';
  return getCurrentRequirementLabel();
}

function captureDesignBriefSnapshot() {
  const cloneGallery = (gallery) => (gallery || []).map((it) => ({
    image: it.image || '',
    productPoint: it.productPoint || '',
    designRequirement: it.designRequirement || '',
    referenceImages: (it.referenceImages || []).slice(),
  }));
  const cloneRichText = (blocks) => (blocks || []).map((b) => ({
    title: b.title || '',
    productPoint: b.productPoint || '',
    designRequirement: b.designRequirement || '',
    imageCopy: b.imageCopy || '',
    referenceImages: (b.referenceImages || []).slice(),
  }));
  if (isOptimizationImageDemand()) {
    return {
      gallery: cloneGallery((MOCK_DATA.optimizationImageCreative || {}).gallery),
      richTextBlocks: cloneRichText(getOptRichTextBlocks()),
    };
  }
  return {
    gallery: cloneGallery((MOCK_DATA.imageCreative || {}).gallery),
    richTextBlocks: cloneRichText(getRichTextBlocks()),
  };
}

function buildDesignSubmitMeta() {
  const submitTime = typeof formatDesignSubmitTime === 'function'
    ? formatDesignSubmitTime()
    : new Date().toLocaleString('zh-CN');
  const siteVal = document.getElementById('site') ? document.getElementById('site').value : 'us';
  const subSel = document.getElementById('subcategory');
  const subValue = subSel ? subSel.value : '';
  const subLabel = subValue && typeof getSubcategoryLabel === 'function'
    ? getSubcategoryLabel(subValue)
    : (subValue || '');
  const skuCode = skuList[0] || 'PO17X4011';
  const skuInfo = (typeof allSkusData !== 'undefined' ? allSkusData : []).find((s) => s.code === skuCode);
  const productName = skuInfo ? skuInfo.name : '7格便携药盒';
  const brand = /ZIKEE/i.test(productName) ? 'ZIKEE' : (/AMOOS/i.test(productName) ? 'AMOOS' : 'AUVON');
  const siteCode = String(siteVal || 'us').toUpperCase().replace(/^.*\s/, '').slice(0, 2);
  const productImage = (MOCK_DATA.product && MOCK_DATA.product.image) || (skuInfo && skuInfo.image) || '';
  return {
    designSync: true,
    sku: skuCode,
    type: getDesignDemandCanonicalType(),
    site: siteCode === 'US' || siteCode.length <= 3 ? siteCode : 'US',
    brand,
    sub: subLabel,
    name: productName,
    productImage,
    productImageAlt: productName,
    submit_time: submitTime,
    design_delivery: typeof getDesignDeliveryDate === 'function' ? getDesignDeliveryDate() : '',
    launch_date: document.getElementById('product-launch-date')
      ? (document.getElementById('product-launch-date').value || '')
      : '',
    brief: captureDesignBriefSnapshot(),
  };
}

function tryCreateDesignTaskOnSubmit() {
  if (!isSellingPointImageDemand()) return null;
  if (typeof isDesignDeptEnabled !== 'function' || !isDesignDeptEnabled()) return null;
  if (typeof createDesignTaskFromSubmit !== 'function') return null;
  return createDesignTaskFromSubmit(buildDesignSubmitMeta());
}

function submitRequirement() {
  const designQueued = typeof isDesignDeptEnabled === 'function' && isDesignDeptEnabled();
  if (isOptimizationImageDemand()) {
    showToast('优化需求已提交，进入排期队列', 'success');
    if (designQueued) tryCreateDesignTaskOnSubmit();
    setTimeout(() => {
      showToast(designQueued ? '设计需求已同步，等待文案定稿后通知设计' : '文案将按图位修改说明处理', 'success');
    }, 1000);
    return;
  }
  const num = confirmedModules.size;
  const total = getActiveResultModules().length;
  if (num === 0) {
    if (!confirm(`您还未确认任何模块，是否直接提交全部 ${total} 个模块？`)) return;
  } else if (num < total) {
    if (!confirm(`已确认 ${num}/${total} 个模块，未确认的部分将按默认采纳，是否继续提交？`)) return;
  }
  showToast('需求已提交，进入排期队列', 'success');
  if (designQueued) tryCreateDesignTaskOnSubmit();
  setTimeout(() => {
    showToast(designQueued ? '设计需求已同步，等待文案定稿后通知设计' : '系统将在工作日内完成处理', 'success');
  }, 1000);
}

// ===== 重置 =====
function resetStep1() {
  // 重置需求类型选择器
  currentStage = 'new';
  currentBiz = null;
  currentSub = null;
  document.querySelectorAll('.stage-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.stage === 'new')
  );
  renderBizGrid();
  renderSubGrid();
  syncReqType();
  document.getElementById('req-type-error').classList.remove('show');

  ['site','subcategory','delivery-date','product-launch-date','demand-remark','design-delivery-date'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    clearError(el);
  });
  if (typeof designDeptEnabled !== 'undefined') designDeptEnabled = false;
  const designBtn = document.getElementById('design-dept-toggle');
  const designFields = document.getElementById('design-dept-fields');
  if (designBtn) designBtn.classList.remove('active');
  if (designFields) designFields.style.display = 'none';
  const designWarn = document.getElementById('design-date-warn');
  if (designWarn) designWarn.style.display = 'none';
  if (typeof updateDesignDeptField === 'function') updateDesignDeptField();
  subcategorySearchQuery = '';
  const subSearch = document.getElementById('subcategory-search');
  if (subSearch) subSearch.value = '';
  closeSubcategoryDropdown();
  if (typeof renderSubcategoryTrigger === 'function') renderSubcategoryTrigger();
  if (typeof renderSubcategoryOptions === 'function') renderSubcategoryOptions();
  // 重置 SKU 选择器
  skuList = [];
  skuPool = [];
  skuSearchQuery = '';
  const search = document.getElementById('sku-search');
  if (search) search.value = '';
  const trigger = document.getElementById('sku-trigger');
  trigger.disabled = true;
  trigger.style.borderColor = '';
  closeSkuDropdown();
  document.getElementById('sku-pool-total').textContent = '0';
  renderSkuTrigger();
  renderSkuChips();
  renderSkuOptions();
  forceReparse = false;
  skuPackReuseMode = false;
  if (typeof updateSkuParsedHint === 'function') updateSkuParsedHint();
}

function clearUpload() {
  clearAllFeishuLinks();
  removeFile();
}

// ===== 工具函数 =====
function updateCharCount(el, countId) {
  document.getElementById(countId).textContent = el.value.length;
}

function goBack() {
  goToList();
}

// ============================================
// ===== 列表页相关 =====
// ============================================

// ===== Excel 导出 =====
function exportResultExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Excel 库加载失败，请刷新页面重试', 'error');
    return;
  }
  if (isOptimizationImageDemand()) {
    exportOptimizationResultExcel();
    return;
  }
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: 基础信息 ---
  const basicRows = getResultBasicRows();
  const s1Data = [['字段名', '值']];
  basicRows.forEach(r => s1Data.push([r.label, r.value]));
  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 18 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, '基础信息');

  // --- Sheet 2: 产品信息 ---
  const prod = MOCK_DATA.product || {};
  const imgProd = MOCK_DATA.imageProduct || {};
  const s2Data = [];
  s2Data.push(['【产品定位】']);
  s2Data.push([prod.positioning || '']);
  s2Data.push([]);
  s2Data.push(['【竞对主要客诉点】']);
  s2Data.push(['序号', '客诉内容']);
  (imgProd.complaints || []).forEach((c, i) => s2Data.push([i + 1, c]));
  s2Data.push([]);
  s2Data.push(['【出货清单】']);
  s2Data.push(['序号', '清单项']);
  (imgProd.packingList || []).forEach((p, i) => s2Data.push([i + 1, p]));
  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 14 }, { wch: 50 }, { wch: 16 }, { wch: 44 }];
  XLSX.utils.book_append_sheet(wb, ws2, '产品信息');

  // --- Sheet 3: 卖点信息 ---
  const sell = MOCK_DATA.selling || {};
  const s3Data = [['分组', '序号', '卖点标题']];
  ['usp', 'ksp', 'osp'].forEach(group => {
    const label = group.toUpperCase();
    (sell[group] || []).forEach((item, i) => {
      s3Data.push([label, i + 1, item.title]);
    });
  });
  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  ws3['!cols'] = [{ wch: 8 }, { wch: 6 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws3, '卖点信息');

  // --- Sheet 4: 卖点创意信息 ---
  const creative = MOCK_DATA.imageCreative || {};
  const s4Data = [];
  s4Data.push(['【图片创意】']);
  s4Data.push(['图序号', '卖点展示', '图片', '文案']);
  (creative.gallery || []).forEach(g => {
    s4Data.push([g.image, g.productPoint, g.designRequirement || '', g.imageCopy || '']);
  });
  const ws4 = XLSX.utils.aoa_to_sheet(s4Data);
  ws4['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws4, '卖点创意信息');

  // --- Sheet 5: 富文本信息 ---
  const rtBlocks = (typeof getRichTextBlocks === 'function') ? getRichTextBlocks() : (creative.richTextBlocks || []);
  const s5Data = [];
  s5Data.push(['段落标题', '卖点展示', '图片', '文案']);
  rtBlocks.forEach((b, i) => {
    s5Data.push([getRichTextBlockLabel(i), b.productPoint, b.designRequirement || '', b.imageCopy || '']);
  });
  const ws5 = XLSX.utils.aoa_to_sheet(s5Data);
  ws5['!cols'] = [{ wch: 18 }, { wch: 40 }, { wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws5, '富文本信息');

  const skuCode = (getResultBasicRows().find(r => r.label === 'SKU') || {}).value || 'export';
  XLSX.writeFile(wb, `图片文案模板_${skuCode}_${new Date().toISOString().slice(0,10)}.xlsx`);
  showToast('Excel 模板已导出', 'success');
}

function exportOptimizationResultExcel() {
  const wb = XLSX.utils.book_new();

  const basicRows = getResultBasicRows();
  const s1Data = [['字段名', '值']];
  basicRows.forEach(r => s1Data.push([r.label, r.value]));
  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 18 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, '基础信息');

  const optCreative = MOCK_DATA.optimizationImageCreative || {};
  const s2Data = [['图位', '卖点展示', '图片', '文案']];
  (optCreative.gallery || []).forEach(g => {
    s2Data.push([g.image, g.productPoint, g.designRequirement || '', g.imageCopy || '']);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws2, '卖点图片优化');

  const optBlocks = getOptRichTextBlocks();
  const s3Data = [['段落标题', '卖点展示', '图片', '文案']];
  optBlocks.forEach((b, i) => {
    s3Data.push([getRichTextBlockLabel(i), b.productPoint, b.designRequirement || '', b.imageCopy || '']);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  ws3['!cols'] = [{ wch: 18 }, { wch: 40 }, { wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws3, '富文本优化');

  const skuCode = (getResultBasicRows().find(r => r.label === 'SKU') || {}).value || 'export';
  XLSX.writeFile(wb, `图片优化模板_${skuCode}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast('Excel 模板已导出', 'success');
}

// 现代线性图标库（Lucide 风格，stroke 1.6）

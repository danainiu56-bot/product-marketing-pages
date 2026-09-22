/* ============================================
   路由 / 视图切换 / 状态持久化
   抽取自 创建需求-上传页面.html
   依赖：sessionStorage、各页面 render 函数（页面 JS 提供）
   ============================================ */

// ----- VIEW_KEY / FORM_KEY -----
const VIEW_KEY = '__cursor_current_view';
const FORM_KEY = '__cursor_step1_form';

// ----- saveView -----
function saveView(view) {
  try { sessionStorage.setItem(VIEW_KEY, view); } catch (e) {}
}

// ----- getSavedView -----
function getSavedView() {
  try { return sessionStorage.getItem(VIEW_KEY); } catch (e) { return null; }
}

// ----- saveStep1Form -----
function saveStep1Form() {
  try {
    const data = {
      stage: currentStage,
      biz: currentBiz,
      sub: currentSub,
      site: document.getElementById('site').value,
      subcategory: document.getElementById('subcategory').value,
      sku: skuList[0] || '',
      remark: document.getElementById('demand-remark') ? document.getElementById('demand-remark').value : '',
      delivery: document.getElementById('delivery-date').value,
      launchDate: document.getElementById('product-launch-date') ? document.getElementById('product-launch-date').value : '',
      designDept: typeof isDesignDeptEnabled === 'function' ? isDesignDeptEnabled() : false,
      designDelivery: document.getElementById('design-delivery-date') ? document.getElementById('design-delivery-date').value : '',
    };
    sessionStorage.setItem(FORM_KEY, JSON.stringify(data));
  } catch (e) {}
}

// ----- restoreStep1Form -----
async function restoreStep1Form() {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.stage) selectStage(data.stage);
    if (data.biz) selectBiz(data.biz);
    if (data.sub) selectSub(data.sub);
    if (data.site) document.getElementById('site').value = data.site;
    if (data.subcategory) {
      document.getElementById('subcategory').value = data.subcategory;
      if (typeof renderSubcategoryTrigger === 'function') renderSubcategoryTrigger();
      await onSubcategoryChange();
      if (data.sku) selectSku(data.sku);
    }
    if (data.delivery) document.getElementById('delivery-date').value = data.delivery;
    if (typeof data.remark === 'string' && document.getElementById('demand-remark')) {
      document.getElementById('demand-remark').value = data.remark;
    }
    if (typeof updateProductLaunchField === 'function') updateProductLaunchField();
    if (data.launchDate && document.getElementById('product-launch-date')) {
      document.getElementById('product-launch-date').value = data.launchDate;
    }
    if (typeof updateDesignDeptField === 'function') updateDesignDeptField();
    if (data.designDept && typeof toggleDesignDept === 'function') {
      if (!isDesignDeptEnabled()) toggleDesignDept();
      if (data.designDelivery && document.getElementById('design-delivery-date')) {
        document.getElementById('design-delivery-date').value = data.designDelivery;
      }
    }
    return true;
  } catch (e) { return false; }
}

// ----- restoreSavedView -----
function restoreSavedView() {
  const view = getSavedView();
  if (!view || view === 'list') {
    goToList();
    return;
  }
  if (view === 'workbench') {
    goToList();
    showWorkbenchView();
  } else if (view === 'demand-mgr') {
    goToList();
    showDemandMgrView();
  } else if (view === 'review-mgr') {
    goToList();
    showReviewMgrView();
  } else if (view === 'copy-review') {
    goToList();
    showCopyReviewView();
  } else if (view === 'design-demand') {
    goToList();
    showDesignDemandView();
  } else if (view === 'competitor-mgr') {
    goToList();
    showCompetitorMgrView();
  } else if (view === 'title-board') {
    goToList();
    showTitleBoardView();
  } else if (view === 'ops-workbench') {
    goToList();
    showOpsWorkbenchView();
  } else if (view && view.startsWith('geo:')) {
    goToList();
    showGeoView(view.slice(4));
  } else if (view === 'ai-chat') {
    goToList();
    showDemandMgrView();
    openAiChat(aiChatState.sku || 'PO17X4011', aiChatState.productName || '7格便携药盒');
  } else if (view === 'wizard:1') {
    goToCreate();
    restoreStep1Form();
  } else if (view === 'wizard:2') {
    goToCreate({ skipSetStep: true, silent: true });
    restoreStep1Form();
    buildSummaryTags();
    setStep(2);
  } else if (view === 'result') {
    goToCreate({ skipSetStep: true, silent: true });
    restoreStep1Form();
    buildSummaryTags();
    setStep(2);
    showResultPage();
  } else {
    goToList();
  }
}

// ----- handleIpdDeepLink -----
function handleIpdDeepLink() {
  const params = new URLSearchParams(window.location.search);
  if ((params.get('source') || '').toLowerCase() !== 'ipd') return false;
  const externalId = params.get('externalId');
  if (!externalId) {
    showToast('缺少 externalId 参数', 'warning');
    return true;
  }
  goToList();
  if (typeof showCopywritingView === 'function') showCopywritingView();
  const row = typeof findIpdDemandByExternalId === 'function'
    ? findIpdDemandByExternalId(externalId)
    : LIST_DATA.find(r => r.externalId === externalId);
  if (!row) {
    showToast(`未找到 IPD 需求：${externalId}`, 'warning');
    return true;
  }
  filterSourceValue = 'IPD';
  const srcEl = document.getElementById('f-source');
  if (srcEl) srcEl.value = 'IPD';
  applyFilters();
  setTimeout(() => {
    if (typeof openIpdDossierDrawer === 'function') openIpdDossierDrawer(row);
  }, 200);
  return true;
}

// ----- goToList -----
function goToList() {
  document.getElementById('list-page').classList.add('show');
  document.getElementById('wizard-main').style.display = 'none';
  document.getElementById('result-main').style.display = 'none';
  document.getElementById('topbar-divider').style.display = 'none';
  document.getElementById('topbar-title').style.display = 'none';
  document.getElementById('topbar-tools').style.display = 'flex';
  document.getElementById('back-to-list-btn').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'instant' });
  saveView('list');
}

// ----- goToCreate -----
function goToCreate(opts = {}) {
  document.getElementById('list-page').classList.remove('show');
  document.getElementById('wizard-main').style.display = 'block';
  document.getElementById('result-main').style.display = 'none';
  document.getElementById('topbar-divider').style.display = 'inline-block';
  document.getElementById('topbar-title').style.display = 'inline';
  document.getElementById('topbar-tools').style.display = 'none';
  document.getElementById('back-to-list-btn').style.display = 'inline-flex';
  if (!opts.skipSetStep) setStep(1);
  if (!opts.silent) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----- setListActiveTabTitle -----
function setListActiveTabTitle(title) {
  const el = document.getElementById('list-active-tab-title');
  if (el) el.textContent = title;
}

// ----- showWorkbenchView -----
function showWorkbenchView() {
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    // 只隐藏 list-main 下「首页列表」那一层，避免误伤 #demand-mgr-view 内部的同名 class（否则文案区会被写死 display:none）
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const dd = document.getElementById('design-demand-view');
  if (dd) dd.style.display = 'none';
  const cmp = document.getElementById('competitor-mgr-view');
  if (cmp) cmp.style.display = 'none';
  const prd = document.getElementById('product-mgr-view');
  if (prd) prd.style.display = 'none';
  const ops = document.getElementById('ops-workbench-view');
  if (ops) ops.style.display = 'none';
  const insight = document.getElementById('insight-report-view');
  if (insight) insight.style.display = 'none';
  const titleBoard = document.getElementById('title-board-view');
  if (titleBoard) titleBoard.style.display = 'none';
  const geo = document.getElementById('geo-view');
  if (geo) geo.style.display = 'none';
  const wb = document.getElementById('workbench-view');
  if (wb) {
    wb.style.display = 'flex';
    refreshWorkbench();
    wb.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const wbBtn = document.querySelector(`.list-nav-single[onclick*="'workbench'"]`);
  if (wbBtn) wbBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('workbench');
}

// ----- showCopywritingView -----
function showCopywritingView() {
  // 显示 需求管理 列表（list-main 内默认那一套）
  setListActiveTabTitle('需求管理');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = '');
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const dd = document.getElementById('design-demand-view');
  if (dd) dd.style.display = 'none';
  const cmp = document.getElementById('competitor-mgr-view');
  if (cmp) cmp.style.display = 'none';
  const prd = document.getElementById('product-mgr-view');
  if (prd) prd.style.display = 'none';
  const ops = document.getElementById('ops-workbench-view');
  if (ops) ops.style.display = 'none';
  const insight = document.getElementById('insight-report-view');
  if (insight) insight.style.display = 'none';
  const titleBoard = document.getElementById('title-board-view');
  if (titleBoard) titleBoard.style.display = 'none';
  const geo = document.getElementById('geo-view');
  if (geo) geo.style.display = 'none';
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'copywriting'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('list');
}

// ----- showDemandMgrView -----
function showDemandMgrView() {
  // 隐藏 需求管理 的筛选栏 + 表格 + 分页，但保留顶部 Tab 切换
  setListActiveTabTitle('文案管理');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const ddD = document.getElementById('design-demand-view');
  if (ddD) ddD.style.display = 'none';
  const cmpD = document.getElementById('competitor-mgr-view');
  if (cmpD) cmpD.style.display = 'none';
  const prdD = document.getElementById('product-mgr-view');
  if (prdD) prdD.style.display = 'none';
  const opsD = document.getElementById('ops-workbench-view');
  if (opsD) opsD.style.display = 'none';
  const insightD = document.getElementById('insight-report-view');
  if (insightD) insightD.style.display = 'none';
  const titleBoardD = document.getElementById('title-board-view');
  if (titleBoardD) titleBoardD.style.display = 'none';
  const geoD = document.getElementById('geo-view');
  if (geoD) geoD.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) {
    // 用 flex 匹配 CSS 中 .demand-mgr-view 的 display:flex（避免覆盖布局）
    dm.style.display = 'flex';
    // 若曾被旧版 showWorkbench 全局写过 display:none，进入文案管理时清掉内层行内样式
    dm.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    // 防御性：先 apply 筛选；如果 applyCopyFilters 因任何原因没正确填表（罕见），强制再 render 一次
    try {
      if (typeof applyCopyFilters === 'function') applyCopyFilters();
    } catch (e) {
      console.error('[demand-mgr] applyCopyFilters 失败:', e);
    }
    const tbody = document.getElementById('cf-tbody');
    if (tbody && tbody.children.length === 0) {
      // 兜底：直接渲染全量数据
      if (typeof copyCurrentListData !== 'undefined' && copyCurrentListData.length === 0) {
        copyCurrentListData = COPY_LIST_DATA.slice();
      }
      if (typeof renderCopyListTable === 'function') renderCopyListTable();
    }
    dm.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'demand-mgr'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('demand-mgr');
}

// ----- showReviewMgrView -----
function showReviewMgrView() {
  setListActiveTabTitle('需求审核');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const ddR = document.getElementById('design-demand-view');
  if (ddR) ddR.style.display = 'none';
  const cmpR = document.getElementById('competitor-mgr-view');
  if (cmpR) cmpR.style.display = 'none';
  const prdR = document.getElementById('product-mgr-view');
  if (prdR) prdR.style.display = 'none';
  const opsR = document.getElementById('ops-workbench-view');
  if (opsR) opsR.style.display = 'none';
  const insightR = document.getElementById('insight-report-view');
  if (insightR) insightR.style.display = 'none';
  const titleBoardR = document.getElementById('title-board-view');
  if (titleBoardR) titleBoardR.style.display = 'none';
  const geoR = document.getElementById('geo-view');
  if (geoR) geoR.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) {
    rv.style.display = 'flex';
    rv.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    if (typeof renderReviewMgrView === 'function') renderReviewMgrView();
    rv.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'titletd-review'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('review-mgr');
}

// ----- showCopyReviewView -----
function showCopyReviewView() {
  setListActiveTabTitle('文案审核');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cmpCR = document.getElementById('competitor-mgr-view');
  if (cmpCR) cmpCR.style.display = 'none';
  const prdCR = document.getElementById('product-mgr-view');
  if (prdCR) prdCR.style.display = 'none';
  const opsCR = document.getElementById('ops-workbench-view');
  if (opsCR) opsCR.style.display = 'none';
  const insightCR = document.getElementById('insight-report-view');
  if (insightCR) insightCR.style.display = 'none';
  const ddCR = document.getElementById('design-demand-view');
  if (ddCR) ddCR.style.display = 'none';
  const titleBoardCR = document.getElementById('title-board-view');
  if (titleBoardCR) titleBoardCR.style.display = 'none';
  const geoCR = document.getElementById('geo-view');
  if (geoCR) geoCR.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) {
    cr.style.display = 'flex';
    cr.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    if (typeof renderCopyReviewView === 'function') renderCopyReviewView();
    cr.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'copy-review'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('copy-review');
}

// ----- showDesignDemandView -----
function showDesignDemandView() {
  setListActiveTabTitle('设计需求');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const cmpCR = document.getElementById('competitor-mgr-view');
  if (cmpCR) cmpCR.style.display = 'none';
  const prdCR = document.getElementById('product-mgr-view');
  if (prdCR) prdCR.style.display = 'none';
  const opsCR = document.getElementById('ops-workbench-view');
  if (opsCR) opsCR.style.display = 'none';
  const insightCR = document.getElementById('insight-report-view');
  if (insightCR) insightCR.style.display = 'none';
  const titleBoardDD = document.getElementById('title-board-view');
  if (titleBoardDD) titleBoardDD.style.display = 'none';
  const geoDD = document.getElementById('geo-view');
  if (geoDD) geoDD.style.display = 'none';
  const dd = document.getElementById('design-demand-view');
  if (dd) {
    dd.style.display = 'flex';
    dd.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    if (typeof renderDesignDemandView === 'function') renderDesignDemandView();
    dd.scrollTop = 0;
  }
  if (typeof markDesignNotifyRead === 'function') markDesignNotifyRead();
  if (typeof refreshDesignNotifyBadge === 'function') refreshDesignNotifyBadge();
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'design-demand'"], .list-nav-single[onclick*="'design-demand'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('design-demand');
}

// ----- showCompetitorMgrView -----
function showCompetitorMgrView() {
  setListActiveTabTitle('竞品管理');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  ['workbench-view','demand-mgr-view','review-mgr-view','copy-review-view','design-demand-view','product-mgr-view','title-board-view','insight-report-view','ops-workbench-view','geo-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const v = document.getElementById('competitor-mgr-view');
  if (v) {
    v.style.display = 'block';
    if (typeof renderCompetitorMgrView === 'function') renderCompetitorMgrView();
    v.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'competitor-mgr'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('competitor-mgr');
}

// ----- showProductMgrView -----
function showProductMgrView() {
  setListActiveTabTitle('产品管理');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  ['workbench-view','demand-mgr-view','review-mgr-view','copy-review-view','design-demand-view','competitor-mgr-view','title-board-view','insight-report-view','ops-workbench-view','geo-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const v = document.getElementById('product-mgr-view');
  if (v) {
    v.style.display = 'block';
    if (typeof renderProductMgrView === 'function') renderProductMgrView();
    v.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'product-mgr'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('product-mgr');
}

// ----- showTitleBoardView -----
function showTitleBoardView() {
  setListActiveTabTitle('Title 看板');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  ['workbench-view','demand-mgr-view','review-mgr-view','copy-review-view','design-demand-view','competitor-mgr-view','product-mgr-view','insight-report-view','ops-workbench-view','geo-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const view = document.getElementById('title-board-view');
  if (view) {
    view.style.display = 'block';
    if (typeof renderTitleBoardView === 'function') renderTitleBoardView();
    view.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'title-board'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('title-board');
}

// ----- showInsightReportView -----
function showInsightReportView() {
  setListActiveTabTitle('洞察报告');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  ['workbench-view','demand-mgr-view','review-mgr-view','copy-review-view','design-demand-view','competitor-mgr-view','product-mgr-view','title-board-view','ops-workbench-view','geo-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const v = document.getElementById('insight-report-view');
  if (v) {
    v.style.display = 'block';
    if (typeof renderInsightReportView === 'function') renderInsightReportView();
    v.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'insight-report'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('insight-report');
}

// ----- showOpsWorkbenchView -----
function showOpsWorkbenchView() {
  setListActiveTabTitle('运营工作台');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  ['workbench-view','demand-mgr-view','review-mgr-view','copy-review-view','design-demand-view','competitor-mgr-view','product-mgr-view','title-board-view','insight-report-view','geo-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const v = document.getElementById('ops-workbench-view');
  if (v) {
    v.style.display = 'block';
    if (typeof renderOpsWorkbenchView === 'function') renderOpsWorkbenchView();
    v.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'ops-new-product-ppt'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('ops-workbench');
}

// ----- showGeoView -----
function showGeoView(pageId) {
  const page = (typeof GEO_PAGES !== 'undefined' && GEO_PAGES[pageId])
    ? GEO_PAGES[pageId]
    : { title: 'GEO' };
  setListActiveTabTitle(page.title);
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  ['workbench-view','demand-mgr-view','review-mgr-view','copy-review-view','design-demand-view','competitor-mgr-view','product-mgr-view','title-board-view','insight-report-view','ops-workbench-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const v = document.getElementById('geo-view');
  if (v) {
    v.style.display = 'block';
    if (typeof renderGeoView === 'function') renderGeoView(pageId);
    v.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'${pageId}'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView(`geo:${pageId}`);
}

// ============================================
// 工作台时间粒度状态 + 看板动态渲染
// ============================================

let wbState = { granularity: 'month', year: 2026, month: 5, quarter: 2, anomalyOnly: false };

function setWbGranularity(g) {
  if (!['month', 'quarter', 'year'].includes(g)) return;
  wbState.granularity = g;
  // 更新段控件 active
  document.querySelectorAll('#wb-granularity-seg button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.g === g);
  });
  refreshWorkbench();
}

function setWbYear(y) {
  wbState.year = parseInt(y, 10);
  refreshWorkbench();
}
function setWbMonth(m) {
  wbState.month = parseInt(m, 10);
  refreshWorkbench();
}
function setWbQuarter(q) {
  wbState.quarter = parseInt(q, 10);
  refreshWorkbench();
}

function renderWbTimePickers() {
  const wrap = document.getElementById('wb-time-pickers');
  if (!wrap) return;
  const years = [2025, 2026];
  const yearOpts = years.map(y => `<option value="${y}" ${y === wbState.year ? 'selected' : ''}>${y}年</option>`).join('');
  if (wbState.granularity === 'month') {
    const monthOpts = [];
    for (let m = 1; m <= 12; m++) {
      monthOpts.push(`<option value="${m}" ${m === wbState.month ? 'selected' : ''}>${m}月</option>`);
    }
    wrap.innerHTML = `
      <select class="wb-month-select" onchange="setWbYear(this.value)">${yearOpts}</select>
      <select class="wb-month-select" onchange="setWbMonth(this.value)">${monthOpts.join('')}</select>`;
  } else if (wbState.granularity === 'quarter') {
    const qOpts = [1, 2, 3, 4].map(q => `<option value="${q}" ${q === wbState.quarter ? 'selected' : ''}>Q${q}</option>`).join('');
    wrap.innerHTML = `
      <select class="wb-month-select" onchange="setWbYear(this.value)">${yearOpts}</select>
      <select class="wb-month-select" onchange="setWbQuarter(this.value)">${qOpts}</select>`;
  } else {
    wrap.innerHTML = `<select class="wb-month-select" onchange="setWbYear(this.value)">${yearOpts}</select>`;
  }
}

function refreshWorkbench() {
  renderWbTimePickers();
  const data = (typeof getWorkbenchData === 'function') ? getWorkbenchData(wbState) : null;
  if (!data) return;
  renderWbHealth(data);
  renderWbBuDist(data);
  renderWbTypeDist(data);
  renderWbTeam(data);
  renderWbSalesTeam(data);
  renderWbQuality(data);
  if (typeof renderWbTrend === 'function') renderWbTrend();
  updateWbScopeNotes();
  // 重新应用 BU 筛选/异常筛选状态
  if (typeof updateWorkbenchDistributionFilter === 'function') updateWorkbenchDistributionFilter();
}

function wbScopeLabel() {
  const g = wbState.granularity;
  if (g === 'month') return `${wbState.year} 年 ${wbState.month} 月`;
  if (g === 'quarter') return `${wbState.year} 年 Q${wbState.quarter}`;
  return `${wbState.year} 年`;
}

function wbTrendWindowLabel() {
  const g = wbState.granularity;
  if (g === 'month') return `${wbState.year} 年 1月-12月`;
  if (g === 'quarter') return `近 8 个季度（截至 ${wbState.year} 年 Q${wbState.quarter}）`;
  return '全部年份';
}

function updateWbScopeNotes() {
  const trendScope = document.getElementById('wb-trend-scope');
  const teamScope = document.getElementById('wb-team-scope');
  const qualityScope = document.getElementById('wb-quality-scope');
  if (trendScope) {
    trendScope.innerHTML = `
      <span>当前筛选：${wbScopeLabel()}</span>
      <span>图表窗口：${wbTrendWindowLabel()}</span>
    `;
  }
  if (teamScope) {
    teamScope.innerHTML = `<span>统计范围：${wbScopeLabel()}</span>`;
  }
  if (qualityScope) {
    qualityScope.innerHTML = `<span>统计范围：${wbScopeLabel()}</span>`;
  }
}

function wbHealthStatusClass(status) {
  const map = {
    '正常': 'good',
    '需关注': 'warn',
    '高风险': 'danger',
    '暂无数据': 'empty',
  };
  return map[status] || 'warn';
}

function renderWbHealth(data) {
  const hero = document.getElementById('wb-health-hero');
  const metrics = document.getElementById('wb-health-metrics');
  if (hero) {
    const eyebrow = `${wbScopeLabel()} 经营健康度`;
    const status = data.health.status;
    const statusCls = wbHealthStatusClass(status);
    hero.className = `wb-health-hero is-health-${statusCls}`;
    hero.innerHTML = `
      <div class="health-eyebrow">${eyebrow}</div>
      <div class="health-status is-${statusCls}">${status}</div>
      <p>${data.health.summary}</p>
      <div class="health-facts">
        <span class="static">需求总量 ${data.total}</span>
        <span onclick="event.stopPropagation(); openWorkbenchRiskOverview()">风险需求 ${data.overdue + data.willOverdue}</span>
        <span class="danger" onclick="event.stopPropagation(); openWorkbenchRiskOverview()">已逾期 ${data.overdue}</span>
        <span class="warn" onclick="event.stopPropagation(); openWorkbenchRiskOverview()">即将逾期 ${data.willOverdue}</span>
      </div>`;
  }
  if (metrics) {
    const k = data.kpi;
    const fmt = v => `${(v * 100).toFixed(1).replace(/\.0$/, '')}%`;
    metrics.innerHTML = `
      <div class="health-metric" onclick="openWorkbenchKpiDetail('delivery')">
        <span>准时交付率</span><strong>${fmt(k.delivery)}</strong><em>${k.delivery >= 0.9 ? '整体达标' : '低于 90% 目标'}</em>
      </div>
      <div class="health-metric" onclick="openWorkbenchKpiDetail('draft')">
        <span>一稿通过率</span><strong>${fmt(k.draft)}</strong><em>${k.draft >= 0.9 ? '达标' : '低于 90% 目标'}</em>
      </div>
      <div class="health-metric" onclick="openWorkbenchKpiDetail('grammar')">
        <span>语法准确率</span><strong>${fmt(k.grammar)}</strong><em>基础质量稳定</em>
      </div>
      <div class="health-metric" onclick="openWorkbenchKpiDetail('ai')">
        <span>AI 采纳率</span><strong>${fmt(k.ai)}</strong><em>${k.ai >= 0.8 ? '采纳良好' : '部分类型偏低'}</em>
      </div>`;
  }
}

function renderWbBuDist(data) {
  const list = document.getElementById('wb-bu-list');
  if (!list) return;
  const rows = WB_BU_LIST.map(name => {
    const total = data.bu[name] || 0;
    const risk = data.buRisk[name] || { warn: 0, danger: 0 };
    const normal = Math.max(0, total - risk.warn - risk.danger);
    const pct = (n) => total ? `${(n * 100 / total).toFixed(1)}%` : '0%';
    const isRisk = (risk.warn + risk.danger) > 0;
    const riskCls = risk.danger >= 2 ? 'risk-high' : (isRisk ? 'risk-warn' : 'risk-good');
    return `
      <div class="chart-bar-row ${riskCls}" data-bu="${name}" data-risk="${isRisk}" onclick="applyWorkbenchBuFilter('${name}')">
        <div class="chart-label"><strong>${name}</strong><em>${WB_BU_HINT[name] || ''}</em></div>
        <div class="chart-stack-wrap">
          <div class="stacked-bar">
            <span class="normal" style="width:${pct(normal)};"></span>
            <span class="warn" style="width:${pct(risk.warn)};"></span>
            <span class="danger" style="width:${pct(risk.danger)};"></span>
          </div>
          <div class="chart-segment-counts">
            <span class="normal">进行中 ${normal}</span>
            <span class="warn">即将逾期 ${risk.warn}</span>
            <span class="danger">已逾期 ${risk.danger}</span>
          </div>
        </div>
        <div class="chart-kpi"><b>${total}</b><span>风险 ${risk.warn + risk.danger}</span></div>
      </div>`;
  }).join('');
  list.innerHTML = rows;
}

function renderWbTypeDist(data) {
  const list = document.getElementById('wb-type-list');
  if (!list) return;
  const rows = WB_TYPE_LIST.map(name => {
    const total = data.type[name] || 0;
    const risk = data.typeRisk[name] || { warn: 0, danger: 0 };
    const normal = Math.max(0, total - risk.warn - risk.danger);
    const pct = (n) => total ? `${(n * 100 / total).toFixed(1)}%` : '0%';
    const isRisk = (risk.warn + risk.danger) > 0;
    const riskCls = risk.danger >= 2 ? 'risk-high' : (isRisk ? 'risk-warn' : 'risk-good');
    return `
      <div class="chart-bar-row ${riskCls}" data-demand-card="${name}" data-bu-match="${WB_TYPE_BU_MATCH[name] || ''}" data-risk="${isRisk}" onclick="openWorkbenchDemandOverview('${name}')">
        <div class="chart-label"><strong>${name}</strong><em>${WB_TYPE_HINT[name] || ''}</em></div>
        <div class="chart-stack-wrap">
          <div class="stacked-bar">
            <span class="normal" style="width:${pct(normal)};"></span>
            <span class="warn" style="width:${pct(risk.warn)};"></span>
            <span class="danger" style="width:${pct(risk.danger)};"></span>
          </div>
          <div class="chart-segment-counts">
            <span class="normal">进行中 ${normal}</span>
            <span class="warn">即将逾期 ${risk.warn}</span>
            <span class="danger">已逾期 ${risk.danger}</span>
          </div>
        </div>
        <div class="chart-kpi"><b>${total}</b><span>风险 ${risk.warn + risk.danger}</span></div>
      </div>`;
  }).join('');
  list.innerHTML = rows;
}

let wbTeamRoleState = 'writer';
let wbTeamRoleTabsBound = false;

function switchWbTeamRoleTab(role, btn) {
  if (!role || role === wbTeamRoleState) return;
  wbTeamRoleState = role;
  const group = btn?.closest('[data-role]') || document.querySelector('.wb-team-role-tab[data-role="team"]');
  group?.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.getAttribute('data-v') === role));
  switchWbTeamRole(role);
}

function initWbTeamRoleTabs() {
  if (wbTeamRoleTabsBound) return;
  const tab = document.querySelector('.wb-team-role-tab[data-role="team"]');
  if (!tab) return;
  tab.addEventListener('click', (e) => {
    const btn = (e.target instanceof Element ? e.target : e.target.parentElement)?.closest('button');
    if (!btn || !tab.contains(btn)) return;
    const value = btn.getAttribute('data-v');
    if (!value) return;
    switchWbTeamRoleTab(value, btn);
  });
  wbTeamRoleTabsBound = true;
}

function switchWbTeamRole(role) {
  const writerPanel = document.getElementById('wb-writer-panel');
  const salesPanel = document.getElementById('wb-sales-panel');
  if (writerPanel) writerPanel.classList.toggle('hidden', role !== 'writer');
  if (salesPanel) salesPanel.classList.toggle('hidden', role !== 'sales');
}

function renderWbTeam(data) {
  initWbTeamRoleTabs();
  switchWbTeamRole(wbTeamRoleState);
  const wrap = document.getElementById('wb-team-rows');
  if (!wrap) return;
  const maxLoad = Math.max(...data.team.map(t => t.load), 1);
  const fmtPct = v => `${(v * 100).toFixed(0)}%`;
  const cls = (label, value) => {
    if (label === 'grammar') return value >= 0.97 ? 'metric-good' : (value < 0.95 ? 'metric-warn' : '');
    if (label === 'draft') return value < 0.80 ? 'metric-danger' : '';
    if (label === 'ai') return value < 0.70 ? 'metric-danger' : '';
    return '';
  };
  wrap.innerHTML = data.team.map(t => {
    const attention = t.draft < 0.80 ? 'attention' : '';
    return `<div class="team-table-row ${attention}" onclick="openWorkbenchPersonDetail('${t.name}')">
      <strong>${t.name}</strong>
      <span class="${cls('grammar', t.grammar)}">${fmtPct(t.grammar)}</span>
      <span class="${cls('draft', t.draft)}">${fmtPct(t.draft)}</span>
      <span class="${cls('ai', t.ai)}">${fmtPct(t.ai)}</span>
      <b>${t.load}</b>
      <i><em style="width:${Math.min(100, Math.round(t.load * 100 / maxLoad))}%;"></em></i>
    </div>`;
  }).join('');
}

function renderWbSalesTeam(data) {
  initWbTeamRoleTabs();
  const wrap = document.getElementById('wb-sales-rows');
  if (!wrap || !data.salesTeam) return;
  const fmtPct = v => `${(v * 100).toFixed(0)}%`;
  const passCls = (rate) => {
    if (rate >= 0.85) return 'metric-good';
    if (rate >= 0.70) return 'metric-warn';
    return 'metric-danger';
  };
  wrap.innerHTML = data.salesTeam.map(s => {
    const attention = s.passRate < 0.70 ? 'attention' : '';
    return `<div class="sales-table-row ${attention}" onclick="openWorkbenchSalesDetail('${s.name}')">
      <strong>${s.name}</strong>
      <span>${s.bu}</span>
      <span>${s.buLead}</span>
      <b>${s.submitCount}</b>
      <span class="${passCls(s.passRate)}">${fmtPct(s.passRate)}</span>
    </div>`;
  }).join('');
}

function renderWbQuality(data) {
  const list = document.getElementById('wb-quality-list');
  if (!list) return;
  list.innerHTML = data.quality.map(q => {
    const label = String(q.label || '').replace(/'/g, "\\'");
    return `<div class="wb-quality-row" role="button" tabindex="0" onclick="openWorkbenchQualityDetail('${label}')" onkeydown="if(event.key==='Enter')openWorkbenchQualityDetail('${label}')">
      <span>${q.label}</span><b>${q.pct}%</b><i style="width:${q.pct}%;"></i>
    </div>`;
  }).join('');
}

function wbEscHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderQualityBreakdownCard(title, items) {
  const body = items.length
    ? items.map(it => `${it.name} ${it.count}次 (${it.pct}%)`).join(' / ')
    : '暂无数据';
  return `<div class="wb-person-card"><h3>${title}</h3><p>${wbEscHtml(body)}</p></div>`;
}

function openWorkbenchQualityDetail(category) {
  const modal = document.getElementById('wb-quality-modal');
  const title = document.getElementById('wb-quality-title');
  const subtitle = document.getElementById('wb-quality-subtitle');
  const body = document.getElementById('wb-quality-body');
  if (!modal || !title || !body) return;
  const detail = typeof getQualityRejectDetails === 'function'
    ? getQualityRejectDetails(wbState, category)
    : { summary: { count: 0, pct: 0, demandCount: 0 }, byBu: [], byType: [], byWriter: [], highlights: [], records: [] };
  title.textContent = `${category} · 质量问题详情`;
  if (subtitle) subtitle.textContent = `统计范围：${wbScopeLabel()}`;
  const s = detail.summary;
  const highlightHtml = detail.highlights.length
    ? `<ul>${detail.highlights.map(h => `<li>${wbEscHtml(h)}</li>`).join('')}</ul>`
    : '<p>暂无典型问题摘要</p>';
  body.innerHTML = `
    <div class="wb-quality-summary-strip">
      <div><span>驳回次数</span><strong>${s.count}</strong></div>
      <div><span>占全部驳回</span><strong>${s.pct}%</strong></div>
      <div><span>涉及需求</span><strong>${s.demandCount}</strong></div>
    </div>
    <div class="wb-person-detail-grid">
      ${renderQualityBreakdownCard('按 BU', detail.byBu)}
      ${renderQualityBreakdownCard('按需求类型', detail.byType)}
      ${renderQualityBreakdownCard('按文案人员', detail.byWriter)}
      <div class="wb-person-card"><h3>典型问题</h3>${highlightHtml}</div>
    </div>`;
  modal.classList.add('show');
}

function closeWorkbenchQualityDetail() {
  const modal = document.getElementById('wb-quality-modal');
  if (modal) modal.classList.remove('show');
}

function openQualityRejectAudit(reviewKey) {
  closeWorkbenchQualityDetail();
  if (typeof showCopyReviewView === 'function') showCopyReviewView();
  if (typeof openCopyAuditByReviewKey === 'function') {
    openCopyAuditByReviewKey(reviewKey);
  } else {
    showToast('未找到对应审核记录（演示数据）', 'warning');
  }
}

function openQualityRejectAuditBySku(sku) {
  closeWorkbenchQualityDetail();
  if (typeof showCopyReviewView === 'function') showCopyReviewView();
  if (typeof openCopyAuditRecordBySku === 'function') {
    openCopyAuditRecordBySku(sku, '已驳回');
  } else {
    showToast('未找到对应审核记录（演示数据）', 'warning');
  }
}

const WORKBENCH_SALES_DATA = {
  Jessi: {
    kpis: ['28', '86%', '2', '物理治疗', 'Suki'],
    bu: '物理治疗 18 / 北美市场 6 / 家居关怀 4',
    type: '新品 Listing 12 / Listing 图片文案 8 / FAQ 5 / 说明书 3',
    issues: ['SKU 与开卖时间不一致 2 次', '资料缺失导致驳回 1 次', '需求类型选错 1 次'],
    risk: '驳回率高于团队均值，建议提交前使用需求自检清单核对基础信息。',
  },
  Liz: {
    kpis: ['22', '91%', '1', '北美市场', 'Suki'],
    bu: '北美市场 14 / 家居关怀 5 / 物理治疗 3',
    type: '新品 Listing 10 / 新品图片文案 6 / FAQ 4 / 视频脚本 2',
    issues: ['竞品资料引用不完整 1 次'],
    risk: '提交量最高且通过率稳定，可继续承接北美市场新品需求。',
  },
  Tina: {
    kpis: ['14', '86%', '1', '北美市场', 'Suki'],
    bu: '北美市场 8 / 物理治疗 4 / 健康家访 2',
    type: '新品 Listing 6 / 老品 TD 4 / FAQ 2 / 说明书 2',
    issues: ['跨 BU 需求排期冲突 1 次', '开卖时间填写模糊 1 次'],
    risk: '跨事业部提交较多，建议按 BU 拆分批次，减少审核往返。',
  },
  Sam: {
    kpis: ['12', '92%', '0', '家居关怀', 'Suki'],
    bu: '家居关怀 9 / 慢病耗材 3',
    type: '新品 Listing 5 / FAQ 3 / 新闻稿 2 / 说明书 2',
    issues: [],
    risk: '通过率稳定，适合承接家居关怀线新品 Listing。',
  },
  Kevin: {
    kpis: ['10', '70%', '2', '慢病耗材', 'Suki'],
    bu: '慢病耗材 7 / 健康家访 3',
    type: '说明书 4 / 视频脚本 3 / FAQ 2 / 包装盒 1',
    issues: ['需求描述不完整 2 次', '子品类选择错误 1 次', '附件遗漏 1 次'],
    risk: '通过率偏低，建议暂缓复杂类型，先补齐模板化资料。',
  },
};

const WORKBENCH_PERSON_DATA = {
  Mason: {
    kpis: ['18', '98%', '88%', '80%', '高负载'],
    risk: '当前处理量最高，建议控制新增分配，优先处理 Listing 图片文案审核。',
    bu: '物理治疗 8 / 北美市场 5 / 家居关怀 3 / 慢病耗材 2',
    type: '新品 Listing 7 / Listing 图片文案 5 / 包装盒 3 / FAQ 3',
    issues: ['信息错误 3 次', 'GEO/本地化不匹配 2 次', '卖点表达不清 1 次'],
  },
  Yumi: {
    kpis: ['15', '97%', '84%', '76%', '正常'],
    risk: '交付稳定，可承接部分 FAQ 与新闻稿需求。',
    bu: '家居关怀 6 / 物理治疗 4 / 健康家访 3 / 北美市场 2',
    type: '优化 Listing 5 / FAQ 4 / 说明书 3 / 新闻稿 3',
    issues: ['因果链不完整 2 次', 'SEO 覆盖不足 2 次'],
  },
  Brian: {
    kpis: ['12', '94%', '76%', '68%', '需关注'],
    risk: '一稿通过率低于团队均值，建议复盘需求理解和资料引用链路。',
    bu: '慢病耗材 5 / 北美市场 4 / 物理治疗 2 / 家居关怀 1',
    type: '说明书 4 / 视频脚本 3 / Listing 图片文案 3 / FAQ 2',
    issues: ['信息错误 4 次', '因果链不完整 3 次', '语法问题 2 次'],
  },
  Suki: {
    kpis: ['10', '96%', '82%', '74%', '可承接'],
    risk: '当前负载较低，可承接慢病耗材和新闻稿类需求。',
    bu: '健康家访 4 / 家居关怀 3 / 慢病耗材 2 / 北美市场 1',
    type: '新闻稿 3 / FAQ 3 / 包装盒 2 / 优化 Listing 2',
    issues: ['SEO 覆盖不足 2 次', '卖点表达不清 1 次'],
  },
};

const WORKBENCH_KPI_DETAILS = {
  grammar: {
    title: '语法准确率详情',
    subtitle: '语法准确率用于衡量文案基础质量是否稳定。',
    cards: [
      ['按人员', 'Mason 98% / Yumi 97% / Suki 96% / Brian 94%'],
      ['按需求类型', 'FAQ 98% / 新闻稿 97% / 新品 Listing 96% / 视频脚本 93%'],
      ['主要问题', '长句结构、单位表达、站点本地化拼写差异'],
    ],
  },
  delivery: {
    title: '准时交付率详情',
    subtitle: '准时交付率用于判断团队交付节奏是否稳定。',
    cards: [
      ['按 BU', '健康家访 96% / 物理治疗 93% / 北美市场 90% / 慢病耗材 86%'],
      ['按需求类型', '包装盒 95% / FAQ 94% / Listing 图片文案 82%'],
      ['风险来源', '已逾期 3 个，集中在 Listing 图片文案和说明书'],
    ],
  },
  draft: {
    title: '一稿通过率详情',
    subtitle: '一稿通过率反映需求理解和初稿质量。',
    cards: [
      ['按人员', 'Mason 88% / Yumi 84% / Suki 82% / Brian 76%'],
      ['按需求类型', 'FAQ 90% / 新闻稿 88% / 说明书 79% / 视频脚本 74%'],
      ['未通过原因', '需求信息不完整、因果链不足、卖点表达不清'],
    ],
  },
  ai: {
    title: 'AI 采纳率详情',
    subtitle: 'AI 采纳率用于衡量 AI 初稿是否真正能减少人工修改。',
    cards: [
      ['按需求类型', 'FAQ 84% / 新闻稿 81% / 新品 Listing 76% / 视频脚本 62%'],
      ['按人员', 'Mason 80% / Yumi 76% / Suki 74% / Brian 68%'],
      ['低采纳原因', '视频脚本场景细节不足，GEO 表达不够贴近站点'],
    ],
  },
};

let workbenchDistributionFilter = { bu: '', anomalyOnly: false };

function renderWorkbenchInfoCards(cards) {
  return `<div class="wb-risk-breakdown">${cards.map(([title, text]) => `
    <div class="wb-person-card">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>`).join('')}</div>`;
}

function openWorkbenchKpiDetail(type) {
  const data = WORKBENCH_KPI_DETAILS[type];
  const modal = document.getElementById('wb-kpi-modal');
  const title = document.getElementById('wb-kpi-title');
  const subtitle = document.getElementById('wb-kpi-subtitle');
  const body = document.getElementById('wb-kpi-body');
  if (!modal || !title || !subtitle || !body || !data) return;
  title.textContent = data.title;
  subtitle.textContent = data.subtitle;
  body.innerHTML = renderWorkbenchInfoCards(data.cards);
  modal.classList.add('show');
}

function closeWorkbenchKpiDetail() {
  const modal = document.getElementById('wb-kpi-modal');
  if (modal) modal.classList.remove('show');
}

function applyWorkbenchBuFilter(bu) {
  workbenchDistributionFilter.bu = bu;
  updateWorkbenchDistributionFilter();
}

function clearWorkbenchDistributionFilter() {
  workbenchDistributionFilter.bu = '';
  updateWorkbenchDistributionFilter();
}

function toggleWorkbenchAnomalyOnly() {
  workbenchDistributionFilter.anomalyOnly = !workbenchDistributionFilter.anomalyOnly;
  updateWorkbenchDistributionFilter();
}

function updateWorkbenchDistributionFilter() {
  const chip = document.getElementById('wb-filter-chips');
  const toggle = document.getElementById('wb-anomaly-toggle');
  const bu = workbenchDistributionFilter.bu;
  if (chip) {
    const label = bu ? `${bu} / 相关需求类型` : '全部 BU / 全部需求类型';
    chip.querySelector('span').textContent = `当前：${label}`;
  }
  if (toggle) toggle.classList.toggle('active', workbenchDistributionFilter.anomalyOnly);
  document.querySelectorAll('[data-bu]').forEach(card => {
    card.classList.toggle('active', card.dataset.bu === bu);
    card.classList.toggle('anomaly-hidden', workbenchDistributionFilter.anomalyOnly && card.dataset.risk !== 'true');
  });
  document.querySelectorAll('[data-demand-card]').forEach(card => {
    const matchBu = !bu || (card.dataset.buMatch || '').split(',').includes(bu);
    card.classList.toggle('filtered-out', !matchBu);
    card.classList.toggle('anomaly-hidden', workbenchDistributionFilter.anomalyOnly && card.dataset.risk !== 'true');
  });
}

function openWorkbenchSalesDetail(name) {
  const data = WORKBENCH_SALES_DATA[name];
  const modal = document.getElementById('wb-person-modal');
  const title = document.getElementById('wb-person-title');
  const subtitle = document.getElementById('wb-person-subtitle');
  const body = document.getElementById('wb-person-body');
  if (!modal || !title || !body || !data) return;
  if (subtitle) subtitle.textContent = '查看提需求人的提交量、事业部归属、BU长与需求通过率。';
  title.textContent = `${name} 提需求看板`;
  body.innerHTML = `
    <div class="wb-person-kpis">
      <div class="wb-person-kpi"><span>提交需求数</span><strong>${data.kpis[0]}</strong></div>
      <div class="wb-person-kpi"><span>需求通过率</span><strong>${data.kpis[1]}</strong></div>
      <div class="wb-person-kpi"><span>驳回数</span><strong>${data.kpis[2]}</strong></div>
      <div class="wb-person-kpi"><span>主事业部</span><strong>${data.kpis[3]}</strong></div>
      <div class="wb-person-kpi"><span>BU长</span><strong>${data.kpis[4]}</strong></div>
    </div>
    <div class="wb-person-detail-grid">
      <div class="wb-person-card"><h3>需求类型分布</h3><p>${data.type}</p></div>
      <div class="wb-person-card"><h3>近期驳回摘要</h3><ul>${(data.issues.length ? data.issues : ['近期无驳回记录']).map(item => `<li>${item}</li>`).join('')}</ul></div>
    </div>`;
  modal.classList.add('show');
}

function openWorkbenchPersonDetail(name) {
  const data = WORKBENCH_PERSON_DATA[name];
  const modal = document.getElementById('wb-person-modal');
  const title = document.getElementById('wb-person-title');
  const subtitle = document.getElementById('wb-person-subtitle');
  const body = document.getElementById('wb-person-body');
  if (!modal || !title || !body || !data) return;
  if (subtitle) subtitle.textContent = '查看个人处理量、质量表现与风险需求。';
  title.textContent = `${name} 个人看板`;
  body.innerHTML = `
    <div class="wb-person-kpis">
      <div class="wb-person-kpi"><span>处理量</span><strong>${data.kpis[0]}</strong></div>
      <div class="wb-person-kpi"><span>语法准确率</span><strong>${data.kpis[1]}</strong></div>
      <div class="wb-person-kpi"><span>一稿通过率</span><strong>${data.kpis[2]}</strong></div>
      <div class="wb-person-kpi"><span>AI 采纳率</span><strong>${data.kpis[3]}</strong></div>
      <div class="wb-person-kpi"><span>当前负载</span><strong>${data.kpis[4]}</strong></div>
    </div>
    <div class="wb-person-detail-grid">
      <div class="wb-person-card"><h3>需求类型分布</h3><p>${data.type}</p></div>
      <div class="wb-person-card"><h3>主要质量问题</h3><ul>${data.issues.map(item => `<li>${item}</li>`).join('')}</ul></div>
    </div>`;
  modal.classList.add('show');
}

function closeWorkbenchPersonDetail() {
  const modal = document.getElementById('wb-person-modal');
  if (modal) modal.classList.remove('show');
}

function openWorkbenchRiskOverview() {
  const modal = document.getElementById('wb-risk-modal');
  if (modal) modal.classList.add('show');
}

function closeWorkbenchRiskOverview() {
  const modal = document.getElementById('wb-risk-modal');
  if (modal) modal.classList.remove('show');
}

const WORKBENCH_DEMAND_EXTRA_ROWS = [
  ['新品 Listing', '新品 Listing：EB1521048', '健康护理 BU · 德国站 · 迷你便携药盒', '需求审核', '当前：需求审核', ''],
  ['新品 Listing', '新品 Listing：EB1522091', '家居生活 BU · 日本站 · 便携按摩枪', '文案生成', '当前：文案生成', ''],
  ['新品 Listing', '新品 Listing：EB1523305', '健康护理 BU · 加拿大站 · 智能血压仪', '已完成', '当前：已完成', 'good'],
  ['优化 Title/TD', '优化 Title/TD：PO20A1101', '健康护理 BU · 美国站 · 智能温控药盒', '需求审核', '当前：需求审核', ''],
  ['优化 Title/TD', '优化 Title/TD：PO21C3301', '家居生活 BU · 德国站 · 加热颈椎仪', '文案审核', '当前：文案审核', 'warn'],
  ['优化 Title/TD', '优化 Title/TD：PO22F6601', '健康护理 BU · 英国站 · 便携血氧仪', '已完成', '当前：已完成', 'good'],
  ['Listing 图片文案', 'Listing 图片文案：PX2021077', '家居生活 BU · 英国站 · 桌面收纳套装', '文案审核', '当前：文案审核', 'warn'],
  ['Listing 图片文案', 'Listing 图片文案：PX2021120', '健康护理 BU · 美国站 · 药盒旅行装', '文案生成', '当前：文案生成', ''],
  ['Listing 图片文案', 'Listing 图片文案：PX2021198', '家居生活 BU · 加拿大站 · 收纳药盒组合', '已完成', '当前：已完成', 'good'],
  ['包装盒', '包装盒：BX2209045', '健康护理 BU · 美国站 · 便携血氧仪', '需求审核', '当前：需求审核', ''],
  ['包装盒', '包装盒：BX2209099', '家居生活 BU · 德国站 · 家用按摩枪', '文案审核', '当前：文案审核', 'warn'],
  ['包装盒', '包装盒：BX2209186', '健康护理 BU · 英国站 · 7格便携药盒', '已完成', '当前：已完成', 'good'],
  ['说明书', '说明书：MN3001150', '健康护理 BU · 加拿大站 · 颈椎理疗仪', '需求审核', '当前：需求审核', ''],
  ['说明书', '说明书：MN3001233', '家居生活 BU · 美国站 · 智能按摩仪', '文案生成', '当前：文案生成', ''],
  ['说明书', '说明书：MN3001298', '健康护理 BU · 日本站 · 温控药盒', '已完成', '当前：已完成', 'good'],
  ['视频脚本文案', '视频脚本文案：AS8012112', '家居生活 BU · 德国站 · 智能收纳药盒', '需求审核', '当前：需求审核', ''],
  ['视频脚本文案', '视频脚本文案：AS8012230', '健康护理 BU · 加拿大站 · 家用理疗仪', '文案审核', '当前：文案审核', 'warn'],
  ['视频脚本文案', '视频脚本文案：AS8012344', '家居生活 BU · 英国站 · 便携按摩器', '已完成', '当前：已完成', 'good'],
  ['FAQ', 'FAQ：FQ8801240', '家居生活 BU · 美国站 · 智能按摩枪', '需求审核', '当前：需求审核', ''],
  ['FAQ', 'FAQ：FQ8801288', '健康护理 BU · 加拿大站 · 理疗贴片', '文案审核', '当前：文案审核', 'warn'],
  ['FAQ', 'FAQ：FQ8801320', '健康护理 BU · 德国站 · 温控药盒', '已完成', '当前：已完成', 'good'],
  ['新闻稿', '新闻稿：PR240430', '健康护理 BU · 加拿大站 · 新品上市传播', '需求审核', '当前：需求审核', ''],
  ['新闻稿', '新闻稿：PR240506', '家居生活 BU · 美国站 · 活动传播', '文案生成', '当前：文案生成', ''],
  ['新闻稿', '新闻稿：PR240512', '健康护理 BU · 英国站 · 品牌传播', '已完成', '当前：已完成', 'good'],
];

function renderWorkbenchDemandRow([type, title, meta, currentStage, statusText, statusClass]) {
  const stages = ['需求提交', '需求审核', '文案生成', '文案审核', '已完成'];
  const activeIndex = stages.indexOf(currentStage);
  const dueText = statusClass === 'danger' ? '已逾期' : statusClass === 'warn' ? '即将逾期' : '正常';
  const stageHtml = stages.map((stage, index) => {
    const classes = [];
    if (index < activeIndex || currentStage === '已完成') classes.push('done');
    if (index === activeIndex) classes.push('active');
    return `<span class="${classes.join(' ')}">${stage}</span>`;
  }).join('');
  return `<div class="wb-demand-row is-hidden" data-demand-type="${type}" data-generated="true">
    <div class="demand-main">
      <strong>${title}</strong>
      <span>${meta}</span>
    </div>
    <div class="demand-progress">${stageHtml}</div>
    <em class="demand-status ${statusClass || ''}">${dueText} · ${statusText}</em>
  </div>`;
}

function ensureWorkbenchDemandRows() {
  const list = document.querySelector('#wb-demand-modal .wb-demand-list');
  if (!list || list.dataset.extraReady === 'true') return;
  list.insertAdjacentHTML('beforeend', WORKBENCH_DEMAND_EXTRA_ROWS.map(renderWorkbenchDemandRow).join(''));
  list.dataset.extraReady = 'true';
}

function openWorkbenchDemandOverview(type = '新品 Listing') {
  const modal = document.getElementById('wb-demand-modal');
  if (modal) {
    modal.classList.add('show');
    ensureWorkbenchDemandRows();
    filterWorkbenchDemandType(type);
  }
}

function closeWorkbenchDemandOverview() {
  const modal = document.getElementById('wb-demand-modal');
  if (modal) modal.classList.remove('show');
}

function filterWorkbenchDemandType(type) {
  document.querySelectorAll('.wb-demand-type-card').forEach(card => {
    card.classList.toggle('active', card.dataset.demandType === type);
  });
  document.querySelectorAll('.wb-demand-row').forEach(row => {
    row.classList.toggle('is-hidden', row.dataset.demandType !== type);
  });
  const title = document.getElementById('wb-demand-detail-title');
  if (title) title.textContent = `${type} 进度明细`;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeWorkbenchDemandOverview();
    closeWorkbenchPersonDetail();
    closeWorkbenchRiskOverview();
    closeWorkbenchKpiDetail();
    closeWorkbenchQualityDetail();
  }
});


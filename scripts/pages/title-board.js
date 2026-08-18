/* ============================================
   Title 看板 - PN 维度在售 Listing 与头部竞品对比
   ============================================ */

const TB_MAX_COMPETITORS = 3;
const TB_ASIN_PATTERN = /^B0[A-Z0-9]{8}$/i;
const TB_MOCK_BRANDS = ['MedPro', 'HealthPlus', 'CareLine', 'VitaBox', 'ZenCare', 'PureAid', 'NovaMed'];

const titleBoardState = {
  filters: { brand: '', site: '' },
  searchQuery: '',
  searchOpen: false,
  searchActiveIndex: -1,
  searchTimer: null,
  expandedLines: [],
  selectedPn: '',
  selectedVariantKey: '',
  activeCompareTab: 'own',
  competitorAsinsByVariant: {},
  competitorDataByAsin: {},
  competitorLoadingAsins: {},
  competitorAddError: {},
  competitorAddDraft: {},
  versionDrawerKey: '',
  versionDrawerSelectedVersion: null,
  lastGlobalSyncAt: typeof TITLE_BOARD_LAST_GLOBAL_SYNC !== 'undefined' ? TITLE_BOARD_LAST_GLOBAL_SYNC : '',
  lastSyncResult: null,
};

function renderTitleBoardView() {
  const root = document.getElementById('title-board-view');
  if (!root) return;
  tbEnsureSearchOutsideHandler();

  const filtered = tbGetFilteredRecords();
  let selectedPnChanged = false;

  if (!filtered.some(item => item.pn === titleBoardState.selectedPn)) {
    titleBoardState.selectedPn = filtered[0]?.pn || '';
    titleBoardState.selectedVariantKey = '';
    titleBoardState.activeCompareTab = 'own';
    selectedPnChanged = true;
  }

  const selectedRecord = tbGetSelectedRecord();
  if (selectedPnChanged && selectedRecord && !titleBoardState.expandedLines.includes(selectedRecord.productLine)) {
    titleBoardState.expandedLines.push(selectedRecord.productLine);
  }
  tbEnsureAllCompetitorSelections(selectedRecord);
  const activeVariants = selectedRecord ? selectedRecord.variants.filter(tbIsActiveVariant) : [];

  root.innerHTML = `
    <div class="tb-app">
      <header class="tb-header">
        <div>
          <span class="tb-eyebrow">AMAZON LISTING CONTENT</span>
          <h1>Title 看板</h1>
          <p>按 PN 查看公司全部亚马逊在售商品的 Title 与 Highlight，并在同一页面与头部竞品逐条对比。</p>
        </div>
        <div class="tb-header-summary">
          <span>PN数据</span>
          <strong>${filtered.length}</strong>
        </div>
      </header>

      ${tbRenderFilters()}

      <div class="tb-workspace">
        <aside class="tb-pn-panel">
          <div class="tb-panel-head">
            <div>
              <h2>品线 / PN</h2>
              <p>展开品线，选择需要查看的 PN</p>
            </div>
          </div>
          <div class="tb-line-tree">
            ${TITLE_BOARD_PRODUCT_LINES.map(line => tbRenderProductLine(line, filtered)).join('')}
          </div>
        </aside>

        <main class="tb-compare-panel">
          ${selectedRecord && activeVariants.length
            ? tbRenderComparison(selectedRecord)
            : tbRenderNoSelection()}
        </main>
      </div>
      ${titleBoardState.versionDrawerKey ? tbRenderVersionDrawer() : ''}
    </div>`;
}

function tbRenderFilters() {
  const brands = tbUnique(TITLE_BOARD_RECORDS.map(item => item.brand));
  const sites = tbUnique(TITLE_BOARD_RECORDS.flatMap(item => item.variants.filter(tbIsActiveVariant).map(item => item.site)));
  const filters = titleBoardState.filters;

  return `
    <section class="tb-filters">
      <div class="tb-search">
        <span class="tb-search-icon">⌕</span>
        <input value="${tbEscapeAttr(titleBoardState.searchQuery)}" placeholder="搜索 PN"
          oninput="tbHandleSearchInput(this.value)"
          onfocus="tbOpenSearch()"
          onkeydown="tbHandleSearchKeydown(event)">
        <button type="button" class="tb-search-clear" onclick="tbClearSearch()" ${titleBoardState.searchQuery ? '' : 'hidden'}>×</button>
        <div class="tb-search-results ${titleBoardState.searchOpen ? 'open' : ''}">
          ${titleBoardState.searchOpen ? tbRenderSearchSuggestions() : ''}
        </div>
      </div>
      <select onchange="tbSetFilter('brand', this.value)">
        <option value="">全部品牌</option>
        ${brands.map(value => `<option value="${tbEscapeAttr(value)}" ${filters.brand === value ? 'selected' : ''}>${tbEscapeHtml(value)}</option>`).join('')}
      </select>
      <select onchange="tbSetFilter('site', this.value)">
        <option value="">全部站点</option>
        ${sites.map(value => `<option value="${tbEscapeAttr(value)}" ${filters.site === value ? 'selected' : ''}>${tbEscapeHtml(value)}</option>`).join('')}
      </select>
      <span class="tb-active-only">仅显示亚马逊在售</span>
      <button type="button" class="tb-reset-btn" onclick="tbResetFilters()">重置</button>
    </section>`;
}

function tbGetSearchSuggestions() {
  const query = tbNormalizeSearch(titleBoardState.searchQuery);
  if (!query) return [];
  return tbGetFilteredRecords()
    .filter(record => tbNormalizeSearch(record.pn).includes(query))
    .slice(0, 8)
    .map(record => ({ type: 'pn', record }));
}

function tbRenderSearchSuggestions() {
  const suggestions = tbGetSearchSuggestions();
  if (!suggestions.length) {
    return '<div class="tb-search-empty">未找到相关 PN</div>';
  }
  return suggestions.map((item, index) => {
    const active = index === titleBoardState.searchActiveIndex ? 'active' : '';
    return `
      <button type="button" class="tb-search-result tb-search-result-code ${active}"
        onclick="tbSelectSearchResult('${tbEscapeAttr(item.record.pn)}')">
        ${tbHighlightSearchMatch(item.record.pn)}
      </button>`;
  }).join('');
}

function tbHighlightSearchMatch(value) {
  const text = String(value || '');
  const query = tbNormalizeSearch(titleBoardState.searchQuery);
  if (!query) return tbEscapeHtml(text);
  const normalizedText = tbNormalizeSearch(text);
  const start = normalizedText.indexOf(query);
  if (start < 0) return tbEscapeHtml(text);

  const map = [];
  Array.from(text).forEach((character, index) => {
    if (tbNormalizeSearch(character)) map.push(index);
  });
  const startIndex = map[start];
  const endIndex = (map[start + query.length - 1] ?? startIndex) + 1;
  return `${tbEscapeHtml(text.slice(0, startIndex))}<mark>${tbEscapeHtml(text.slice(startIndex, endIndex))}</mark>${tbEscapeHtml(text.slice(endIndex))}`;
}

function tbHandleSearchInput(value) {
  titleBoardState.searchQuery = value;
  titleBoardState.searchActiveIndex = 0;
  clearTimeout(titleBoardState.searchTimer);
  const clearButton = document.querySelector('#title-board-view .tb-search-clear');
  if (clearButton) clearButton.hidden = !value;
  titleBoardState.searchTimer = setTimeout(() => {
    titleBoardState.searchOpen = Boolean(value.trim());
    tbUpdateSearchDropdown();
  }, 150);
}

function tbOpenSearch() {
  if (!titleBoardState.searchQuery.trim()) return;
  titleBoardState.searchOpen = true;
  if (titleBoardState.searchActiveIndex < 0) titleBoardState.searchActiveIndex = 0;
  tbUpdateSearchDropdown();
}

function tbHandleSearchKeydown(event) {
  const suggestions = tbGetSearchSuggestions();
  if (event.key === 'Escape') {
    titleBoardState.searchOpen = false;
    tbUpdateSearchDropdown();
    return;
  }
  if (!suggestions.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const current = Math.max(0, titleBoardState.searchActiveIndex);
    titleBoardState.searchActiveIndex = (current + step + suggestions.length) % suggestions.length;
    titleBoardState.searchOpen = true;
    tbUpdateSearchDropdown();
    return;
  }
  if (event.key === 'Enter' && titleBoardState.searchOpen) {
    event.preventDefault();
    const item = suggestions[Math.max(0, titleBoardState.searchActiveIndex)] || suggestions[0];
    if (!item) return;
    tbSelectSearchResult(item.record.pn);
  }
}

function tbUpdateSearchDropdown() {
  const dropdown = document.querySelector('#title-board-view .tb-search-results');
  if (!dropdown) return;
  dropdown.classList.toggle('open', titleBoardState.searchOpen);
  dropdown.innerHTML = titleBoardState.searchOpen ? tbRenderSearchSuggestions() : '';
}

function tbClearSearch() {
  clearTimeout(titleBoardState.searchTimer);
  titleBoardState.searchQuery = '';
  titleBoardState.searchOpen = false;
  titleBoardState.searchActiveIndex = -1;
  const input = document.querySelector('#title-board-view .tb-search input');
  const clearButton = document.querySelector('#title-board-view .tb-search-clear');
  if (input) {
    input.value = '';
    input.focus();
  }
  if (clearButton) clearButton.hidden = true;
  tbUpdateSearchDropdown();
}

function tbSelectSearchResult(pn, variantKey = '', displayValue = '') {
  const record = TITLE_BOARD_RECORDS.find(item => item.pn === pn);
  if (!record) return;
  const variant = variantKey
    ? record.variants.find(item => tbVariantKey(item) === variantKey)
    : null;
  titleBoardState.searchQuery = displayValue || (variant ? variant.sku : pn);
  titleBoardState.searchOpen = false;
  titleBoardState.searchActiveIndex = -1;
  titleBoardState.selectedPn = pn;
  titleBoardState.selectedVariantKey = variantKey;
  titleBoardState.activeCompareTab = variantKey || 'own';
  if (!titleBoardState.expandedLines.includes(record.productLine)) {
    titleBoardState.expandedLines.push(record.productLine);
  }
  renderTitleBoardView();
  requestAnimationFrame(() => {
    document.querySelector('#title-board-view .tb-pn-item.active')?.scrollIntoView({ block: 'nearest' });
  });
}

let tbSearchOutsideBound = false;
function tbEnsureSearchOutsideHandler() {
  if (tbSearchOutsideBound) return;
  document.addEventListener('click', event => {
    if (!titleBoardState.searchOpen || event.target.closest('#title-board-view .tb-search')) return;
    titleBoardState.searchOpen = false;
    tbUpdateSearchDropdown();
  });
  tbSearchOutsideBound = true;
}

function tbRenderProductLine(line, records) {
  const expanded = titleBoardState.expandedLines.includes(line);
  const lineRecords = records.filter(record => record.productLine === line);
  return `
    <section class="tb-line-group ${expanded ? 'expanded' : ''}">
      <button type="button" class="tb-line-toggle" onclick="tbToggleProductLine('${tbEscapeAttr(line)}')">
        <span>${tbEscapeHtml(line)}</span>
        <i>›</i>
      </button>
      ${expanded ? `<div class="tb-line-pns">${lineRecords.map(tbRenderPnItem).join('')}</div>` : ''}
    </section>`;
}

function tbRenderPnItem(record) {
  const skuCount = tbUnique(record.variants.filter(tbIsActiveVariant).map(item => item.sku)).length;
  const active = record.pn === titleBoardState.selectedPn;
  return `
    <button type="button" class="tb-pn-item ${active ? 'active' : ''}" onclick="tbSelectPn('${tbEscapeAttr(record.pn)}')">
      <span>${tbEscapeHtml(record.pn)}</span>
      <strong>${skuCount} SKU</strong>
    </button>`;
}

function tbRenderComparison(record) {
  const variants = record.variants.filter(tbIsActiveVariant);
  tbEnsureActiveCompareTab(variants);
  const activeTab = titleBoardState.activeCompareTab;
  const activeVariant = variants.find(item => tbVariantKey(item) === activeTab) || null;

  return `
    <section class="tb-identity">
      <div class="tb-pn-summary">
        <small>PN</small>
        <strong>${tbEscapeHtml(record.pn)}</strong>
        <span>${tbEscapeHtml(record.productLine)} · ${variants.length} 个在售 SKU</span>
      </div>
    </section>

    <section class="tb-compare-tabs-wrap">
      <div class="tb-compare-tabs" role="tablist">
        <button type="button" role="tab" class="tb-compare-tab ${activeTab === 'own' ? 'active' : ''}"
          onclick="tbSetCompareTab('own')">PN ASIN概览</button>
        ${variants.map(variant => {
          const key = tbVariantKey(variant);
          return `
            <button type="button" role="tab" class="tb-compare-tab ${activeTab === key ? 'active' : ''}"
              onclick="tbSetCompareTab('${tbEscapeAttr(key)}')">${tbEscapeHtml(variant.site)} · ${tbEscapeHtml(variant.sku)}</button>`;
        }).join('')}
      </div>
      <section class="tb-matrix-section">
        ${activeTab === 'own'
          ? tbRenderOwnSkuMatrix(record, variants)
          : tbRenderSkuCompetitorMatrix(record, activeVariant)}
      </section>
    </section>`;
}

function tbEnsureActiveCompareTab(variants) {
  const keys = variants.map(tbVariantKey);
  if (titleBoardState.selectedVariantKey && keys.includes(titleBoardState.selectedVariantKey)) {
    titleBoardState.activeCompareTab = titleBoardState.selectedVariantKey;
    titleBoardState.selectedVariantKey = '';
    return;
  }
  if (titleBoardState.activeCompareTab !== 'own' && !keys.includes(titleBoardState.activeCompareTab)) {
    titleBoardState.activeCompareTab = 'own';
  }
}

function tbSetCompareTab(tab) {
  titleBoardState.activeCompareTab = tab;
  renderTitleBoardView();
}

const TB_LISTING_FIELD_LABELS = {
  title: 'Title',
  highlight: 'Highlight',
  TD1: 'TD1',
  TD2: 'TD2',
  TD3: 'TD3',
  TD4: 'TD4',
  TD5: 'TD5',
};

function tbListingSnapshotFromVariant(variant) {
  return {
    title: String(variant?.title || '').trim(),
    highlight: String(variant?.highlight || '').trim(),
    highlights: Array.from({ length: 5 }, (_, index) => String(variant?.highlights?.[index] || '').trim()),
  };
}

function tbApplyListingSnapshotToVariant(variant, snapshot) {
  variant.title = snapshot.title;
  variant.highlight = snapshot.highlight;
  variant.highlights = [...snapshot.highlights];
}

function tbDetectListingChanges(prevSnapshot, nextSnapshot) {
  const changes = [];
  if ((prevSnapshot?.title || '') !== (nextSnapshot?.title || '')) changes.push('title');
  if ((prevSnapshot?.highlight || '') !== (nextSnapshot?.highlight || '')) changes.push('highlight');
  for (let index = 0; index < 5; index += 1) {
    const fieldKey = `TD${index + 1}`;
    if ((prevSnapshot?.highlights?.[index] || '') !== (nextSnapshot?.highlights?.[index] || '')) {
      changes.push(fieldKey);
    }
  }
  return changes;
}

function tbEnsureVariantVersions(variant) {
  if (!variant) return;
  const snapshot = tbListingSnapshotFromVariant(variant);
  if (!Array.isArray(variant.versions) || !variant.versions.length) {
    const syncedAt = variant.lastSyncedAt || variant.fetchedAt || titleBoardState.lastGlobalSyncAt || '2026-08-07 06:00';
    variant.versions = [{
      version: 1,
      syncedAt,
      source: 'amazon-scrape',
      snapshot,
      changes: [],
    }];
    variant.currentVersion = 1;
    variant.lastSyncedAt = syncedAt;
    return;
  }
  if (!variant.currentVersion) {
    variant.currentVersion = variant.versions[variant.versions.length - 1]?.version || 1;
  }
  if (!variant.lastSyncedAt) {
    variant.lastSyncedAt = variant.versions[variant.versions.length - 1]?.syncedAt || variant.fetchedAt || '';
  }
}

function tbGetVariantVersionEntry(variant, versionNumber) {
  tbEnsureVariantVersions(variant);
  return variant.versions.find(item => item.version === versionNumber) || null;
}

function tbGetLatestVersionEntry(variant) {
  tbEnsureVariantVersions(variant);
  return variant.versions.find(item => item.version === variant.currentVersion)
    || variant.versions[variant.versions.length - 1]
    || null;
}

function tbGetPreviousVersionEntry(variant, versionNumber) {
  tbEnsureVariantVersions(variant);
  const sorted = [...variant.versions].sort((a, b) => a.version - b.version);
  const index = sorted.findIndex(item => item.version === versionNumber);
  return index > 0 ? sorted[index - 1] : null;
}

function tbGetVariantChanges(variant) {
  const latest = tbGetLatestVersionEntry(variant);
  return Array.isArray(latest?.changes) ? latest.changes : [];
}

function tbFormatChangeLabels(changes) {
  return (changes || []).map(key => TB_LISTING_FIELD_LABELS[key] || key);
}

function tbFindVariantByKey(variantKey) {
  for (const record of TITLE_BOARD_RECORDS) {
    const variant = record.variants.find(item => tbVariantKey(item) === variantKey);
    if (variant) return { record, variant };
  }
  return { record: null, variant: null };
}

function tbGetAllActiveVariants() {
  return TITLE_BOARD_RECORDS.flatMap(record =>
    record.variants.filter(tbIsActiveVariant).map(variant => ({ record, variant }))
  );
}

function tbCountVariantsWithRecentChanges(variants) {
  return variants.filter(variant => tbGetVariantChanges(variant).length > 0).length;
}

function tbAdvanceSyncTimestamp(currentValue) {
  const base = String(currentValue || titleBoardState.lastGlobalSyncAt || '2026-08-07 06:00');
  const match = base.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}):(\d{2})$/);
  if (!match) return '2026-08-08 06:00';
  const date = new Date(`${match[1]}T${match[2]}:${match[3]}:00`);
  date.setDate(date.getDate() + 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} 06:00`;
}

function tbApplyListingSyncToVariant(variant, nextSnapshot, syncedAt) {
  tbEnsureVariantVersions(variant);
  const currentSnapshot = tbListingSnapshotFromVariant(variant);
  const changes = tbDetectListingChanges(currentSnapshot, nextSnapshot);

  if (!changes.length) {
    variant.lastSyncedAt = syncedAt;
    variant.fetchedAt = syncedAt;
    return { changed: false, changes: [] };
  }

  const nextVersion = (variant.currentVersion || variant.versions.length) + 1;
  variant.versions.push({
    version: nextVersion,
    syncedAt,
    source: 'amazon-scrape',
    snapshot: {
      title: nextSnapshot.title,
      highlight: nextSnapshot.highlight,
      highlights: [...nextSnapshot.highlights],
    },
    changes,
  });
  variant.currentVersion = nextVersion;
  variant.lastSyncedAt = syncedAt;
  variant.fetchedAt = syncedAt;
  tbApplyListingSnapshotToVariant(variant, nextSnapshot);
  return { changed: true, changes };
}

function tbSimulateDailySync() {
  const syncedAt = tbAdvanceSyncTimestamp(titleBoardState.lastGlobalSyncAt);
  let changedCount = 0;
  const changedSkus = [];

  tbGetAllActiveVariants().forEach(({ variant }) => {
    const key = tbVariantKey(variant);
    const preset = typeof TITLE_BOARD_NEXT_SYNC_SNAPSHOTS !== 'undefined'
      ? TITLE_BOARD_NEXT_SYNC_SNAPSHOTS[key]
      : null;
    const nextSnapshot = preset || tbListingSnapshotFromVariant(variant);
    const result = tbApplyListingSyncToVariant(variant, nextSnapshot, syncedAt);
    if (result.changed) {
      changedCount += 1;
      changedSkus.push(variant.sku);
    }
  });

  titleBoardState.lastGlobalSyncAt = syncedAt;
  titleBoardState.lastSyncResult = { syncedAt, changedCount, changedSkus };
  renderTitleBoardView();
}

function tbOpenVersionDrawer(variantKey, versionNumber = null) {
  titleBoardState.versionDrawerKey = variantKey;
  const { variant } = tbFindVariantByKey(variantKey);
  tbEnsureVariantVersions(variant);
  titleBoardState.versionDrawerSelectedVersion = versionNumber || variant?.currentVersion || null;
  renderTitleBoardView();
}

function tbCloseVersionDrawer() {
  titleBoardState.versionDrawerKey = '';
  titleBoardState.versionDrawerSelectedVersion = null;
  renderTitleBoardView();
}

function tbSelectVersionInDrawer(versionNumber) {
  titleBoardState.versionDrawerSelectedVersion = Number(versionNumber);
  renderTitleBoardView();
}

function tbRenderSyncBar(variants) {
  const changedCount = tbCountVariantsWithRecentChanges(variants);
  const lastSync = titleBoardState.lastGlobalSyncAt || TITLE_BOARD_LAST_GLOBAL_SYNC || '—';
  const resultHint = titleBoardState.lastSyncResult
    ? ` · 本次 ${titleBoardState.lastSyncResult.changedCount} 个 SKU 有变更`
    : (changedCount ? ` · ${changedCount} 个 SKU 近期有变更` : '');

  return `
    <div class="tb-sync-bar">
      <button type="button" class="tb-sync-btn" onclick="tbSimulateDailySync()">获取最新数据</button>
      <span class="tb-sync-meta">上次全量同步：${tbEscapeHtml(lastSync)}${tbEscapeHtml(resultHint)}</span>
    </div>`;
}

function tbRenderVersionDrawer() {
  const { record, variant } = tbFindVariantByKey(titleBoardState.versionDrawerKey);
  if (!record || !variant) return '';

  tbEnsureVariantVersions(variant);
  const versions = [...variant.versions].sort((a, b) => b.version - a.version);
  const selectedVersion = titleBoardState.versionDrawerSelectedVersion || variant.currentVersion;
  const selectedEntry = tbGetVariantVersionEntry(variant, selectedVersion);
  const previousEntry = tbGetPreviousVersionEntry(variant, selectedVersion);

  return `
    <div class="tb-version-overlay" onclick="tbCloseVersionDrawer()">
      <aside class="tb-version-drawer" onclick="event.stopPropagation()">
        <header class="tb-version-drawer-head">
          <div>
            <small>版本历史</small>
            <strong>${tbEscapeHtml(variant.sku)} · ${tbEscapeHtml(variant.site)}</strong>
            <span>${tbEscapeHtml(record.pn)} · ${tbEscapeHtml(variant.asin)}</span>
          </div>
          <button type="button" class="tb-version-close" onclick="tbCloseVersionDrawer()" aria-label="关闭">×</button>
        </header>
        <div class="tb-version-list">
          ${versions.map(entry => {
            const active = entry.version === selectedVersion ? 'active' : '';
            const isCurrent = entry.version === variant.currentVersion;
            const changeText = entry.changes?.length
              ? tbFormatChangeLabels(entry.changes).join('、')
              : (entry.version === 1 ? '初始版本' : '无字段变更');
            return `
              <button type="button" class="tb-version-item ${active}" onclick="tbSelectVersionInDrawer(${entry.version})">
                <div class="tb-version-item-top">
                  <strong>v${entry.version}</strong>
                  <span>${tbEscapeHtml(entry.syncedAt)}</span>
                  ${isCurrent ? '<em class="tb-version-current">当前</em>' : ''}
                </div>
                <p>变更：${tbEscapeHtml(changeText)}</p>
              </button>`;
          }).join('')}
        </div>
        <section class="tb-version-diff">
          <h3>字段对比 ${previousEntry ? `(v${previousEntry.version} → v${selectedEntry?.version || selectedVersion})` : `(v${selectedVersion} 初始)`}</h3>
          ${tbRenderVersionDiff(previousEntry?.snapshot || null, selectedEntry?.snapshot || null, selectedEntry?.changes || [])}
        </section>
      </aside>
    </div>`;
}

function tbRenderVersionDiff(previousSnapshot, currentSnapshot, changedFields) {
  const rows = [
    { key: 'title', label: 'Title' },
    { key: 'highlight', label: 'Highlight' },
    ...Array.from({ length: 5 }, (_, index) => ({
      key: `TD${index + 1}`,
      label: `TD${index + 1}`,
    })),
  ];

  return `
    <div class="tb-version-diff-table">
      <div class="tb-version-diff-row tb-version-diff-head">
        <span>字段</span>
        <span>上一版</span>
        <span>选中版本</span>
      </div>
      ${rows.map(row => {
        const prevValue = row.key.startsWith('TD')
          ? (previousSnapshot?.highlights?.[Number(row.key.slice(2)) - 1] || '')
          : (previousSnapshot?.[row.key] || '');
        const currValue = row.key.startsWith('TD')
          ? (currentSnapshot?.highlights?.[Number(row.key.slice(2)) - 1] || '')
          : (currentSnapshot?.[row.key] || '');
        const changed = changedFields.includes(row.key);
        return `
          <div class="tb-version-diff-row ${changed ? 'changed' : ''}">
            <span class="tb-version-diff-label">${row.label}${changed ? '<i>已变更</i>' : ''}</span>
            <span class="tb-version-diff-value">${prevValue ? tbEscapeHtml(prevValue) : '—'}</span>
            <span class="tb-version-diff-value">${currValue ? tbEscapeHtml(currValue) : '—'}</span>
          </div>`;
      }).join('')}
    </div>`;
}

function tbClampText(value, limit) {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.length > limit ? text.slice(0, limit) : text;
}

function tbGetProductHighlight(source) {
  if (source.highlight) return tbClampText(source.highlight, 125);
  const bullets = source.highlights || source.bullets || [];
  if (!bullets.length) return '—';
  return tbClampText(bullets[0], 125);
}

function tbBuildOwnProduct(record, variant, options = {}) {
  return {
    type: 'own',
    image: record.image,
    label: options.label || `${variant.site} · ${variant.sku}`,
    name: `${record.brand} · ${variant.asin}`,
    meta: variant.price || '—',
    title: variant.title,
    highlight: tbGetProductHighlight(variant),
    highlights: variant.highlights,
    seoKeywords: Array.isArray(variant.seoKeywords) ? variant.seoKeywords : [],
    rating: variant.rating,
    url: variant.amazonUrl,
  };
}

function tbBuildCompetitorProduct(item, index) {
  return {
    type: 'competitor',
    competitorIndex: index,
    asin: item.asin,
    loading: false,
    image: item.image,
    label: '竞品',
    name: `${item.brand || '—'} · ${item.asin}`,
    meta: `${item.site || '—'} · ${item.price || '—'} · ${item.rating || '—'} 分`,
    title: item.title || '—',
    highlight: tbGetProductHighlight(item),
    highlights: Array.isArray(item.bullets) ? item.bullets : [],
    seoKeywords: [],
    rating: item.rating,
    url: item.link || '',
  };
}

function tbBuildCompetitorProductLoading(asin, index) {
  return {
    type: 'competitor',
    competitorIndex: index,
    asin,
    loading: true,
    label: '竞品',
    image: '',
    name: asin,
    meta: '爬取中',
    title: '—',
    highlight: '—',
    highlights: [],
    seoKeywords: [],
    rating: null,
    url: '',
  };
}

function tbHashString(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function tbNormalizeAsin(value) {
  return String(value || '').trim().toUpperCase();
}

function tbValidateAsin(asin) {
  return TB_ASIN_PATTERN.test(asin);
}

function tbGenerateMockCompetitorData(asin, site) {
  const hash = tbHashString(asin);
  const brand = TB_MOCK_BRANDS[hash % TB_MOCK_BRANDS.length];
  const rating = Number((3.8 + (hash % 12) / 10).toFixed(1));
  const priceCents = 699 + (hash % 1800);
  const price = site === 'UK' ? `£${(priceCents / 100).toFixed(2)}` : site === 'DE' ? `€${(priceCents / 100).toFixed(2)}` : `$${(priceCents / 100).toFixed(2)}`;
  const titleBase = `${brand} ${site} Amazon Listing Product ${asin.slice(-4)} with Premium Features and Reliable Daily Use`;
  const title = titleBase.length > 73 ? titleBase.slice(0, 73) : titleBase;
  const highlightBase = `Discover ${brand} quality designed for everyday convenience. Compact, durable, and shopper-trusted on Amazon ${site}.`;
  const highlight = highlightBase.length > 125 ? highlightBase.slice(0, 125) : highlightBase;
  const bulletSeeds = [
    'Premium build quality for daily use',
    'Compact design fits travel and home routines',
    'Easy to clean and maintain over time',
    'Trusted by thousands of verified buyers',
    'Great value with consistent performance',
  ];
  const bullets = bulletSeeds.map((text, index) => {
    const suffix = ` · ${asin.slice(-3)}-${index + 1}`;
    const combined = `${text}${suffix}`;
    return combined.length > 100 ? combined.slice(0, 100) : combined;
  });

  return {
    asin,
    brand,
    site: site || 'US',
    title,
    highlight,
    bullets,
    rating,
    price,
    image: `https://picsum.photos/seed/${encodeURIComponent(asin)}/120/120`,
    link: `https://www.amazon.${site === 'UK' ? 'co.uk' : site === 'DE' ? 'de' : 'com'}/dp/${asin}`,
  };
}

function tbMockFetchAsin(asin, site) {
  return new Promise(resolve => {
    setTimeout(() => resolve(tbGenerateMockCompetitorData(asin, site)), 1500);
  });
}

function tbStartCompetitorCrawl(asin, site) {
  if (titleBoardState.competitorLoadingAsins[asin]) return;
  delete titleBoardState.competitorDataByAsin[asin];
  titleBoardState.competitorLoadingAsins[asin] = true;
  tbMockFetchAsin(asin, site).then(data => {
    if (!titleBoardState.competitorLoadingAsins[asin]) return;
    titleBoardState.competitorDataByAsin[asin] = data;
    delete titleBoardState.competitorLoadingAsins[asin];
    renderTitleBoardView();
  });
}

function tbEnsureCompetitorData(asin, site) {
  if (titleBoardState.competitorDataByAsin[asin] || titleBoardState.competitorLoadingAsins[asin]) return;
  const poolRecord = typeof competitorRecords === 'undefined'
    ? null
    : competitorRecords.find(item => item.asin === asin && item.site === site && item.status === '有效');
  if (poolRecord) {
    titleBoardState.competitorDataByAsin[asin] = poolRecord;
    return;
  }
  tbStartCompetitorCrawl(asin, site);
}

function tbRenderAddCompetitorBar(variantKey) {
  const draft = titleBoardState.competitorAddDraft[variantKey] || '';
  const error = titleBoardState.competitorAddError[variantKey] || '';
  const selectedCount = (titleBoardState.competitorAsinsByVariant[variantKey] || []).length;
  const atLimit = selectedCount >= TB_MAX_COMPETITORS;
  const inputId = `tb-add-asin-${variantKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  return `
    <div class="tb-add-competitor-bar">
      <label for="${tbEscapeAttr(inputId)}">添加竞品 ASIN</label>
      <div class="tb-add-competitor-controls">
        <input id="${tbEscapeAttr(inputId)}" value="${tbEscapeAttr(draft)}" placeholder="B0XXXXXXXX"
          ${atLimit ? 'disabled' : ''}
          oninput="tbHandleCompetitorAsinInput('${tbEscapeAttr(variantKey)}', this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();tbAddCompetitorFromBar('${tbEscapeAttr(variantKey)}', this);}">
        <button type="button" ${atLimit ? 'disabled' : ''} onclick="tbAddCompetitorFromBar('${tbEscapeAttr(variantKey)}', this.previousElementSibling)">添加</button>
      </div>
      <span class="tb-add-competitor-hint">${atLimit ? `已达上限 ${selectedCount}/${TB_MAX_COMPETITORS}` : `已添加 ${selectedCount}/${TB_MAX_COMPETITORS} 个竞品`}</span>
      ${error ? `<span class="tb-add-competitor-error">${tbEscapeHtml(error)}</span>` : ''}
    </div>`;
}

function tbHandleCompetitorAsinInput(variantKey, value) {
  titleBoardState.competitorAddDraft[variantKey] = value;
  if (titleBoardState.competitorAddError[variantKey]) {
    delete titleBoardState.competitorAddError[variantKey];
    const errorEl = document.querySelector('#title-board-view .tb-add-competitor-error');
    if (errorEl) errorEl.remove();
  }
}

function tbAddCompetitorFromBar(variantKey, inputEl) {
  const selected = titleBoardState.competitorAsinsByVariant[variantKey] || [];
  if (selected.length >= TB_MAX_COMPETITORS) return;
  tbAddCompetitorByAsin(variantKey, inputEl?.value || titleBoardState.competitorAddDraft[variantKey] || '');
}

function tbAddCompetitorByAsin(variantKey, rawAsin) {
  const asin = tbNormalizeAsin(rawAsin);
  titleBoardState.competitorAddDraft[variantKey] = rawAsin.trim();
  delete titleBoardState.competitorAddError[variantKey];

  if (!asin) {
    titleBoardState.competitorAddError[variantKey] = '请输入 ASIN';
    renderTitleBoardView();
    return;
  }
  if (!tbValidateAsin(asin)) {
    titleBoardState.competitorAddError[variantKey] = 'ASIN 格式不正确，应为 B0 开头的 10 位字符';
    renderTitleBoardView();
    return;
  }

  if (!Array.isArray(titleBoardState.competitorAsinsByVariant[variantKey])) {
    titleBoardState.competitorAsinsByVariant[variantKey] = [];
  }
  const selected = titleBoardState.competitorAsinsByVariant[variantKey];
  if (selected.includes(asin)) {
    titleBoardState.competitorAddError[variantKey] = '该 ASIN 已在对比中';
    renderTitleBoardView();
    return;
  }
  if (selected.length >= TB_MAX_COMPETITORS) {
    titleBoardState.competitorAddError[variantKey] = `最多添加 ${TB_MAX_COMPETITORS} 个竞品`;
    renderTitleBoardView();
    return;
  }

  selected.push(asin);
  titleBoardState.competitorAsinsByVariant[variantKey] = selected;
  titleBoardState.competitorAddDraft[variantKey] = '';

  const record = tbGetSelectedRecord();
  const variant = record?.variants.find(item => tbVariantKey(item) === variantKey);
  tbStartCompetitorCrawl(asin, variant?.site || 'US');
  renderTitleBoardView();
}

function tbRemoveCompetitor(variantKey, index) {
  const selected = titleBoardState.competitorAsinsByVariant[variantKey];
  if (!Array.isArray(selected) || index < 0 || index >= selected.length) return;
  const removed = selected.splice(index, 1)[0];
  titleBoardState.competitorAsinsByVariant[variantKey] = selected;
  const stillUsed = Object.values(titleBoardState.competitorAsinsByVariant).some(list => Array.isArray(list) && list.includes(removed));
  if (!stillUsed) delete titleBoardState.competitorLoadingAsins[removed];
  delete titleBoardState.competitorAddError[variantKey];
  renderTitleBoardView();
}

function tbRenderOwnSkuMatrix(record, variants) {
  variants.forEach(tbEnsureVariantVersions);
  const products = variants.map(variant => ({
    ...tbBuildOwnProduct(record, variant),
    variantKey: tbVariantKey(variant),
    changedFields: tbGetVariantChanges(variant),
    lastSyncedAt: variant.lastSyncedAt,
    currentVersion: variant.currentVersion,
  }));
  return `
    ${tbRenderSyncBar(variants)}
    ${tbRenderMatrixGrid(products, { allOwn: true, scrollable: variants.length > 1, showVersionMeta: true })}`;
}

function tbRenderSkuCompetitorMatrix(record, variant) {
  if (!variant) return '<div class="tb-search-empty">未找到 SKU</div>';
  const variantKey = tbVariantKey(variant);
  const selectedAsins = titleBoardState.competitorAsinsByVariant[variantKey] || [];
  const products = [
    tbBuildOwnProduct(record, variant, { label: '我方产品' }),
    ...selectedAsins.map((asin, index) => {
      if (titleBoardState.competitorLoadingAsins[asin] || !titleBoardState.competitorDataByAsin[asin]) {
        return tbBuildCompetitorProductLoading(asin, index);
      }
      return tbBuildCompetitorProduct(titleBoardState.competitorDataByAsin[asin], index);
    }),
  ];
  return `
    ${tbRenderAddCompetitorBar(variantKey)}
    ${tbRenderMatrixGrid(products, { variantKey, scrollable: products.length > 2 })}`;
}

function tbRenderCharacterCount(value, limit) {
  const count = String(value || '').length;
  return `<span class="tb-char-count ${count > limit ? 'over' : 'ok'}">${count}</span>`;
}

function tbHighlightSeoTerms(value, keywords) {
  const terms = keywords.filter(Boolean).sort((a, b) => b.length - a.length);
  if (!terms.length) return tbEscapeHtml(value);
  const pattern = new RegExp(`(${terms.map(tbEscapeRegExp).join('|')})`, 'gi');
  return String(value || '').split(pattern).map((part, index) =>
    index % 2 ? `<mark>${tbEscapeHtml(part)}</mark>` : tbEscapeHtml(part)
  ).join('');
}

function tbEscapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tbGetMatrixRows() {
  return [
    { label: 'Title', fieldKey: 'title', limit: 73, getValue: item => item.title },
    { label: 'Highlight', fieldKey: 'highlight', limit: 125, getValue: item => item.highlight },
    { label: '核心 SEO 词', type: 'seo', getValue: item => item.seoKeywords },
    { label: '星级', type: 'rating', getValue: item => item.rating },
    ...Array.from({ length: 5 }, (_, index) => ({
      label: `TD${index + 1}`,
      fieldKey: `TD${index + 1}`,
      limit: 100,
      getValue: item => item.highlights[index] || '—',
    })),
  ];
}

function tbRenderMatrixGrid(products, options = {}) {
  const {
    allOwn = false,
    scrollable = false,
    variantKey = '',
    showVersionMeta = false,
  } = options;
  const rows = tbGetMatrixRows();
  const scrollClass = scrollable ? ' tb-matrix-scroll-wide' : '';

  return `
    <div class="tb-matrix-scroll${scrollClass}">
      <div class="tb-matrix" style="--tb-product-count:${products.length}">
        <div class="tb-matrix-cell tb-field-head">对比字段</div>
        ${products.map((item, index) => tbRenderMatrixProductHead(
          item,
          allOwn || index === 0,
          variantKey,
          showVersionMeta
        )).join('')}
        ${rows.map(row => `
          <div class="tb-matrix-cell tb-field-cell">${row.label}</div>
          ${products.map((item, index) => {
            if (item.loading) return tbRenderMatrixLoadingCell(allOwn || index === 0);
            const changedFields = Array.isArray(item.changedFields) ? item.changedFields : [];
            const isChanged = row.fieldKey && changedFields.includes(row.fieldKey);
            return tbRenderMatrixContent(
              row.getValue(item),
              allOwn || index === 0,
              row.limit,
              item.seoKeywords,
              row.type,
              isChanged
            );
          }).join('')}
        `).join('')}
      </div>
    </div>`;
}

function tbRenderMatrixLoadingCell(isOwn) {
  return `
    <div class="tb-matrix-cell tb-content-cell tb-competitor-loading-cell ${isOwn ? 'tb-own-cell' : ''}">
      <span class="tb-competitor-loading-pulse"></span>
      <span>爬取中</span>
    </div>`;
}

function tbRenderMatrixProductHead(item, isOwn, variantKey = '', showVersionMeta = false) {
  const versionMeta = showVersionMeta && item.variantKey
    ? `
      <div class="tb-product-sync-meta">
        <span>上次同步：${tbEscapeHtml(item.lastSyncedAt || '—')}</span>
        <span>v${item.currentVersion || 1}</span>
      </div>
      <button type="button" class="tb-version-history-btn"
        onclick="event.stopPropagation();tbOpenVersionDrawer('${tbEscapeAttr(item.variantKey)}')">查看历史</button>`
    : '';
  const headExtraClass = showVersionMeta && item.variantKey ? ' tb-product-head-clickable' : '';
  const headClick = showVersionMeta && item.variantKey
    ? ` onclick="tbOpenVersionDrawer('${tbEscapeAttr(item.variantKey)}')"`
    : '';

  return `
    <div class="tb-matrix-cell tb-product-head ${isOwn ? 'tb-own-cell' : ''} ${item.loading ? 'tb-competitor-loading-head' : ''}${headExtraClass}"${headClick}>
      <div class="tb-product-head-top">
        <div class="tb-product-type ${isOwn ? 'own' : ''}">${tbEscapeHtml(item.label)}</div>
        ${!isOwn ? `
          <button type="button" class="tb-competitor-remove" aria-label="删除竞品"
            onclick="event.stopPropagation();tbRemoveCompetitor('${tbEscapeAttr(variantKey)}', ${item.competitorIndex})">×</button>` : ''}
      </div>
      ${item.loading ? `
        <div class="tb-product-head-main">
          <div>
            <strong>${tbEscapeHtml(item.asin)}</strong>
            <span class="tb-crawl-badge"><span class="tb-competitor-loading-pulse"></span>爬取中</span>
          </div>
        </div>` : `
      <div class="tb-product-head-main">
        <img src="${tbEscapeAttr(item.image || '')}" alt="">
        <div>
          <strong>${tbEscapeHtml(item.name)}</strong>
          <span>${tbEscapeHtml(item.meta)}</span>
        </div>
      </div>
      ${versionMeta}
      ${item.url ? `<a href="${tbEscapeAttr(item.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">查看商品 ↗</a>` : ''}`}
    </div>`;
}

function tbRenderMatrixContent(value, isOwn, limit, seoKeywords, type, isChanged = false) {
  if (type === 'seo') {
    const keywords = Array.isArray(value) ? value : [];
    return `
      <div class="tb-matrix-cell tb-content-cell tb-seo-cell ${isOwn ? 'tb-own-cell' : ''}">
        ${keywords.length
          ? keywords.map(keyword => `<mark>${tbEscapeHtml(keyword)}</mark>`).join('')
          : '<span class="tb-not-recorded">未收录</span>'}
      </div>`;
  }
  if (type === 'rating') {
    const rating = Number(value);
    return `
      <div class="tb-matrix-cell tb-content-cell tb-rating-cell ${isOwn ? 'tb-own-cell' : ''}">
        ${Number.isFinite(rating)
          ? `<strong><span>★</span> ${rating.toFixed(1)}</strong>`
          : '<span class="tb-not-recorded">未收录</span>'}
      </div>`;
  }
  const text = String(value || '—');
  const changedClass = isChanged ? ' tb-cell-changed' : '';
  return `
    <div class="tb-matrix-cell tb-content-cell ${isOwn ? 'tb-own-cell' : ''}${changedClass}">
      ${isChanged ? '<span class="tb-change-badge">已变更</span>' : ''}
      <p>${isOwn ? tbHighlightSeoTerms(text, seoKeywords) : tbEscapeHtml(text)}
      ${text === '—'
        ? '<span class="tb-not-recorded">未收录</span>'
        : tbRenderCharacterCount(text, limit)}</p>
    </div>`;
}

function tbRenderNoSelection() {
  return `
    <div class="tb-empty tb-empty-large">
      <strong>未找到在售商品</strong>
      <span>请调整上方筛选条件。</span>
    </div>`;
}

function tbGetFilteredRecords() {
  const filters = titleBoardState.filters;
  return TITLE_BOARD_RECORDS.filter(record => {
    const activeVariants = record.variants.filter(tbIsActiveVariant);
    if (!activeVariants.length) return false;
    if (filters.brand && record.brand !== filters.brand) return false;
    if (filters.site && !activeVariants.some(item => item.site === filters.site)) return false;
    return true;
  });
}

function tbNormalizeSearch(value) {
  return String(value || '').toLowerCase().replace(/[\s\-_/]+/g, '');
}

function tbGetSelectedRecord() {
  return TITLE_BOARD_RECORDS.find(item => item.pn === titleBoardState.selectedPn) || null;
}


function tbGetCompetitorCandidates(record, variant) {
  if (!record || !variant || typeof competitorRecords === 'undefined') return [];
  const boundAsins = typeof competitorBindings === 'undefined'
    ? []
    : competitorBindings
      .filter(item =>
        item.sku === variant.sku
        && item.site === variant.site
        && item.level === '核心竞品'
      )
      .map(item => item.asin);

  const bound = boundAsins
    .map(asin => competitorRecords.find(item =>
      item.asin === asin && item.site === variant.site && item.status === '有效'
    ))
    .filter(Boolean);
  const head = competitorRecords.filter(item =>
    item.status === '有效'
    && item.site === variant.site
    && item.subcategory === record.subcategory
    && item.tier === '头部竞品'
  );
  const categoryFallback = competitorRecords.filter(item =>
    item.status === '有效'
    && item.site === variant.site
    && item.subcategory === record.subcategory
  );

  const unique = new Map();
  [...bound, ...head, ...categoryFallback].forEach(item => {
    if (!unique.has(item.asin)) unique.set(item.asin, item);
  });
  return Array.from(unique.values()).slice(0, 8);
}

function tbEnsureAllCompetitorSelections(record) {
  if (!record) return;
  record.variants.filter(tbIsActiveVariant).forEach(variant => {
    const key = tbVariantKey(variant);
    if (!Array.isArray(titleBoardState.competitorAsinsByVariant[key])) {
      titleBoardState.competitorAsinsByVariant[key] = [];
    }
    if (titleBoardState.competitorAsinsByVariant[key].length === 0) {
      const candidates = tbGetCompetitorCandidates(record, variant);
      candidates.slice(0, 2).forEach(item => {
        if (!titleBoardState.competitorAsinsByVariant[key].includes(item.asin)) {
          titleBoardState.competitorAsinsByVariant[key].push(item.asin);
        }
      });
    }
    titleBoardState.competitorAsinsByVariant[key] = titleBoardState.competitorAsinsByVariant[key].slice(0, TB_MAX_COMPETITORS);
    titleBoardState.competitorAsinsByVariant[key].forEach(asin => {
      tbEnsureCompetitorData(asin, variant.site);
    });
  });
}

function tbSetFilter(field, value) {
  titleBoardState.filters[field] = value;
  renderTitleBoardView();
}

function tbResetFilters() {
  titleBoardState.filters = { brand: '', site: '' };
  titleBoardState.searchQuery = '';
  titleBoardState.searchOpen = false;
  titleBoardState.searchActiveIndex = -1;
  renderTitleBoardView();
}

function tbToggleProductLine(line) {
  if (titleBoardState.expandedLines.includes(line)) {
    titleBoardState.expandedLines = titleBoardState.expandedLines.filter(item => item !== line);
  } else {
    titleBoardState.expandedLines.push(line);
  }
  renderTitleBoardView();
}

function tbSelectPn(pn) {
  titleBoardState.selectedPn = pn;
  titleBoardState.selectedVariantKey = '';
  titleBoardState.activeCompareTab = 'own';
  renderTitleBoardView();
}

function tbVariantKey(item) {
  return `${item.site}|${item.sku}|${item.asin}`;
}

function tbIsActiveVariant(item) {
  return item && item.status === '在售';
}

function tbUnique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function tbEscapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tbEscapeAttr(value) {
  return tbEscapeHtml(value).replace(/`/g, '&#96;');
}

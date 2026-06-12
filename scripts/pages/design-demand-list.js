/* ============================================
   设计需求列表（独立视图 + 详情弹窗）
   ============================================ */

let ddCurrentListData = [];
let ddCurrentFilters = {};
let ddDetailTab = 'brief';

function ddEscape(value) {
  const text = String(value ?? '');
  return typeof escapeAiHtml === 'function'
    ? escapeAiHtml(text)
    : text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function renderDesignDemandView() {
  const root = document.getElementById('design-demand-view');
  if (!root) return;
  if (!root.dataset.ready) {
    root.innerHTML = designDemandTemplate();
    root.dataset.ready = '1';
  }
  applyDesignDemandFilters();
  if (typeof refreshDesignNotifyBadge === 'function') refreshDesignNotifyBadge();
}

function designDemandTemplate() {
  return `
    <div class="list-filter-bar">
      <div class="list-filter-row">
        <div class="filter-group">
          <select class="filter-select" id="dd-status" onchange="applyDesignDemandFilters()">
            <option value="">全部状态</option>
            <option value="待文案定稿">待文案定稿</option>
            <option value="待设计">待设计</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="dd-req-type" onchange="applyDesignDemandFilters()">
            <option value="">全部需求类型</option>
            <option value="新品图片文案">新品图片文案</option>
            <option value="优化卖点图片">优化卖点图片</option>
          </select>
        </div>
        <div class="filter-group">
          <input type="text" class="filter-input" id="dd-sku" placeholder="SKU 筛选" oninput="applyDesignDemandFilters()" />
        </div>
      </div>
    </div>
    <div class="list-table-wrap">
      <table class="list-table">
        <thead>
          <tr>
            <th style="width:120px;">需求类型</th>
            <th style="width:60px;">站点</th>
            <th style="width:100px;">品牌</th>
            <th style="width:80px;">子品类</th>
            <th style="width:170px;">产品名称</th>
            <th style="width:120px;">SKU</th>
            <th style="width:160px;">需求提交时间</th>
            <th style="width:120px;">期望交付</th>
            <th style="width:100px;">状态</th>
            <th style="width:120px;">操作</th>
          </tr>
        </thead>
        <tbody id="dd-tbody"></tbody>
      </table>
    </div>
    <div class="list-pagination">
      <span>共 <strong id="dd-pg-total">0</strong> 条</span>
    </div>
    <div class="modal-overlay" id="design-detail-modal" style="display:none;" onclick="if(event.target===this)closeDesignDetailModal()">
      <div class="modal-box dd-detail-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 id="design-detail-title">设计需求详情</h3>
          <button type="button" class="modal-close" onclick="closeDesignDetailModal()">×</button>
        </div>
        <div class="modal-body" id="design-detail-body"></div>
      </div>
    </div>`;
}

function applyDesignDemandFilters() {
  const statusEl = document.getElementById('dd-status');
  const typeEl = document.getElementById('dd-req-type');
  const skuEl = document.getElementById('dd-sku');
  ddCurrentFilters = {
    status: statusEl ? statusEl.value : '',
    type: typeEl ? typeEl.value : '',
    sku: skuEl ? skuEl.value.trim().toUpperCase() : '',
  };
  let list = typeof getDesignTaskList === 'function' ? getDesignTaskList() : [];
  if (ddCurrentFilters.status) list = list.filter((r) => r.status === ddCurrentFilters.status);
  if (ddCurrentFilters.type) list = list.filter((r) => r.type === ddCurrentFilters.type);
  if (ddCurrentFilters.sku) list = list.filter((r) => (r.sku || '').toUpperCase().includes(ddCurrentFilters.sku));
  const order = { '待设计': 1, '待文案定稿': 2 };
  ddCurrentListData = list.sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
  renderDesignDemandTable();
}

function renderDesignDemandTable() {
  const tbody = document.getElementById('dd-tbody');
  const totalEl = document.getElementById('dd-pg-total');
  if (!tbody) return;
  if (totalEl) totalEl.textContent = String(ddCurrentListData.length);
  if (!ddCurrentListData.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="list-empty">暂无设计需求</td></tr>';
    return;
  }
  tbody.innerHTML = ddCurrentListData.map((row) => {
    const statusCls = row.status === '待设计' ? 'dd-status-ready' : 'dd-status-wait';
    return `<tr>
      <td>${ddEscape(row.type)}</td>
      <td>${ddEscape(row.site)}</td>
      <td>${ddEscape(row.brand)}</td>
      <td>${ddEscape(row.sub)}</td>
      <td>${ddEscape(row.name)}</td>
      <td>${ddEscape(row.sku)}</td>
      <td>${ddEscape(row.submit_time)}</td>
      <td>${ddEscape(row.design_delivery || '—')}</td>
      <td><span class="dd-status-pill ${statusCls}">${ddEscape(row.status)}</span></td>
      <td><button type="button" class="btn btn-sm btn-outline" onclick="openDesignDetailModal('${ddEscape(row.id)}')">查看详情</button></td>
    </tr>`;
  }).join('');
}

function openDesignDetailModal(taskId) {
  const task = typeof findDesignTaskById === 'function' ? findDesignTaskById(taskId) : null;
  if (!task) {
    showToast('未找到设计需求', 'warning');
    return;
  }
  ddDetailTab = task.status === '待设计' ? 'approved' : 'brief';
  const modal = document.getElementById('design-detail-modal');
  const body = document.getElementById('design-detail-body');
  const title = document.getElementById('design-detail-title');
  if (!modal || !body) return;
  modal.dataset.taskId = task.id;
  if (title) title.textContent = `${task.name} · 设计需求`;
  body.innerHTML = renderDesignDetailContent(task);
  modal.style.display = 'flex';
}

function closeDesignDetailModal() {
  const modal = document.getElementById('design-detail-modal');
  if (modal) modal.style.display = 'none';
}

function switchDesignDetailTab(tab) {
  ddDetailTab = tab;
  const modal = document.getElementById('design-detail-modal');
  if (!modal || modal.style.display === 'none') return;
  const activeBtn = modal.querySelector(`.dd-detail-tab[data-tab="${tab}"]`);
  const taskId = modal.dataset.taskId;
  const task = typeof findDesignTaskById === 'function' ? findDesignTaskById(taskId) : null;
  if (!task) return;
  modal.querySelectorAll('.dd-detail-tab').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  const panel = document.getElementById('dd-detail-panel');
  if (panel) panel.innerHTML = tab === 'brief' ? renderDesignBriefPanel(task) : renderDesignApprovedPanel(task);
}

function renderDesignDetailContent(task) {
  const esc = ddEscape;
  const thumb = task.productImage
    ? `<img class="dd-product-thumb" src="${esc(task.productImage)}" alt="${esc(task.productImageAlt || task.name)}" loading="lazy" />`
    : '<div class="dd-product-thumb dd-product-thumb-empty">暂无图</div>';
  const approvedDisabled = task.status !== '待设计';
  return `
    <div class="dd-detail-head" data-task-id="${esc(task.id)}">
      <div class="dd-detail-product">
        ${thumb}
        <div class="dd-detail-meta">
          <div><strong>SKU</strong><span>${esc(task.sku)}</span></div>
          <div><strong>类型</strong><span>${esc(task.type)}</span></div>
          <div><strong>状态</strong><span class="dd-status-pill ${task.status === '待设计' ? 'dd-status-ready' : 'dd-status-wait'}">${esc(task.status)}</span></div>
          <div><strong>期望交付</strong><span>${esc(task.design_delivery || '—')}</span></div>
        </div>
      </div>
      <div class="dd-detail-tabs">
        <button type="button" class="dd-detail-tab ${ddDetailTab === 'brief' ? 'active' : ''}" data-tab="brief" onclick="switchDesignDetailTab('brief')">创意 Brief</button>
        <button type="button" class="dd-detail-tab ${ddDetailTab === 'approved' ? 'active' : ''} ${approvedDisabled ? 'disabled' : ''}" data-tab="approved" ${approvedDisabled ? 'disabled' : ''} onclick="switchDesignDetailTab('approved')">定稿文案</button>
      </div>
      <div id="dd-detail-panel">
        ${ddDetailTab === 'approved' && !approvedDisabled ? renderDesignApprovedPanel(task) : renderDesignBriefPanel(task)}
      </div>
    </div>`;
}

function renderDesignBriefPanel(task) {
  const esc = ddEscape;
  const brief = task.brief || {};
  const gallery = brief.gallery || [];
  const richTextBlocks = brief.richTextBlocks || [];
  const modal = document.getElementById('design-detail-modal');
  if (modal) modal.dataset.taskId = task.id;
  return `
    <div class="dd-brief-panel">
      <div class="dd-section-title">图片创意 Brief（${gallery.length} 张）</div>
      <div class="dd-brief-gallery">
        ${gallery.map((it, i) => {
          const label = it.image || ('图' + (i + 1));
          const refs = (it.referenceImages || []).map((src, ri) =>
            `<figure class="dd-ref-thumb"><img src="${esc(src)}" alt="参考图${ri + 1}" loading="lazy" /></figure>`
          ).join('');
          return `<div class="dd-brief-card">
            <div class="dd-brief-card-head">${esc(label)}</div>
            <div class="dd-brief-field"><span>产品卖点</span><p>${esc(it.productPoint || '—')}</p></div>
            <div class="dd-brief-field"><span>设计要求</span><p>${esc(it.designRequirement || '—')}</p></div>
            ${refs ? `<div class="dd-ref-grid">${refs}</div>` : ''}
          </div>`;
        }).join('') || '<p class="dd-empty-hint">暂无图片 Brief</p>'}
      </div>
      <div class="dd-section-title">富文本 Brief（${richTextBlocks.length} 块）</div>
      <div class="dd-brief-richtext">
        ${richTextBlocks.map((b) => `<div class="dd-brief-card">
          <div class="dd-brief-card-head">${esc(b.title || '富文本')}</div>
          <div class="dd-brief-field"><span>产品卖点</span><p>${esc(b.productPoint || '—')}</p></div>
          <div class="dd-brief-field"><span>设计要求</span><p>${esc(b.designRequirement || '—')}</p></div>
        </div>`).join('') || '<p class="dd-empty-hint">暂无富文本 Brief</p>'}
      </div>
    </div>`;
}

function renderDesignApprovedPanel(task) {
  const esc = ddEscape;
  const modal = document.getElementById('design-detail-modal');
  if (modal) modal.dataset.taskId = task.id;
  if (task.status !== '待设计' || !task.approved_copy) {
    return '<p class="dd-empty-hint">文案审核通过后将同步定稿文案至此</p>';
  }
  const copy = task.approved_copy;
  const gallery = copy.gallery || [];
  return `
    <div class="dd-approved-panel">
      <div class="dd-section-title">定稿图文案（${gallery.length} 张）</div>
      <div class="image-copy-submit-list">
        ${gallery.map((it) => `<div class="image-copy-submit-card">
          <div class="image-copy-submit-title">${esc(it.image)}</div>
          <div class="image-copy-en-block">
            <div class="image-copy-en-text">${esc(it.imageCopy || '—')}</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="dd-section-title">定稿富文本</div>
      <div class="image-copy-richtext-preview">${esc(copy.richText || '—').replace(/\n/g, '<br>')}</div>
    </div>`;
}

window.renderDesignDemandView = renderDesignDemandView;
window.applyDesignDemandFilters = applyDesignDemandFilters;
window.openDesignDetailModal = openDesignDetailModal;
window.closeDesignDetailModal = closeDesignDetailModal;
window.switchDesignDetailTab = switchDesignDetailTab;

/* ============================================
   设计需求 mock 数据 + sessionStorage API
   ============================================ */

const DESIGN_TASKS_KEY = '__cursor_design_tasks';
const DESIGN_NOTIFY_KEY = '__cursor_design_notify';

function buildDesignTaskKey(sku, type, submitTime) {
  return [sku || '', type || '', submitTime || ''].join('|');
}

function isDesignSyncCopyType(type) {
  return /图片文案|卖点图片/.test(String(type || ''));
}

function formatDesignSubmitTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function readDesignTasksRaw() {
  try {
    const raw = sessionStorage.getItem(DESIGN_TASKS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeDesignTasks(tasks) {
  try {
    sessionStorage.setItem(DESIGN_TASKS_KEY, JSON.stringify(tasks || []));
  } catch (e) {}
}

function getDefaultDesignBrief() {
  const md = typeof MOCK_DATA !== 'undefined' ? MOCK_DATA : {};
  const gallery = ((md.imageCreative && md.imageCreative.gallery) || []).map((it) => ({
    image: it.image || '',
    productPoint: it.productPoint || '',
    designRequirement: it.designRequirement || '',
    referenceImages: (it.referenceImages || []).slice(),
  }));
  const richTextBlocks = ((md.imageCreative && md.imageCreative.richTextBlocks) || []).map((b) => ({
    title: b.title || '',
    productPoint: b.productPoint || '',
    designRequirement: b.designRequirement || '',
    imageCopy: b.imageCopy || '',
    referenceImages: (b.referenceImages || []).slice(),
  }));
  return { gallery, richTextBlocks };
}

function getDesignTaskSeed() {
  return [{
    id: 'dt-seed-patch-20',
    copy_review_key: buildDesignTaskKey('PO17X4011', '新品图片文案', '2026/02/09 08:55:21'),
    sku: 'PO17X4011',
    type: '新品图片文案',
    site: 'US',
    brand: 'AUVON',
    sub: '贴片',
    name: '针形贴片 20pack',
    productImage: 'https://picsum.photos/seed/cr-patch-20pack/144/144',
    productImageAlt: '针形贴片 20pack 主图',
    submit_time: '2026/02/09 08:55:21',
    design_delivery: '2026/02/18',
    launch_date: '2026/02/21',
    status: '待文案定稿',
    brief: getDefaultDesignBrief(),
    approved_copy: null,
    created_at: '2026/02/09 08:55:21',
  }];
}

function readDesignTasks() {
  const stored = readDesignTasksRaw();
  if (Array.isArray(stored)) return stored;
  const seed = getDesignTaskSeed();
  writeDesignTasks(seed);
  return seed.slice();
}

function getDesignTaskList() {
  return readDesignTasks().slice();
}

function findDesignTaskByKey(copyReviewKey) {
  return readDesignTasks().find((t) => t.copy_review_key === copyReviewKey) || null;
}

function findDesignTaskById(id) {
  return readDesignTasks().find((t) => t.id === id) || null;
}

function createDesignTaskFromSubmit(meta) {
  if (!meta || !meta.designSync) return null;
  if (!isDesignSyncCopyType(meta.type)) return null;
  const key = buildDesignTaskKey(meta.sku, meta.type, meta.submit_time);
  const tasks = readDesignTasks();
  const existing = tasks.find((t) => t.copy_review_key === key);
  if (existing) return existing;
  const task = {
    id: 'dt-' + Date.now(),
    copy_review_key: key,
    sku: meta.sku,
    type: meta.type,
    site: meta.site,
    brand: meta.brand,
    sub: meta.sub || '',
    name: meta.name,
    productImage: meta.productImage || '',
    productImageAlt: meta.productImageAlt || meta.name || '',
    submit_time: meta.submit_time,
    design_delivery: meta.design_delivery || '',
    launch_date: meta.launch_date || '',
    status: '待文案定稿',
    brief: meta.brief || { gallery: [], richTextBlocks: [] },
    approved_copy: null,
    created_at: meta.submit_time,
  };
  tasks.unshift(task);
  writeDesignTasks(tasks);
  return task;
}

function buildApprovedCopyFromCopyReviewRow(row) {
  const md = typeof MOCK_DATA !== 'undefined' ? MOCK_DATA : {};
  const gallery = (md.imageCreative && md.imageCreative.gallery) || [];
  const richText = typeof getImageCreativeRichTextItems === 'function'
    ? getImageCreativeRichTextItems(md)
    : [];
  return {
    gallery: gallery.map((it, i) => {
      const label = it.image || ('图' + (i + 1));
      const imageCopy = typeof getCopyAuditSubmittedImageCopy === 'function'
        ? getCopyAuditSubmittedImageCopy(row, label, i, it.imageCopy || '')
        : (it.imageCopy || '');
      return { image: label, imageCopy };
    }),
    richText: typeof getCopyAuditSubmittedRichText === 'function'
      ? getCopyAuditSubmittedRichText(row, richText)
      : '',
  };
}

function syncDesignTaskOnCopyApprove(row) {
  if (!row || !isDesignSyncCopyType(row.type)) return null;
  const key = buildDesignTaskKey(row.sku, row.type, row.submit_time);
  const tasks = readDesignTasks();
  const idx = tasks.findIndex((t) => t.copy_review_key === key);
  if (idx < 0) return null;
  const task = { ...tasks[idx] };
  task.status = '待设计';
  task.approved_copy = buildApprovedCopyFromCopyReviewRow(row);
  task.approved_at = new Date().toLocaleString('zh-CN');
  task.copy_review_status = '已通过';
  tasks[idx] = task;
  writeDesignTasks(tasks);
  pushDesignNotify(task);
  return task;
}

function readDesignNotifyQueue() {
  try {
    const raw = sessionStorage.getItem(DESIGN_NOTIFY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeDesignNotifyQueue(queue) {
  try {
    sessionStorage.setItem(DESIGN_NOTIFY_KEY, JSON.stringify(queue || []));
  } catch (e) {}
}

function pushDesignNotify(task) {
  if (!task) return;
  const queue = readDesignNotifyQueue();
  queue.unshift({
    id: 'dn-' + Date.now(),
    taskId: task.id,
    title: `${task.name} · 定稿文案可查阅`,
    sku: task.sku,
    time: new Date().toLocaleString('zh-CN'),
    read: false,
  });
  writeDesignNotifyQueue(queue.slice(0, 50));
  if (typeof showToast === 'function') {
    showToast(`设计通知：${task.name} 文案已定稿，可开始设计`, 'success');
  }
}

function getDesignNotifyUnreadCount() {
  return readDesignNotifyQueue().filter((n) => !n.read).length;
}

function markDesignNotifyRead() {
  const queue = readDesignNotifyQueue();
  let changed = false;
  queue.forEach((n) => {
    if (!n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) writeDesignNotifyQueue(queue);
}

function refreshDesignNotifyBadge() {
  const count = getDesignNotifyUnreadCount();
  const link = document.querySelector('.list-nav-link[onclick*="design-demand"], .list-nav-single[onclick*="design-demand"]');
  if (!link) return;
  let badge = link.querySelector('.design-notify-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'design-notify-badge';
      link.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : String(count);
  } else if (badge) {
    badge.remove();
  }
}

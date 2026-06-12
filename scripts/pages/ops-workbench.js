/* ============================================
   运营工作台 - 新品卖点 PPT
   独立模块：只读复用竞品主数据，不写回现有业务状态
   ============================================ */

let _opsWorkbenchRendered = false;

const opsWorkbenchState = {
  mode: 'newProduct',
  advancedOpen: false,
  basics: {
    nameZh: '',
    nameEn: '',
    brand: 'AUVON',
    sites: ['US'],
    subcategory: 'woundPatch',
    launchDate: '',
    priceBand: '$9-$19',
    productForm: '',
    coreFunction: '',
    limitations: '',
  },
  marketing: {
    positioningOneLiner: '',
    keywords: ['防水', '亲肤', '便携'],
    audience: ['家庭急救用户', '户外出行人群'],
    scenes: ['家庭急救', '户外出行'],
    materials: '',
  },
  manualCompetitorDraft: {
    asin: '',
    title: '',
    price: '',
    rating: '',
    focus: '',
    complaints: '',
    difference: '',
  },
  manualCompetitors: [],
  existingProduct: {
    asin: '',
    productName: '',
    issue: '转化下滑',
    listingSummary: '',
    performanceNote: '',
  },
  selectedCompetitors: [],
  inputs: {
    differentiators: ['更强防水场景表达', '更舒适的贴合体验'],
    complaintsKnown: ['粘性不足', '边缘容易翘起'],
    notes: '',
  },
  strategy: null,
  ppt: null,
  pptPage: 0,
  tuningInput: '',
  tuningHistory: [],
  isGenerating: false,
};

function renderOpsWorkbenchView() {
  const root = document.getElementById('ops-workbench-view');
  if (!root) return;
  root.innerHTML = `
    <div class="ops-app">
      <header class="ops-header">
        <div>
          <span class="ops-eyebrow">OPERATIONS WORKBENCH</span>
          <h1>产品卖点策略分析工作台</h1>
          <p>先输入产品信息并选择竞品，系统先分析竞品，再生成有依据、有推理过程的卖点策略。</p>
        </div>
        <div class="ops-header-meta">
          <span>产品 + 竞品</span>
          <strong>产品信息 → 竞品分析 → 卖点策略 → 对话调优</strong>
        </div>
      </header>

      <div class="ops-layout">
        <aside class="ops-input-pane">
          ${opsRenderProductInputSection()}
          ${opsRenderCompetitorSection()}
          ${opsRenderAdvancedSection()}
          <div class="ops-generate-bar">
            <button class="ops-btn ops-btn-primary" onclick="opsGenerateStrategy()" ${opsWorkbenchState.isGenerating ? 'disabled' : ''}>
              ${opsWorkbenchState.isGenerating ? '分析中...' : '分析竞品并生成策略'}
            </button>
            <button class="ops-btn ops-btn-ghost" onclick="opsSaveDraft()">保存草稿</button>
            <button class="ops-btn ops-btn-ghost" onclick="opsResetWorkbench()">重置</button>
          </div>
        </aside>

        <section class="ops-output-pane">
          ${opsRenderOutputPane()}
        </section>
      </div>
      ${opsWorkbenchState.strategy ? opsRenderBottomTuneBar() : ''}
    </div>`;
  _opsWorkbenchRendered = true;
}

function opsRenderModeSection() {
  const mode = opsWorkbenchState.mode;
  return `
    <section class="ops-mode-section">
      <button type="button" class="ops-mode-card ${mode === 'newProduct' ? 'active' : ''}" onclick="opsSwitchMode('newProduct')">
        <strong>新品生成</strong>
        <span>无 SKU / 前期评审，快速生成卖点策略和 PPT。</span>
      </button>
      <button type="button" class="ops-mode-card ${mode === 'existingProduct' ? 'active' : ''}" onclick="opsSwitchMode('existingProduct')">
        <strong>老品优化</strong>
        <span>已有 Listing，围绕转化、差评、竞品挤压优化卖点。</span>
      </button>
    </section>`;
}

function opsRenderProductInputSection() {
  const basics = opsWorkbenchState.basics;
  const marketing = opsWorkbenchState.marketing;
  return `
    <section class="ops-section ops-quick-section">
      <div class="ops-section-head">
        <span>01</span>
        <div>
          <h2>产品信息</h2>
          <p>先把产品真实信息放进来，后续策略会基于这些信息和竞品对比生成。</p>
        </div>
      </div>
      <label class="ops-field">
        <span>策略场景</span>
        <select onchange="opsSwitchMode(this.value)">
          <option value="newProduct" ${opsWorkbenchState.mode === 'newProduct' ? 'selected' : ''}>新品卖点生成</option>
          <option value="existingProduct" ${opsWorkbenchState.mode === 'existingProduct' ? 'selected' : ''}>老品卖点优化</option>
        </select>
      </label>
      <label class="ops-field">
        <span>产品名称 / ASIN</span>
        <input value="${opsEscapeAttr(opsGetCurrentProductName())}" placeholder="例如：新品防水伤口贴组合装 / B0XXXX" oninput="opsUpdateCurrentProductName(this.value)">
      </label>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>品牌</span>
          <input value="${opsEscapeAttr(basics.brand)}" placeholder="AUVON" oninput="opsUpdateBasic('brand', this.value)">
        </label>
        <label class="ops-field">
          <span>价格带</span>
          <input value="${opsEscapeAttr(basics.priceBand)}" placeholder="$9-$19" oninput="opsUpdateBasic('priceBand', this.value)">
        </label>
      </div>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>子品类</span>
          <select onchange="opsUpdateBasic('subcategory', this.value, true)">
            ${opsGetCategories().map(category => `
              <option value="${opsEscapeAttr(category.id)}" ${basics.subcategory === category.id ? 'selected' : ''}>${opsEscapeHtml(category.name)}</option>
            `).join('')}
          </select>
        </label>
        <label class="ops-field">
          <span>核心功能</span>
          <input value="${opsEscapeAttr(basics.coreFunction)}" placeholder="例如：防水保护、舒适贴合" oninput="opsUpdateBasic('coreFunction', this.value)">
        </label>
      </div>
      <label class="ops-field">
        <span>站点</span>
        <div class="ops-site-row">
          ${['US', 'UK', 'DE', 'JP', 'CA'].map(site => `
            <button type="button" class="${basics.sites.includes(site) ? 'active' : ''}" onclick="opsToggleSite('${site}')">${site}</button>
          `).join('')}
        </div>
      </label>
      <label class="ops-field">
        <span>产品信息 / 当前问题</span>
        <textarea rows="4" placeholder="新品：写产品优势、适用人群、使用场景；老品：写当前 Listing、评论痛点或转化问题" oninput="opsUpdateProductContext(this.value)">${opsEscapeHtml(opsGetCurrentProductContext())}</textarea>
      </label>
      ${opsRenderTagEditor('audience', '目标人群', '输入后回车，例如：儿童家庭')}
      ${opsRenderTagEditor('scenes', '使用场景', '输入后回车，例如：露营徒步')}
    </section>`;
}

function opsRenderQuickInputSection() {
  return opsWorkbenchState.mode === 'existingProduct'
    ? opsRenderExistingQuickInput()
    : opsRenderNewQuickInput();
}

function opsRenderNewQuickInput() {
  const basics = opsWorkbenchState.basics;
  const marketing = opsWorkbenchState.marketing;
  return `
    <section class="ops-section ops-quick-section">
      <div class="ops-section-head">
        <span>01</span>
        <div>
          <h2>最小输入</h2>
          <p>先填 4-5 个核心信息即可生成，其他资料可后补。</p>
        </div>
      </div>
      <label class="ops-field">
        <span>产品名</span>
        <input value="${opsEscapeAttr(basics.nameZh || basics.nameEn)}" placeholder="例如：新品防水伤口贴组合装" oninput="opsUpdateNewProductName(this.value)">
      </label>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>品牌</span>
          <input value="${opsEscapeAttr(basics.brand)}" placeholder="AUVON" oninput="opsUpdateBasic('brand', this.value)">
        </label>
        <label class="ops-field">
          <span>子品类</span>
          <select onchange="opsUpdateBasic('subcategory', this.value, true)">
            ${opsGetCategories().map(category => `
              <option value="${opsEscapeAttr(category.id)}" ${basics.subcategory === category.id ? 'selected' : ''}>${opsEscapeHtml(category.name)}</option>
            `).join('')}
          </select>
        </label>
      </div>
      <label class="ops-field">
        <span>站点</span>
        <div class="ops-site-row">
          ${['US', 'UK', 'DE', 'JP', 'CA'].map(site => `
            <button type="button" class="${basics.sites.includes(site) ? 'active' : ''}" onclick="opsToggleSite('${site}')">${site}</button>
          `).join('')}
        </div>
      </label>
      <label class="ops-field">
        <span>一句话产品信息</span>
        <textarea rows="3" placeholder="例如：面向家庭和户外用户的舒适防水伤口护理方案" oninput="opsUpdateMarketing('positioningOneLiner', this.value)">${opsEscapeHtml(marketing.positioningOneLiner)}</textarea>
      </label>
    </section>`;
}

function opsRenderExistingQuickInput() {
  const product = opsWorkbenchState.existingProduct;
  return `
    <section class="ops-section ops-quick-section">
      <div class="ops-section-head">
        <span>01</span>
        <div>
          <h2>最小输入</h2>
          <p>先说明老品和当前问题，系统会给出卖点优化诊断。</p>
        </div>
      </div>
      <label class="ops-field">
        <span>SKU / ASIN / 产品名</span>
        <input value="${opsEscapeAttr(product.asin || product.productName)}" placeholder="例如：B0XXXX 或 7格旅行药盒" oninput="opsUpdateExistingProductIdentity(this.value)">
      </label>
      <label class="ops-field">
        <span>站点</span>
        <div class="ops-site-row">
          ${['US', 'UK', 'DE', 'JP', 'CA'].map(site => `
            <button type="button" class="${opsWorkbenchState.basics.sites.includes(site) ? 'active' : ''}" onclick="opsToggleSite('${site}')">${site}</button>
          `).join('')}
        </div>
      </label>
      <label class="ops-field">
        <span>当前优化问题</span>
        <select onchange="opsUpdateExistingProduct('issue', this.value)">
          ${['转化下滑', '广告 ACOS 高', '差评集中', '卖点老化', '竞品挤压', '大促前强化'].map(issue => `
            <option value="${issue}" ${product.issue === issue ? 'selected' : ''}>${issue}</option>
          `).join('')}
        </select>
      </label>
      <label class="ops-field">
        <span>现有 Listing / 经营摘要（可选）</span>
        <textarea rows="4" placeholder="粘贴当前标题、五点、评论痛点或近期表现摘要" oninput="opsUpdateExistingProduct('listingSummary', this.value)">${opsEscapeHtml(product.listingSummary)}</textarea>
      </label>
    </section>`;
}

function opsRenderAdvancedSection() {
  const open = opsWorkbenchState.advancedOpen;
  return `
    <section class="ops-section ops-advanced-section">
      <button type="button" class="ops-advanced-toggle" onclick="opsToggleAdvanced()">
        <span>高级资料（可选）</span>
        <strong>${open ? '收起' : '展开'}</strong>
      </button>
      ${open ? `
        <div class="ops-advanced-body">
          ${opsRenderMarketingSection()}
          ${opsRenderKeyInputSection()}
        </div>
      ` : `
        <p class="ops-advanced-hint">关键词、已知差异点、评论/客诉、合规限制可以先不填；如果要让结果更有依据，建议至少选择或补充 3 个竞品。</p>
      `}
    </section>`;
}

function opsRenderBasicsSection() {
  const state = opsWorkbenchState.basics;
  return `
    <section class="ops-section">
      <div class="ops-section-head">
        <span>01</span>
        <div>
          <h2>新品基础信息</h2>
          <p>新品还没有 SKU，用产品名、站点和子品类建立生成上下文。</p>
        </div>
      </div>
      <label class="ops-field">
        <span>产品中文名</span>
        <input value="${opsEscapeAttr(state.nameZh)}" placeholder="例如：新品防水伤口贴组合装" oninput="opsUpdateBasic('nameZh', this.value)">
      </label>
      <label class="ops-field">
        <span>产品英文名</span>
        <input value="${opsEscapeAttr(state.nameEn)}" placeholder="例如：Waterproof Adhesive Bandages" oninput="opsUpdateBasic('nameEn', this.value)">
      </label>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>品牌</span>
          <input value="${opsEscapeAttr(state.brand)}" placeholder="AUVON" oninput="opsUpdateBasic('brand', this.value)">
        </label>
        <label class="ops-field">
          <span>价格带</span>
          <input value="${opsEscapeAttr(state.priceBand)}" placeholder="$9-$19" oninput="opsUpdateBasic('priceBand', this.value)">
        </label>
      </div>
      <label class="ops-field">
        <span>计划上架站点</span>
        <div class="ops-site-row">
          ${['US', 'UK', 'DE', 'JP', 'CA'].map(site => `
            <button type="button" class="${state.sites.includes(site) ? 'active' : ''}" onclick="opsToggleSite('${site}')">${site}</button>
          `).join('')}
        </div>
      </label>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>子品类</span>
          <select onchange="opsUpdateBasic('subcategory', this.value, true)">
            ${opsGetCategories().map(category => `
              <option value="${opsEscapeAttr(category.id)}" ${state.subcategory === category.id ? 'selected' : ''}>${opsEscapeHtml(category.name)}</option>
            `).join('')}
          </select>
        </label>
        <label class="ops-field">
          <span>计划上架日期</span>
          <input type="date" value="${opsEscapeAttr(state.launchDate)}" oninput="opsUpdateBasic('launchDate', this.value)">
        </label>
      </div>
      <label class="ops-field">
        <span>产品形态 / 规格</span>
        <input value="${opsEscapeAttr(state.productForm)}" placeholder="例如：100片装、透明防水、独立包装" oninput="opsUpdateBasic('productForm', this.value)">
      </label>
      <label class="ops-field">
        <span>核心功能</span>
        <textarea rows="3" placeholder="例如：覆盖小伤口、防水保护、减少摩擦、便于外出携带" oninput="opsUpdateBasic('coreFunction', this.value)">${opsEscapeHtml(state.coreFunction)}</textarea>
      </label>
      <label class="ops-field">
        <span>已知限制 / 合规注意</span>
        <textarea rows="2" placeholder="例如：不能暗示治疗功效；不适用于深度伤口" oninput="opsUpdateBasic('limitations', this.value)">${opsEscapeHtml(state.limitations)}</textarea>
      </label>
    </section>`;
}

function opsRenderMarketingSection() {
  const state = opsWorkbenchState.marketing;
  return `
    <section class="ops-section">
      <div class="ops-section-head">
        <span>02</span>
        <div>
          <h2>营销资料</h2>
          <p>先输入运营已知信息，生成时会和竞品数据一起合成策略。</p>
        </div>
      </div>
      <label class="ops-field">
        <span>产品定位一句话</span>
        <textarea rows="3" placeholder="例如：面向家庭和户外用户的舒适防水伤口护理方案" oninput="opsUpdateMarketing('positioningOneLiner', this.value)">${opsEscapeHtml(state.positioningOneLiner)}</textarea>
      </label>
      ${opsRenderTagEditor('keywords', '主推卖点关键词', '输入后回车，例如：强粘性')}
      ${opsRenderTagEditor('audience', '目标用户群体', '输入后回车，例如：儿童家庭')}
      ${opsRenderTagEditor('scenes', '主要使用场景', '输入后回车，例如：露营徒步')}
      <label class="ops-field">
        <span>产品资料说明</span>
        <textarea rows="4" placeholder="粘贴 PM 提供的产品资料、结构特点、材质说明、图片信息等" oninput="opsUpdateMarketing('materials', this.value)">${opsEscapeHtml(state.materials)}</textarea>
      </label>
    </section>`;
}

function opsRenderCompetitorSection() {
  const records = opsGetFilteredCompetitors();
  const selected = opsWorkbenchState.selectedCompetitors;
  const manual = opsWorkbenchState.manualCompetitors;
  const totalSelected = selected.length + manual.length;
  return `
    <section class="ops-section">
      <div class="ops-section-head">
        <span>02</span>
        <div>
          <h2>选择竞品</h2>
          <p>选择 3-5 个竞品作为分析依据，系统会先总结竞品共性、弱点和差异化机会。</p>
        </div>
      </div>
      ${opsRenderManualCompetitorForm()}
      ${manual.length ? `
        <div class="ops-manual-list">
          ${manual.map((item, index) => opsRenderManualCompetitorCard(item, index)).join('')}
        </div>
      ` : ''}
      <div class="ops-comp-summary">
        <span>候选 ${records.length} 个</span>
        <strong>已选 ${totalSelected} 个，建议 3-5 个</strong>
      </div>
      <div class="ops-comp-list">
        ${records.length ? records.slice(0, 12).map(record => opsRenderCompetitorCard(record)).join('') : `
          <div class="ops-empty-mini">当前子品类和站点暂无竞品，可先调整站点或子品类。</div>
        `}
      </div>
    </section>`;
}

function opsRenderManualCompetitorForm() {
  const draft = opsWorkbenchState.manualCompetitorDraft;
  return `
    <div class="ops-manual-comp">
      <div class="ops-manual-head">
        <strong>手动补充竞品</strong>
        <span>MVP 先支持人工录入，不依赖自动抓取</span>
      </div>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>ASIN / 链接</span>
          <input value="${opsEscapeAttr(draft.asin)}" placeholder="B0XXXX 或竞品链接" oninput="opsUpdateManualCompetitorDraft('asin', this.value)">
        </label>
        <label class="ops-field">
          <span>竞品名称</span>
          <input value="${opsEscapeAttr(draft.title)}" placeholder="竞品标题或简称" oninput="opsUpdateManualCompetitorDraft('title', this.value)">
        </label>
      </div>
      <div class="ops-grid-2">
        <label class="ops-field">
          <span>价格</span>
          <input value="${opsEscapeAttr(draft.price)}" placeholder="$12.99" oninput="opsUpdateManualCompetitorDraft('price', this.value)">
        </label>
        <label class="ops-field">
          <span>评分</span>
          <input value="${opsEscapeAttr(draft.rating)}" placeholder="4.5" oninput="opsUpdateManualCompetitorDraft('rating', this.value)">
        </label>
      </div>
      <label class="ops-field">
        <span>竞品主打卖点</span>
        <textarea rows="2" placeholder="例如：强调强粘性、防水、适合儿童" oninput="opsUpdateManualCompetitorDraft('focus', this.value)">${opsEscapeHtml(draft.focus)}</textarea>
      </label>
      <label class="ops-field">
        <span>竞品差评 / 痛点摘要</span>
        <textarea rows="2" placeholder="例如：边缘翘起、尺寸偏小、粘胶残留" oninput="opsUpdateManualCompetitorDraft('complaints', this.value)">${opsEscapeHtml(draft.complaints)}</textarea>
      </label>
      <label class="ops-field">
        <span>我方可差异化方向</span>
        <textarea rows="2" placeholder="例如：强调更舒适贴合和场景化防水" oninput="opsUpdateManualCompetitorDraft('difference', this.value)">${opsEscapeHtml(draft.difference)}</textarea>
      </label>
      <button type="button" class="ops-btn ops-btn-ghost ops-full-btn" onclick="opsAddManualCompetitor()">添加为竞品参考</button>
    </div>`;
}

function opsRenderManualCompetitorCard(item, index) {
  return `
    <article class="ops-manual-card">
      <div>
        <strong>${opsEscapeHtml(item.asin || `手动竞品 ${index + 1}`)}</strong>
        <span>${opsEscapeHtml(item.title || '未填写名称')}</span>
      </div>
      <button type="button" onclick="opsRemoveManualCompetitor(${index})">移除</button>
    </article>`;
}

function opsRenderCompetitorCard(record) {
  const selected = opsWorkbenchState.selectedCompetitors.find(item => item.asin === record.asin);
  return `
    <article class="ops-comp-card ${selected ? 'selected' : ''}">
      <label class="ops-comp-check">
        <input type="checkbox" ${selected ? 'checked' : ''} onchange="opsToggleCompetitor('${opsEscapeAttr(record.asin)}', this.checked)">
        <img src="${opsEscapeAttr(record.image || '')}" alt="">
        <span>
          <strong>${opsEscapeHtml(record.brand || '—')} · ${opsEscapeHtml(record.asin)}</strong>
          <em>${opsEscapeHtml(record.title || '—')}</em>
        </span>
      </label>
      <div class="ops-comp-meta">
        <span>${opsEscapeHtml(record.site || '—')}</span>
        <span>${opsEscapeHtml(record.price || '—')}</span>
        <span>${opsEscapeHtml(String(record.rating || '—'))} 分</span>
        <span>${opsEscapeHtml(record.tier || '竞品')}</span>
      </div>
      ${selected ? `
        <select class="ops-role-select" onchange="opsSetCompetitorRole('${opsEscapeAttr(record.asin)}', this.value)">
          ${['主竞品', '参考竞品', '价格锚点'].map(role => `<option value="${role}" ${selected.role === role ? 'selected' : ''}>${role}</option>`).join('')}
        </select>
      ` : ''}
    </article>`;
}

function opsRenderKeyInputSection() {
  return `
    <section class="ops-section">
      <div class="ops-section-head">
        <span>04</span>
        <div>
          <h2>重点输入</h2>
          <p>补充运营判断，让生成结果更接近实际评审场景。</p>
        </div>
      </div>
      ${opsRenderTagEditor('differentiators', '我方差异点', '输入后回车，例如：四边密封更稳定')}
      ${opsRenderTagEditor('complaintsKnown', '已知客诉 / 风险点', '输入后回车，例如：边缘翘起')}
      <label class="ops-field">
        <span>备注</span>
        <textarea rows="3" placeholder="补充使用场景、素材要求、评审关注点等" oninput="opsUpdateInput('notes', this.value)">${opsEscapeHtml(opsWorkbenchState.inputs.notes)}</textarea>
      </label>
    </section>`;
}

function opsRenderTagEditor(kind, label, placeholder) {
  const values = opsGetTagValues(kind);
  return `
    <div class="ops-field">
      <span>${label}</span>
      <div class="ops-chip-box">
        <div class="ops-chip-list">
          ${values.map((value, index) => `
            <button type="button" class="ops-chip" onclick="opsRemoveTag('${kind}', ${index})">
              ${opsEscapeHtml(value)} <i>×</i>
            </button>
          `).join('')}
        </div>
        <div class="ops-chip-input-row">
          <input id="ops-tag-${kind}" placeholder="${opsEscapeAttr(placeholder)}" onkeydown="opsHandleTagKey(event, '${kind}')">
          <button type="button" onclick="opsAddTag('${kind}')">添加</button>
        </div>
      </div>
    </div>`;
}

function opsRenderOutputPane() {
  if (opsWorkbenchState.ppt) return opsRenderPptPreview();
  if (opsWorkbenchState.strategy) return opsRenderStrategy();
  return `
    <div class="ops-output-empty">
      <span>STEP 1</span>
      <h2>先输入产品信息并选择竞品</h2>
      <p>点击“分析竞品并生成策略”后，这里会先展示竞品分析，再给出带依据、推理和风险说明的卖点策略。</p>
      <div class="ops-output-tips">
        <span>竞品分析</span>
        <span>有理有据</span>
        <span>底部对话调优</span>
      </div>
      ${opsRenderMvpScopeCard()}
    </div>`;
}

function opsRenderMvpScopeCard() {
  return `
    <div class="ops-mvp-card">
      <div>
        <strong>2 周 MVP 验收</strong>
        <span>核心链路是“产品信息 + 竞品选择 → 竞品分析 → 卖点策略 → 对话调优”。</span>
      </div>
      <ul>
        <li>先展示竞品共性、差异、弱点、价格定位和我方机会点。</li>
        <li>每个卖点都显示推荐表达、依据来源、推理过程和风险提醒。</li>
        <li>底部对话框用于继续调优策略，并沉淀策略版本。</li>
      </ul>
    </div>`;
}

function opsUpdateBasic(field, value, shouldRender) {
  opsWorkbenchState.basics[field] = value;
  if (field === 'subcategory') {
    const subcategory = opsResolveSubcategory(value);
    opsWorkbenchState.selectedCompetitors = opsWorkbenchState.selectedCompetitors.filter(item => {
      const record = opsFindCompetitor(item.asin);
      return record && record.subcategory === subcategory;
    });
  }
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  if (shouldRender) renderOpsWorkbenchView();
}

function opsSwitchMode(mode) {
  if (opsWorkbenchState.mode === mode) return;
  opsWorkbenchState.mode = mode;
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  opsWorkbenchState.tuningHistory = [];
  renderOpsWorkbenchView();
}

function opsGetCurrentProductName() {
  if (opsWorkbenchState.mode === 'existingProduct') {
    return opsWorkbenchState.existingProduct.asin || opsWorkbenchState.existingProduct.productName;
  }
  return opsWorkbenchState.basics.nameZh || opsWorkbenchState.basics.nameEn;
}

function opsUpdateCurrentProductName(value) {
  if (opsWorkbenchState.mode === 'existingProduct') {
    opsUpdateExistingProductIdentity(value);
    return;
  }
  opsUpdateNewProductName(value);
}

function opsGetCurrentProductContext() {
  if (opsWorkbenchState.mode === 'existingProduct') {
    return opsWorkbenchState.existingProduct.listingSummary;
  }
  return opsWorkbenchState.marketing.positioningOneLiner || opsWorkbenchState.marketing.materials;
}

function opsUpdateProductContext(value) {
  if (opsWorkbenchState.mode === 'existingProduct') {
    opsUpdateExistingProduct('listingSummary', value);
    return;
  }
  opsWorkbenchState.marketing.positioningOneLiner = value;
  opsWorkbenchState.marketing.materials = value;
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
}

function opsToggleAdvanced() {
  opsWorkbenchState.advancedOpen = !opsWorkbenchState.advancedOpen;
  renderOpsWorkbenchView();
}

function opsUpdateNewProductName(value) {
  opsWorkbenchState.basics.nameZh = value;
  opsWorkbenchState.basics.nameEn = '';
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
}

function opsUpdateExistingProductIdentity(value) {
  if (/^B0[A-Z0-9]{6,}$/i.test(value.trim())) {
    opsWorkbenchState.existingProduct.asin = value.trim();
    opsWorkbenchState.existingProduct.productName = '';
  } else {
    opsWorkbenchState.existingProduct.productName = value;
    opsWorkbenchState.existingProduct.asin = '';
  }
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
}

function opsUpdateExistingProduct(field, value) {
  opsWorkbenchState.existingProduct[field] = value;
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
}

function opsUpdateMarketing(field, value) {
  opsWorkbenchState.marketing[field] = value;
}

function opsUpdateInput(field, value) {
  opsWorkbenchState.inputs[field] = value;
}

function opsToggleSite(site) {
  const sites = opsWorkbenchState.basics.sites;
  if (sites.includes(site)) {
    opsWorkbenchState.basics.sites = sites.filter(item => item !== site);
  } else {
    opsWorkbenchState.basics.sites = [...sites, site];
  }
  opsWorkbenchState.selectedCompetitors = opsWorkbenchState.selectedCompetitors.filter(item => {
    const record = opsFindCompetitor(item.asin);
    return record && opsWorkbenchState.basics.sites.includes(record.site);
  });
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
}

function opsToggleCompetitor(asin, checked) {
  const selected = opsWorkbenchState.selectedCompetitors;
  if (checked) {
    if (selected.length >= 5) {
      showToast('最多选择 5 个竞品', 'warning');
      renderOpsWorkbenchView();
      return;
    }
    if (!selected.some(item => item.asin === asin)) {
      selected.push({ asin, role: selected.length === 0 ? '主竞品' : '参考竞品' });
    }
  } else {
    opsWorkbenchState.selectedCompetitors = selected.filter(item => item.asin !== asin);
  }
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
}

function opsSetCompetitorRole(asin, role) {
  const item = opsWorkbenchState.selectedCompetitors.find(comp => comp.asin === asin);
  if (item) item.role = role;
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
}

function opsHandleTagKey(event, kind) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  opsAddTag(kind);
}

function opsAddTag(kind) {
  const input = document.getElementById(`ops-tag-${kind}`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  const values = opsGetTagValues(kind);
  if (!values.includes(value)) values.push(value);
  input.value = '';
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
}

function opsRemoveTag(kind, index) {
  const values = opsGetTagValues(kind);
  values.splice(index, 1);
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
}

function opsGetTagValues(kind) {
  if (kind === 'keywords') return opsWorkbenchState.marketing.keywords;
  if (kind === 'audience') return opsWorkbenchState.marketing.audience;
  if (kind === 'scenes') return opsWorkbenchState.marketing.scenes;
  if (kind === 'differentiators') return opsWorkbenchState.inputs.differentiators;
  if (kind === 'complaintsKnown') return opsWorkbenchState.inputs.complaintsKnown;
  return [];
}

function opsUpdateManualCompetitorDraft(field, value) {
  opsWorkbenchState.manualCompetitorDraft[field] = value;
}

function opsAddManualCompetitor() {
  const draft = opsWorkbenchState.manualCompetitorDraft;
  if (!draft.asin.trim() && !draft.title.trim()) {
    showToast('请至少填写竞品 ASIN/链接或名称', 'warning');
    return;
  }
  opsWorkbenchState.manualCompetitors.push({
    asin: draft.asin.trim() || `MANUAL-${Date.now()}`,
    title: draft.title.trim(),
    price: draft.price.trim(),
    rating: draft.rating.trim(),
    focus: draft.focus.trim(),
    complaints: draft.complaints.trim(),
    difference: draft.difference.trim(),
    site: opsWorkbenchState.basics.sites[0] || 'US',
    brand: '手动竞品',
    role: opsWorkbenchState.manualCompetitors.length === 0 ? '主竞品' : '参考竞品',
  });
  opsWorkbenchState.manualCompetitorDraft = {
    asin: '',
    title: '',
    price: '',
    rating: '',
    focus: '',
    complaints: '',
    difference: '',
  };
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
  showToast('已添加手动竞品', 'success');
}

function opsRemoveManualCompetitor(index) {
  opsWorkbenchState.manualCompetitors.splice(index, 1);
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
}

function opsGenerateStrategy() {
  const basics = opsWorkbenchState.basics;
  const existing = opsWorkbenchState.existingProduct;
  const competitorCount = opsWorkbenchState.selectedCompetitors.length + opsWorkbenchState.manualCompetitors.length;
  if (opsWorkbenchState.mode === 'newProduct' && !basics.nameZh.trim() && !basics.nameEn.trim()) {
    showToast('请先填写产品名称', 'warning');
    return;
  }
  if (opsWorkbenchState.mode === 'existingProduct' && !existing.asin.trim() && !existing.productName.trim()) {
    showToast('请先填写 SKU / ASIN / 产品名', 'warning');
    return;
  }
  if (competitorCount < 1) {
    showToast('请先选择或手动补充至少 1 个竞品作为分析依据', 'warning');
    return;
  }
  opsWorkbenchState.isGenerating = true;
  renderOpsWorkbenchView();
  setTimeout(() => {
    opsWorkbenchState.strategy = opsBuildStrategy();
    opsWorkbenchState.ppt = null;
    opsWorkbenchState.isGenerating = false;
    renderOpsWorkbenchView();
    showToast('卖点策略已生成', 'success');
  }, 700);
}

function opsBuildStrategy() {
  if (opsWorkbenchState.mode === 'existingProduct') {
    return opsBuildExistingStrategy();
  }
  const basics = opsWorkbenchState.basics;
  const marketing = opsWorkbenchState.marketing;
  const inputs = opsWorkbenchState.inputs;
  const competitors = opsGetSelectedCompetitors();
  const productName = basics.nameZh || basics.nameEn || '新品';
  const categoryName = opsGetCategoryName(basics.subcategory);
  const keywordText = marketing.keywords.slice(0, 3).join('、') || '核心体验';
  const audienceText = marketing.audience.slice(0, 3).join('、') || '目标用户';
  const sceneText = marketing.scenes.slice(0, 3).join('、') || '核心使用场景';
  const diffs = inputs.differentiators.length ? inputs.differentiators : ['更清晰的使用场景', '更完整的价值表达', '更贴近目标用户痛点'];
  const complaints = opsCollectComplaints(competitors);
  const competitorAnalysis = opsBuildCompetitorAnalysis(competitors, diffs, complaints);
  const sellingPoints = opsBuildSellingPoints(productName, categoryName, keywordText, audienceText, sceneText, diffs, complaints, competitorAnalysis);

  return {
    positioning: marketing.positioningOneLiner.trim() || `${productName} 是面向 ${audienceText} 的 ${categoryName} 新品方案，重点突出 ${keywordText}。`,
    usp: `${productName} 以“${diffs[0]}”作为核心差异，帮助用户在 ${categoryName} 场景中获得更稳定、更省心的体验。`,
    targetUsers: marketing.audience.length
      ? marketing.audience.map(item => `${item}：关注 ${keywordText}，需要简单可信的购买理由。`)
      : [`${audienceText}：关注使用便利性、价格合理性和基础可靠性。`],
    scenes: marketing.scenes.length
      ? marketing.scenes.map(item => `${item}：适合突出 ${keywordText} 与 ${diffs[0] || '差异体验'}。`)
      : [`${sceneText}：建议补充更具体的使用画面。`],
    pains: complaints.slice(0, 4).map(item => `${item}：需要在图片、QA 或风险说明中提前管理预期。`),
    competitorAnalysis,
    sellingPoints,
    ksp: [
      `${marketing.keywords[0] || '核心功能'}：围绕主要使用场景建立第一记忆点。`,
      `${diffs[0] || '差异体验'}：与同类竞品形成直观对比。`,
      `${audienceText}：让卖点表达直接对应目标人群。`,
    ],
    osp: [
      `${basics.priceBand || '目标价格带'} 内建立清晰价值感。`,
      `素材表达优先覆盖 ${marketing.keywords.slice(0, 2).join('、') || '功能与体验'}。`,
      `后续 Listing 可围绕场景图、对比图、风险说明展开。`,
    ],
    comparisons: competitors.map((record, index) => ({
      competitor: `${record.brand || '竞品'} · ${record.asin}`,
      role: opsWorkbenchState.selectedCompetitors.find(item => item.asin === record.asin)?.role || (index === 0 ? '主竞品' : '参考竞品'),
      theirFocus: (record.bullets && record.bullets[0]) || record.reason || '强调基础功能和价格优势',
      ourDiff: diffs[index % diffs.length] || '更聚焦目标用户使用场景',
    })),
    complaints,
    expressionDirections: [
      `标题：优先覆盖 ${marketing.keywords.slice(0, 2).join('、') || '核心关键词'}，不要堆砌无证明词。`,
      `五点：按“痛点 → 证据 → 使用场景”展开，突出 ${diffs[0] || '核心差异'}。`,
      `图片/A+：用对比图和场景图说明 ${sceneText}，补充限制条件降低差评风险。`,
    ],
    risks: opsBuildRisks(),
    modeLabel: '新品生成',
    diagnostics: [
      '当前处于新品前期阶段，重点先验证目标人群、使用场景和差异化是否成立。',
      '建议补充实物图、参数证明、竞品 Review 样本后再进入 Listing 文案生产。',
    ],
    actionPlan: [
      '确认主卖点是否能支撑内部评审。',
      '用卖点卡片反推主图、五点和 A+ 的表达方向。',
      '评审通过后进入 Listing 文案或视觉需求创建。',
    ],
    summary: `建议将 ${productName} 的 PPT 主线收敛为“用户痛点 → 竞品缺口 → 我方差异 → Listing 表达机会”。`,
  };
}

function opsBuildExistingStrategy() {
  const basics = opsWorkbenchState.basics;
  const marketing = opsWorkbenchState.marketing;
  const inputs = opsWorkbenchState.inputs;
  const existing = opsWorkbenchState.existingProduct;
  const competitors = opsGetSelectedCompetitors();
  const productName = existing.productName || existing.asin || '老品';
  const categoryName = opsGetCategoryName(basics.subcategory);
  const issue = existing.issue || '转化下滑';
  const keywordText = marketing.keywords.slice(0, 3).join('、') || '核心卖点';
  const audienceText = marketing.audience.slice(0, 3).join('、') || '当前目标用户';
  const sceneText = marketing.scenes.slice(0, 3).join('、') || '主要使用场景';
  const diffs = inputs.differentiators.length ? inputs.differentiators : ['重新强化差异化表达', '补齐用户疑虑说明', '提升图片承接效率'];
  const complaints = opsCollectComplaints(competitors);
  const competitorAnalysis = opsBuildCompetitorAnalysis(competitors, diffs, complaints);
  const sellingPoints = opsBuildExistingSellingPoints(productName, issue, keywordText, audienceText, sceneText, diffs, complaints, competitorAnalysis);

  return {
    modeLabel: '老品优化',
    positioning: `${productName} 当前优化目标是解决“${issue}”，建议从卖点承接、差异化表达和用户疑虑管理三方面重构策略。`,
    usp: `围绕“${diffs[0]}”重建主卖点，让用户在进入 Listing 后更快理解为什么选择我们而不是竞品。`,
    targetUsers: marketing.audience.length
      ? marketing.audience.map(item => `${item}：需要更直接的购买理由和风险说明，减少犹豫。`)
      : [`${audienceText}：建议结合广告关键词和评论语言进一步细分。`],
    scenes: marketing.scenes.length
      ? marketing.scenes.map(item => `${item}：用场景图或五点承接 ${issue} 带来的转化损耗。`)
      : [`${sceneText}：建议补充真实使用画面，提升 Listing 承接。`],
    pains: complaints.slice(0, 4).map(item => `${item}：建议在图片、QA 或五点中明确回应。`),
    competitorAnalysis,
    sellingPoints,
    comparisons: competitors.map((record, index) => ({
      competitor: `${record.brand || '竞品'} · ${record.asin}`,
      role: opsWorkbenchState.selectedCompetitors.find(item => item.asin === record.asin)?.role || (index === 0 ? '主竞品' : '参考竞品'),
      theirFocus: (record.bullets && record.bullets[0]) || record.reason || '强调基础功能和价格优势',
      ourDiff: diffs[index % diffs.length] || '用更清晰的场景和证据降低选择成本',
    })),
    diagnostics: [
      `问题判断：${issue} 不一定只是流量问题，可能是 Listing 卖点承接不足。`,
      `现有摘要：${existing.listingSummary || '暂未输入现有 Listing 摘要，建议补充标题、五点或近期评论。'}`,
      '优化方向：优先强化能影响点击后转化的主卖点、证据和预期管理。',
    ],
    expressionDirections: [
      `标题：保留核心关键词 ${keywordText}，补强差异化而不是堆词。`,
      `五点：第一点直接回应 ${issue}，后续按痛点、证据、场景展开。`,
      `图片/A+：用对比图、评论痛点解释图和场景图承接用户犹豫。`,
    ],
    risks: opsBuildRisks(),
    actionPlan: [
      '先替换主图/副图文案中最弱的卖点表达。',
      '同步调整标题或五点中的用户疑虑回应。',
      '上线后观察 7-14 天 CVR、CTR、ACOS、差评关键词变化。',
    ],
    summary: `建议将 ${productName} 的优化主线收敛为“当前问题 → 评论痛点 → 竞品压制 → 卖点重构 → 指标验证”。`,
  };
}

function opsBuildCompetitorAnalysis(competitors, diffs, complaints) {
  const selectedNames = competitors.map(record => `${record.brand || '竞品'} ${record.asin || ''}`.trim()).filter(Boolean);
  const focusItems = competitors
    .map(record => (record.bullets && record.bullets[0]) || record.reason || record.title || '')
    .filter(Boolean);
  const priceItems = competitors.map(record => record.price).filter(Boolean);
  const ratingItems = competitors.map(record => Number(record.rating)).filter(value => !Number.isNaN(value));
  const avgRating = ratingItems.length
    ? (ratingItems.reduce((sum, value) => sum + value, 0) / ratingItems.length).toFixed(1)
    : '暂无评分样本';
  const commonFocus = opsUniqueList([
    ...opsWorkbenchState.marketing.keywords,
    ...focusItems.flatMap(item => String(item).split(/[，,、/|]/).map(value => value.trim()).filter(Boolean)),
  ]).slice(0, 5);
  const diffItems = competitors.map((record, index) => {
    const focus = (record.bullets && record.bullets[0]) || record.reason || '基础功能表达';
    return `${record.brand || '竞品'} ${record.asin || ''}：主打 ${focus}，我方可用“${diffs[index % diffs.length] || '差异化表达'}”拉开。`;
  }).slice(0, 5);
  const weaknessItems = opsUniqueList(complaints).slice(0, 5).map(item => `${item}：可转化为预期管理或反向卖点。`);

  return {
    competitors: selectedNames,
    common: commonFocus.length
      ? commonFocus.map(item => `${item} 是竞品反复出现的基础表达，说明该类目需要覆盖。`)
      : ['已选择竞品较少，建议补充竞品卖点摘要后再判断类目共性。'],
    differences: diffItems.length ? diffItems : ['竞品差异样本不足，建议补充主打卖点或选择更多竞品。'],
    weaknesses: weaknessItems.length ? weaknessItems : ['暂无明确差评机会点，建议补充评论或客诉摘要。'],
    pricePosition: [
      `价格样本：${priceItems.length ? priceItems.slice(0, 5).join(' / ') : '暂无价格样本'}。`,
      `评分样本：${avgRating}，可作为判断价值感和信任门槛的参考。`,
      '如果我方价格不占优，策略应少讲低价，多讲体验、证据和场景价值。',
    ],
    opportunities: [
      `必须覆盖：${commonFocus.slice(0, 3).join('、') || '类目基础功能'}。`,
      `差异化方向：${diffs.slice(0, 3).join('、') || '补齐竞品没有讲清楚的场景和证据'}。`,
      `风险管理：围绕 ${complaints.slice(0, 2).join('、') || '用户疑虑'} 提前解释，降低差评预期落差。`,
    ],
  };
}

function opsUniqueList(list) {
  return Array.from(new Set((list || []).map(item => String(item || '').trim()).filter(Boolean)));
}

function opsBuildExistingSellingPoints(productName, issue, keywordText, audienceText, sceneText, diffs, complaints, competitorAnalysis) {
  return opsAttachPointEvidence([
    {
      type: '诊断卖点',
      name: `${issue} 修复主线`,
      description: `${productName} 需要先把 ${issue} 对应的购买阻力转成更清楚的卖点表达。`,
      pain: complaints[0] || '用户进入 Listing 后没有快速形成购买理由',
      evidence: opsWorkbenchState.existingProduct.listingSummary || '来自当前优化问题和人工输入摘要',
      usage: '五点 / 图片 / A+',
      priority: 'P0',
      adopted: true,
    },
    {
      type: '差异化卖点',
      name: diffs[0] || '差异化重建',
      description: `对比竞品重新突出“${diffs[0] || '差异化重建'}”，避免老品表达被同质化。`,
      pain: '竞品压制导致用户缺少选择我们的理由',
      evidence: opsWorkbenchState.inputs.differentiators.join('、') || '来自竞品对比和运营判断',
      usage: '标题 / 主图 / A+',
      priority: 'P0',
      adopted: true,
    },
    {
      type: '场景卖点',
      name: sceneText,
      description: `把 ${sceneText} 做得更具体，帮助用户把产品价值映射到自己的使用场景。`,
      pain: '场景表达泛化，转化承接弱',
      evidence: '来自使用场景和 Listing 摘要',
      usage: '图片 / 五点',
      priority: 'P1',
      adopted: true,
    },
    {
      type: '人群卖点',
      name: audienceText,
      description: `针对 ${audienceText} 重写购买理由，减少无差别卖点。`,
      pain: '目标人群不清导致表达平均化',
      evidence: '来自目标用户标签和运营输入',
      usage: '五点 / 广告承接',
      priority: 'P1',
      adopted: true,
    },
    {
      type: '风险说明',
      name: complaints[0] || '差评预期管理',
      description: `把 ${complaints[0] || '潜在差评点'} 前置说明，减少购买前后预期落差。`,
      pain: '评论痛点没有被 Listing 提前消化',
      evidence: opsWorkbenchState.inputs.complaintsKnown.join('、') || '来自评论/客诉摘要',
      usage: 'QA / 图片 / A+',
      priority: 'P0',
      adopted: true,
    },
  ], competitorAnalysis);
}

function opsBuildSellingPoints(productName, categoryName, keywordText, audienceText, sceneText, diffs, complaints, competitorAnalysis) {
  const keywords = opsWorkbenchState.marketing.keywords;
  const basics = opsWorkbenchState.basics;
  return opsAttachPointEvidence([
    {
      type: '功能卖点',
      name: keywords[0] || '核心功能体验',
      description: `${productName} 在 ${categoryName} 使用中突出 ${keywordText}，让用户快速理解产品能解决什么问题。`,
      pain: complaints[0] || '用户担心基础功能不稳定',
      evidence: basics.coreFunction || '来自产品功能说明和运营输入',
      usage: '标题 / 五点 / 图片',
      priority: 'P0',
      adopted: true,
    },
    {
      type: '场景卖点',
      name: sceneText,
      description: `围绕 ${sceneText} 建立购买画面，降低新品没有 Review 时的理解成本。`,
      pain: '用户不知道这个新品适合自己什么场景',
      evidence: opsWorkbenchState.marketing.materials || '来自产品资料和目标场景输入',
      usage: '图片 / A+ / PPT',
      priority: 'P0',
      adopted: true,
    },
    {
      type: '人群卖点',
      name: audienceText,
      description: `直接面向 ${audienceText} 组织表达，让评审时能判断目标用户是否清晰。`,
      pain: '目标人群泛化导致文案没有记忆点',
      evidence: '来自运营目标人群标签',
      usage: 'PPT / 五点 / QA',
      priority: 'P1',
      adopted: true,
    },
    {
      type: '差异化卖点',
      name: diffs[0] || '差异化表达',
      description: `把“${diffs[0] || '差异化表达'}”作为与竞品拉开的主线，避免只复述类目通用卖点。`,
      pain: '竞品表达同质化，用户缺少选择理由',
      evidence: opsWorkbenchState.inputs.differentiators.join('、') || '来自竞品对比和人工判断',
      usage: 'PPT / 标题 / A+',
      priority: 'P0',
      adopted: true,
    },
    {
      type: '风险说明',
      name: complaints[0] || '预期管理',
      description: `对 ${complaints[0] || '潜在客诉'} 提前做说明，避免过度承诺和上线后差评。`,
      pain: '购买前预期不清导致差评',
      evidence: opsWorkbenchState.basics.limitations || opsWorkbenchState.inputs.complaintsKnown.join('、') || '来自已知客诉和合规注意',
      usage: 'QA / 图片 / 风险页',
      priority: 'P1',
      adopted: true,
    },
  ], competitorAnalysis);
}

function opsAttachPointEvidence(points, competitorAnalysis) {
  const competitors = (competitorAnalysis && competitorAnalysis.competitors && competitorAnalysis.competitors.length)
    ? competitorAnalysis.competitors.slice(0, 3).join('、')
    : '已选竞品';
  const common = competitorAnalysis?.common?.[0] || '来自竞品主打卖点和类目基础表达。';
  const weakness = competitorAnalysis?.weaknesses?.[0] || '来自竞品差评/痛点摘要。';
  return points.map(point => ({
    ...point,
    rationale: point.rationale || `因为 ${common} 同时 ${weakness}，所以该卖点既覆盖基础购买理由，也回应用户疑虑。`,
    source: point.source || `依据：产品资料、${competitors}、竞品卖点/差评摘要。`,
    relatedCompetitors: point.relatedCompetitors || competitors,
    risk: point.risk || '如缺少参数或测试证明，表达应避免绝对化和功效承诺。',
  }));
}

function opsBuildRisks() {
  const limitations = opsWorkbenchState.basics.limitations.trim();
  const complaints = opsWorkbenchState.inputs.complaintsKnown;
  const risks = [];
  if (limitations) risks.push(`合规/限制：${limitations}`);
  complaints.slice(0, 3).forEach(item => risks.push(`客诉预警：${item}`));
  if (!opsWorkbenchState.selectedCompetitors.length && !opsWorkbenchState.manualCompetitors.length) {
    risks.push('竞品参考不足：建议至少补充 1-3 个竞品再评审。');
  }
  if (!risks.length) risks.push('暂无明确风险，建议评审时补充合规和差评预判。');
  return risks;
}

function opsRenderStrategy() {
  const strategy = opsWorkbenchState.strategy;
  return `
    <div class="ops-output-head">
      <div>
        <span>STEP 2</span>
        <h2>${opsEscapeHtml(strategy.modeLabel || '卖点策略')}草稿</h2>
        <p>内容可编辑，也可以通过右侧调优指令继续生成新版本。</p>
      </div>
      <div class="ops-ppt-actions">
        <button class="ops-btn ops-btn-ghost" onclick="opsApplyQuickTune('更适合内部评审 PPT')">优化成评审版</button>
        <button class="ops-btn ops-btn-primary" onclick="opsGeneratePpt()">生成 PPT</button>
      </div>
    </div>
    <div class="ops-strategy-grid">
        ${opsRenderCompetitorAnalysis(strategy.competitorAnalysis)}
        ${opsRenderEditableCard('positioning', opsWorkbenchState.mode === 'existingProduct' ? '优化定位' : '产品定位', strategy.positioning)}
        ${opsRenderEditableCard('usp', '主卖点主线', strategy.usp)}
        ${opsRenderListCard('diagnostics', opsWorkbenchState.mode === 'existingProduct' ? '优化诊断' : '策略判断', strategy.diagnostics)}
        ${opsRenderListCard('targetUsers', '目标用户', strategy.targetUsers)}
        ${opsRenderListCard('scenes', '使用场景', strategy.scenes)}
        ${opsRenderSellingPointCards(strategy.sellingPoints)}
        ${opsRenderComparisonCard(strategy.comparisons)}
        ${opsRenderListCard('pains', '核心痛点 / 客诉机会', strategy.pains)}
        ${opsRenderListCard('expressionDirections', '内容表达方向', strategy.expressionDirections)}
        ${opsRenderListCard('risks', '风险与待补充信息', strategy.risks)}
        ${opsRenderListCard('actionPlan', '下一步动作', strategy.actionPlan)}
        ${opsRenderEditableCard('summary', '卖点总括', strategy.summary)}
    </div>`;
}

function opsRenderCompetitorAnalysis(analysis) {
  if (!analysis) return '';
  return `
    <article class="ops-strategy-card ops-wide-card ops-analysis-card">
      <div class="ops-card-title-row">
        <h3>竞品分析结论</h3>
        <span>先分析，再生成</span>
      </div>
      <div class="ops-analysis-grid">
        ${opsRenderAnalysisBlock('竞品卖点共性', analysis.common)}
        ${opsRenderAnalysisBlock('竞品差异点', analysis.differences)}
        ${opsRenderAnalysisBlock('竞品弱点 / 差评机会', analysis.weaknesses)}
        ${opsRenderAnalysisBlock('价格与定位', analysis.pricePosition)}
        ${opsRenderAnalysisBlock('我方机会点', analysis.opportunities)}
      </div>
    </article>`;
}

function opsRenderAnalysisBlock(title, items) {
  return `
    <div class="ops-analysis-block">
      <strong>${opsEscapeHtml(title)}</strong>
      ${(items || []).map(item => `<p>${opsEscapeHtml(item)}</p>`).join('')}
    </div>`;
}

function opsRenderBottomTuneBar() {
  const quickPrompts = ['更偏转化', '更偏差异化', '更适合美国站', '更适合高端价格带', '降低合规风险', '强化图片表达', '针对差评重写'];
  return `
    <div class="ops-bottom-tune">
      <div class="ops-bottom-tune-meta">
        <strong>策略 V${opsWorkbenchState.tuningHistory.length + 1}</strong>
        <span>对生成内容进行策略调优</span>
      </div>
      <div class="ops-tune-actions">
        ${quickPrompts.map(prompt => `
          <button type="button" onclick="opsApplyQuickTune('${opsEscapeAttr(prompt)}')">${opsEscapeHtml(prompt)}</button>
        `).join('')}
      </div>
      <input class="ops-bottom-tune-input" value="${opsEscapeAttr(opsWorkbenchState.tuningInput)}" placeholder="输入调优要求，例如：竞品都讲防水，帮我从舒适性和家庭急救场景重新组织卖点" oninput="opsWorkbenchState.tuningInput = this.value" onkeydown="if(event.key==='Enter'){opsSubmitTune()}">
      <button type="button" class="ops-btn ops-btn-primary" onclick="opsSubmitTune()">发送</button>
      ${opsWorkbenchState.tuningHistory.length ? `
        <div class="ops-tune-history">
          ${opsWorkbenchState.tuningHistory.map(item => `<span>${opsEscapeHtml(item)}</span>`).join('')}
        </div>
      ` : ''}
    </div>`;
}

function opsRenderSellingPointCards(list) {
  return `
    <article class="ops-strategy-card ops-wide-card">
      <h3>结构化卖点卡片</h3>
      <div class="ops-point-list">
        ${(list || []).map((item, index) => `
          <div class="ops-point-card ${item.adopted ? 'adopted' : ''}">
            <div class="ops-point-top">
              <select onchange="opsUpdateSellingPoint(${index}, 'type', this.value)">
                ${['功能卖点', '场景卖点', '人群卖点', '差异化卖点', '证据型卖点', '风险说明'].map(type => `<option value="${type}" ${item.type === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
              <select onchange="opsUpdateSellingPoint(${index}, 'priority', this.value)">
                ${['P0', 'P1', 'P2'].map(priority => `<option value="${priority}" ${item.priority === priority ? 'selected' : ''}>${priority}</option>`).join('')}
              </select>
              <label>
                <input type="checkbox" ${item.adopted ? 'checked' : ''} onchange="opsUpdateSellingPoint(${index}, 'adopted', this.checked)">
                采用
              </label>
            </div>
            <input value="${opsEscapeAttr(item.name)}" placeholder="卖点名称" oninput="opsUpdateSellingPoint(${index}, 'name', this.value)">
            <textarea rows="2" placeholder="卖点说明" oninput="opsUpdateSellingPoint(${index}, 'description', this.value)">${opsEscapeHtml(item.description)}</textarea>
            <div class="ops-grid-2">
              <textarea rows="2" placeholder="对应痛点" oninput="opsUpdateSellingPoint(${index}, 'pain', this.value)">${opsEscapeHtml(item.pain)}</textarea>
              <textarea rows="2" placeholder="支撑依据" oninput="opsUpdateSellingPoint(${index}, 'evidence', this.value)">${opsEscapeHtml(item.evidence)}</textarea>
            </div>
            <input value="${opsEscapeAttr(item.usage)}" placeholder="推荐使用位置：标题 / 五点 / 图片 / A+" oninput="opsUpdateSellingPoint(${index}, 'usage', this.value)">
            <div class="ops-point-reason">
              <strong>为什么这样生成</strong>
              <textarea rows="2" oninput="opsUpdateSellingPoint(${index}, 'rationale', this.value)">${opsEscapeHtml(item.rationale || '')}</textarea>
              <strong>依据来源</strong>
              <textarea rows="2" oninput="opsUpdateSellingPoint(${index}, 'source', this.value)">${opsEscapeHtml(item.source || '')}</textarea>
              <div class="ops-grid-2">
                <textarea rows="2" placeholder="对应竞品" oninput="opsUpdateSellingPoint(${index}, 'relatedCompetitors', this.value)">${opsEscapeHtml(item.relatedCompetitors || '')}</textarea>
                <textarea rows="2" placeholder="风险提醒" oninput="opsUpdateSellingPoint(${index}, 'risk', this.value)">${opsEscapeHtml(item.risk || '')}</textarea>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </article>`;
}

function opsRenderEditableCard(key, title, value) {
  return `
    <article class="ops-strategy-card">
      <h3>${title}</h3>
      <textarea rows="4" oninput="opsUpdateStrategyText('${key}', this.value)">${opsEscapeHtml(value)}</textarea>
    </article>`;
}

function opsRenderListCard(key, title, list) {
  return `
    <article class="ops-strategy-card">
      <h3>${title}</h3>
      ${(list || []).map((item, index) => `
        <textarea rows="2" oninput="opsUpdateStrategyList('${key}', ${index}, this.value)">${opsEscapeHtml(item)}</textarea>
      `).join('')}
    </article>`;
}

function opsRenderComparisonCard(list) {
  if (!list || !list.length) {
    return `
      <article class="ops-strategy-card ops-wide-card">
        <h3>竞争对手对比</h3>
        <p class="ops-muted">尚未选择竞品，PPT 中会保留对比页结构。</p>
      </article>`;
  }
  return `
    <article class="ops-strategy-card ops-wide-card">
      <h3>竞争对手对比</h3>
      <div class="ops-mini-table">
        <div class="ops-mini-row ops-mini-head">
          <span>竞品</span><span>角色</span><span>对方主打</span><span>我方差异</span>
        </div>
        ${list.map((item, index) => `
          <div class="ops-mini-row">
            <span>${opsEscapeHtml(item.competitor)}</span>
            <span>${opsEscapeHtml(item.role)}</span>
            <textarea rows="2" oninput="opsUpdateComparison(${index}, 'theirFocus', this.value)">${opsEscapeHtml(item.theirFocus)}</textarea>
            <textarea rows="2" oninput="opsUpdateComparison(${index}, 'ourDiff', this.value)">${opsEscapeHtml(item.ourDiff)}</textarea>
          </div>
        `).join('')}
      </div>
    </article>`;
}

function opsUpdateStrategyText(key, value) {
  if (opsWorkbenchState.strategy) opsWorkbenchState.strategy[key] = value;
}

function opsUpdateStrategyList(key, index, value) {
  if (opsWorkbenchState.strategy && opsWorkbenchState.strategy[key]) {
    opsWorkbenchState.strategy[key][index] = value;
  }
}

function opsUpdateComparison(index, field, value) {
  if (opsWorkbenchState.strategy && opsWorkbenchState.strategy.comparisons[index]) {
    opsWorkbenchState.strategy.comparisons[index][field] = value;
  }
}

function opsUpdateSellingPoint(index, field, value) {
  if (opsWorkbenchState.strategy && opsWorkbenchState.strategy.sellingPoints[index]) {
    opsWorkbenchState.strategy.sellingPoints[index][field] = value;
    opsWorkbenchState.ppt = null;
  }
}

function opsApplyQuickTune(prompt) {
  opsApplyTune(prompt);
}

function opsSubmitTune() {
  const prompt = opsWorkbenchState.tuningInput.trim();
  if (!prompt) {
    showToast('请先输入调优要求', 'warning');
    return;
  }
  opsApplyTune(prompt);
  opsWorkbenchState.tuningInput = '';
}

function opsApplyTune(prompt) {
  if (!opsWorkbenchState.strategy) {
    showToast('请先生成卖点策略', 'warning');
    return;
  }
  const strategy = opsWorkbenchState.strategy;
  const tag = `调优：${prompt}`;
  strategy.summary = `${strategy.summary}\n${tag}。`;
  strategy.usp = `${strategy.usp}（已按“${prompt}”方向调整）`;
  strategy.expressionDirections = [
    `${prompt}：优先调整标题、五点和图片中的第一层卖点表达。`,
    ...(strategy.expressionDirections || []).slice(0, 2),
  ];
  if (strategy.sellingPoints && strategy.sellingPoints[0]) {
    strategy.sellingPoints[0].description = `${strategy.sellingPoints[0].description} 调优方向：${prompt}。`;
  }
  opsWorkbenchState.tuningHistory = [prompt, ...opsWorkbenchState.tuningHistory].slice(0, 5);
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
  showToast('策略已按调优要求更新', 'success');
}

function opsGeneratePpt() {
  if (!opsWorkbenchState.strategy) {
    showToast('请先生成卖点策略', 'warning');
    return;
  }
  opsWorkbenchState.ppt = opsBuildPptSlides();
  opsWorkbenchState.pptPage = 0;
  renderOpsWorkbenchView();
  showToast('PPT 预览已生成', 'success');
}

function opsBuildPptSlides() {
  if (opsWorkbenchState.mode === 'existingProduct') {
    return opsBuildExistingPptSlides();
  }
  const basics = opsWorkbenchState.basics;
  const strategy = opsWorkbenchState.strategy;
  const name = basics.nameZh || basics.nameEn || '新品卖点 PPT';
  const adoptedPoints = (strategy.sellingPoints || []).filter(item => item.adopted);
  return [
    { title: '新品概览', subtitle: name, blocks: [`品牌：${basics.brand || '—'}`, `站点：${basics.sites.join(' / ') || '—'}`, `子品类：${opsGetCategoryName(basics.subcategory)}`, `价格带：${basics.priceBand || '—'}`] },
    { title: '市场与竞品参考', subtitle: '从竞品主打卖点和客诉中寻找机会', blocks: [...(strategy.competitorAnalysis?.common || []), ...(strategy.competitorAnalysis?.opportunities || [])].slice(0, 6) },
    { title: '目标用户与使用场景', blocks: [...strategy.targetUsers, ...strategy.scenes].slice(0, 6) },
    { title: '核心卖点策略', subtitle: strategy.usp, blocks: adoptedPoints.slice(0, 5).map(item => `${item.priority} · ${item.name}：${item.description}`) },
    { title: '差异化定位', blocks: adoptedPoints.filter(item => item.type === '差异化卖点' || item.type === '功能卖点').map(item => `${item.name}：${item.evidence}`).slice(0, 4) },
    { title: '内容表达建议', blocks: strategy.expressionDirections },
    { title: '风险与待补充信息', blocks: strategy.risks },
    { title: '评审结论', subtitle: strategy.summary, blocks: ['建议推进：主卖点、人群和场景都清晰。', '待补充：实物图、参数证明、合规限制和竞品 Review 样本。', '下一步：确认卖点后进入 Listing 文案或视觉需求创建。'] },
  ];
}

function opsBuildExistingPptSlides() {
  const basics = opsWorkbenchState.basics;
  const strategy = opsWorkbenchState.strategy;
  const product = opsWorkbenchState.existingProduct;
  const name = product.productName || product.asin || '老品卖点优化';
  const adoptedPoints = (strategy.sellingPoints || []).filter(item => item.adopted);
  return [
    { title: '老品现状与目标问题', subtitle: name, blocks: [`站点：${basics.sites.join(' / ') || '—'}`, `子品类：${opsGetCategoryName(basics.subcategory)}`, `当前问题：${product.issue || '—'}`, `摘要：${product.listingSummary || '待补充现有 Listing 或经营数据'}`] },
    { title: '当前 Listing 卖点诊断', blocks: strategy.diagnostics },
    { title: '评论/客诉机会点', blocks: strategy.pains },
    { title: '竞品压制与差异化机会', blocks: [...(strategy.competitorAnalysis?.differences || []), ...(strategy.competitorAnalysis?.opportunities || [])].slice(0, 6) },
    { title: '优化后主卖点策略', subtitle: strategy.usp, blocks: adoptedPoints.slice(0, 5).map(item => `${item.priority} · ${item.name}：${item.description}`) },
    { title: '内容表达建议', blocks: strategy.expressionDirections },
    { title: '风险与待补充信息', blocks: strategy.risks },
    { title: '执行动作与验证指标', subtitle: strategy.summary, blocks: [...strategy.actionPlan, '验证指标：CVR、CTR、ACOS、评分、差评关键词。'].slice(0, 6) },
  ];
}

function opsRenderPptPreview() {
  const slides = opsWorkbenchState.ppt || [];
  const page = Math.min(opsWorkbenchState.pptPage, slides.length - 1);
  const slide = slides[page] || {};
  return `
    <div class="ops-output-head">
      <div>
        <span>STEP 3</span>
        <h2>卖点 PPT 预览</h2>
        <p>${opsWorkbenchState.mode === 'existingProduct' ? '老品优化' : '新品评审'} 8 页结构，首版提供 HTML 预览和内容复制。</p>
      </div>
      <div class="ops-ppt-actions">
        <button class="ops-btn ops-btn-ghost" onclick="opsBackToStrategy()">返回策略</button>
        <button class="ops-btn ops-btn-primary" onclick="opsCopyPpt()">复制 PPT 内容</button>
      </div>
    </div>
    <div class="ops-ppt-wrap">
      <div class="ops-slide">
        <span class="ops-slide-no">${page + 1} / ${slides.length}</span>
        <h2>${opsEscapeHtml(slide.title || '')}</h2>
        ${slide.subtitle ? `<p class="ops-slide-subtitle">${opsEscapeHtml(slide.subtitle)}</p>` : ''}
        ${slide.table ? opsRenderSlideTable(slide.table) : opsRenderSlideBlocks(slide.blocks || [])}
      </div>
      <div class="ops-ppt-nav">
        <button class="ops-btn ops-btn-ghost" onclick="opsSetPptPage(${page - 1})" ${page <= 0 ? 'disabled' : ''}>上一页</button>
        <div class="ops-thumb-row">
          ${slides.map((item, index) => `
            <button class="${index === page ? 'active' : ''}" onclick="opsSetPptPage(${index})">${index + 1}</button>
          `).join('')}
        </div>
        <button class="ops-btn ops-btn-ghost" onclick="opsSetPptPage(${page + 1})" ${page >= slides.length - 1 ? 'disabled' : ''}>下一页</button>
      </div>
    </div>`;
}

function opsRenderSlideBlocks(blocks) {
  return `
    <div class="ops-slide-blocks">
      ${(blocks || []).map(item => `<div>${opsEscapeHtml(item)}</div>`).join('')}
    </div>`;
}

function opsRenderSlideTable(rows) {
  if (!rows || !rows.length) return `<div class="ops-slide-blocks"><div>尚未选择竞品。</div></div>`;
  return `
    <div class="ops-slide-table">
      <div class="ops-slide-table-head"><span>竞品</span><span>对方主打</span><span>我方差异</span></div>
      ${rows.map(row => `
        <div class="ops-slide-table-row">
          <span>${opsEscapeHtml(row.competitor)}</span>
          <span>${opsEscapeHtml(row.theirFocus)}</span>
          <span>${opsEscapeHtml(row.ourDiff)}</span>
        </div>
      `).join('')}
    </div>`;
}

function opsSetPptPage(page) {
  if (!opsWorkbenchState.ppt) return;
  opsWorkbenchState.pptPage = Math.max(0, Math.min(page, opsWorkbenchState.ppt.length - 1));
  renderOpsWorkbenchView();
}

function opsBackToStrategy() {
  opsWorkbenchState.ppt = null;
  renderOpsWorkbenchView();
}

function opsCopyPpt() {
  const slides = opsWorkbenchState.ppt || [];
  const text = slides.map((slide, index) => {
    const blocks = slide.table
      ? slide.table.map(row => `- ${row.competitor || '竞品'}：${row.theirFocus || '—'} / 我方：${row.ourDiff || '—'}`).join('\n')
      : (slide.blocks || []).map(item => `- ${item}`).join('\n');
    return `${index + 1}. ${slide.title}\n${slide.subtitle || ''}\n${blocks}`.trim();
  }).join('\n\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast('PPT 内容已复制', 'success'));
    return;
  }
  showToast('当前浏览器不支持自动复制，可手动选择预览内容', 'warning');
}

function opsResetWorkbench() {
  const currentMode = opsWorkbenchState.mode;
  opsWorkbenchState.advancedOpen = false;
  opsWorkbenchState.basics = {
    nameZh: '',
    nameEn: '',
    brand: 'AUVON',
    sites: ['US'],
    subcategory: 'woundPatch',
    launchDate: '',
    priceBand: '$9-$19',
    productForm: '',
    coreFunction: '',
    limitations: '',
  };
  opsWorkbenchState.marketing = {
    positioningOneLiner: '',
    keywords: ['防水', '亲肤', '便携'],
    audience: ['家庭急救用户', '户外出行人群'],
    scenes: ['家庭急救', '户外出行'],
    materials: '',
  };
  opsWorkbenchState.manualCompetitorDraft = {
    asin: '',
    title: '',
    price: '',
    rating: '',
    focus: '',
    complaints: '',
    difference: '',
  };
  opsWorkbenchState.manualCompetitors = [];
  opsWorkbenchState.existingProduct = {
    asin: '',
    productName: '',
    issue: '转化下滑',
    listingSummary: '',
    performanceNote: '',
  };
  opsWorkbenchState.selectedCompetitors = [];
  opsWorkbenchState.inputs = {
    differentiators: ['更强防水场景表达', '更舒适的贴合体验'],
    complaintsKnown: ['粘性不足', '边缘容易翘起'],
    notes: '',
  };
  opsWorkbenchState.strategy = null;
  opsWorkbenchState.ppt = null;
  opsWorkbenchState.pptPage = 0;
  opsWorkbenchState.tuningInput = '';
  opsWorkbenchState.tuningHistory = [];
  opsWorkbenchState.isGenerating = false;
  opsWorkbenchState.mode = currentMode;
  renderOpsWorkbenchView();
}

function opsSaveDraft() {
  try {
    localStorage.setItem('ops-new-product-ppt-draft', JSON.stringify({
      mode: opsWorkbenchState.mode,
      basics: opsWorkbenchState.basics,
      marketing: opsWorkbenchState.marketing,
      existingProduct: opsWorkbenchState.existingProduct,
      manualCompetitors: opsWorkbenchState.manualCompetitors,
      selectedCompetitors: opsWorkbenchState.selectedCompetitors,
      inputs: opsWorkbenchState.inputs,
      strategy: opsWorkbenchState.strategy,
      ppt: opsWorkbenchState.ppt,
      tuningHistory: opsWorkbenchState.tuningHistory,
      savedAt: new Date().toISOString(),
    }));
    showToast('草稿已保存', 'success');
  } catch (error) {
    showToast('草稿保存失败，请检查浏览器存储权限', 'warning');
  }
}

function opsGetCategories() {
  if (typeof competitorCategoryTree !== 'undefined' && competitorCategoryTree.length) {
    return competitorCategoryTree;
  }
  return [
    { id: 'woundPatch', name: '伤口贴' },
    { id: 'pillbox', name: '药物管理' },
  ];
}

function opsGetCategoryName(id) {
  const item = opsGetCategories().find(category => category.id === id);
  return item ? item.name : '新品类目';
}

function opsGetFilteredCompetitors() {
  if (typeof competitorRecords === 'undefined') return [];
  const basics = opsWorkbenchState.basics;
  const subcategory = opsResolveSubcategory(basics.subcategory);
  return competitorRecords.filter(record => {
    const siteOk = !basics.sites.length || basics.sites.includes(record.site);
    return record.subcategory === subcategory && siteOk && record.status !== '下架';
  });
}

function opsResolveSubcategory(categoryId) {
  if (typeof competitorCategoryMap !== 'undefined' && competitorCategoryMap[categoryId]) {
    return competitorCategoryMap[categoryId];
  }
  return categoryId;
}

function opsFindCompetitor(asin) {
  if (typeof competitorRecords === 'undefined') return null;
  return competitorRecords.find(record => record.asin === asin);
}

function opsGetSelectedCompetitors() {
  const selectedFromMaster = opsWorkbenchState.selectedCompetitors
    .map(item => opsFindCompetitor(item.asin))
    .filter(Boolean);
  return [
    ...selectedFromMaster,
    ...opsWorkbenchState.manualCompetitors.map(item => ({
      asin: item.asin,
      brand: item.brand || '手动竞品',
      title: item.title,
      site: item.site,
      price: item.price,
      rating: item.rating,
      role: item.role,
      bullets: item.focus ? [item.focus] : [],
      changes: item.complaints ? item.complaints.split(/[，,、\n]/).map(value => value.trim()).filter(Boolean) : [],
      reason: item.difference,
    })),
  ];
}

function opsCollectComplaints(competitors) {
  const manual = opsWorkbenchState.inputs.complaintsKnown.slice();
  const fromCompetitors = competitors.flatMap(record => {
    const changes = Array.isArray(record.changes) ? record.changes : [];
    return changes.slice(0, 2);
  });
  const fallback = ['价格敏感', '使用场景表达不清晰', '材质和舒适度证明不足'];
  return [...manual, ...fromCompetitors, ...fallback].slice(0, 5);
}

function opsEscapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function opsEscapeAttr(value) {
  return opsEscapeHtml(value).replace(/`/g, '&#96;');
}

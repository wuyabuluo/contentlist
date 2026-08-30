// ============================================================
// 公共脚本 - 导航、Toast、渲染通用组件
// ============================================================

// ============================================================
// Toast 提示
// ============================================================

let toastTimer = null;
function showToast(message, type = '') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = 'toast';
  if (type) toast.classList.add(type);
  toast.textContent = message;
  // 强制 reflow 后再显示（保证动画）
  void toast.offsetHeight;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ============================================================
// 导航栏渲染
// ============================================================

function renderNavbar(activeKey) {
  const user = getCurrentUser();

  // 搜索框 - 所有页面都显示（统一体验）
  const showSearch = true;

  // 右侧区域
  // 不管登录态，右上角只保留 1 个统一的【我的清单】入口
  // - 已登录：头像 chip（点击进我的主页）
  // - 未登录：相同位置的"我的清单"按钮（点击跳登录页）
  const rightArea = `
    ${showSearch ? `
      <div class="search-bar" style="margin:0">
        <span class="search-icon">🔍</span>
        <input id="search-input" class="search-input" type="text" placeholder="搜索清单或内容">
      </div>
    ` : '<div style="flex:1"></div>'}
    ${user ? `
      <a href="me.html" class="user-chip" title="${escapeHtml(user.name)} - 我的清单">
        <div class="user-avatar" style="background:${user.avatarColor}">${user.avatar}</div>
        <span class="user-name">${escapeHtml(user.name)}</span>
      </a>
    ` : `
      <a href="login.html" class="user-chip user-chip--guest" title="登录后查看我的清单">
        <div class="user-avatar" style="background:#e8e8e8;color:var(--text-secondary)">📋</div>
        <span class="user-name">我的清单</span>
      </a>
    `}
  `;

  const navHtml = `
    <div class="navbar">
      <div class="navbar-inner">
        <a href="index.html" class="logo">
          <span class="logo-icon">📋</span>
          <span>清单</span>
        </a>
        <div class="nav-links">
          <a href="index.html" class="nav-link ${activeKey === 'home' ? 'active' : ''}">发现</a>
        </div>
        <div class="nav-user">
          ${rightArea}
        </div>
      </div>
    </div>
  `;
  // 替换或插入
  const existing = document.querySelector('.navbar');
  if (existing) {
    existing.outerHTML = navHtml;
  } else {
    const main = document.querySelector('.main');
    if (main && main.parentNode) {
      // 把 nav 插入到 main 的前面（main 可能是 .app 的子节点）
      const wrapper = document.createElement('div');
      wrapper.innerHTML = navHtml;
      main.parentNode.insertBefore(wrapper.firstElementChild, main);
    } else {
      // 没有 main 的话（比如 login 页），插入到 body 第一个位置
      const wrapper = document.createElement('div');
      wrapper.innerHTML = navHtml;
      document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);
    }
  }

  // 绑定搜索框：回车跳首页带 search 参数
  const si = document.getElementById('search-input');
  if (si) {
    si.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = si.value.trim();
        if (q) {
          window.location.href = 'index.html?search=' + encodeURIComponent(q);
        } else {
          window.location.href = 'index.html';
        }
      }
    });
  }
}

// ============================================================
// 通用渲染函数
// ============================================================

// 渲染清单卡片
function renderListCard(list, options = {}) {
  const { showEdit = false } = options;
  const creator = list.anonymous ? null : getUserById(list.creatorId);
  const creatorHtml = list.anonymous
    ? `<span class="list-card-creator-name">匿名用户</span>`
    : `
      <div class="user-avatar" style="background:${creator.avatarColor}">${creator.avatar}</div>
      <span class="list-card-creator-name">${escapeHtml(creator.name)}</span>
    `;

  return `
    <div class="list-card-wrap${showEdit ? ' list-card-wrap--my' : ''}">
      <a href="list.html?id=${list.id}" class="list-card">
        <div class="list-card-cover" style="color:${list.coverColor}">
          <span class="list-card-cover-emoji">${list.coverEmoji}</span>
          <span class="list-card-cover-count">${list.itemIds.length} 条内容</span>
        </div>
        <div class="list-card-body">
          <div class="list-card-title">${escapeHtml(list.title)}</div>
          <div class="list-card-desc">${escapeHtml(list.description || '')}</div>
          <div class="list-card-meta">
            <div class="list-card-creator">
              ${creatorHtml}
            </div>
            <div class="list-card-collect">
              <span>★</span>
              <span>${formatCount(list.collectCount)}</span>
            </div>
          </div>
        </div>
      </a>
      ${showEdit ? `
        <button class="list-card-edit-btn" data-edit-list="${escapeHtml(list.id)}" type="button" aria-label="编辑清单">
          ✏️ 编辑
        </button>
      ` : ''}
    </div>
  `;
}

// 渲染单条 item 卡片 (首页信息流)
function renderItemCard(item) {
  const platform = getPlatformInfo(item.platform);
  const creator = getUserById(item.creatorId);

  return `
    <a href="item.html?id=${item.id}" class="item-card">
      <div class="item-card-platform ${item.platform}">${platform.icon}</div>
      <div class="item-card-body">
        <div class="item-card-meta-row">
          <span class="item-card-platform-name ${item.platform}">${platform.shortName}</span>
          <span>·</span>
          <span>${formatTime(item.createTime)}</span>
        </div>
        <div class="item-card-intro">${escapeHtml(item.intro)}</div>
        <div class="item-card-footer">
          <div class="item-card-creator">
            <div class="user-avatar" style="background:${creator.avatarColor}">${creator.avatar}</div>
            <span>${escapeHtml(creator.name)}</span>
          </div>
          <div class="item-card-stats">
            <span class="item-card-stat">♡ ${formatCount(item.likeCount)}</span>
          </div>
        </div>
      </div>
    </a>
  `;
}

// 渲染清单内的单行 item
function renderListItemRow(item, index, listId) {
  const platform = getPlatformInfo(item.platform);
  const creator = getUserById(item.creatorId);

  return `
    <div class="list-item-row" data-open-item="${escapeHtml(item.id)}" data-from-list="${escapeHtml(listId || '')}">
      <div class="list-item-index">${String(index + 1).padStart(2, '0')}</div>
      <div class="list-item-info">
        <div class="list-item-intro">${escapeHtml(item.intro)}</div>
        <div class="list-item-meta">
          <span class="list-item-platform ${item.platform}">${platform.icon} ${platform.shortName}</span>
          <span>·</span>
          <span>分享者：${escapeHtml(creator.name)}</span>
        </div>
      </div>
      <div class="list-item-arrow">›</div>
    </div>
  `;
}

// 渲染单条内容 drawer（弹层版本）
function renderItemDrawerHTML(item) {
  const platform = getPlatformInfo(item.platform);
  const creator = getUserById(item.creatorId);
  const liked = isLiked(item.id);
  const likeCount = (item.likeCount || 0) + (liked ? 1 : 0);

  return `
    <div class="item-drawer-mask" data-drawer-action="mask"></div>
    <div class="item-drawer-card">
      <div class="item-drawer-handle"></div>
      <header class="item-drawer-header">
        <span class="item-drawer-platform ${item.platform}">${platform.icon} ${platform.name}</span>
        <button class="item-drawer-close" data-drawer-action="close" aria-label="关闭">✕</button>
      </header>
      <div class="item-drawer-intro">${escapeHtml(item.intro || '（无介绍）')}</div>
      <div class="item-drawer-meta">
        <div class="user-avatar" style="background:${creator.avatarColor}">${creator.avatar}</div>
        <span>${escapeHtml(creator.name)}</span>
        <span class="item-drawer-time">· ${escapeHtml(item.createTime || '')}</span>
      </div>
      <div class="item-drawer-link">
        <span class="item-drawer-link-url">${escapeHtml((item.url || '').slice(0, 60))}${(item.url || '').length > 60 ? '…' : ''}</span>
      </div>
      <div class="item-drawer-actions">
        <button class="item-drawer-action ${liked ? 'liked' : ''}" data-drawer-action="like">
          <span>${liked ? '♥' : '♡'}</span>
          <span>${liked ? '已点赞' : '点赞'}</span>
          <span>(${formatCount(likeCount)})</span>
        </button>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="item-drawer-action item-drawer-action--primary">
          <span>↗</span>
          <span>打开${platform.shortName}</span>
        </a>
      </div>
      <div class="item-drawer-foot">
        <button type="button" class="item-drawer-share" data-drawer-action="copy-list-link">📋 复制清单链接</button>
      </div>
    </div>
  `;
}

// 全局函数：打开 item drawer
function openItemDrawer(itemId) {
  const item = getItemById(itemId);
  if (!item) return;
  // 移除已存在的
  closeItemDrawer();
  const wrap = document.createElement('div');
  wrap.className = 'item-drawer';
  wrap.id = 'item-drawer';
  wrap.innerHTML = renderItemDrawerHTML(item);
  document.body.appendChild(wrap);
  // 禁止 body 滚动
  document.body.style.overflow = 'hidden';
}

function closeItemDrawer() {
  const existing = document.getElementById('item-drawer');
  if (existing) existing.remove();
  document.body.style.overflow = '';
}

// ============================================================
// 移动端底部 tab bar
// ============================================================

function renderMobileTabBar() {
  // 只在移动端显示（< 768px）
  if (window.innerWidth > 768) return;

  const path = location.pathname;
  const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '';
  const isMe = path.endsWith('me.html');
  const user = getCurrentUser();

  // 未登录时不显示 tab bar（让登录页全屏显示）
  if (!user) return;

  const tabbar = document.createElement('nav');
  tabbar.className = 'mobile-tabbar';
  tabbar.innerHTML = `
    <a href="index.html" class="mobile-tab ${isHome ? 'active' : ''}">
      <span class="mobile-tab-icon">🏠</span>
      <span class="mobile-tab-label">发现</span>
    </a>
    <a href="me.html?tab=created" class="mobile-tab ${isMe ? 'active' : ''}">
      <span class="mobile-tab-icon">📋</span>
      <span class="mobile-tab-label">我的清单</span>
    </a>
    <button class="mobile-tab mobile-tab--fab" id="mobile-fab" type="button" aria-label="发布">
      <span class="mobile-tab-icon">+</span>
    </button>
    <a href="me.html" class="mobile-tab">
      <span class="mobile-tab-icon">👤</span>
      <span class="mobile-tab-label">我</span>
    </a>
  `;
  document.body.appendChild(tabbar);

  // FAB 点击：跳首页并 focus 输入框
  document.getElementById('mobile-fab').addEventListener('click', () => {
    if (isHome) {
      // 在首页，滚到 hero 并 focus 输入框
      const urlField = document.getElementById('hero-url');
      if (urlField) {
        urlField.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // 跳到首页（用 hash 让首页知道要 focus）
      location.href = 'index.html#publish';
    }
  });
}

// 入口
function initMobileFeatures() {
  renderMobileTabBar();
  renderFooter();
  // 监听 resize（横竖屏切换）
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastWidth) > 50) {
      lastWidth = window.innerWidth;
      const existing = document.querySelector('.mobile-tabbar');
      if (existing) existing.remove();
      renderMobileTabBar();
    }
  });
}

// 底部页脚（法律链接 + 版本号）
function renderFooter() {
  if (document.querySelector('.app-footer')) return;
  const main = document.querySelector('.main');
  if (!main) return;
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div class="app-footer-inner">
      <a href="legal/agreement.html">用户协议</a>
      <span class="app-footer-divider">·</span>
      <a href="legal/privacy.html">隐私政策</a>
      <span class="app-footer-divider">·</span>
      <span class="app-footer-version">v${APP_VERSION}</span>
    </div>
  `;
  main.appendChild(footer);
}

// ============================================================
// URL 参数读取
// ============================================================

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ============================================================
// 工具
// ============================================================

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 登录守卫：未登录则跳转到登录页
function requireLogin(returnUrl) {
  if (!getCurrentUser()) {
    const url = returnUrl
      ? `login.html?return=${encodeURIComponent(returnUrl)}`
      : 'login.html';
    window.location.href = url;
    return false;
  }
  return true;
}

// ============================================================
// 底部 Footer
// ============================================================

function renderFooter() {
  if (document.querySelector('.app-footer')) return; // 防重复
  const main = document.querySelector('.main');
  if (!main) return;

  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div>
      <a href="index.html">关于</a>·
      <a href="terms.html">用户协议</a>·
      <a href="privacy.html">隐私政策</a>·
      <a href="javascript:void(0)" id="footer-feedback">反馈</a>
    </div>
    <div class="app-footer-version">v${APP_VERSION} · ${APP_BUILD}</div>
  `;
  // 插到 main 之后、body 末尾
  document.querySelector('.app').appendChild(footer);

  // 反馈：复制邮箱到剪贴板
  document.getElementById('footer-feedback').addEventListener('click', () => {
    const email = 'feedback@example.com';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        showToast('反馈邮箱已复制：' + email, 'success');
      }).catch(() => {
        showToast('反馈邮箱：' + email, 'success');
      });
    } else {
      showToast('反馈邮箱：' + email, 'success');
    }
  });
}

// ============================================================
// 自动初始化
// ============================================================

// 移动端底部 tab bar - 所有前台页面自动启用
if (typeof window !== 'undefined') {
  // 检查当前页面是不是后台（admin.html 不显示 tab bar / footer）
  const isAdmin = location.pathname.endsWith('admin.html') || location.pathname.endsWith('login.html');
  if (!isAdmin) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFrontend);
    } else {
      initFrontend();
    }
  }

  // 检查应用版本（大版本升级时清理旧数据）
  try {
    const v = checkAppVersion();
    if (v.upgraded && v.major) {
      console.log('[app] major version upgrade, data cleared');
    }
  } catch (e) {}
}

function initFrontend() {
  initMobileFeatures();
  renderFooter();
  // 版本检查：如果存储的版本不匹配，提示用户硬刷新
  checkVersion();
}

function checkVersion() {
  try {
    const saved = localStorage.getItem('contentlist_app_version');
    if (saved && saved !== APP_VERSION) {
      // 版本不一致，提示用户刷新
      setTimeout(() => {
        showToast('新版本已发布，建议刷新页面 (Ctrl+Shift+R)', 'success');
      }, 1500);
    }
    localStorage.setItem('contentlist_app_version', APP_VERSION);
  } catch (e) {}
}

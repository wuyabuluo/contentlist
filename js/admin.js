// ============================================================
// 后台管理 - admin.js
// 单页应用：6 个 tab（数据看板 / 举报 / 清单 / 内容 / 用户 / 日志）
// 数据全部来自 localStorage（与前台共享 origin）
// ============================================================

(function() {
  'use strict';

  // 模块级状态（用 let 但提到顶部，避免 TDZ）
  let currentReportFilter = 'pending';

  function init() {
    const loginView = document.getElementById('login-view');
    const adminView = document.getElementById('admin-view');

    function showLogin() { loginView.hidden = false; adminView.hidden = true; }
    function showAdmin() { loginView.hidden = true; adminView.hidden = false; renderAll(); }

    if (isAdminLoggedIn()) {
      loginView.hidden = true;
      adminView.hidden = false;
      try {
        renderDashboard();
        renderReports();
        renderLists();
        renderItems();
        renderUsers();
        renderLogs();
      } catch (e) { console.error('render err', e); }
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 登录 / 退出 / Tab 切换 等事件绑定（DOMContentLoaded 后）
  function bindEvents() {
    // 登录
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value.trim();
        const p = document.getElementById('login-password').value;
        const err = document.getElementById('login-error');
        if (adminLogin(u, p)) {
          err.textContent = '';
          document.getElementById('login-view').hidden = true;
          document.getElementById('admin-view').hidden = false;
          try {
            renderDashboard(); renderReports(); renderLists();
            renderItems(); renderUsers(); renderLogs();
          } catch (e) { console.error('render err', e); }
        } else {
          err.textContent = '账号或密码错误';
        }
      });
    }

    // 退出
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
          adminLogout();
          document.getElementById('login-view').hidden = false;
          document.getElementById('admin-view').hidden = true;
        }
      });
    }

    // Tab 切换
    document.querySelectorAll('.admin-tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(x => x.classList.toggle('active', x === t));
        const tab = t.dataset.tab;
        document.querySelectorAll('.admin-tab-panel').forEach(p => p.hidden = true);
        document.getElementById('tab-' + tab).hidden = false;
        window.scrollTo(0, 0);
      });
    });
  }

  // ========== 工具函数 ==========
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function statusTag(status) {
    if (status === 'pending') return '<span class="tag tag-pending">待处理</span>';
    if (status === 'approved') return '<span class="tag tag-approved">已通过</span>';
    if (status === 'rejected') return '<span class="tag tag-rejected">已拒绝</span>';
    if (status === 'banned') return '<span class="tag tag-banned">已封禁</span>';
    if (status === 'normal') return '<span class="tag tag-normal">正常</span>';
    return status;
  }
  function platformTag(platform) {
    const map = { douyin: '抖音', xiaohongshu: '小红书', wechat: '公众号' };
    return map[platform] || platform;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

  // ========== 数据看板 ==========
  function renderDashboard() {
    const users = [...MOCK_USERS, ...getLocalUsers()];
    const lists = getAllLists();
    const items = getAllItems();
    const reports = getAllReports();
    const logs = getAdminLogs();
    const banned = getBannedUserIds();

    const today = new Date().toISOString().slice(0, 10);
    const newListsToday = lists.filter(l => l.createTime === today).length;
    const newItemsToday = items.filter(i => (i.createTime || '').startsWith(today)).length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const totalFavs = getFavoriteListIds().length;
    const totalLikes = getLikedItemIds().length;

    document.getElementById('tab-dashboard').innerHTML = `
      <h2 class="admin-page-title">数据看板</h2>
      <p class="admin-page-sub">实时数据快照（基于当前 localStorage）</p>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">总用户数</div>
          <div class="kpi-value">${users.length}</div>
          <div class="kpi-sub">已封禁 ${banned.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">总清单数</div>
          <div class="kpi-value">${lists.length}</div>
          <div class="kpi-sub">今日新增 ${newListsToday}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">总内容数</div>
          <div class="kpi-value">${items.length}</div>
          <div class="kpi-sub">今日新增 ${newItemsToday}</div>
        </div>
        <div class="kpi-card kpi-card-warn">
          <div class="kpi-label">待处理举报</div>
          <div class="kpi-value">${pendingReports}</div>
          <div class="kpi-sub">${pendingReports > 0 ? '<a href="#" class="link-to-reports">去处理 →</a>' : '已清空'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">总收藏数</div>
          <div class="kpi-value">${totalFavs}</div>
          <div class="kpi-sub">清单被收藏次数</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">总点赞数</div>
          <div class="kpi-value">${totalLikes}</div>
          <div class="kpi-sub">单条被点赞次数</div>
        </div>
      </div>

      <h3 class="admin-section-title">最近操作</h3>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>时间</th><th>操作人</th><th>动作</th><th>对象</th></tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? '<tr><td colspan="4" class="empty-row">暂无操作记录</td></tr>' :
              logs.slice(0, 8).map(l => `
                <tr>
                  <td>${escapeHtml(l.createdAt)}</td>
                  <td>${escapeHtml(l.operatorName)}</td>
                  <td><code>${escapeHtml(l.action)}</code></td>
                  <td>${escapeHtml(l.target || '-')}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 绑定"去处理"链接
    const linkToReports = document.querySelector('#tab-dashboard .link-to-reports');
    if (linkToReports) {
      linkToReports.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.admin-tab[data-tab="reports"]').click();
      });
    }
  }

  // ========== 举报队列 ==========
  function renderReports() {
    const all = getAllReports();
    const pending = all.filter(r => r.status === 'pending');
    const processed = all.filter(r => r.status !== 'pending');
    const filtered = currentReportFilter === 'pending' ? pending : all;

    // 更新侧边栏 badge
    const badge = document.getElementById('report-badge');
    if (pending.length > 0) {
      badge.textContent = pending.length;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }

    document.getElementById('tab-reports').innerHTML = `
      <h2 class="admin-page-title">举报审核</h2>
      <p class="admin-page-sub">社区举报 → 管理员审核 → 通过 / 拒绝</p>

      <div class="filter-bar">
        <button class="filter-pill ${currentReportFilter === 'pending' ? 'active' : ''}" data-filter="pending">
          待处理 <span class="pill-count">${pending.length}</span>
        </button>
        <button class="filter-pill ${currentReportFilter === 'all' ? 'active' : ''}" data-filter="all">
          全部 <span class="pill-count">${all.length}</span>
        </button>
        <button class="filter-pill ${currentReportFilter === 'processed' ? 'active' : ''}" data-filter="processed">
          已处理 <span class="pill-count">${processed.length}</span>
        </button>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>时间</th><th>类型</th><th>对象</th><th>原因</th><th>描述</th><th>举报人</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? '<tr><td colspan="8" class="empty-row">暂无举报</td></tr>' :
              filtered.map(r => {
                let targetInfo = '-';
                if (r.type === 'list') {
                  const l = getListById(r.targetId);
                  if (l) targetInfo = `<a href="list.html?id=${l.id}" target="_blank">${escapeHtml(l.title)}</a>`;
                  else targetInfo = `<span class="text-muted">[已删除] ${escapeHtml(r.targetId)}</span>`;
                } else if (r.type === 'item') {
                  const it = getItemById(r.targetId);
                  if (it) targetInfo = `<a href="item.html?id=${it.id}" target="_blank">${escapeHtml((it.intro || '').slice(0, 30))}…</a>`;
                  else targetInfo = `<span class="text-muted">[已删除] ${escapeHtml(r.targetId)}</span>`;
                } else if (r.type === 'user') {
                  const u = getUserById(r.targetId);
                  if (u) targetInfo = `${escapeHtml(u.name)} <span class="text-muted">(${escapeHtml(r.targetId)})</span>`;
                  else targetInfo = escapeHtml(r.targetId);
                }

                return `
                  <tr>
                    <td>${escapeHtml(r.createdAt)}</td>
                    <td>${REPORT_TYPE_TEXT[r.type] || r.type}</td>
                    <td>${targetInfo}</td>
                    <td>${REPORT_REASON_TEXT[r.reason] || r.reason}</td>
                    <td>${escapeHtml(r.description || '-')}</td>
                    <td>${escapeHtml(r.reporterId)}</td>
                    <td>${statusTag(r.status)}</td>
                    <td class="action-col">
                      ${r.status === 'pending' ? `
                        <button class="btn-mini btn-mini-danger" data-action="approve-report" data-id="${r.id}">通过</button>
                        <button class="btn-mini" data-action="reject-report" data-id="${r.id}">拒绝</button>
                      ` : '-'}
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 绑定筛选
    document.querySelectorAll('#tab-reports .filter-pill').forEach(p => {
      p.addEventListener('click', () => {
        currentReportFilter = p.dataset.filter;
        renderReports();
      });
    });

    // 绑定通过/拒绝按钮
    document.querySelectorAll('#tab-reports [data-action^="approve-"], #tab-reports [data-action^="reject-"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const r = getAllReports().find(x => x.id === id);
        if (!r) return;
        const action = b.dataset.action.startsWith('approve-') ? 'approved' : 'rejected';
        const verb = action === 'approved' ? '通过' : '拒绝';

        if (!confirm(`确认${verb}这条举报吗？\n（${REPORT_TYPE_TEXT[r.type]} - ${REPORT_REASON_TEXT[r.reason]}）`)) return;

        // 特殊处理：通过举报 → 同时删除目标
        if (action === 'approved') {
          if (r.type === 'list' && r.targetId.startsWith('l_')) {
            adminDeleteUserList(r.targetId);
          } else if (r.type === 'item' && r.targetId.startsWith('i_')) {
            adminDeleteUserItem(r.targetId);
          } else if (r.type === 'user') {
            banUser(r.targetId);
          }
        }

        handleReport(id, action);
        addAdminLog(`${action === 'approved' ? 'approve' : 'reject'}_report`, id, `${REPORT_TYPE_TEXT[r.type]} ${r.targetId} - ${REPORT_REASON_TEXT[r.reason]}`);
        showToast(`已${verb}举报`, 'success');
        renderReports();
        renderDashboard();
      });
    });
  }

  // ========== 清单管理 ==========
  function renderLists() {
    const all = getAllLists();
    const mockCount = MOCK_LISTS.length;
    const userCount = all.length - mockCount;

    document.getElementById('tab-lists').innerHTML = `
      <h2 class="admin-page-title">清单管理</h2>
      <p class="admin-page-sub">共 ${all.length} 个清单（演示 ${mockCount} + 用户 ${userCount}）</p>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>标题</th><th>创建者</th><th>内容数</th><th>收藏数</th><th>创建时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${all.length === 0 ? '<tr><td colspan="6" class="empty-row">暂无清单</td></tr>' :
              all.map(l => {
                const creator = l.anonymous ? null : getUserById(l.creatorId);
                const creatorName = l.anonymous ? '匿名' : (creator ? creator.name : '[已注销]');
                const isUserList = l.id.startsWith('l_'); // 用户创建的可编辑
                return `
                  <tr>
                    <td>
                      <a href="list.html?id=${l.id}" target="_blank">${escapeHtml(l.title)}</a>
                      ${l.anonymous ? '<span class="tag tag-muted" style="margin-left:6px">匿名</span>' : ''}
                    </td>
                    <td>${escapeHtml(creatorName)}</td>
                    <td>${l.itemIds.length}</td>
                    <td>${formatCount(l.collectCount)}</td>
                    <td>${escapeHtml(l.createTime)}</td>
                    <td class="action-col">
                      <a href="list.html?id=${l.id}" target="_blank" class="btn-mini">查看</a>
                      ${isUserList ? `<button class="btn-mini btn-mini-danger" data-action="delete-list" data-id="${l.id}">删除</button>` : '<span class="text-muted">演示</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 绑定删除
    document.querySelectorAll('#tab-lists [data-action="delete-list"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const l = getListById(id);
        if (!l) return;
        if (!confirm(`确认删除清单「${l.title}」吗？\n（该操作不可撤销）`)) return;
        adminDeleteUserList(id);
        addAdminLog('delete_list', id, l.title);
        showToast('已删除清单', 'success');
        renderLists();
        renderDashboard();
      });
    });
  }

  // ========== 内容管理 ==========
  function renderItems() {
    const all = getAllItems();
    const mockCount = MOCK_ITEMS.length;
    const userCount = all.length - mockCount;

    document.getElementById('tab-items').innerHTML = `
      <h2 class="admin-page-title">内容管理</h2>
      <p class="admin-page-sub">共 ${all.length} 条内容（演示 ${mockCount} + 用户 ${userCount}）</p>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>介绍</th><th>平台</th><th>分享者</th><th>链接</th><th>点赞</th><th>时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${all.length === 0 ? '<tr><td colspan="7" class="empty-row">暂无内容</td></tr>' :
              all.map(it => {
                const creator = getUserById(it.creatorId);
                const isUserItem = it.id.startsWith('i_');
                return `
                  <tr>
                    <td><a href="item.html?id=${it.id}" target="_blank">${escapeHtml((it.intro || '').slice(0, 40))}${(it.intro || '').length > 40 ? '…' : ''}</a></td>
                    <td>${platformTag(it.platform)}</td>
                    <td>${creator ? escapeHtml(creator.name) : escapeHtml(it.creatorId)}</td>
                    <td class="link-cell"><a href="${escapeHtml(it.url)}" target="_blank" rel="noopener">${escapeHtml((it.url || '').slice(0, 40))}…</a></td>
                    <td>${formatCount(it.likeCount)}</td>
                    <td>${escapeHtml(it.createTime || '-')}</td>
                    <td class="action-col">
                      <a href="item.html?id=${it.id}" target="_blank" class="btn-mini">查看</a>
                      ${isUserItem ? `<button class="btn-mini btn-mini-danger" data-action="delete-item" data-id="${it.id}">删除</button>` : '<span class="text-muted">演示</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 绑定删除
    document.querySelectorAll('#tab-items [data-action="delete-item"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const it = getItemById(id);
        if (!it) return;
        if (!confirm(`确认删除这条内容吗？\n「${(it.intro || '').slice(0, 30)}…」\n（该操作不可撤销）`)) return;
        adminDeleteUserItem(id);
        addAdminLog('delete_item', id, (it.intro || '').slice(0, 30));
        showToast('已删除内容', 'success');
        renderItems();
        renderDashboard();
      });
    });
  }

  // ========== 用户管理 ==========
  function renderUsers() {
    const all = [...MOCK_USERS, ...getLocalUsers()];
    const banned = getBannedUserIds();
    const userLists = getAllLists().reduce((acc, l) => {
      acc[l.creatorId] = (acc[l.creatorId] || 0) + 1;
      return acc;
    }, {});
    const userItems = getAllItems().reduce((acc, it) => {
      acc[it.creatorId] = (acc[it.creatorId] || 0) + 1;
      return acc;
    }, {});

    document.getElementById('tab-users').innerHTML = `
      <h2 class="admin-page-title">用户管理</h2>
      <p class="admin-page-sub">共 ${all.length} 个用户，${banned.length} 个已封禁</p>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>用户</th><th>ID</th><th>简介</th><th>清单</th><th>内容</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${all.map(u => {
              const isBannedNow = banned.includes(u.id);
              return `
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar user-avatar-sm" style="background:${u.avatarColor}">${u.avatar}</div>
                      <span>${escapeHtml(u.name)}</span>
                    </div>
                  </td>
                  <td><code>${escapeHtml(u.id)}</code></td>
                  <td>${escapeHtml(u.bio || '-')}</td>
                  <td>${userLists[u.id] || 0}</td>
                  <td>${userItems[u.id] || 0}</td>
                  <td>${statusTag(isBannedNow ? 'banned' : 'normal')}</td>
                  <td class="action-col">
                    ${isBannedNow
                      ? `<button class="btn-mini" data-action="unban-user" data-id="${u.id}">解封</button>`
                      : `<button class="btn-mini btn-mini-danger" data-action="ban-user" data-id="${u.id}">封禁</button>`
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 绑定封禁/解封
    document.querySelectorAll('#tab-users [data-action="ban-user"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const u = getUserById(id);
        if (!u) return;
        if (!confirm(`确认封禁用户「${u.name}」吗？\n（封禁后该用户仍能看到内容，但无法发布）`)) return;
        banUser(id);
        addAdminLog('ban_user', id, u.name);
        showToast('已封禁用户', 'success');
        renderUsers();
        renderDashboard();
      });
    });
    document.querySelectorAll('#tab-users [data-action="unban-user"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const u = getUserById(id);
        if (!confirm(`确认解封用户「${u.name}」吗？`)) return;
        unbanUser(id);
        addAdminLog('unban_user', id, u.name);
        showToast('已解封', 'success');
        renderUsers();
        renderDashboard();
      });
    });
  }

  // ========== 操作日志 ==========
  function renderLogs() {
    const logs = getAdminLogs();

    document.getElementById('tab-logs').innerHTML = `
      <h2 class="admin-page-title">操作日志</h2>
      <p class="admin-page-sub">所有管理员操作记录（最近 200 条）</p>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>时间</th><th>操作人</th><th>动作</th><th>对象</th><th>详情</th></tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? '<tr><td colspan="5" class="empty-row">暂无操作记录</td></tr>' :
              logs.map(l => `
                <tr>
                  <td>${escapeHtml(l.createdAt)}</td>
                  <td>${escapeHtml(l.operatorName)}</td>
                  <td><code>${escapeHtml(l.action)}</code></td>
                  <td>${escapeHtml(l.target || '-')}</td>
                  <td>${escapeHtml(l.details || '-')}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========== 总渲染 ==========
  function renderAll() {
    renderDashboard();
    renderReports();
    renderLists();
    renderItems();
    renderUsers();
    renderLogs();
  }

  // ========== Toast ==========
  function showToast(msg, type) {
    let t = document.getElementById('admin-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'admin-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    void t.offsetHeight;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  // 暴露给 HTML onclick 使用
  window.__admin = { renderAll, renderDashboard, renderReports, showToast };
})();

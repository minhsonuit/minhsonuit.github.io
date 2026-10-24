/**
 * UI & Interaction Layer — Portfolio & Architecture Telemetry Console
 * Võ Minh Sơn (@minhsonuit) — Senior Software Architect & ERP Solutions Lead
 *
 * Nguyên tắc Kiến trúc:
 * - Tách biệt 100% UI (View Layer) và Data (JSON Layer tại ./data/*.json).
 * - Không hardcode bất kỳ dữ liệu nghiệp vụ nào trong file này.
 * - Khi dữ liệu trong ./data/*.json thay đổi (thêm/xóa/sửa dự án, KPI, kỹ năng, biểu đồ...),
 *   UI sẽ tự động tính toán lại số lượng, bộ lọc, bảng dữ liệu và vẽ lại biểu đồ SVG.
 */

const AppState = {
  data: null,
  currentFilterDomain: 'all',
  currentSearchQuery: '',
  currentSortBy: 'impact',
  selectedSystemId: null,
  currentSkillCategory: 'all',
  isDesktopInspectorVisible: true
};

document.addEventListener('DOMContentLoaded', async () => {
  initThemeEngine();
  initResponsiveDrawers();
  initPrintCV();

  try {
    const portfolioData = await window.PortfolioDataService.loadAllPortfolioData();
    AppState.data = portfolioData;
    AppState.selectedSystemId =
      portfolioData.architecture?.defaultSelectedId ||
      portfolioData.architecture?.systems?.[0]?.id ||
      null;

    renderAllSections(portfolioData);
    initInteractiveControllers();
  } catch (error) {
    renderDataLoadError(error);
  }
});

/**
 * Render toàn bộ giao diện từ dữ liệu JSON đã tải
 */
function renderAllSections(data) {
  renderDocumentMeta(data.profile);
  renderSidebar(data.profile, data.computed);
  renderTopHeader(data.profile);
  renderOverviewAndKpis(data.profile, data.kpis, data.computed);
  renderArchitectureSectionShell(data.architecture, data.computed);
  renderArchitectureTable();
  renderInspectorPanel(AppState.selectedSystemId);
  syncInspectorVisibility();
  renderTelemetryBenchmarks(data.telemetry);
  renderCompetenciesSection(data.competencies);
  renderExperienceAndEducation(data.experience);
  renderGovernanceSection(data.governance);
  renderContactAndFooter(data.profile);
}

/**
 * Cập nhật tiêu đề trang từ profile.json
 */
function renderDocumentMeta(profile) {
  if (!profile?.meta) return;
  if (profile.meta.title) {
    document.title = profile.meta.title;
  }
}

/**
 * 1. Render Left Sidebar (Brand, Trạng thái, Menu Điều hướng với Auto-Counters, Chuẩn AX 2012)
 */
function renderSidebar(profile, computed) {
  if (!profile) return;
  const { identity, navigation, sidebarCompliance, contact } = profile;

  const brandEl = document.getElementById('sidebar-brand-identity');
  if (brandEl && identity) {
    brandEl.innerHTML = `
      <img src="${escapeHtml(identity.avatar)}" alt="${escapeHtml(identity.fullName)}" class="w-9 h-9 rounded-lg object-cover border border-[var(--border-default)] shrink-0">
      <div class="min-w-0">
        <div class="text-sm font-semibold text-[var(--text-primary)] truncate">${escapeHtml(identity.fullName)}</div>
        <div class="font-mono-tabular text-[11px] text-[var(--text-muted)] whitespace-nowrap">${escapeHtml(identity.handle)} • ${escapeHtml(identity.shortRole)}</div>
      </div>
    `;
  }

  const statusCardEl = document.getElementById('sidebar-role-status');
  if (statusCardEl && identity) {
    const pillClass = getStatusPillClass(identity.availability?.status);
    statusCardEl.innerHTML = `
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="text-[11px] font-medium text-[var(--text-muted)] whitespace-nowrap">Trạng thái công việc</span>
        <span class="status-pill ${pillClass}">
          <span class="status-pill-dot"></span>
          <span>${escapeHtml(identity.availability?.shortLabel || 'Sẵn sàng')}</span>
        </span>
      </div>
      <div class="text-xs font-medium text-[var(--text-primary)] leading-snug">${escapeHtml(identity.operationalRole)}</div>
      <div class="font-mono-tabular text-[11px] text-[var(--text-secondary)] mt-1 whitespace-nowrap">${escapeHtml(identity.locationShort)} • ${escapeHtml(identity.experienceShort)}</div>
    `;
  }

  const navContainer = document.getElementById('sidebar-nav-links');
  if (navContainer && Array.isArray(navigation)) {
    const navItemsHtml = navigation.map((item, idx) => {
      const badgeText =
        item.badgeSource && item.badgeSource !== 'static' && computed?.badges?.[item.badgeSource]
          ? computed.badges[item.badgeSource]
          : item.badgeValue;
      const badgeColorClass = item.accent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]';
      return `
        <a href="#${escapeHtml(item.id)}" class="sidebar-link ${idx === 0 ? 'active' : ''}">
          <span>${escapeHtml(item.label)}</span>
          <span class="font-mono-tabular text-[11px] ${badgeColorClass}">${escapeHtml(badgeText)}</span>
        </a>
      `;
    }).join('');

    navContainer.innerHTML = `
      <div class="px-2 pb-1 text-[11px] font-medium text-[var(--text-muted)] whitespace-nowrap">Điều hướng Hồ sơ</div>
      ${navItemsHtml}
    `;
  }

  const complianceEl = document.getElementById('sidebar-ax-compliance');
  if (complianceEl && sidebarCompliance) {
    complianceEl.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">${escapeHtml(sidebarCompliance.title)}</span>
        <span class="font-mono-tabular text-[10px] text-[var(--accent-telemetry)] whitespace-nowrap">${escapeHtml(sidebarCompliance.badge)}</span>
      </div>
      <ul class="space-y-1.5 text-[11px] text-[var(--text-secondary)] leading-normal">
        ${(sidebarCompliance.items || []).map(rule => `
          <li class="flex items-start gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0"></span>
            <span>${escapeHtml(rule)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  const sidebarEmailLabel = document.getElementById('sidebar-email-label');
  if (sidebarEmailLabel && contact?.email) {
    sidebarEmailLabel.textContent = contact.email;
  }
}

/**
 * 2. Render Top Header Telemetry
 */
function renderTopHeader(profile) {
  if (!profile?.headerTelemetry) return;
  const ht = profile.headerTelemetry;

  const breadcrumbEl = document.getElementById('header-breadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <span class="font-mono-tabular text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">${escapeHtml(ht.breadcrumbTitle)}</span>
      <span class="text-[var(--text-muted)] hidden sm:inline">/</span>
      <span class="text-xs text-[var(--text-secondary)] truncate hidden sm:inline">${escapeHtml(ht.breadcrumbSubtitle)}</span>
    `;
  }

  const badgesEl = document.getElementById('header-telemetry-badges');
  if (badgesEl) {
    const pillClass = getStatusPillClass(ht.primaryPill?.status);
    badgesEl.innerHTML = `
      <span class="status-pill ${pillClass}">
        <span class="status-pill-dot"></span>
        <span class="font-mono-tabular">${escapeHtml(ht.primaryPill?.text || '')}</span>
      </span>
      <span class="font-mono-tabular text-xs text-[var(--text-secondary)] whitespace-nowrap">${escapeHtml(ht.secondaryMetric || '')}</span>
    `;
  }
}

/**
 * 3. Render Section 1: Overview Hero & Progressive KPI Grid
 */
function renderOverviewAndKpis(profile, kpis, computed) {
  const heroContainer = document.getElementById('overview-hero-card');
  if (heroContainer && profile?.identity) {
    const id = profile.identity;
    const contact = profile.contact || {};
    const pillClass = getStatusPillClass(id.availability?.status);
    const totalSystems = computed?.totalSystems || 6;

    heroContainer.innerHTML = `
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-3 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2">
            <span class="status-pill ${pillClass}">
              <span class="status-pill-dot"></span>
              <span>${escapeHtml(id.availability?.heroBadge || '')}</span>
            </span>
            <span class="font-mono-tabular text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] whitespace-nowrap">
              ${escapeHtml(id.academicBadge || '')}
            </span>
          </div>

          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              ${escapeHtml(id.headline)}
            </h1>
            <p class="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
              ${id.summaryHtml || ''}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 pt-1 no-print">
            <a href="#contact" class="px-3.5 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Gửi yêu cầu tư vấn kiến trúc</span>
            </a>

            <a href="#architecture" class="px-3.5 py-2 rounded-lg bg-[var(--bg-subtle)] hover:border-[var(--border-hover)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-semibold inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap">
              <svg class="w-4 h-4 text-[var(--accent-telemetry)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <span>Kiểm tra hồ sơ hệ thống (${totalSystems} Case Studies)</span>
            </a>

            <button type="button" class="btn-copy-email px-3.5 py-2 rounded-lg bg-[var(--bg-subtle)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-medium inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>Sao chép địa chỉ Email</span>
            </button>
          </div>
        </div>

        <!-- Architect Portrait & Verification Card -->
        <div class="w-full md:w-auto flex sm:flex-row md:flex-col items-center gap-4 p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] shrink-0">
          <img src="${escapeHtml(id.avatar)}" alt="Chân dung ${escapeHtml(id.fullName)}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-[var(--border-default)]" width="96" height="96">
          <div class="text-left md:text-center space-y-1">
            <div class="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">${escapeHtml(id.fullName)}</div>
            <div class="font-mono-tabular text-[11px] text-[var(--accent-telemetry)] whitespace-nowrap">${escapeHtml(id.techSummaryBadge || '')}</div>
            <div class="flex items-center md:justify-center gap-2 pt-1">
              <a href="${escapeHtml(contact.github?.url || '#')}" target="_blank" rel="noopener noreferrer" class="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2 font-mono-tabular">GitHub</a>
              <span class="text-[var(--text-muted)]">•</span>
              <a href="${escapeHtml(contact.linkedin?.url || '#')}" target="_blank" rel="noopener noreferrer" class="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2 font-mono-tabular">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const kpiGridEl = document.getElementById('kpi-grid');
  if (kpiGridEl && Array.isArray(kpis?.items)) {
    kpiGridEl.innerHTML = kpis.items.map(item => {
      const pillClass = getStatusPillClass(item.status);
      const valueColorClass = item.valueAccent === 'telemetry'
        ? 'text-[var(--accent-telemetry)]'
        : 'text-[var(--text-primary)]';

      return `
        <div class="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">${escapeHtml(item.label)}</span>
            <span class="status-pill ${pillClass}">
              <span class="status-pill-dot"></span>
              <span>${escapeHtml(item.pillText)}</span>
            </span>
          </div>
          <div class="font-mono-tabular text-2xl font-bold ${valueColorClass} whitespace-nowrap">${escapeHtml(item.value)}</div>
          <div class="text-xs text-[var(--text-muted)]">${escapeHtml(item.subtitle)}</div>
        </div>
      `;
    }).join('');
  }
}

/**
 * 4. Render Section 2: Architecture Filter Tabs, Sort Select & Table
 */
function renderArchitectureSectionShell(architecture, computed) {
  if (!architecture) return;

  const titleEl = document.getElementById('arch-section-title');
  const subtitleEl = document.getElementById('arch-section-subtitle');
  if (titleEl) titleEl.textContent = architecture.sectionTitle || '';
  if (subtitleEl) subtitleEl.innerHTML = architecture.sectionSubtitleHtml || '';

  // Tự động render các nút lọc phân hệ kèm số lượng đếm tự động từ mảng systems
  const domainTabsEl = document.getElementById('arch-domain-tabs');
  if (domainTabsEl && Array.isArray(architecture.domains)) {
    domainTabsEl.innerHTML = architecture.domains.map(dom => {
      const count = computed?.domainCounts?.[dom.id] ?? 0;
      const isActive = dom.id === AppState.currentFilterDomain;
      return `
        <button type="button" data-arch-tab="${escapeHtml(dom.id)}" class="seg-btn ${isActive ? 'active' : ''} px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] border border-transparent">
          ${escapeHtml(dom.label)} (${count})
        </button>
      `;
    }).join('');
  }

  // Tự động render các tùy chọn sắp xếp từ JSON
  const sortSelectEl = document.getElementById('arch-sort-select');
  if (sortSelectEl && Array.isArray(architecture.sortOptions)) {
    sortSelectEl.innerHTML = architecture.sortOptions.map(opt => `
      <option value="${escapeHtml(opt.value)}" ${opt.value === AppState.currentSortBy ? 'selected' : ''}>
        ${escapeHtml(opt.label)}
      </option>
    `).join('');
  }
}

function getFilteredAndSortedSystems() {
  const systems = AppState.data?.architecture?.systems || [];
  return systems.filter(item => {
    const matchesDomain = AppState.currentFilterDomain === 'all' || item.domain === AppState.currentFilterDomain;
    const haystack = `${item.id} ${item.name} ${item.domainLabel} ${item.company} ${(item.techStack || []).join(' ')} ${item.summary}`.toLowerCase();
    const matchesQuery = !AppState.currentSearchQuery || haystack.includes(AppState.currentSearchQuery);
    return matchesDomain && matchesQuery;
  }).sort((a, b) => {
    if (AppState.currentSortBy === 'latency') return a.latencyValue - b.latencyValue;
    if (AppState.currentSortBy === 'throughput') return b.throughputValue - a.throughputValue;
    return b.impactScore - a.impactScore;
  });
}

function renderArchitectureTable() {
  const tbody = document.getElementById('arch-table-body');
  const countBadge = document.getElementById('arch-result-count');
  const totalSystems = (AppState.data?.architecture?.systems || []).length;
  if (!tbody) return;

  const filtered = getFilteredAndSortedSystems();
  if (countBadge) {
    countBadge.textContent = `${filtered.length} / ${totalSystems} hệ thống`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
          Không tìm thấy giải pháp kiến trúc phù hợp với từ khóa tìm kiếm. Hãy thử xóa bộ lọc.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(sys => {
    const isSelected = sys.id === AppState.selectedSystemId;
    const statusClass = getStatusPillClass(sys.status);

    return `
      <tr class="arch-row border-b border-[var(--border-subtle)] ${isSelected ? 'selected' : ''}" data-system-id="${escapeHtml(sys.id)}" tabindex="0" role="button" aria-label="Xem chi tiết kiến trúc ${escapeHtml(sys.name)}">
        <td class="sticky-col px-3.5 py-2.5 font-mono-tabular text-xs font-medium text-[var(--text-primary)] whitespace-nowrap border-r border-[var(--border-subtle)]">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[var(--accent-primary)]' : 'bg-transparent'}"></span>
            <span>${escapeHtml(sys.id)}</span>
          </div>
        </td>
        <td class="px-3.5 py-2.5 max-w-[260px] sm:max-w-[320px]">
          <div class="text-xs font-semibold text-[var(--text-primary)] truncate" title="${escapeHtml(sys.name)}">${escapeHtml(sys.name)}</div>
          <div class="text-[11px] text-[var(--text-muted)] truncate">${escapeHtml(sys.company)} • ${escapeHtml((sys.techStack || []).slice(0, 3).join(', '))}</div>
        </td>
        <td class="px-3.5 py-2.5 whitespace-nowrap">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] whitespace-nowrap">
            ${escapeHtml(sys.domainLabel)}
          </span>
        </td>
        <td class="px-3.5 py-2.5 font-mono-tabular text-xs text-[var(--text-primary)] whitespace-nowrap">
          ${escapeHtml(sys.throughput)}
        </td>
        <td class="px-3.5 py-2.5 font-mono-tabular text-xs text-[var(--accent-telemetry)] font-medium whitespace-nowrap">
          ${escapeHtml(sys.latencyP99)}
        </td>
        <td class="px-3.5 py-2.5 whitespace-nowrap">
          <span class="status-pill ${statusClass}">
            <span class="status-pill-dot"></span>
            <span>${escapeHtml(sys.statusText)}</span>
          </span>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.arch-row').forEach(row => {
    const handleSelect = () => {
      const id = row.getAttribute('data-system-id');
      if (!id) return;
      AppState.selectedSystemId = id;
      renderArchitectureTable();
      renderInspectorPanel(id);

      if (window.innerWidth < 1280) {
        openMobileInspectorOverlay(true);
      } else if (!AppState.isDesktopInspectorVisible) {
        AppState.isDesktopInspectorVisible = true;
        syncInspectorVisibility();
      }
    };

    row.addEventListener('click', handleSelect);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
  });
}

/**
 * Vẽ biểu đồ Sparkline SVG Vercel-Style trong Right Inspector từ mảng dữ liệu JSON
 */
function buildVercelSparklineSvg(points, unitLabel, thresholdLabel) {
  const safePoints = Array.isArray(points) && points.length > 1 ? points : [0, 0];
  const width = 310;
  const height = 96;
  const padX = 8;
  const padY = 14;
  const minVal = Math.min(...safePoints) * 0.92;
  const maxVal = Math.max(...safePoints) * 1.05 || 1;
  const range = maxVal - minVal || 1;

  const coords = safePoints.map((val, idx) => {
    const x = padX + (idx / (safePoints.length - 1)) * (width - padX * 2);
    const y = height - padY - ((val - minVal) / range) * (height - padY * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), val };
  });

  const pathD = coords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - 4} L ${coords[0].x} ${height - 4} Z`;
  const lastPt = coords[coords.length - 1];

  return `
    <div class="rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] p-3">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-[11px] font-medium text-[var(--text-secondary)] truncate">${escapeHtml(thresholdLabel)}</span>
        <span class="font-mono-tabular text-xs font-semibold text-[var(--accent-telemetry)] whitespace-nowrap">${escapeHtml(lastPt.val)} ${escapeHtml(unitLabel)}</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-24 overflow-visible" role="img" aria-label="Biểu đồ Telemetry">
        <defs>
          <linearGradient id="inspectorTelemetryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-telemetry)" stop-opacity="0.18" />
            <stop offset="100%" stop-color="var(--accent-telemetry)" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="${padX}" y1="22" x2="${width - padX}" y2="22" stroke="var(--border-hover)" stroke-dasharray="3 3" stroke-width="1" />
        <line x1="${padX}" y1="52" x2="${width - padX}" y2="52" stroke="var(--border-subtle)" stroke-dasharray="2 2" stroke-width="1" />
        <line x1="${padX}" y1="82" x2="${width - padX}" y2="82" stroke="var(--border-subtle)" stroke-width="1" />
        <path d="${areaD}" fill="url(#inspectorTelemetryGrad)" />
        <path d="${pathD}" fill="none" stroke="var(--accent-telemetry)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${lastPt.x}" cy="${lastPt.y}" r="3.5" fill="var(--accent-telemetry)" />
      </svg>
      <div class="flex items-center justify-between text-[10px] font-mono-tabular text-[var(--text-muted)] mt-1">
        <span>T-12h</span>
        <span>T-8h</span>
        <span>T-4h</span>
        <span>Hiện tại (Real-time)</span>
      </div>
    </div>
  `;
}

function renderInspectorPanel(systemId) {
  const systems = AppState.data?.architecture?.systems || [];
  const sys = systems.find(s => s.id === systemId) || systems[0];
  const container = document.getElementById('inspector-content');
  if (!container || !sys) return;

  const statusClass = getStatusPillClass(sys.status);

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
          ${escapeHtml(sys.id)}
        </span>
        <span class="status-pill ${statusClass}">
          <span class="status-pill-dot"></span>
          <span>${escapeHtml(sys.statusText)}</span>
        </span>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-[var(--text-primary)] leading-snug">${escapeHtml(sys.name)}</h3>
        <p class="text-xs text-[var(--text-muted)] mt-1 font-mono-tabular">${escapeHtml(sys.company)} • ${escapeHtml(sys.period)} • ${escapeHtml(sys.scale)}</p>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        ${(sys.metrics || []).map(m => `
          <div class="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
            <div class="text-[11px] text-[var(--text-muted)] truncate">${escapeHtml(m.label)}</div>
            <div class="font-mono-tabular text-sm font-bold text-[var(--text-primary)] mt-0.5 whitespace-nowrap">${escapeHtml(m.value)}</div>
            <div class="text-[11px] text-[var(--accent-primary)] font-medium mt-0.5 whitespace-nowrap">${escapeHtml(m.delta)}</div>
          </div>
        `).join('')}
      </div>

      <div>
        <div class="text-xs font-semibold text-[var(--text-primary)] mb-1.5">${escapeHtml(sys.telemetryTitle)}</div>
        ${buildVercelSparklineSvg(sys.telemetryPoints, sys.telemetryUnit, sys.telemetryThreshold)}
      </div>

      <div class="space-y-2.5 text-xs leading-relaxed">
        <div class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
          <div class="font-semibold text-[var(--text-primary)] mb-1">Bài toán Thực tế (Bottleneck)</div>
          <p class="text-[var(--text-secondary)]">${escapeHtml(sys.problem)}</p>
        </div>
        <div class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
          <div class="font-semibold text-[var(--text-primary)] mb-1">Giải pháp Kiến trúc (Architecture Execution)</div>
          <p class="text-[var(--text-secondary)]">${escapeHtml(sys.solution)}</p>
        </div>
      </div>

      <div class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-[var(--text-primary)]">Tuân thủ Nguyên tắc Kiến trúc &amp; AX</span>
          <span class="font-mono-tabular text-[10px] text-[var(--accent-primary)] whitespace-nowrap">VERIFIED</span>
        </div>
        <ul class="space-y-1.5 text-xs text-[var(--text-secondary)]">
          ${(sys.governance || []).map(rule => `
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0"></span>
              <span>${escapeHtml(rule)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-semibold text-[var(--text-primary)]">Mẫu Triển khai Thực chiến</span>
          <span class="font-mono-tabular text-[11px] text-[var(--text-muted)]">Production Snippet</span>
        </div>
        <pre class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[11px] font-mono-tabular text-[var(--text-secondary)] overflow-x-auto leading-relaxed"><code>${escapeHtml(sys.codeSnippet)}</code></pre>
      </div>

      <div>
        <div class="text-xs font-semibold text-[var(--text-primary)] mb-2">Công nghệ Sử dụng</div>
        <div class="flex flex-wrap gap-1.5">
          ${(sys.techStack || []).map(t => `
            <span class="px-2 py-0.5 rounded text-[11px] font-mono-tabular bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
              ${escapeHtml(t)}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 5. Render Section 3: Production Telemetry Benchmarks (Tự động vẽ SVG từ mảng points trong data/telemetry.json)
 */
function buildMainBenchmarkSvg(bm, idx) {
  const points = Array.isArray(bm.points) && bm.points.length > 1 ? bm.points : [0, 0];
  const width = 480;
  const height = 130;
  const padX = 10;
  const topY = 25;
  const bottomY = 112;
  const chartHeight = bottomY - topY;

  const minVal = Math.min(...points) * 0.88;
  const maxVal = Math.max(...points) * 1.04 || 1;
  const range = maxVal - minVal || 1;

  const coords = points.map((val, i) => {
    const x = padX + (i / (points.length - 1)) * (width - padX * 2);
    const y = bottomY - ((val - minVal) / range) * chartHeight;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const linePath = coords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${bottomY} L ${coords[0].x} ${bottomY} Z`;
  const lastPt = coords[coords.length - 1];
  const gradId = `telemetryBenchGrad_${idx}`;
  const accentColor = bm.accentVar || 'var(--accent-telemetry)';
  const thresholdStroke = bm.thresholdLineColor || 'var(--border-hover)';

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-32 overflow-visible" role="img" aria-label="${escapeHtml(bm.ariaLabel || bm.title)}">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <line x1="10" y1="24" x2="470" y2="24" stroke="${thresholdStroke}" stroke-dasharray="4 4" stroke-width="1"/>
      <text x="14" y="18" fill="var(--text-muted)" font-size="10" font-family="JetBrains Mono">${escapeHtml(bm.thresholdLabel || '')}</text>
      <line x1="10" y1="68" x2="470" y2="68" stroke="var(--border-default)" stroke-dasharray="3 3" stroke-width="1"/>
      <line x1="10" y1="112" x2="470" y2="112" stroke="var(--border-subtle)" stroke-width="1"/>

      <path d="${areaPath}" fill="url(#${gradId})"/>
      <path d="${linePath}" fill="none" stroke="${accentColor}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${lastPt.x}" cy="${lastPt.y}" r="3.5" fill="${accentColor}"/>
    </svg>
  `;
}

function renderTelemetryBenchmarks(telemetry) {
  if (!telemetry) return;

  const titleEl = document.getElementById('telemetry-section-title');
  const subtitleEl = document.getElementById('telemetry-section-subtitle');
  const gridEl = document.getElementById('telemetry-benchmarks-grid');

  if (titleEl) titleEl.textContent = telemetry.sectionTitle || '';
  if (subtitleEl) subtitleEl.textContent = telemetry.sectionSubtitle || '';

  if (gridEl && Array.isArray(telemetry.benchmarks)) {
    gridEl.innerHTML = telemetry.benchmarks.map((bm, idx) => {
      const pillClass = getStatusPillClass(bm.status);
      const rightAccentClass = bm.footerRightAccent === 'telemetry'
        ? 'text-[var(--accent-telemetry)]'
        : 'text-[var(--accent-primary)]';

      return `
        <div class="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-[var(--text-primary)]">${escapeHtml(bm.title)}</div>
              <div class="text-xs text-[var(--text-secondary)]">${escapeHtml(bm.subtitle)}</div>
            </div>
            <span class="status-pill ${pillClass}">
              <span class="status-pill-dot"></span>
              <span class="font-mono-tabular">${escapeHtml(bm.pillText)}</span>
            </span>
          </div>

          ${buildMainBenchmarkSvg(bm, idx)}

          <div class="flex items-center justify-between text-[11px] font-mono-tabular text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
            <span>${escapeHtml(bm.footerLeft)}</span>
            <span class="${rightAccentClass} font-medium">${escapeHtml(bm.footerRight)}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * 6. Render Section 4: Technical Competencies & Skill Matrix
 */
function renderCompetenciesSection(competencies) {
  if (!competencies) return;

  const titleEl = document.getElementById('competencies-section-title');
  const subtitleEl = document.getElementById('competencies-section-subtitle');
  const filterTabsEl = document.getElementById('competencies-filter-tabs');
  const gridEl = document.getElementById('competencies-grid');

  if (titleEl) titleEl.textContent = competencies.sectionTitle || '';
  if (subtitleEl) subtitleEl.textContent = competencies.sectionSubtitle || '';

  if (filterTabsEl && Array.isArray(competencies.categories)) {
    filterTabsEl.innerHTML = competencies.categories.map(cat => {
      const isActive = cat.id === AppState.currentSkillCategory;
      return `
        <button type="button" data-skill-filter="${escapeHtml(cat.id)}" class="seg-btn ${isActive ? 'active' : ''} px-2.5 py-1 rounded text-xs font-medium text-[var(--text-secondary)] border border-transparent">
          ${escapeHtml(cat.label)}
        </button>
      `;
    }).join('');
  }

  if (gridEl && Array.isArray(competencies.groups)) {
    gridEl.innerHTML = competencies.groups.map(grp => {
      const expColorClass = grp.accent === 'telemetry'
        ? 'text-[var(--accent-telemetry)]'
        : 'text-[var(--accent-primary)]';
      const isHidden = AppState.currentSkillCategory !== 'all' && grp.category !== AppState.currentSkillCategory;

      return `
        <div data-skill-group="${escapeHtml(grp.category)}" class="${isHidden ? 'hidden' : ''} p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-sm font-semibold text-[var(--text-primary)]">${escapeHtml(grp.title)}</h3>
            <span class="font-mono-tabular text-xs ${expColorClass} whitespace-nowrap">${escapeHtml(grp.experience)}</span>
          </div>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
            ${escapeHtml(grp.description)}
          </p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(grp.skills || []).map(skill => {
              const name = typeof skill === 'string' ? skill : skill.name;
              const isHighlighted = typeof skill === 'object' ? Boolean(skill.highlighted) : true;
              const textColor = isHighlighted ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]';
              return `
                <span class="px-2.5 py-1 rounded-md text-xs font-mono-tabular bg-[var(--bg-subtle)] ${textColor} border border-[var(--border-default)] whitespace-nowrap">
                  ${escapeHtml(name)}
                </span>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * 7. Render Section 5 (Experience) & Section 7 (Education)
 */
function renderExperienceAndEducation(experienceData) {
  if (!experienceData) return;

  const expSection = experienceData.experienceSection;
  if (expSection) {
    const titleEl = document.getElementById('experience-section-title');
    const subtitleEl = document.getElementById('experience-section-subtitle');
    const listEl = document.getElementById('experience-timeline-list');

    if (titleEl) titleEl.textContent = expSection.sectionTitle || '';
    if (subtitleEl) subtitleEl.textContent = expSection.sectionSubtitle || '';

    if (listEl && Array.isArray(expSection.roles)) {
      listEl.innerHTML = expSection.roles.map(role => {
        const companyColorClass =
          role.accent === 'primary'
            ? 'text-[var(--accent-primary)]'
            : role.accent === 'telemetry'
              ? 'text-[var(--accent-telemetry)]'
              : 'text-[var(--text-secondary)]';

        const dotColorClass =
          role.accent === 'primary'
            ? 'bg-[var(--accent-primary)]'
            : role.accent === 'telemetry'
              ? 'bg-[var(--accent-telemetry)]'
              : 'bg-[var(--text-muted)]';

        return `
          <article class="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-3 print-break-inside-avoid">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-bold text-[var(--text-primary)]">${escapeHtml(role.title)}</h3>
                <div class="text-xs font-medium ${companyColorClass}">${escapeHtml(role.company)}</div>
              </div>
              <span class="font-mono-tabular text-xs px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
                ${escapeHtml(role.period)}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              ${escapeHtml(role.summary)}
            </p>

            <ul class="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              ${(role.highlights || []).map(hl => `
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full ${dotColorClass} mt-2 shrink-0"></span>
                  <span><strong>${escapeHtml(hl.lead)}</strong> ${escapeHtml(hl.detail)}</span>
                </li>
              `).join('')}
            </ul>
          </article>
        `;
      }).join('');
    }
  }

  const eduSection = experienceData.educationSection;
  if (eduSection) {
    const eduTitleEl = document.getElementById('education-section-title');
    const eduListEl = document.getElementById('education-list');

    if (eduTitleEl) eduTitleEl.textContent = eduSection.sectionTitle || '';

    if (eduListEl && Array.isArray(eduSection.items)) {
      eduListEl.innerHTML = eduSection.items.map(edu => {
        const pillClass = getStatusPillClass(edu.status);
        return `
          <div class="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono-tabular text-xs font-semibold px-2.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--accent-telemetry)] border border-[var(--border-default)] whitespace-nowrap">${escapeHtml(edu.period)}</span>
                <span class="status-pill ${pillClass}">
                  <span class="status-pill-dot"></span>
                  <span>${escapeHtml(edu.statusLabel)}</span>
                </span>
              </div>
              <h3 class="text-base font-bold text-[var(--text-primary)]">${escapeHtml(edu.degree)}</h3>
              <div class="text-xs font-medium text-[var(--text-secondary)]">${escapeHtml(edu.institution)}</div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed pt-1 max-w-3xl">
                ${escapeHtml(edu.description)}
              </p>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

/**
 * 8. Render Section 6: Mandatory AX Integration & Engineering Governance
 */
function renderGovernanceSection(governance) {
  if (!governance) return;

  const titleEl = document.getElementById('governance-section-title');
  const subtitleEl = document.getElementById('governance-section-subtitle');
  const gridEl = document.getElementById('governance-rules-grid');

  if (titleEl) titleEl.textContent = governance.sectionTitle || '';
  if (subtitleEl) subtitleEl.textContent = governance.sectionSubtitle || '';

  if (gridEl && Array.isArray(governance.rules)) {
    gridEl.innerHTML = governance.rules.map(rule => {
      const codeColorClass = rule.codeAccent === 'telemetry'
        ? 'text-[var(--accent-telemetry)]'
        : 'text-[var(--accent-primary)]';
      const pillClass = getStatusPillClass(rule.status);

      return `
        <div class="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-mono-tabular text-xs font-bold ${codeColorClass}">${escapeHtml(rule.code)}</span>
            <span class="status-pill ${pillClass}">
              <span class="status-pill-dot"></span>
              <span>${escapeHtml(rule.pillText)}</span>
            </span>
          </div>
          <h3 class="text-sm font-semibold text-[var(--text-primary)]">${escapeHtml(rule.title)}</h3>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
            ${rule.descriptionHtml || ''}
          </p>
        </div>
      `;
    }).join('');
  }
}

/**
 * 9. Render Section 8: Contact Channels, Form Placeholders & Footer
 */
function renderContactAndFooter(profile) {
  if (!profile) return;
  const { contact, identity, footer } = profile;

  if (contact) {
    const titleEl = document.getElementById('contact-section-title');
    const subtitleEl = document.getElementById('contact-section-subtitle');
    const directCardEl = document.getElementById('contact-direct-card');

    if (titleEl) titleEl.textContent = contact.sectionTitle || '';
    if (subtitleEl) subtitleEl.textContent = contact.sectionSubtitle || '';

    if (directCardEl) {
      directCardEl.innerHTML = `
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-[var(--text-primary)]">${escapeHtml(contact.cardTitle || '')}</h3>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
            ${escapeHtml(contact.cardDescription || '')}
          </p>

          <div class="space-y-2.5 pt-2">
            <div class="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-[11px] text-[var(--text-muted)]">Địa chỉ Email</div>
                <a href="mailto:${escapeHtml(contact.email)}" class="font-mono-tabular text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] truncate block">${escapeHtml(contact.email)}</a>
              </div>
              <button type="button" class="btn-copy-email px-2.5 py-1 rounded bg-[var(--bg-subtle)] hover:border-[var(--border-hover)] text-[11px] font-medium text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
                Sao chép
              </button>
            </div>

            <div class="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-[11px] text-[var(--text-muted)]">Hồ sơ LinkedIn</div>
                <a href="${escapeHtml(contact.linkedin?.url || '#')}" target="_blank" rel="noopener noreferrer" class="font-mono-tabular text-xs font-semibold text-[var(--accent-telemetry)] hover:underline truncate block">${escapeHtml(contact.linkedin?.label || '')}</a>
              </div>
              <span class="font-mono-tabular text-[11px] text-[var(--text-muted)] whitespace-nowrap">${escapeHtml(contact.linkedin?.badge || '')}</span>
            </div>

            <div class="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-[11px] text-[var(--text-muted)]">Kho lưu trữ GitHub</div>
                <a href="${escapeHtml(contact.github?.url || '#')}" target="_blank" rel="noopener noreferrer" class="font-mono-tabular text-xs font-semibold text-[var(--text-primary)] hover:underline truncate block">${escapeHtml(contact.github?.label || '')}</a>
              </div>
              <span class="font-mono-tabular text-[11px] text-[var(--text-muted)] whitespace-nowrap">${escapeHtml(contact.github?.badge || '')}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Địa bàn: ${escapeHtml(identity?.location || 'TP. Hồ Chí Minh, VN')}</span>
          <span class="font-mono-tabular">${escapeHtml(identity?.timezone || 'GMT+7')}</span>
        </div>
      `;
    }

    if (contact.form) {
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');
      const slaNoteEl = document.getElementById('form-sla-note');
      const submitLabelEl = document.getElementById('form-submit-label');

      if (nameInput && contact.form.namePlaceholder) nameInput.placeholder = contact.form.namePlaceholder;
      if (emailInput && contact.form.emailPlaceholder) emailInput.placeholder = contact.form.emailPlaceholder;
      if (subjectInput && contact.form.subjectPlaceholder) subjectInput.placeholder = contact.form.subjectPlaceholder;
      if (messageInput && contact.form.messagePlaceholder) messageInput.placeholder = contact.form.messagePlaceholder;
      if (slaNoteEl && contact.form.slaNote) slaNoteEl.textContent = contact.form.slaNote;
      if (submitLabelEl && contact.form.submitLabel) submitLabelEl.textContent = contact.form.submitLabel;
    }
  }

  const footerEl = document.getElementById('app-footer');
  if (footerEl && identity) {
    footerEl.innerHTML = `
      <div>
        © ${escapeHtml(footer?.copyrightYear || 2026)} <strong class="text-[var(--text-primary)]">${escapeHtml(identity.fullName)}</strong> (<span class="font-mono-tabular">${escapeHtml(identity.handle)}</span>). ${escapeHtml(footer?.tagline || '')}
      </div>
      <div class="flex items-center gap-4 font-mono-tabular">
        <a href="${escapeHtml(contact?.github?.url || '#')}" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--text-primary)]">GitHub</a>
        <a href="${escapeHtml(contact?.linkedin?.url || '#')}" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--text-primary)]">LinkedIn</a>
        <a href="mailto:${escapeHtml(contact?.email || '')}" class="hover:text-[var(--text-primary)]">Email</a>
      </div>
    `;
  }
}

/**
 * Gắn toàn bộ sự kiện tương tác sau khi DOM đã được dựng từ JSON
 */
function initInteractiveControllers() {
  // 1. Sự kiện đóng menu mobile khi nhấn vào link điều hướng trên Sidebar
  const leftSidebar = document.getElementById('left-sidebar');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  document.querySelectorAll('#left-sidebar a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024 && leftSidebar && mobileBackdrop) {
        leftSidebar.classList.add('-translate-x-full');
        leftSidebar.classList.remove('translate-x-0');
        mobileBackdrop.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });

  // 2. Bộ lọc phân hệ Kiến trúc (Event Delegation trên #arch-domain-tabs)
  const domainTabsEl = document.getElementById('arch-domain-tabs');
  if (domainTabsEl) {
    domainTabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-arch-tab]');
      if (!btn) return;
      AppState.currentFilterDomain = btn.getAttribute('data-arch-tab') || 'all';
      domainTabsEl.querySelectorAll('[data-arch-tab]').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      renderArchitectureTable();
    });
  }

  // 3. Ô tìm kiếm và Sắp xếp bảng Kiến trúc
  const searchInput = document.getElementById('arch-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.currentSearchQuery = (e.target.value || '').trim().toLowerCase();
      renderArchitectureTable();
    });
  }

  const sortSelect = document.getElementById('arch-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.currentSortBy = e.target.value;
      renderArchitectureTable();
    });
  }

  // 4. Bộ lọc nhóm Kỹ năng Chuyên môn (Event Delegation trên #competencies-filter-tabs)
  const skillFilterTabsEl = document.getElementById('competencies-filter-tabs');
  if (skillFilterTabsEl) {
    skillFilterTabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-skill-filter]');
      if (!btn) return;
      const target = btn.getAttribute('data-skill-filter') || 'all';
      AppState.currentSkillCategory = target;

      skillFilterTabsEl.querySelectorAll('[data-skill-filter]').forEach(b => {
        b.classList.toggle('active', b === btn);
      });

      document.querySelectorAll('[data-skill-group]').forEach(card => {
        const group = card.getAttribute('data-skill-group');
        card.classList.toggle('hidden', target !== 'all' && group !== target);
      });
    });
  }

  // 5. ScrollSpy, Copy Email & Form Tư vấn
  initScrollSpy();
  initEmailCopyAndForm();
}

/**
 * Dual-Palette Theme Engine (:root.dark Obsidian Telemetry <-> :root Supabase Unified Stone)
 */
function initThemeEngine() {
  const themeToggleBtns = document.querySelectorAll('[data-action="toggle-theme"]');
  const savedTheme = localStorage.getItem('vms-portfolio-theme');
  const initialDark = savedTheme ? savedTheme === 'dark' : true;

  applyTheme(initialDark);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      applyTheme(!isCurrentlyDark);
    });
  });
}

function applyTheme(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('vms-portfolio-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('vms-portfolio-theme', 'light');
  }

  document.querySelectorAll('.theme-mode-label').forEach(el => {
    el.textContent = isDark ? 'Obsidian Dark' : 'Supabase Light';
  });

  document.querySelectorAll('.icon-sun').forEach(el => el.classList.toggle('hidden', !isDark));
  document.querySelectorAll('.icon-moon').forEach(el => el.classList.toggle('hidden', isDark));
}

/**
 * Multi-Platform Responsive Drawers (<1024px Left Sidebar, <1280px Right Inspector Overlay)
 */
function initResponsiveDrawers() {
  const openSidebarBtn = document.getElementById('btn-open-sidebar');
  const closeSidebarBtn = document.getElementById('btn-close-sidebar');
  const leftSidebar = document.getElementById('left-sidebar');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

  const toggleInspectorBtns = document.querySelectorAll('[data-action="toggle-inspector"]');
  const closeInspectorBtn = document.getElementById('btn-close-inspector');
  const inspectorBackdrop = document.getElementById('inspector-backdrop');

  function setLeftDrawer(open) {
    if (!leftSidebar || !mobileBackdrop) return;
    if (open) {
      leftSidebar.classList.remove('-translate-x-full');
      leftSidebar.classList.add('translate-x-0');
      mobileBackdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      leftSidebar.classList.add('-translate-x-full');
      leftSidebar.classList.remove('translate-x-0');
      mobileBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => setLeftDrawer(true));
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => setLeftDrawer(false));
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => setLeftDrawer(false));

  toggleInspectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth >= 1280) {
        AppState.isDesktopInspectorVisible = !AppState.isDesktopInspectorVisible;
        syncInspectorVisibility();
      } else {
        openMobileInspectorOverlay(true);
      }
    });
  });

  if (closeInspectorBtn) {
    closeInspectorBtn.addEventListener('click', () => {
      if (window.innerWidth >= 1280) {
        AppState.isDesktopInspectorVisible = false;
        syncInspectorVisibility();
      } else {
        openMobileInspectorOverlay(false);
      }
    });
  }

  if (inspectorBackdrop) {
    inspectorBackdrop.addEventListener('click', () => openMobileInspectorOverlay(false));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setLeftDrawer(false);
      openMobileInspectorOverlay(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && mobileBackdrop && !mobileBackdrop.classList.contains('hidden')) {
      setLeftDrawer(false);
    }
    syncInspectorVisibility();
  });
}

function openMobileInspectorOverlay(open) {
  const inspector = document.getElementById('right-inspector');
  const backdrop = document.getElementById('inspector-backdrop');
  if (!inspector || !backdrop) return;

  if (open) {
    inspector.classList.remove('translate-x-full');
    inspector.classList.add('translate-x-0');
    if (window.innerWidth < 1280) {
      backdrop.classList.remove('hidden');
    }
  } else {
    inspector.classList.add('translate-x-full');
    inspector.classList.remove('translate-x-0');
    backdrop.classList.add('hidden');
  }
}

function syncInspectorVisibility() {
  const inspector = document.getElementById('right-inspector');
  const backdrop = document.getElementById('inspector-backdrop');
  const toggleTextEls = document.querySelectorAll('.inspector-toggle-label');
  if (!inspector) return;

  if (window.innerWidth >= 1280) {
    if (backdrop) backdrop.classList.add('hidden');
    inspector.classList.remove('translate-x-full', 'translate-x-0');
    if (AppState.isDesktopInspectorVisible) {
      inspector.classList.remove('xl:hidden');
      inspector.classList.add('xl:flex');
    } else {
      inspector.classList.add('xl:hidden');
      inspector.classList.remove('xl:flex');
    }
  }

  toggleTextEls.forEach(el => {
    el.textContent = (window.innerWidth >= 1280 && AppState.isDesktopInspectorVisible) ? 'Ẩn chi tiết' : 'Hiện chi tiết';
  });
}

/**
 * ScrollSpy cho Left Sidebar Navigation
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.sidebar-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
      }
    });
  }, { rootMargin: '-15% 0px -70% 0px' });

  sections.forEach(sec => observer.observe(sec));
}

/**
 * Copy Email, Form Tư vấn & Toast Notification
 */
function initEmailCopyAndForm() {
  const email = AppState.data?.profile?.contact?.email || 'minhson.uit@gmail.com';
  const copyBtns = document.querySelectorAll('.btn-copy-email');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        showToast(`Đã sao chép địa chỉ email: ${email}`);
      } catch (_) {
        const input = document.createElement('input');
        input.value = email;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast(`Đã sao chép địa chỉ email: ${email}`);
      }
    });
  });

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name')?.value || '';
      const senderEmail = document.getElementById('form-email')?.value || '';
      const subject = document.getElementById('form-subject')?.value || 'Yêu cầu Tư vấn Kiến trúc ERP / Hệ thống';
      const message = document.getElementById('form-message')?.value || '';

      const mailtoBody = `Họ và tên: ${name}%0D%0AEmail liên hệ: ${senderEmail}%0D%0A%0D%0ANội dung trao đổi:%0D%0A${encodeURIComponent(message)}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${mailtoBody}`;
      showToast('Đang mở trình gửi Email để chuyển yêu cầu tư vấn...');
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast) return;
  if (toastText) {
    toastText.textContent = message;
  } else {
    toast.textContent = message;
  }
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * Print-Ready CV Export
 */
function initPrintCV() {
  document.querySelectorAll('.btn-print-cv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  });
}

/**
 * Hiển thị thông báo chẩn đoán rõ ràng nếu việc tải JSON thất bại (ví dụ lỗi cú pháp JSON hoặc mở qua file://)
 */
function renderDataLoadError(error) {
  const mainEl = document.getElementById('main-workspace');
  if (!mainEl) return;

  const isFileProtocol = window.location.protocol === 'file:';
  mainEl.innerHTML = `
    <div class="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-3 max-w-2xl mx-auto my-8">
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono-tabular text-xs font-bold text-[var(--accent-primary)]">DATA LOADER DIAGNOSTIC</span>
        <span class="status-pill status-warning"><span class="status-pill-dot"></span><span>Cần HTTP Server</span></span>
      </div>
      <h2 class="text-base font-bold text-[var(--text-primary)]">Không thể tải dữ liệu từ thư mục <code>./data/*.json</code></h2>
      <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
        ${isFileProtocol
          ? 'Trình duyệt chặn lệnh <code>fetch("./data/*.json")</code> khi mở trực tiếp qua giao thức <code>file://</code> vì chính sách bảo mật CORS. Khi chạy trên GitHub Pages hoặc Local HTTP Server, toàn bộ dữ liệu JSON sẽ tự động tải bình thường.'
          : 'Đã xảy ra lỗi khi đọc hoặc phân tích cú pháp một trong các file JSON trong thư mục <code>./data/</code>.'}
      </p>
      <pre class="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs font-mono-tabular text-[var(--text-primary)] overflow-x-auto"><code>${escapeHtml(error?.message || String(error))}
${isFileProtocol ? '\n# Chạy lệnh sau tại thư mục dự án để mở Local Web Server:\npython3 -m http.server 8080\n# Sau đó truy cập: http://localhost:8080' : ''}</code></pre>
    </div>
  `;
}

/**
 * Tiện ích ánh xạ trạng thái sang class Status Pill chuẩn 92-6-2
 */
function getStatusPillClass(status) {
  if (status === 'warning') return 'status-warning';
  if (status === 'danger') return 'status-danger';
  return 'status-healthy';
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

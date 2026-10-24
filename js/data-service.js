/**
 * Data Service Layer — Portfolio & Architecture Telemetry Console
 * Võ Minh Sơn (@minhsonuit)
 *
 * Nhiệm vụ:
 * 1. Tách biệt hoàn toàn tầng Dữ liệu (Data Layer - thư mục ./data/*.json) khỏi tầng Giao diện (UI Layer).
 * 2. Tự động tải song song (Promise.all) 7 phân hệ dữ liệu JSON khi trang khởi chạy.
 * 3. Tự động tính toán các bộ đếm động (Auto-Counters) cho Sidebar, Filter Tabs, KPIs mà không cần sửa code UI.
 * 4. Hỗ trợ Fallback an toàn nếu người dùng mở trực tiếp qua giao thức cục bộ (file://) bị trình duyệt chặn CORS.
 */

const DATA_ENDPOINTS = {
  profile: './data/profile.json',
  kpis: './data/kpis.json',
  architecture: './data/architecture-systems.json',
  telemetry: './data/telemetry.json',
  competencies: './data/competencies.json',
  experience: './data/experience.json',
  governance: './data/governance.json'
};

/**
 * Định dạng số đếm thành chuỗi 2 chữ số (ví dụ: 6 -> "06") cho badge trên Sidebar
 */
function formatBadgeCount(num) {
  const n = Number(num) || 0;
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Tính toán các số liệu thống kê tự động dựa trên dữ liệu thực tế trong các file JSON
 */
function buildComputedMetadata(raw) {
  const systems = raw.architecture?.systems || [];
  const benchmarks = raw.telemetry?.benchmarks || [];
  const skillGroups = raw.competencies?.groups || [];
  const expRoles = raw.experience?.experienceSection?.roles || [];
  const govRules = raw.governance?.rules || [];

  // Đếm số lượng hệ thống theo từng domain (phục vụ thanh Filter Tabs tự động)
  const domainCounts = {
    all: systems.length
  };
  systems.forEach(sys => {
    if (sys.domain) {
      domainCounts[sys.domain] = (domainCounts[sys.domain] || 0) + 1;
    }
  });

  // Đếm số lượng nhóm kỹ năng theo từng category
  const skillCategoryCounts = {
    all: skillGroups.length
  };
  skillGroups.forEach(grp => {
    if (grp.category) {
      skillCategoryCounts[grp.category] = (skillCategoryCounts[grp.category] || 0) + 1;
    }
  });

  return {
    badges: {
      architectureCount: formatBadgeCount(systems.length),
      telemetryCount: formatBadgeCount(benchmarks.length),
      competenciesCount: formatBadgeCount(skillGroups.length),
      experienceCount: formatBadgeCount(expRoles.length),
      governanceCount: formatBadgeCount(govRules.length),
      lessonsCount: formatBadgeCount((raw.governance?.lessons?.items || []).length)
    },
    totalSystems: systems.length,
    domainCounts,
    skillCategoryCounts
  };
}

/**
 * Tải một file JSON từ đường dẫn cấu hình với chế độ no-cache để luôn nhận dữ liệu mới nhất
 */
async function fetchJsonResource(key, url) {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`[DataService] Không thể tải "${url}" (HTTP ${response.status})`);
  }

  try {
    return await response.json();
  } catch (parseErr) {
    throw new Error(`[DataService] Lỗi cú pháp JSON trong file "${url}": ${parseErr.message}`);
  }
}

/**
 * Tải toàn bộ 7 file JSON từ thư mục ./data/
 */
async function loadAllPortfolioData() {
  const entries = Object.entries(DATA_ENDPOINTS);

  try {
    const results = await Promise.all(
      entries.map(async ([key, url]) => {
        const data = await fetchJsonResource(key, url);
        return [key, data];
      })
    );

    const payload = Object.fromEntries(results);
    payload.computed = buildComputedMetadata(payload);
    payload.sourceMode = 'json-live';
    return payload;
  } catch (error) {
    console.warn(
      '[DataService] Cảnh báo khi tải JSON qua fetch (có thể do mở trực tiếp bằng giao thức file://). ' +
      'Để load trực tiếp từ ./data/*.json khi phát triển cục bộ, hãy chạy HTTP server (ví dụ: python3 -m http.server 8080). Chi tiết:',
      error.message
    );
    throw error;
  }
}

window.PortfolioDataService = {
  DATA_ENDPOINTS,
  loadAllPortfolioData,
  buildComputedMetadata,
  formatBadgeCount
};

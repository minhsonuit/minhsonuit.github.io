/**
 * High-Craft Portfolio & Architecture Telemetry Console
 * Võ Minh Sơn (@minhsonuit) — Senior Software Architect & ERP Solutions Lead
 * Built according to /frontend-design principles:
 * - Dual-Palette Theme Engine (Obsidian Telemetry .dark <-> Supabase Unified Stone :root)
 * - Multi-Platform Responsive Drawers (<1024px Left Sidebar, <1280px Right Inspector Overlay)
 * - Live Filtering, Search, Sorting & Row-to-Inspector Telemetry Binding
 */

const ARCHITECTURE_SYSTEMS = [
  {
    id: 'ARCH-AX01',
    name: 'Mạng lưới Retail POS 1.000+ Cửa hàng & Đồng bộ AX Real-time',
    domain: 'erp-pos',
    domainLabel: 'ERP & Retail POS',
    company: 'PHARMACITY JSC',
    period: '2017 – Hiện tại',
    scale: '1,000+ POS Stores',
    throughput: '10.4M tx/ngày',
    throughputValue: 10400000,
    latencyP99: '185 ms',
    latencyValue: 185,
    impactScore: 99,
    status: 'healthy',
    statusText: 'SLA 99.98% • Active',
    summary: 'Kiến trúc bán lẻ phân tán Offline-first cho hơn 1.000 nhà thuốc trên toàn quốc, đảm bảo quầy thu ngân thanh toán dưới 2 giây ngay cả khi mất kết nối WAN và đồng bộ đối soát 100% chính xác về AX 2012 R3 Head Office.',
    problem: 'Khi quy mô chuỗi vượt mốc 500 cửa hàng, cơ chế đồng bộ CDX/Async Server mặc định bị nghẽn cổ chai vào giờ cao điểm (17:00–21:00), gây trễ tồn kho và lệch công nợ ca bán hàng.',
    solution: 'Tái thiết kế luồng đồng bộ phân tầng kết hợp Local Store DB (SQL Express), hàng đợi nén gói tin theo lô (Batch Compression) và X++ Posting Engine bất đồng bộ tại AOS Cluster.',
    metrics: [
      { label: 'Thời gian thanh toán POS', value: '< 1.8 giây', delta: '-68% độ trễ' },
      { label: 'Khớp lệnh tài chính POS-GL', value: '100.0%', delta: 'Zero Data Loss' },
      { label: 'Khả năng chịu lỗi Offline', value: '72 giờ', delta: 'Tự động hồi phục' },
      { label: 'Tải đỉnh xử lý đồng thời', value: '4,200 req/s', delta: '+340% công suất' }
    ],
    governance: [
      'Giao thức đồng bộ một chiều kiểm soát chặt qua AX Adapter Service.',
      'Toàn bộ giao dịch POS áp dụng Idempotency Key chống ghi trùng khi mạng chập chờn.',
      'Đối soát tự động cuối ca (End-of-Day Shift Reconciliation) trước khi post General Ledger.'
    ],
    techStack: ['Dynamics AX 2012 R3', 'X++ (MorphX)', 'Retail POS', 'C# .NET', 'SQL Replication', 'Async Server'],
    telemetryTitle: 'Lưu lượng đồng bộ POS về HO (Nghìn giao dịch / giờ)',
    telemetryUnit: 'k tx/h',
    telemetryThreshold: 'Ngưỡng cảnh báo tải: 650k tx/h',
    telemetryPoints: [310, 340, 390, 420, 480, 520, 590, 610, 575, 540, 490, 460],
    codeSnippet: `// X++: Kiểm tra Idempotency & Post Statement an toàn theo lô
public void postRetailStatementBatch(RetailStatementId _statementId)
{
    RetailStatementTable statementTable;
    ttsBegin;
    select firstOnly forUpdate statementTable
        where statementTable.statementId == _statementId;
    if (statementTable && statementTable.Status == RetailStatementStatus::Validated)
    {
        RetailStatementPost::runServer(_statementId);
    }
    ttsCommit;
}`
  },
  {
    id: 'ARCH-GW02',
    name: 'AX Integration Adapter & Event-Driven Gateway (.NET 8)',
    domain: 'integration',
    domainLabel: 'Integration Gateway',
    company: 'PHARMACITY JSC',
    period: '2018 – Hiện tại',
    scale: 'Omnichannel Hub',
    throughput: '3,850 req/s',
    throughputValue: 8800000,
    latencyP99: '42 ms',
    latencyValue: 42,
    impactScore: 98,
    status: 'healthy',
    statusText: 'Circuit Closed • 99.99%',
    summary: 'Cổng giao tiếp trung gian duy nhất (Single Point of Entry) kết nối ERP lõi Dynamics AX 2012 với E-commerce, Mobile App, Đối tác giao hàng (Grab/AhaMove) và cổng thanh toán điện tử.',
    problem: 'Các kênh bán hàng trực tuyến thường xuyên mở chiến dịch Flash Sale khiến lượng truy cập tăng đột biến gấp 10 lần, đe dọa làm treo AOS Server và khóa bảng InventSum trong AX.',
    solution: 'Xây dựng AX Adapter độc quyền bằng ASP.NET Core (.NET 8), tích hợp Polly Circuit Breaker, Timeout nghiêm ngặt, Redis Read-Through Cache và RabbitMQ Dead-Letter Queue. Tuyệt đối cấm ứng dụng ngoài ghi trực tiếp vào SQL Server của AX.',
    metrics: [
      { label: 'Độ trễ phản hồi API (P99)', value: '42 ms', delta: '-85% so với AIF cũ' },
      { label: 'Tỷ lệ Cache Hit tồn kho', value: '94.6%', delta: 'Giảm tải 90% cho AX' },
      { label: 'Cô lập sự cố (Fault Isolation)', value: '100%', delta: 'Polly Circuit Breaker' },
      { label: 'Chống SQL Injection', value: '100%', delta: '100% Parameterized' }
    ],
    governance: [
      'AX Adapter là điểm duy nhất được phép gọi vào hệ thống AX.',
      'Cấm tuyệt đối write trực tiếp vào AX SQL Server từ các dịch vụ vệ tinh.',
      'SQL Server AX chỉ được phép dùng cho read-only fallback khi thật sự cần thiết.',
      '100% truy vấn Parameterized, cấm hoàn toàn dynamic string SQL.',
      'Áp dụng cứng Timeout (3s) + Circuit Breaker (ngắt mạch sau 5 lỗi liên tiếp).'
    ],
    techStack: ['.NET 8 Web API', 'C#', 'Polly Circuit Breaker', 'RabbitMQ', 'Redis Cluster', 'AIF Custom Services'],
    telemetryTitle: 'Độ trễ phản hồi AX Adapter Gateway P99 (ms)',
    telemetryUnit: 'ms',
    telemetryThreshold: 'Ngưỡng SLA Timeout: 250 ms',
    telemetryPoints: [68, 62, 55, 49, 46, 44, 48, 43, 41, 40, 42, 42],
    codeSnippet: `// .NET 8: Chính sách Timeout + Circuit Breaker bắt buộc cho AX Adapter
var axResiliencePipeline = new ResiliencePipelineBuilder<AxResponse>()
    .AddTimeout(TimeSpan.FromSeconds(3.0))
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions<AxResponse> {
        FailureRatio = 0.25,
        SamplingDuration = TimeSpan.FromSeconds(30),
        MinimumThroughput = 20,
        BreakDuration = TimeSpan.FromSeconds(15)
    }).Build();`
  },
  {
    id: 'ARCH-DB03',
    name: 'Tối ưu hóa CSDL SQL Server Hàng trăm Triệu Bản ghi',
    domain: 'database',
    domainLabel: 'High-Scale Database',
    company: 'PHARMACITY JSC & Enterprise Clients',
    period: '2017 – Hiện tại',
    scale: '500M+ Rows / Table',
    throughput: '28,500 QPS',
    throughputValue: 9600000,
    latencyP99: '18 ms',
    latencyValue: 18,
    impactScore: 97,
    status: 'healthy',
    statusText: 'Deadlock -78% • Optimal',
    summary: 'Phân tích sâu Execution Plan, thiết kế lại chiến lược Covering Index, Table Partitioning theo kỳ kế toán và loại bỏ Key Lookup / Lock Escalation trên các bảng giao dịch cốt lõi (InventTrans, RetailTransactionSalesTrans).',
    problem: 'Bảng lịch sử giao dịch kho và bán lẻ vượt ngưỡng 400 triệu dòng khiến CPU máy chủ SQL Server thường xuyên chạm mức 92%–98%, phát sinh hàng chục vụ Deadlock mỗi ngày làm gián đoạn việc chốt đơn.',
    solution: 'Sử dụng Extended Events & Query Store để khoanh vùng Top 25 câu truy vấn tốn tài nguyên nhất; áp dụng Partitioning theo tháng, tinh chỉnh `MAXDOP`, bật `READ_COMMITTED_SNAPSHOT` có kiểm soát và chuẩn hóa toàn bộ câu lệnh Parameterized.',
    metrics: [
      { label: 'Mức sử dụng CPU SQL Server', value: '32%', delta: 'Giảm từ 92% giờ cao điểm' },
      { label: 'Tần suất Deadlock / ngày', value: '< 1 vụ', delta: 'Giảm hơn 78% sự cố khóa' },
      { label: 'Tốc độ chạy báo cáo EOD', value: '1.8 phút', delta: 'Nhanh gấp 18 lần (từ 45p)' },
      { label: 'Buffer Cache Hit Ratio', value: '99.8%', delta: 'Tối ưu I/O Disk Read' }
    ],
    governance: [
      'Mọi câu truy vấn bắt buộc đi qua Parameterized Query / Stored Procedure đã kiểm duyệt Execution Plan.',
      'Không sử dụng `NOLOCK` bừa bãi gây Dirty Read trên các bảng số dư tài chính và tồn kho khả dụng.',
      'Bảo trì Index định kỳ (Smart Reorganize/Rebuild) và cập nhật Statistics tự động ngoài giờ cao điểm.'
    ],
    techStack: ['SQL Server 2019 Enterprise', 'T-SQL Tuning', 'Execution Plan', 'Table Partitioning', 'Extended Events', 'Query Store'],
    telemetryTitle: 'Mức tải CPU SQL Server cụm ERP Core (%)',
    telemetryUnit: '% CPU',
    telemetryThreshold: 'Ngưỡng cảnh báo nóng: 75% CPU',
    telemetryPoints: [89, 84, 76, 65, 54, 48, 42, 38, 35, 34, 32, 32],
    codeSnippet: `-- T-SQL: Truy vấn Parameterized an toàn với Covering Index Seek
exec sp_executesql 
  N'SELECT ITEMID, AVAILPHYSICAL, RESERVPHYSICAL
    FROM dbo.INVENTSUM WITH (INDEX(IDX_INVENTSUM_ITEM_DIM_INC))
    WHERE DATAAREAID = @pDataAreaId 
      AND ITEMID = @pItemId 
      AND CLOSED = 0;',
  N'@pDataAreaId nvarchar(4), @pItemId nvarchar(20)',
  @pDataAreaId = N'pmc', @pItemId = N'SKU-008492';`
  },
  {
    id: 'ARCH-INV04',
    name: 'Hệ thống Phân bổ Tồn kho Real-time & Chống Overselling',
    domain: 'erp-pos',
    domainLabel: 'ERP & Retail POS',
    company: 'PHARMACITY JSC',
    period: '2019 – Hiện tại',
    scale: '50,000+ SKUs • 1,000 Kho',
    throughput: '1,950 rsv/s',
    throughputValue: 6200000,
    latencyP99: '29 ms',
    latencyValue: 29,
    impactScore: 95,
    status: 'healthy',
    statusText: '99.96% Accuracy',
    summary: 'Cơ chế giữ chỗ tồn kho (Inventory Reservation) thời gian thực theo từng lô thuốc (Batch/Expiry Date - FEFO) kết hợp bộ nhớ đệm phân tán Redis và đối soát ngược với bảng InventSum của Dynamics AX.',
    problem: 'Đặc thù ngành bán lẻ dược phẩm yêu cầu quản lý tồn kho chính xác theo số lô (Batch Number) và hạn sử dụng (FEFO). Khi khách đặt hàng qua App và mua trực tiếp tại nhà thuốc cùng lúc, nguy cơ bán vượt tồn (Overselling) hoặc xuất nhầm lô cận hạn rất cao.',
    solution: 'Thiết kế bộ máy tính tồn kho khả dụng (Available-to-Promise) sử dụng Redis Lua Script nguyên tử (Atomic Decrement) kết hợp đồng bộ sự kiện thay đổi tồn kho từ AX Adapter qua Message Queue.',
    metrics: [
      { label: 'Tỷ lệ Overselling đơn Online', value: '< 0.04%', delta: 'Giảm từ 3.8% trước đó' },
      { label: 'Thời gian giữ chỗ FEFO', value: '29 ms', delta: 'Atomic Redis + AX Sync' },
      { label: 'Tuân thủ chuẩn GPP/FEFO', value: '100%', delta: 'Kiểm soát chặt hạn dùng' },
      { label: 'Đồng bộ biến động tồn kho', value: '< 1.5 giây', delta: 'Near Real-time' }
    ],
    governance: [
      'Chỉ đọc số liệu fallback từ AX Replica khi Redis Cluster cần warm-up.',
      'Mọi lệnh trừ tồn kho chính thức đều phải đi qua AX Adapter để ghi nhận InventTrans chuẩn xác.',
      'Tự động giải phóng tồn kho tạm giữ (Reservation TTL) khi đơn hàng quá hạn thanh toán.'
    ],
    techStack: ['Dynamics AX InventTrans', 'Redis Lua Script', 'C# .NET 8', 'RabbitMQ', 'FEFO Algorithm'],
    telemetryTitle: 'Độ lệch tồn kho giữa Cache và AX Core (%)',
    telemetryUnit: '% Drift',
    telemetryThreshold: 'Ngưỡng cho phép tối đa: 0.15%',
    telemetryPoints: [0.14, 0.12, 0.10, 0.08, 0.07, 0.05, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02],
    codeSnippet: `// C#: Truy vấn tồn kho FEFO qua AX Adapter với Read-Only Fallback an toàn
public async Task<InventorySnapshot> GetStoreFefoStockAsync(string storeId, string itemId, CancellationToken ct)
{
    var cached = await _redisCache.GetStockAsync(storeId, itemId, ct);
    if (cached is not null) return cached;

    return await _axAdapterClient.QueryReadOnlyStockAsync(
        storeId: storeId, itemId: itemId, timeoutMs: 2500, ct);
}`
  },
  {
    id: 'ARCH-BI05',
    name: 'Kiến trúc Báo cáo Quản trị SSRS & Data Pipeline Cuối ngày',
    domain: 'database',
    domainLabel: 'High-Scale Database',
    company: 'PHARMACITY JSC & Tư vấn Doanh nghiệp',
    period: '2016 – Hiện tại',
    scale: '120+ Báo cáo Tài chính/Kho',
    throughput: '450 GB/ngày',
    throughputValue: 4500000,
    latencyP99: '110 ms',
    latencyValue: 110,
    impactScore: 92,
    status: 'warning',
    statusText: 'Batch Window 01:00–03:00',
    summary: 'Tách biệt hoàn toàn tải báo cáo phân tích (OLAP/SSRS) ra khỏi cơ sở dữ liệu giao dịch trực tuyến (OLTP), giúp đội ngũ Kế toán & Chuỗi cung ứng kết xuất báo cáo nhập-xuất-tồn hàng triệu dòng mà không gây khóa bảng.',
    problem: 'Các báo cáo tổng hợp giá trị tồn kho, sổ cái kế toán và doanh thu theo ca chạy trực tiếp trên DB chính vào ban ngày thường xuyên gây Lock Escalation làm chậm hoạt động bán hàng tại các chi nhánh.',
    solution: 'Thiết kế kiến trúc Read-Only Standby / Reporting Mart đồng bộ định kỳ, viết lại các Data Provider Class (RDP) trong X++ sử dụng `RecordInsertList` và bảng tạm `TempDB` thay vì lặp từng bản ghi.',
    metrics: [
      { label: 'Thời gian kết xuất Nhập-Xuất-Tồn', value: '48 giây', delta: 'Giảm từ 38 phút' },
      { label: 'Ảnh hưởng lên DB OLTP chính', value: '0%', delta: 'Tách luồng Read-Only' },
      { label: 'Số lượng báo cáo SSRS tối ưu', value: '120+ mẫu', delta: 'Chuẩn VAS & IFRS' },
      { label: 'Tốc độ xử lý Batch Job đêm', value: '3.2x nhanh hơn', delta: 'Multi-thread AOS Batch' }
    ],
    governance: [
      'Báo cáo nặng chỉ được phép truy vấn trên cụm SQL Read-Only Fallback / Reporting Replica.',
      'Cấm sử dụng vòng lặp `while select` lồng nhau quá 3 cấp trong X++ Report Data Provider.',
      'Bắt buộc giới hạn khoảng thời gian truy vấn và phân trang hợp lý.'
    ],
    techStack: ['SSRS Reports', 'X++ RDP Classes', 'TempDB Optimization', 'SQL AlwaysOn Read-Replica', 'DIXF'],
    telemetryTitle: 'Thời gian hoàn thành Batch Job đóng sổ cuối ngày (Phút)',
    telemetryUnit: 'phút',
    telemetryThreshold: 'Ngưỡng SLA ca đêm: 120 phút',
    telemetryPoints: [145, 132, 118, 96, 84, 72, 65, 58, 54, 51, 49, 47],
    codeSnippet: `// X++: Tối ưu SSRS Report Data Provider bằng RecordInsertList & TempDB
RecordInsertList insertList = new RecordInsertList(tableNum(InventValueReportTmp), true, true, true, false, true, inventValueTmp);
while select sum(PostedQty), sum(PostedValue) from inventSum
    group by ItemId, InventDimId
    where inventSum.Closed == NoYes::No
{
    inventValueTmp.clear();
    inventValueTmp.ItemId     = inventSum.ItemId;
    inventValueTmp.TotalQty   = inventSum.PostedQty;
    insertList.add(inventValueTmp);
}
insertList.insertDatabase();`
  },
  {
    id: 'ARCH-MSG06',
    name: 'Hệ thống Đối soát Hóa đơn Điện tử & Công nợ Đa kênh Tự động',
    domain: 'integration',
    domainLabel: 'Integration Gateway',
    company: 'Tư vấn Kiến trúc Doanh nghiệp',
    period: '2019 – Hiện tại',
    scale: '300K+ Hóa đơn / ngày',
    throughput: '1,200 msg/s',
    throughputValue: 3200000,
    latencyP99: '64 ms',
    latencyValue: 64,
    impactScore: 94,
    status: 'healthy',
    statusText: '100% Tax Synced',
    summary: 'Kiến trúc bất đồng bộ xử lý phát hành hóa đơn điện tử có mã của cơ quan thuế và đối soát thanh toán QR/Ví điện tử cho hàng trăm nghìn biên lai bán lẻ mỗi ngày.',
    problem: 'Việc gọi đồng bộ (Synchronous HTTP) sang cổng Hóa đơn điện tử và Ngân hàng tại thời điểm in bill khiến thu ngân phải chờ 5–10 giây khi cổng đối tác phản hồi chậm.',
    solution: 'Chuyển đổi sang mô hình Outbox Pattern + Message Broker (RabbitMQ/Kafka), kết hợp cơ chế Retry theo cấp số nhân (Exponential Backoff) và cập nhật trạng thái hóa đơn về AX thông qua AX Adapter.',
    metrics: [
      { label: 'Thời gian in hóa đơn tại quầy', value: '0.4 giây', delta: 'Không chờ API bên thứ 3' },
      { label: 'Tỷ lệ phát hành thành công', value: '99.99%', delta: 'Auto-Retry & DLQ' },
      { label: 'Thời gian đối soát công nợ', value: 'Tự động 100%', delta: 'Giảm 85% nhân sự đối soát' },
      { label: 'Độ trễ xử lý bất đồng bộ', value: '64 ms', delta: 'High-Throughput Worker' }
    ],
    governance: [
      'Mọi lệnh cập nhật số hóa đơn VAT về AX đều đi qua AX Adapter với đầy đủ chữ ký số kiểm tra.',
      'Áp dụng Circuit Breaker tự động chuyển sang chế độ lưu trữ tạm (Queue Buffering) khi cổng thuế bảo trì.',
      'Lưu vết kiểm toán (Audit Trail) toàn diện cho từng giao dịch tài chính.'
    ],
    techStack: ['.NET Core Worker', 'RabbitMQ / Kafka', 'Outbox Pattern', 'Polly Resilience', 'PostgreSQL / SQL Server'],
    telemetryTitle: 'Tỷ lệ xử lý thành công hàng đợi Hóa đơn Điện tử (%)',
    telemetryUnit: '% Success',
    telemetryThreshold: 'Mục tiêu cam kết SLA: 99.90%',
    telemetryPoints: [99.85, 99.88, 99.91, 99.93, 99.95, 99.96, 99.97, 99.98, 99.98, 99.99, 99.99, 99.99],
    codeSnippet: `// .NET Worker: Xử lý Outbox Message với Idempotency & Circuit Breaker
public async Task ProcessInvoiceOutboxAsync(InvoiceEvent evt, CancellationToken ct)
{
    if (await _auditRepo.IsProcessedAsync(evt.TransactionId, ct)) return;
    var taxResult = await _taxProviderPipeline.ExecuteAsync(
        token => _taxClient.IssueEInvoiceAsync(evt, token), ct);
    await _axAdapter.UpdateFiscalReferenceAsync(evt.TransactionId, taxResult.FiscalCode, ct);
}`
  }
];

let currentFilterDomain = 'all';
let currentSearchQuery = '';
let currentSortBy = 'impact';
let selectedSystemId = 'ARCH-AX01';
let isDesktopInspectorVisible = true;

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initResponsiveDrawers();
  initArchitectureTableAndInspector();
  initCompetencyFilter();
  initScrollSpy();
  initEmailCopyAndForm();
  initPrintCV();
});

/**
 * 1. Dual-Palette Theme Engine (:root.dark Obsidian Telemetry <-> :root Supabase Unified Stone)
 */
function initThemeEngine() {
  const themeToggleBtns = document.querySelectorAll('[data-action="toggle-theme"]');
  const savedTheme = localStorage.getItem('vms-portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDark = savedTheme ? savedTheme === 'dark' : true; // Default to Obsidian Telemetry Dark

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

  const labelEls = document.querySelectorAll('.theme-mode-label');
  labelEls.forEach(el => {
    el.textContent = isDark ? 'Obsidian Dark' : 'Supabase Light';
  });

  const sunIcons = document.querySelectorAll('.icon-sun');
  const moonIcons = document.querySelectorAll('.icon-moon');
  sunIcons.forEach(el => el.classList.toggle('hidden', !isDark));
  moonIcons.forEach(el => el.classList.toggle('hidden', isDark));
}

/**
 * 2. Multi-Platform Responsive Drawers
 * - Left Sidebar (<1024px Slide-Over Drawer with Backdrop)
 * - Right Inspector (<1280px Adaptive Overlay, >=1280px Inline Toggleable)
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

  // Close mobile sidebar when clicking any navigation link inside it
  document.querySelectorAll('#left-sidebar a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        setLeftDrawer(false);
      }
    });
  });

  toggleInspectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth >= 1280) {
        isDesktopInspectorVisible = !isDesktopInspectorVisible;
        syncInspectorVisibility();
      } else {
        openMobileInspectorOverlay(true);
      }
    });
  });

  if (closeInspectorBtn) {
    closeInspectorBtn.addEventListener('click', () => {
      if (window.innerWidth >= 1280) {
        isDesktopInspectorVisible = false;
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
    if (isDesktopInspectorVisible) {
      inspector.classList.remove('xl:hidden');
      inspector.classList.add('xl:flex');
    } else {
      inspector.classList.add('xl:hidden');
      inspector.classList.remove('xl:flex');
    }
  }

  toggleTextEls.forEach(el => {
    el.textContent = (window.innerWidth >= 1280 && isDesktopInspectorVisible) ? 'Ẩn chi tiết' : 'Hiện chi tiết';
  });
}

/**
 * 3. Interactive Architecture Table & Right Inspector Binding
 */
function initArchitectureTableAndInspector() {
  const tabBtns = document.querySelectorAll('[data-arch-tab]');
  const searchInput = document.getElementById('arch-search-input');
  const sortSelect = document.getElementById('arch-sort-select');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilterDomain = btn.getAttribute('data-arch-tab') || 'all';
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      renderArchitectureTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = (e.target.value || '').trim().toLowerCase();
      renderArchitectureTable();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      renderArchitectureTable();
    });
  }

  renderArchitectureTable();
  renderInspectorPanel(selectedSystemId);
  syncInspectorVisibility();
}

function getFilteredAndSortedSystems() {
  return ARCHITECTURE_SYSTEMS.filter(item => {
    const matchesDomain = currentFilterDomain === 'all' || item.domain === currentFilterDomain;
    const haystack = `${item.id} ${item.name} ${item.domainLabel} ${item.company} ${item.techStack.join(' ')} ${item.summary}`.toLowerCase();
    const matchesQuery = !currentSearchQuery || haystack.includes(currentSearchQuery);
    return matchesDomain && matchesQuery;
  }).sort((a, b) => {
    if (currentSortBy === 'latency') return a.latencyValue - b.latencyValue;
    if (currentSortBy === 'throughput') return b.throughputValue - a.throughputValue;
    return b.impactScore - a.impactScore;
  });
}

function renderArchitectureTable() {
  const tbody = document.getElementById('arch-table-body');
  const countBadge = document.getElementById('arch-result-count');
  if (!tbody) return;

  const filtered = getFilteredAndSortedSystems();
  if (countBadge) {
    countBadge.textContent = `${filtered.length} / ${ARCHITECTURE_SYSTEMS.length} hệ thống`;
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
    const isSelected = sys.id === selectedSystemId;
    const statusClass = sys.status === 'healthy' ? 'status-healthy' : (sys.status === 'warning' ? 'status-warning' : 'status-danger');

    return `
      <tr class="arch-row border-b border-[var(--border-subtle)] ${isSelected ? 'selected' : ''}" data-system-id="${sys.id}" tabindex="0" role="button" aria-label="Xem chi tiết kiến trúc ${sys.name}">
        <td class="sticky-col px-3.5 py-2.5 font-mono-tabular text-xs font-medium text-[var(--text-primary)] whitespace-nowrap border-r border-[var(--border-subtle)]">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[var(--accent-primary)]' : 'bg-transparent'}"></span>
            <span>${sys.id}</span>
          </div>
        </td>
        <td class="px-3.5 py-2.5 max-w-[260px] sm:max-w-[320px]">
          <div class="text-xs font-semibold text-[var(--text-primary)] truncate" title="${sys.name}">${sys.name}</div>
          <div class="text-[11px] text-[var(--text-muted)] truncate">${sys.company} • ${sys.techStack.slice(0, 3).join(', ')}</div>
        </td>
        <td class="px-3.5 py-2.5 whitespace-nowrap">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] whitespace-nowrap">
            ${sys.domainLabel}
          </span>
        </td>
        <td class="px-3.5 py-2.5 font-mono-tabular text-xs text-[var(--text-primary)] whitespace-nowrap">
          ${sys.throughput}
        </td>
        <td class="px-3.5 py-2.5 font-mono-tabular text-xs text-[var(--accent-telemetry)] font-medium whitespace-nowrap">
          ${sys.latencyP99}
        </td>
        <td class="px-3.5 py-2.5 whitespace-nowrap">
          <span class="status-pill ${statusClass}">
            <span class="status-pill-dot"></span>
            <span>${sys.statusText}</span>
          </span>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.arch-row').forEach(row => {
    const handleSelect = () => {
      const id = row.getAttribute('data-system-id');
      if (!id) return;
      selectedSystemId = id;
      renderArchitectureTable();
      renderInspectorPanel(id);

      if (window.innerWidth < 1280) {
        openMobileInspectorOverlay(true);
      } else if (!isDesktopInspectorVisible) {
        isDesktopInspectorVisible = true;
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

function buildVercelSparklineSvg(points, unitLabel, thresholdLabel) {
  const width = 310;
  const height = 96;
  const padX = 8;
  const padY = 14;
  const minVal = Math.min(...points) * 0.92;
  const maxVal = Math.max(...points) * 1.05 || 1;
  const range = maxVal - minVal || 1;

  const coords = points.map((val, idx) => {
    const x = padX + (idx / (points.length - 1)) * (width - padX * 2);
    const y = height - padY - ((val - minVal) / range) * (height - padY * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), val };
  });

  const pathD = coords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - 4} L ${coords[0].x} ${height - 4} Z`;
  const lastPt = coords[coords.length - 1];

  return `
    <div class="rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] p-3">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-[11px] font-medium text-[var(--text-secondary)] truncate">${thresholdLabel}</span>
        <span class="font-mono-tabular text-xs font-semibold text-[var(--accent-telemetry)] whitespace-nowrap">${lastPt.val} ${unitLabel}</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-24 overflow-visible" role="img" aria-label="Biểu đồ Telemetry">
        <defs>
          <linearGradient id="inspectorTelemetryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-telemetry)" stop-opacity="0.18" />
            <stop offset="100%" stop-color="var(--accent-telemetry)" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <!-- Dashed Threshold & Grid Lines -->
        <line x1="${padX}" y1="22" x2="${width - padX}" y2="22" stroke="var(--border-hover)" stroke-dasharray="3 3" stroke-width="1" />
        <line x1="${padX}" y1="52" x2="${width - padX}" y2="52" stroke="var(--border-subtle)" stroke-dasharray="2 2" stroke-width="1" />
        <line x1="${padX}" y1="82" x2="${width - padX}" y2="82" stroke="var(--border-subtle)" stroke-width="1" />
        <!-- Gradient Area -->
        <path d="${areaD}" fill="url(#inspectorTelemetryGrad)" />
        <!-- Crisp 1.75px Telemetry Line -->
        <path d="${pathD}" fill="none" stroke="var(--accent-telemetry)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Active Endpoint Dot -->
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
  const sys = ARCHITECTURE_SYSTEMS.find(s => s.id === systemId) || ARCHITECTURE_SYSTEMS[0];
  const container = document.getElementById('inspector-content');
  if (!container || !sys) return;

  const statusClass = sys.status === 'healthy' ? 'status-healthy' : (sys.status === 'warning' ? 'status-warning' : 'status-danger');

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Header ID & Status -->
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
          ${sys.id}
        </span>
        <span class="status-pill ${statusClass}">
          <span class="status-pill-dot"></span>
          <span>${sys.statusText}</span>
        </span>
      </div>

      <!-- Title & Meta -->
      <div>
        <h3 class="text-sm font-semibold text-[var(--text-primary)] leading-snug">${sys.name}</h3>
        <p class="text-xs text-[var(--text-muted)] mt-1 font-mono-tabular">${sys.company} • ${sys.period} • ${sys.scale}</p>
      </div>

      <!-- 2x2 Key Telemetry Metrics -->
      <div class="grid grid-cols-2 gap-2.5">
        ${sys.metrics.map(m => `
          <div class="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
            <div class="text-[11px] text-[var(--text-muted)] truncate">${m.label}</div>
            <div class="font-mono-tabular text-sm font-bold text-[var(--text-primary)] mt-0.5 whitespace-nowrap">${m.value}</div>
            <div class="text-[11px] text-[var(--accent-primary)] font-medium mt-0.5 whitespace-nowrap">${m.delta}</div>
          </div>
        `).join('')}
      </div>

      <!-- Vercel-Style SVG Telemetry Chart -->
      <div>
        <div class="text-xs font-semibold text-[var(--text-primary)] mb-1.5">${sys.telemetryTitle}</div>
        ${buildVercelSparklineSvg(sys.telemetryPoints, sys.telemetryUnit, sys.telemetryThreshold)}
      </div>

      <!-- Problem & Architectural Solution -->
      <div class="space-y-2.5 text-xs leading-relaxed">
        <div class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
          <div class="font-semibold text-[var(--text-primary)] mb-1">Bài toán Thực tế (Bottleneck)</div>
          <p class="text-[var(--text-secondary)]">${sys.problem}</p>
        </div>
        <div class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
          <div class="font-semibold text-[var(--text-primary)] mb-1">Giải pháp Kiến trúc (Architecture Execution)</div>
          <p class="text-[var(--text-secondary)]">${sys.solution}</p>
        </div>
      </div>

      <!-- Mandatory AX Integration & Governance Rules -->
      <div class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-[var(--text-primary)]">Tuân thủ Nguyên tắc Kiến trúc &amp; AX</span>
          <span class="font-mono-tabular text-[10px] text-[var(--accent-primary)] whitespace-nowrap">VERIFIED</span>
        </div>
        <ul class="space-y-1.5 text-xs text-[var(--text-secondary)]">
          ${sys.governance.map(rule => `
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0"></span>
              <span>${rule}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Production Code Pattern -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-semibold text-[var(--text-primary)]">Mẫu Triển khai Thực chiến</span>
          <span class="font-mono-tabular text-[11px] text-[var(--text-muted)]">Production Snippet</span>
        </div>
        <pre class="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[11px] font-mono-tabular text-[var(--text-secondary)] overflow-x-auto leading-relaxed"><code>${escapeHtml(sys.codeSnippet)}</code></pre>
      </div>

      <!-- Technology Tags -->
      <div>
        <div class="text-xs font-semibold text-[var(--text-primary)] mb-2">Công nghệ Sử dụng</div>
        <div class="flex flex-wrap gap-1.5">
          ${sys.techStack.map(t => `
            <span class="px-2 py-0.5 rounded text-[11px] font-mono-tabular bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
              ${t}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 4. Technical Competency Matrix Filter
 */
function initCompetencyFilter() {
  const skillFilterBtns = document.querySelectorAll('[data-skill-filter]');
  const skillCards = document.querySelectorAll('[data-skill-group]');

  skillFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-skill-filter') || 'all';
      skillFilterBtns.forEach(b => b.classList.toggle('active', b === btn));

      skillCards.forEach(card => {
        const group = card.getAttribute('data-skill-group');
        if (target === 'all' || group === target) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * 5. ScrollSpy for Left Sidebar Navigation
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
 * 6. Copy Email, Direct Consultation Form & Toast Notification
 */
function initEmailCopyAndForm() {
  const email = 'minhson.uit@gmail.com';
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
 * 7. Print-Ready CV Export
 */
function initPrintCV() {
  document.querySelectorAll('.btn-print-cv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  });
}

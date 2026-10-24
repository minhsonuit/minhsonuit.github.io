# AGENTS.md — Hướng dẫn Kỹ thuật & Quy tắc Bắt buộc cho AI Agents

Tài liệu này cung cấp ngữ cảnh kiến trúc, quy ước phân tách **UI (Giao diện)** và **Data (Dữ liệu)**, cùng các quy tắc nghiệp vụ bắt buộc để bất kỳ AI Agent nào khi tham gia hỗ trợ dự án `minhsonuit.github.io` đều hiểu rõ và thao tác chính xác tuyệt đối.

---

## 1. Nguyên tắc Tối thượng: Tách biệt UI và Data (Separation of Concerns)

Dự án này áp dụng kiến trúc **Data-Driven UI** nghiêm ngặt. Không bao giờ trộn lẫn dữ liệu nội dung vào trong code HTML hoặc logic điều khiển UI.

### Phân định Ranh giới File:

1. **Tầng Dữ liệu (`./data/*.json`) — Single Source of Truth:**
   - Mọi văn bản hồ sơ, số liệu KPI, danh sách hệ thống kiến trúc (Case Studies), điểm dữ liệu biểu đồ (Telemetry points), danh sách kỹ năng, kinh nghiệm làm việc, học vấn và quy tắc tích hợp AX đều nằm trong **7 file JSON** tại thư mục `./data/`:
     - [`data/profile.json`](./data/profile.json)
     - [`data/kpis.json`](./data/kpis.json)
     - [`data/architecture-systems.json`](./data/architecture-systems.json)
     - [`data/telemetry.json`](./data/telemetry.json)
     - [`data/competencies.json`](./data/competencies.json)
     - [`data/experience.json`](./data/experience.json)
     - [`data/governance.json`](./data/governance.json)
   - **Quy tắc cho AI Agent khi sửa Data:** Nếu người dùng yêu cầu *"Thêm một dự án mới"*, *"Sửa số năm kinh nghiệm"*, *"Cập nhật số liệu KPI"*, *"Đổi thông tin liên hệ"* hoặc *"Thêm kỹ năng mới"* ➡️ **CHỈ SỬA FILE JSON TƯƠNG ỨNG TRONG `./data/`**. Không cần và không được sửa `index.html` hay `js/main.js`.

2. **Tầng Dịch vụ Tải Dữ liệu ([`js/data-service.js`](./js/data-service.js)):**
   - Chịu trách nhiệm `fetch` song song 7 file JSON từ `./data/` với `cache: 'no-cache'`.
   - Tự động tính toán các bộ đếm động (`buildComputedMetadata`): tổng số hệ thống, số lượng hệ thống theo từng phân hệ (`domainCounts`), số lượng biểu đồ, số lượng nhóm kỹ năng, số lượng vị trí kinh nghiệm và số lượng nguyên tắc AX.

3. **Tầng Khung Giao diện ([`index.html`](./index.html), [`css/style.css`](./css/style.css), [`js/main.js`](./js/main.js)):**
   - [`index.html`](./index.html): Chỉ chứa bộ khung **App Shell** (Left Sidebar, Top Header, các thẻ `<section>` rỗng có ID rõ ràng và Right Inspector). **CẤM** viết cứng các thẻ bài viết, dòng bảng dữ liệu hay thẻ kỹ năng trực tiếp vào `index.html`.
   - [`css/style.css`](./css/style.css): Chứa hệ thống CSS Variables cho 2 bảng màu (`Obsidian Telemetry .dark` và `Supabase Unified Stone :root`), kiểu chữ `tabular-nums`, trạng thái `status-pill` (92-6-2 Color Discipline) và định dạng in ấn A4 (`@media print`).
   - [`js/main.js`](./js/main.js): Nhận dữ liệu từ `window.PortfolioDataService.loadAllPortfolioData()`, tự động dựng DOM cho tất cả các section, tự động vẽ biểu đồ SVG từ mảng số `points` và quản lý các sự kiện tương tác (Filter, Search, Sort, Drawer, Theme Toggle, Copy Email, Print).
   - **Quy tắc cho AI Agent khi sửa UI:** Nếu người dùng yêu cầu thay đổi bố cục, màu sắc, hiệu ứng chuyển động hoặc trải nghiệm người dùng ➡️ Đọc kỹ skill [`.agents/skills/frontend-design/SKILL.md`](./.agents/skills/frontend-design/SKILL.md) trước khi chỉnh sửa `index.html`, `css/style.css` hoặc `js/main.js`. Đảm bảo mọi hàm render trong `js/main.js` vẫn đọc động từ cấu trúc JSON hiện hành.

---

## 2. Quy chuẩn Thiết kế Giao diện (UI/UX Guardrails)

Khi chỉnh sửa hoặc mở rộng giao diện (`index.html`, `css/style.css`, `js/main.js`), AI Agent **BẮT BUỘC** tuân thủ:

1. **Dual-Palette System:**
   - Luôn hỗ trợ cả 2 chế độ **Obsidian Telemetry Dark (`.dark`)** và **Supabase Unified Stone Light (`:root`)** thông qua biến CSS (`var(--bg-canvas)`, `var(--bg-surface)`, `var(--bg-subtle)`, `var(--border-default)`, `var(--text-primary)`, `var(--accent-primary)`, `var(--accent-telemetry)`).
   - Sidebar trái và vùng nội dung chính luôn thuộc cùng một hệ nền (`--bg-canvas`), phân tách bằng đường viền mảnh `1px` (`--border-default`).
2. **92–6–2 Color Discipline & Status Pills:**
   - Không bao giờ tô màu nền xanh/đỏ/vàng đậm cho toàn bộ thẻ KPI hoặc ô bảng dữ liệu.
   - Mọi trạng thái phải hiển thị qua `.status-pill` (`status-healthy`, `status-warning`, `status-danger`) kèm chấm tròn `6px` (`.status-pill-dot`).
3. **Multi-Platform Responsive (4 Breakpoints):**
   - **Mobile (`< 640px`) & Tablet (`< 1024px`):** Sidebar trái ẩn mặc định, mở dưới dạng Slide-over Drawer khi bấm nút Hamburger (`#btn-open-sidebar`).
   - **Laptop & Mobile (`< 1280px`):** Right Inspector (`#right-inspector`) hoạt động như một Overlay Drawer trượt từ bên phải khi người dùng nhấn vào một dòng trong bảng kiến trúc, đảm bảo bảng dữ liệu trung tâm không bao giờ bị ép hẹp.
   - **Wide Desktop (`≥ 1280px`):** Right Inspector hiển thị trực tiếp bên phải (`xl:flex`) và có thể đóng/mở bằng nút `Ẩn/Hiện chi tiết`.
4. **Typography & Chống Ngắt dòng Sai (`whitespace-nowrap`):**
   - Sử dụng font hỗ trợ tiếng Việt đầy đủ (`Inter`, `Plus Jakarta Sans`) và `JetBrains Mono` (`font-mono-tabular`) cho mọi mã định danh (`ARCH-AX01`), con số thống kê, độ trễ (`42 ms`) và thông lượng (`10.4M tx/ngày`).
   - Luôn áp dụng `whitespace-nowrap` cho các nhãn trạng thái, mã hệ thống, nút lọc và tiêu đề cột.

---

## 3. Quy tắc Bất khả xâm phạm về AX 2012 & X++

Khi viết mới hoặc chỉnh sửa bất kỳ nội dung kỹ thuật, giải pháp kiến trúc hoặc đoạn code mẫu (`codeSnippet` trong `data/architecture-systems.json`) liên quan đến **Microsoft Dynamics AX 2012**:

1. **AX Adapter là điểm duy nhất được phép gọi AX.**
2. **Cấm write trực tiếp vào AX SQL Server** dưới mọi hình thức.
3. **SQL Server AX chỉ dùng cho Read-Only Fallback** hoặc báo cáo trên Read Replica.
4. **Query Parameterized 100%**, cấm tuyệt đối dynamic string SQL.
5. **Timeout + Circuit Breaker bắt buộc** cho mọi kết nối tích hợp.
6. Khi viết code X++ hoặc file XPO cho AX 2012, bắt buộc tuân thủ chuẩn định dạng của `ax2012-xpo-formatter` (thụt lề 4 spaces, khai báo biến ở đầu hàm, dùng `ttsBegin` / `ttsCommit` chuẩn xác).

---

## 4. Checklist Kiểm tra trước khi Hoàn tất Tác vụ

- [ ] Đã kiểm tra cú pháp hợp lệ của tất cả các file `.json` trong `./data/` (có thể dùng `python3 -m json.tool data/<file>.json > /dev/null`).
- [ ] Không có dữ liệu nghiệp vụ nào bị hardcode vào `index.html` hoặc `js/main.js`.
- [ ] Tất cả các bộ đếm động (Sidebar badges, Filter tab counts, Table result count) hoạt động tự động dựa trên độ dài mảng dữ liệu.
- [ ] Giao diện hiển thị hoàn hảo ở cả 2 chế độ **Obsidian Dark** và **Supabase Light**, cũng như khi in ấn (`@media print`).

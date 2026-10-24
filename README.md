# Võ Minh Sơn (`@minhsonuit`) — Portfolio & Architecture Telemetry Console

> **Senior Software Architect & Enterprise ERP Solutions Lead**  
> Chuyên gia Kiến trúc Hệ thống, Microsoft Dynamics AX 2012 R3 (X++ / MorphX), Retail POS 1.000+ điểm bán, .NET 8 AX Adapter Gateway & Tối ưu hóa Cơ sở Dữ liệu SQL Server quy mô lớn.

Trang web cá nhân chính thức được xuất bản tại GitHub Pages: **[https://minhsonuit.github.io/](https://minhsonuit.github.io/)**

---

## 🏛️ Kiến trúc Dự án: Tách biệt Hoàn toàn UI (Giao diện) & Data (Dữ liệu)

Dự án được thiết kế theo mô hình **Decoupled Data-Driven Architecture (Kiến trúc Hướng Dữ liệu Tách biệt)** nhằm giải quyết triệt để bài toán bảo trì cho cả **Lập trình viên (Con người)** và **AI Agents**:

1. **Sửa Giao diện (UI) không bao giờ làm hỏng Dữ liệu (Data):**
   - Toàn bộ khung bố cục (`index.html`), hệ thống màu sắc Dual-Palette (`css/style.css`) và bộ máy tương tác (`js/main.js`) hoàn toàn **không chứa dữ liệu cứng (Zero Hardcoded Content)**.
   - Khi nâng cấp giao diện, đổi bố cục hoặc chỉnh sửa CSS, toàn bộ nội dung hồ sơ, số liệu KPI, dự án kiến trúc và lịch sử công tác vẫn nằm an toàn tuyệt đối trong thư mục `./data/*.json`.
2. **Sửa Dữ liệu (Data) tự động cập nhật Giao diện 100%:**
   - Khi bạn thêm/sửa/xóa bất kỳ thông tin nào trong các file JSON tại thư mục [`./data/`](./data/), tầng [`js/data-service.js`](./js/data-service.js) và [`js/main.js`](./js/main.js) sẽ **tự động tải (`fetch`)**, **tự động đếm lại số lượng** (trên thanh điều hướng trái, trên các nút Filter Tabs, bộ đếm kết quả) và **tự động vẽ lại biểu đồ SVG** theo số liệu mới.

```text
minhsonuit.github.io/
├── index.html                      # [UI SHELL] Khung bố cục App Shell thuần túy (Không chứa data cứng)
├── css/
│   └── style.css                   # [UI STYLE] Hệ thống Design Tokens (Obsidian Dark & Supabase Light) + Print A4
├── js/
│   ├── data-service.js             # [DATA LOADER] Tải song song 7 file JSON từ ./data/ & tính toán Auto-Counters
│   └── main.js                     # [UI ENGINE] Render DOM từ JSON, vẽ SVG Chart động & quản lý tương tác
├── data/                           # [SINGLE SOURCE OF TRUTH] Toàn bộ dữ liệu nghiệp vụ định dạng JSON
│   ├── README.md                   # Đặc tả Schema chi tiết & hướng dẫn thêm/sửa dữ liệu cho từng file JSON
│   ├── profile.json                # Khía cạnh 1: Định danh, Hero, Trạng thái, Menu điều hướng & Liên hệ
│   ├── kpis.json                   # Khía cạnh 2: Các thẻ chỉ số KPI cốt lõi (Executive KPI Cards)
│   ├── architecture-systems.json   # Khía cạnh 3: Danh mục Case Studies, Filter Domains & Dữ liệu Inspector
│   ├── telemetry.json              # Khía cạnh 4: Số liệu đo lường hiệu năng thực tế (Vẽ biểu đồ SVG lớn)
│   ├── competencies.json           # Khía cạnh 5: Ma trận kỹ năng chuyên môn & Danh mục bộ lọc công nghệ
│   ├── experience.json             # Khía cạnh 6: Lịch sử công tác thực chiến & Nền tảng học vấn (UIT)
│   └── governance.json             # Khía cạnh 7: Bộ nguyên tắc bất khả xâm phạm trong tích hợp AX 2012
├── resources/                      # Hình ảnh chân dung (avatar.jpg) và tài nguyên tĩnh
├── AGENTS.md                       # [AI AGENT RULES] Hướng dẫn bắt buộc dành riêng cho AI Coding Agents
└── README.md                       # Tài liệu tổng quan dự án (File hiện tại)
```

---

## 📊 Phân tích 7 Khía cạnh Dữ liệu (`./data/*.json`) & Cơ chế Tự động Load

Dữ liệu hồ sơ được phân tích và chia nhỏ thành **7 file JSON độc lập** theo đúng nguyên lý *Single Responsibility Principle (SRP)*, đặt tại thư mục [`./data/`](./data/):

| STT | File Dữ liệu JSON | Khía cạnh Nghiệp vụ | Cơ chế Tự động Cập nhật UI khi Thay đổi JSON |
| :-- | :--- | :--- | :--- |
| **01** | [`data/profile.json`](./data/profile.json) | **Định danh, Trạng thái & Liên hệ:** Họ tên, chức danh, đoạn giới thiệu tổng quan, trạng thái sẵn sàng, menu điều hướng trái, thông tin Email/LinkedIn/GitHub. | Tự động cập nhật Header, Sidebar, Hero Profile, nút Copy Email, liên kết mạng xã hội và phần Liên hệ cuối trang. |
| **02** | [`data/kpis.json`](./data/kpis.json) | **Chỉ số KPI Trọng tâm:** Các con số ấn tượng nhất (`1,000+ Stores`, `10.4M tx/ngày`, `18x Nhanh hơn`, `99.98% Uptime`). | Tự động render các thẻ KPI trong lưới `#kpi-grid` cùng màu sắc nhấn (`primary` hoặc `telemetry`) và chấm trạng thái. |
| **03** | [`data/architecture-systems.json`](./data/architecture-systems.json) | **Giải pháp Kiến trúc & Case Studies:** Danh mục phân hệ (`domains`), tùy chọn sắp xếp (`sortOptions`) và danh sách hệ thống (`systems`) kèm thông số Inspector & Code mẫu. | - Tự động đếm tổng số hệ thống cập nhật lên Sidebar (`06`), nút Hero và bộ đếm bảng.<br>- Tự động sinh các nút Filter Tabs kèm số lượng từng phân hệ (`Tất cả (6)`, `ERP & Retail POS (2)`...).<br>- Tự động render bảng dữ liệu và bảng **Right Inspector** (kèm biểu đồ SVG Sparkline vẽ từ mảng `telemetryPoints`). |
| **04** | [`data/telemetry.json`](./data/telemetry.json) | **Biểu đồ Hiệu năng Thực tế:** Các bài đo benchmark trước/sau tối ưu SQL Server và AX Adapter Gateway. | Tự động tính toán tọa độ `(x, y)` từ mảng số `points` để vẽ lại đường cong SVG `1.75px` và vùng phủ gradient mà không cần sửa tọa độ SVG thủ công. |
| **05** | [`data/competencies.json`](./data/competencies.json) | **Hệ sinh thái Kỹ năng:** Danh mục nhóm lọc (`categories`) và các khối năng lực công nghệ (`groups`). | Tự động sinh thanh lọc kỹ năng (`Tất cả`, `ERP & POS`, `.NET & Integration`...), cập nhật số đếm trên Sidebar và hiển thị các thẻ tag kỹ năng. |
| **06** | [`data/experience.json`](./data/experience.json) | **Kinh nghiệm & Học vấn:** Lịch sử các vị trí công tác (`experienceSection.roles`) và bằng cấp đại học (`educationSection.items`). | Tự động render dòng thời gian sự nghiệp, các gạch đầu dòng thành tựu và thẻ Học vấn UIT VNU-HCM, đồng thời cập nhật số đếm trên Sidebar. |
| **07** | [`data/governance.json`](./data/governance.json) | **Nguyên tắc Quản trị & Tích hợp AX:** Bộ 6 quy tắc bắt buộc khi thiết kế tích hợp ERP Microsoft Dynamics AX 2012. | Tự động render lưới thẻ Rule (`RULE 01` → `RULE 06`) với nhãn mức độ ưu tiên (`Mandatory`, `Strict Write Ban`, `Fallback Only`...). |

> 📖 **Xem chi tiết cấu trúc từng trường JSON tại:** [`data/README.md`](./data/README.md)

---

## 🛠️ Hướng dẫn Chỉnh sửa & Chạy thử Cục bộ (Local Development)

### 1. Khi bạn chỉ muốn cập nhật nội dung CV / Dự án / Số liệu
1. Mở file JSON tương ứng trong thư mục [`./data/`](./data/) (ví dụ: thêm dự án thứ 7 vào `data/architecture-systems.json` hoặc cập nhật kinh nghiệm trong `data/experience.json`).
2. Lưu file JSON (đảm bảo đúng cú pháp JSON chuẩn: dấu ngoặc kép `"`, không dư dấu phẩy `,` ở phần tử cuối).
3. Tải lại trình duyệt (Refresh) — giao diện sẽ tự động nạp dữ liệu mới và tính toán lại mọi con số thống kê!

### 2. Chạy Local HTTP Server để kiểm tra
Vì ứng dụng sử dụng chuẩn `fetch('./data/*.json')` để đọc các file JSON động, khi chạy trên **GitHub Pages (`https://minhsonuit.github.io/`)** mọi thứ hoạt động tự động 100%.  
Khi mở trên máy tính cá nhân, trình duyệt sẽ chặn `fetch` nếu bạn nhấp đúp mở trực tiếp qua giao thức `file://` (do chính sách bảo mật CORS). Hãy chạy một HTTP Server nhẹ tại thư mục gốc dự án:

```bash
# Cách 1: Sử dụng Python 3 (có sẵn trên macOS / Linux)
python3 -m http.server 8080

# Cách 2: Sử dụng Node.js (npx)
npx serve -l 8080
```
Sau đó mở trình duyệt tại địa chỉ: **`http://localhost:8080`**

---

## 🛡️ Nguyên tắc Kiến trúc Tích hợp AX 2012 (Bắt buộc)

Mọi nội dung kỹ thuật, đoạn code mẫu (X++, C# .NET 8, T-SQL) và tài liệu kiến trúc trong dự án này luôn tuân thủ nghiêm ngặt 5 nguyên tắc cốt lõi:
- **AX Adapter là điểm duy nhất được phép gọi AX** (*Single Point of Entry*).
- **Cấm ghi trực tiếp vào AX SQL Server** (*Strict Direct-Write Ban*).
- **SQL Server AX chỉ dùng cho Read-Only Fallback** hoặc tách luồng báo cáo trên Read Replica.
- **100% Query Parameterized**, cấm tuyệt đối việc nối chuỗi SQL động (*No Dynamic String SQL*).
- **Timeout + Circuit Breaker bắt buộc** trên mọi đường truyền tích hợp gọi vào hệ thống.

---

## 🤖 Dành cho AI Agents

Nếu bạn là một AI Coding Agent (Antigravity, Claude, Cursor, GitHub Copilot...) đang làm việc trên kho lưu trữ này, **BẮT BUỘC** đọc kỹ các tài liệu sau trước khi thực hiện bất kỳ thay đổi nào:
1. **[`AGENTS.md`](./AGENTS.md)**: Quy tắc kiến trúc tách biệt UI & Data, quy trình sửa đổi an toàn và danh sách kiểm tra (Checklist).
2. **[`data/README.md`](./data/README.md)**: Đặc tả Schema chi tiết của 7 file JSON trong thư mục `./data/`.
3. **[`.agents/skills/frontend-design/SKILL.md`](./.agents/skills/frontend-design/SKILL.md)**: Tiêu chuẩn thiết kế giao diện High-Craft UI (Obsidian Dark & Supabase Light, 92-6-2 Color Discipline, Multi-Platform Responsive).

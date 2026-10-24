# Hướng dẫn Cấu trúc Dữ liệu (`./data/*.json`) & Cơ chế Tự động Load

Thư mục `./data/` là **Single Source of Truth (Nguồn dữ liệu chuẩn duy nhất)** của toàn bộ trang Portfolio & Architecture Telemetry Console.  
Khi trang web khởi chạy, [`js/data-service.js`](../js/data-service.js) sẽ tự động tải (`fetch`) cả 7 file JSON trong thư mục này và chuyển cho [`js/main.js`](../js/main.js) để dựng giao diện.

---

## 1. `profile.json` — Hồ sơ Định danh, Điều hướng & Liên hệ

Chứa thông tin cá nhân, trạng thái công việc, cấu hình thanh điều hướng bên trái và thông tin liên hệ.

- `meta`: Thẻ tiêu đề trang (`title`), `description`, `keywords` phục vụ SEO.
- `identity`:
  - `fullName`, `handle`, `shortRole`, `headline`, `operationalRole`
  - `location`, `locationShort`, `experienceShort`, `timezone`, `avatar`
  - `availability`: `{ "status": "healthy" | "warning" | "danger", "shortLabel": "Sẵn sàng", "heroBadge": "..." }`
  - `academicBadge`, `techSummaryBadge`, `summaryHtml` (hỗ trợ thẻ `<strong>` để nhấn mạnh từ khóa quan trọng).
- `headerTelemetry`: Cấu hình thanh trạng thái trên Top Header (`breadcrumbTitle`, `breadcrumbSubtitle`, `primaryPill`, `secondaryMetric`).
- `navigation`: Mảng các mục điều hướng trên Left Sidebar.
  - Trường `badgeSource` hỗ trợ tự động đếm số lượng từ dữ liệu thật:
    - `"architectureCount"` ➡️ Tự động lấy tổng số hệ thống trong `architecture-systems.json`.
    - `"telemetryCount"` ➡️ Tự động lấy tổng số biểu đồ trong `telemetry.json`.
    - `"competenciesCount"` ➡️ Tự động lấy tổng số nhóm kỹ năng trong `competencies.json`.
    - `"experienceCount"` ➡️ Tự động lấy tổng số vị trí công việc trong `experience.json`.
    - `"governanceCount"` ➡️ Tự động lấy tổng số nguyên tắc trong `governance.json`.
    - `"static"` ➡️ Hiển thị giá trị tĩnh trong `badgeValue` (ví dụ: `"01"`, `"UIT"`, `"24/7"`).
- `sidebarCompliance`: Hộp tóm tắt chuẩn kiến trúc AX 2012 ở cột trái.
- `contact`: Thông tin Email, LinkedIn, GitHub và cấu hình nhãn cho Form gửi yêu cầu tư vấn.

---

## 2. `kpis.json` — Chỉ số KPI Cốt lõi (Section 1)

Hiển thị lưới thẻ KPI ngay dưới phần giới thiệu tổng quan.

```json
{
  "id": "kpi-pos-scale",
  "label": "Quy mô Vận hành POS",
  "pillText": "Toàn quốc",
  "status": "healthy",
  "value": "1,000+ Stores",
  "valueAccent": "primary",
  "subtitle": "Đồng bộ Offline-first về AX 2012 HO"
}
```
- `status`: `"healthy"` (Xanh ngọc) | `"warning"` (Vàng hổ phách) | `"danger"` (Đỏ).
- `valueAccent`: `"primary"` (Màu chữ chính) | `"telemetry"` (Màu xanh Cyan kỹ thuật nổi bật).

---

## 3. `architecture-systems.json` — Danh mục Hệ thống Kiến trúc & Case Studies (Section 2 & Right Inspector)

Đây là file dữ liệu trung tâm điều khiển cả **Bảng Hệ thống Kiến trúc**, **Thanh Bộ lọc Phân hệ** và **Bảng Chi tiết Right Inspector**.

### Cách thêm một Hệ thống / Dự án Kiến trúc mới:
Chỉ cần thêm 1 đối tượng mới vào mảng `"systems"` theo cấu trúc:
```json
{
  "id": "ARCH-NEW07",
  "name": "Tên Giải pháp Kiến trúc Mới",
  "domain": "integration",
  "domainLabel": "Integration Gateway",
  "company": "Tên Doanh nghiệp",
  "period": "2024 – Hiện tại",
  "scale": "Quy mô vận hành",
  "throughput": "5,000 req/s",
  "throughputValue": 5000000,
  "latencyP99": "25 ms",
  "latencyValue": 25,
  "impactScore": 96,
  "status": "healthy",
  "statusText": "SLA 99.99% • Active",
  "summary": "Tóm tắt giải pháp kiến trúc...",
  "problem": "Mô tả bài toán thực tế & điểm nghẽn...",
  "solution": "Mô tả giải pháp kiến trúc đã triển khai...",
  "metrics": [
    { "label": "Chỉ số 1", "value": "Giá trị 1", "delta": "So sánh cải thiện" },
    { "label": "Chỉ số 2", "value": "Giá trị 2", "delta": "So sánh cải thiện" },
    { "label": "Chỉ số 3", "value": "Giá trị 3", "delta": "So sánh cải thiện" },
    { "label": "Chỉ số 4", "value": "Giá trị 4", "delta": "So sánh cải thiện" }
  ],
  "governance": [
    "Nguyên tắc tuân thủ 1...",
    "Nguyên tắc tuân thủ 2..."
  ],
  "techStack": ["C# .NET 8", "Dynamics AX 2012", "Redis", "SQL Server"],
  "telemetryTitle": "Tiêu đề biểu đồ trong Inspector",
  "telemetryUnit": "ms",
  "telemetryThreshold": "Ngưỡng SLA: 100 ms",
  "telemetryPoints": [45, 42, 38, 35, 32, 30, 28, 27, 26, 25, 25, 24],
  "codeSnippet": "// Đoạn code mẫu thực chiến..."
}
```
**Điều gì sẽ tự động diễn ra trên UI?**
1. Bộ đếm trên Sidebar trái (`Kiến trúc & Case Studies`), nút bấm trên Hero và nhãn góc phải bảng tự động tăng từ `6` lên `7`.
2. Nút lọc phân hệ tương ứng (ví dụ `AX Adapter & Gateway`) tự động tăng số đếm từ `(2)` lên `(3)`.
3. Dòng dữ liệu mới xuất hiện trong bảng, hỗ trợ tìm kiếm từ khóa và sắp xếp theo `impactScore`, `latencyValue`, `throughputValue`.
4. Khi người dùng nhấn vào dòng mới, **Right Inspector** tự động hiển thị đầy đủ 4 ô metrics, vẽ biểu đồ SVG Sparkline từ mảng `telemetryPoints` và hiển thị `codeSnippet`.

---

## 4. `telemetry.json` — Biểu đồ Đo lường Hiệu năng Thực tế (Section 3)

Mỗi phần tử trong mảng `"benchmarks"` sẽ tự động dựng một thẻ biểu đồ SVG kích thước lớn (`480x130`).
- Chỉ cần thay đổi mảng số `"points": [92, 88, 81, 65, 50, 43, 38, 35, 34, 33, 32, 32]`, bộ máy UI sẽ tự động tính toán lại tỷ lệ `min`/`max` và vẽ lại đường biểu đồ SVG mượt mà.

---

## 5. `competencies.json` — Hệ sinh thái Kỹ năng (Section 4)

- `categories`: Danh sách các tab lọc kỹ năng (`all`, `erp`, `backend`, `db`...). Bạn có thể thêm nhóm lọc mới vào đây.
- `groups`: Danh sách các khối kỹ năng. Mỗi kỹ năng trong mảng `skills` có dạng:
  - `{ "name": "Dynamics AX 2012 R3", "highlighted": true }` (Chữ đậm nổi bật)
  - `{ "name": "SSRS Reporting", "highlighted": false }` (Chữ màu trung tính hài hòa)

---

## 6. `experience.json` — Lịch sử Chuyên môn & Học vấn (Section 5 & Section 7)

- `experienceSection.roles`: Mảng các giai đoạn công tác. Mỗi vị trí có `title`, `company`, `period`, `accent` (`"primary"` | `"telemetry"` | `"muted"`), `summary`, và mảng `highlights` (`{ "lead": "Tiêu đề in đậm:", "detail": "Nội dung chi tiết..." }`).
- `educationSection.items`: Mảng thông tin bằng cấp học thuật và trường đào tạo.

---

## 7. `governance.json` — Nguyên tắc Tích hợp AX 2012 (Section 6)

- `rules`: Mảng các quy tắc kiến trúc (`RULE 01` → `RULE 06`). Hỗ trợ `status` (`"healthy"`, `"warning"`, `"danger"`) để hiển thị nhãn cảnh báo trực quan.

---

## ✅ Kiểm tra Tính Hợp lệ của JSON sau khi Chỉnh sửa

Sau khi chỉnh sửa bất kỳ file JSON nào, bạn có thể chạy lệnh kiểm tra nhanh trong Terminal để đảm bảo không bị lỗi cú pháp:

```bash
for f in data/*.json; do python3 -m json.tool "$f" > /dev/null && echo "OK: $f"; done
```

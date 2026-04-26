# RMS-AI - Danh Sách Chức Năng & Design Stitch Prompts

## 📋 TỔNG QUAN DỰ ÁN

**RMS-AI** là hệ thống quản lý nhà hàng thông minh tích hợp AI, gồm:
- **Client**: Next.js (App Router, i18n vi/en, shadcn/ui)
- **Server**: Fastify + Prisma (MySQL) + Socket.IO
- **AI**: Gemini / Groq (fallback) – Chatbot đặt món, đặt bàn, thanh toán

---

## 🔖 PHẦN 1: LIỆT KÊ TOÀN BỘ CHỨC NĂNG

### A. TRANG CÔNG KHAI (Public)

| # | Chức năng | Mô tả |
|---|-----------|-------|
| 1 | Trang chủ (Landing) | Banner, danh sách món ăn với giá & đánh giá sao |
| 2 | Chi tiết món ăn | Trang `/dishes/[slug]` – ảnh, mô tả, giá, đánh giá |
| 3 | Đăng nhập quản lý | Form email/password + Google OAuth |
| 4 | Đăng nhập khách (QR) | Quét QR trên bàn → nhập tên → tự động tạo guest session |
| 5 | Đa ngôn ngữ | Hỗ trợ Tiếng Việt & English |
| 6 | AI Chatbot (floating) | Widget chat ở góc phải, hỗ trợ cả khách chưa đăng nhập |
| 7 | Trang About | Giới thiệu nhà hàng |
| 8 | Privacy Policy & Terms | Các trang pháp lý |

### B. TRANG KHÁCH HÀNG (Guest – sau khi quét QR)

| # | Chức năng | Mô tả |
|---|-----------|-------|
| 1 | Menu gọi món | Danh sách món, chọn số lượng, thêm vào giỏ |
| 2 | Giỏ hàng & Đơn hàng | Xem đơn đã gọi, trạng thái real-time |
| 3 | Thanh toán QR | Dialog hiển thị mã QR VietQR chuyển khoản |
| 4 | Đánh giá món ăn | Rating sao (1-5) + bình luận cho từng món đã ăn |
| 5 | AI Chatbot (đăng nhập) | Gọi món, đặt bàn, thanh toán qua chat |
| 6 | Đăng xuất | Xóa refresh token, kết thúc phiên |

### C. TRANG QUẢN LÝ (Manage – Owner/Employee)

| # | Chức năng | Mô tả |
|---|-----------|-------|
| 1 | Dashboard - Tổng doanh thu | Tính từ đơn Paid trong khoảng thời gian |
| 2 | Dashboard - Số khách | Đếm khách có đơn Paid |
| 3 | Dashboard - Số đơn hàng | Tổng đơn trong khoảng thời gian |
| 4 | Dashboard - Bàn đang phục vụ | Bàn có đơn active |
| 5 | Dashboard - Biểu đồ doanh thu | Line chart theo ngày |
| 6 | Dashboard - Biểu đồ món bán chạy | Bar chart |
| 7 | Quản lý Món - CRUD | Thêm/sửa/xóa/xem danh sách món ăn |
| 8 | Quản lý Món - Trạng thái | Available / Unavailable / Hidden |
| 9 | Quản lý Bàn - CRUD | Thêm/sửa/xóa/xem bàn ăn |
| 10 | Quản lý Bàn - QR Code | Tạo/đổi token QR cho bàn |
| 11 | Quản lý Bàn - Auto-release | Tự động giải phóng bàn Reserved hết hạn |
| 12 | Quản lý Đơn hàng - Danh sách | Bảng lọc theo ngày, trạng thái |
| 13 | Quản lý Đơn hàng - Thêm đơn | Admin tạo đơn cho khách |
| 14 | Quản lý Đơn hàng - Cập nhật | Đổi trạng thái, món, số lượng |
| 15 | Quản lý Đơn hàng - Thanh toán | Chuyển trạng thái Paid |
| 16 | Quản lý Đơn hàng - Chi tiết khách | Xem tất cả đơn của 1 khách |
| 17 | Quản lý Nhân viên - CRUD | Thêm/sửa/xóa tài khoản Employee |
| 18 | Cài đặt - Cập nhật hồ sơ | Đổi tên, avatar |
| 19 | Cài đặt - Đổi mật khẩu | Mật khẩu cũ + mới, auto refresh token |

### D. TÍNH NĂNG HỆ THỐNG

| # | Chức năng | Mô tả |
|---|-----------|-------|
| 1 | WebSocket real-time | Cập nhật đơn, bàn, tài khoản theo thời gian thực |
| 2 | JWT Auth | Access + Refresh token cho Account và Guest |
| 3 | Google OAuth | Đăng nhập quản lý bằng Google |
| 4 | Upload ảnh | Upload ảnh món ăn, avatar |
| 5 | DishSnapshot | Lưu thông tin món tại thời điểm đặt |
| 6 | Auto-remove tokens | Job xóa refresh token hết hạn |
| 7 | AI Fallback | Gemini → Groq tự động khi bị rate limit |
| 8 | SEO | sitemap.ts, robots.ts, metadata động |

### E. TÍNH NĂNG AI CHATBOT (Chi tiết)

| # | Chức năng | Mô tả |
|---|-----------|-------|
| 1 | Gợi ý món ăn | Dựa trên rating, gợi ý món 4.5⭐+ |
| 2 | Đặt bàn qua chat | Trích xuất thông tin → tự động đặt bàn |
| 3 | Gọi món (đã đăng nhập) | AI tạo đơn tự động qua lệnh [ORDER] |
| 4 | Gọi món (chưa đăng nhập) | Trích xuất tên + bàn + món → tạo guest + đơn |
| 5 | Thanh toán qua chat | Xác nhận tổng tiền → hiển thị QR VietQR |
| 6 | Nhớ ngữ cảnh | Sử dụng lịch sử chat, không hỏi lại |

---

## 🎨 PHẦN 2: DESIGN STITCH PROMPTS

### 🏠 1. Trang chủ (Landing Page)

```
Design a modern Vietnamese restaurant landing page called "RMS-AI". 

Header: Logo on the left, navigation links (Home, Menu, Login) on the right, language switcher (VI/EN) as a dropdown. Dark navbar with subtle glass effect.

Hero section: Full-width banner image of elegant Vietnamese cuisine, dark overlay with white text. Title "Nhà hàng RMS-AI" in large bold font. Subtitle slogan below. A floating AI chatbot button (circle, bottom-right corner) with a chat icon.

Menu section: Title "Thực đơn nổi bật". Grid layout (2 columns on desktop, 1 on mobile). Each card shows: dish image (150x150, rounded), dish name (bold), description (gray text), price in VND format, and a star rating badge (yellow pill shape with star icon and number like "4.5").

Footer: Restaurant info, social links, copyright.

Color palette: Dark theme with warm accent colors (amber/gold for highlights). Modern typography. Smooth hover animations on cards.
```

### 🔐 2. Trang đăng nhập (Login)

```
Design a login page for restaurant management system "RMS-AI".

Centered card layout on a dark background with subtle gradient.

Login card: White/dark card with rounded corners and shadow. 
- Title "Đăng nhập" at top
- Email input field with label
- Password input field with label and show/hide toggle
- Primary button "Đăng nhập" full width
- Divider line with text "hoặc"
- Google OAuth button with Google icon "Đăng nhập bằng Google"
- Link back to homepage at bottom

The card should feel premium with subtle border glow effect. Form validation: show red text below invalid fields.

Responsive: card takes 400px on desktop, full width with padding on mobile.
```

### 📱 3. Đăng nhập khách qua QR (Guest Login)

```
Design a mobile-first guest login page for a restaurant. The guest arrives at this page by scanning a QR code on their table.

Layout: 
- Restaurant logo at top center
- Title "Chào mừng đến với RMS-AI"
- Subtitle showing table number "Bàn số 3"
- A single input field for guest name with label "Tên của bạn"
- Large primary button "Bắt đầu gọi món"
- A small text at bottom "Quét mã QR trên bàn để bắt đầu"

Design: Warm, welcoming feel. Soft gradient background. Card-style form in center. Rounded corners, shadows. Mobile optimized (375px width). Vietnamese text.
```

### 🍜 4. Menu gọi món (Guest Menu)

```
Design a mobile-first restaurant menu ordering page.

Top: Navigation bar with "Menu" title, back button, and cart icon with badge count.

Content: Scrollable list of dishes. Each dish card has:
- Dish image (square, rounded corners) on the left
- Dish name (bold), short description, price in VND on the right
- Star rating badge if available
- Quantity controls: minus (-) button, number display, plus (+) button
- "Thêm" (Add) button

Bottom: Fixed footer bar showing "Giỏ hàng: 3 món - 150,000đ" with a "Gọi món" (Order) primary button.

Style: Clean white cards on light gray background. Warm accent color for buttons. Smooth transitions when adjusting quantity.
```

### 🛒 5. Đơn hàng khách (Guest Orders)

```
Design a mobile-first order tracking page for restaurant guests.

Top bar: "Đơn hàng của bạn" title.

Order list: Cards grouped by status with color-coded badges:
- "Chờ xử lý" (Pending) - yellow/amber badge
- "Đang chế biến" (Processing) - blue badge  
- "Đã giao" (Delivered) - green badge
- "Đã thanh toán" (Paid) - gray badge
- "Từ chối" (Rejected) - red badge

Each order card shows: dish image (small), dish name, quantity, unit price, subtotal.

Bottom section: Total amount in bold. Two buttons: "Thanh toán tại quầy" (secondary) and "Thanh toán chuyển khoản" (primary, opens QR dialog).

QR Payment Dialog: Modal showing VietQR code image, bank info, transfer amount, and instruction text.

Style: Clean, status-focused design. Color-coded progress indicators.
```

### ⭐ 6. Đánh giá món ăn (Guest Review)

```
Design a mobile-first dish review page for restaurant guests.

Title: "Đánh giá món ăn"

List of dishes the guest has ordered. Each dish card shows:
- Dish image
- Dish name and price
- 5-star rating selector (interactive, yellow filled stars)
- Text area for comment (optional)
- "Gửi đánh giá" submit button
- If already reviewed: show the existing rating and comment with a "Đã đánh giá" badge

Style: Warm tones, large tap-friendly star buttons for mobile. Cards with subtle shadows.
```

### 🤖 7. AI Chatbot Widget

```
Design a floating AI chatbot widget for a restaurant app.

Collapsed state: Circular button (56px) at bottom-right corner with chat bubble icon, subtle pulse animation, shadow.

Expanded state: Chat card (400px wide, 500px tall) sliding up from bottom-right.
- Header: Primary color background, bot icon, title "Trợ lý ảo RMS-AI", close X button
- Chat area: Scrollable message list
  - AI messages: Left-aligned, light gray bubbles, small bot icon, "RMS-AI" label
  - User messages: Right-aligned, primary color bubbles, user icon, "Bạn" label
  - Typing indicator: Three animated bouncing dots
  - QR code image embedded in chat bubble (for payment)
- Footer: Input field "Nhập tin nhắn..." with send button icon

Style: Modern chat UI, smooth slide-in animation, glassmorphism card effect, auto-scroll to bottom.
```

### 📊 8. Dashboard quản lý

```
Design a restaurant management dashboard page.

Left sidebar: Dark sidebar with logo "RMS-AI" at top, navigation links with icons:
- Dashboard (chart icon, active/highlighted)
- Đơn hàng (order icon)
- Bàn ăn (table icon)
- Món ăn (dish icon)
- Nhân viên (people icon)
- Cài đặt (settings icon)
- Avatar dropdown at bottom with name and logout

Top bar: Date range picker (from date - to date), user avatar dropdown.

Main content - 4 KPI cards in a row:
- Doanh thu (Revenue): large number in VND, green up arrow
- Khách hàng (Guests): count with icon
- Đơn hàng (Orders): count with icon
- Bàn đang phục vụ (Active Tables): count with icon

Charts section (2 columns):
- Left: Line chart "Doanh thu theo ngày" with smooth curve, gradient fill
- Right: Bar chart "Món ăn bán chạy" horizontal bars with dish names

Style: Dark theme dashboard. Cards with subtle gradients. Professional admin feel.
```

### 🍽️ 9. Quản lý Món ăn

```
Design a dish management page for restaurant admin panel.

Top section: Title "Quản lý món ăn", "Thêm món" primary button on the right.

Data table with columns:
- ID, Ảnh (thumbnail 50x50), Tên món, Giá (VND), Đánh giá (stars), Trạng thái (badge: Available=green, Unavailable=red, Hidden=gray), Hành động (Edit/Delete icons)

Table features: Search input, column sorting, pagination.

Add/Edit Dialog: Modal form with image upload preview, inputs for name/price/description, status dropdown, Cancel and Save buttons.

Style: Clean admin table. Hover row highlight. Status badges with color coding. Modal with smooth animation.
```

### 🪑 10. Quản lý Bàn ăn

```
Design a table management page for restaurant admin.

Top: Title "Quản lý bàn ăn", "Thêm bàn" button.

Data table columns: Số bàn, Sức chứa, Trạng thái (Available=green, Reserved=amber, Hidden=gray), QR Code link, Hành động (Edit/Delete).

Edit Dialog: Input capacity, select status, toggle "Đổi QR Code" with warning text.
Add Dialog: Input table number and capacity.

Style: Admin panel style. Warning alerts for destructive actions.
```

### 📋 11. Quản lý Đơn hàng

```
Design an order management page for restaurant admin.

Top: Title "Quản lý đơn hàng", date filter, "Thêm đơn" button.

Statistics bar: 5 cards showing counts by status (Pending=yellow, Processing=blue, Delivered=green, Paid=gray, Rejected=red).

Data table: Order ID, dish thumbnail, dish name, table number, guest name, quantity, price, total, status dropdown, handler, timestamp.

Add Order Dialog: Select guest → Select dishes with quantity → Confirm.
Guest Orders Dialog: All orders from a guest with total and "Thanh toán" button.

Style: Dense operational table. Quick inline status updates. Filter tabs.
```

### 👥 12. Quản lý Nhân viên

```
Design an employee management page for restaurant admin.

Top: Title "Quản lý nhân viên", "Thêm nhân viên" button.

Data table: ID, Avatar (circular), Tên, Email, Vai trò (Owner=purple, Employee=blue badge), Ngày tạo, Edit/Delete actions.

Add Dialog: Avatar upload, name, email, password, confirm password inputs.
Edit Dialog: Same as add plus toggle "Đổi mật khẩu" and role dropdown.

Style: Professional admin table with avatar display and role badges.
```

### ⚙️ 13. Cài đặt (Settings)

```
Design a settings/profile page for restaurant admin.

Section 1 - "Cập nhật hồ sơ": Circular avatar with upload, name input, email (read-only), save button.

Section 2 - "Đổi mật khẩu": Current password, new password, confirm password inputs with show/hide toggles. Password strength indicator. Submit button.

Style: Clean form layout with cards. Consistent with admin panel design.
```

### 🍜 14. Chi tiết món ăn (Public)

```
Design a public dish detail page for a restaurant website.

Layout (2 columns desktop, stacked mobile):
- Left: Large dish image with rounded corners
- Right: Dish name (heading), star rating + review count, price in VND, status badge, description text

Reviews section below: Title "Đánh giá từ khách hàng", review cards with guest name, stars, comment, date. Empty state text.

Style: Clean product detail page. High-quality food image presentation.
```

### 📱 15. Mobile Navigation

```
Design a responsive mobile navigation for restaurant website.

Mobile header: Hamburger menu left, logo "RMS-AI" center, language switcher right.

Slide-out menu: Full height overlay, navigation links stacked (Home, Menu, Orders, Review, Login/Manage, Logout).

Logout dialog: "Bạn có muốn đăng xuất không?" with Cancel and OK buttons.

Style: Smooth slide animation. Touch-friendly large tap targets.
```

---

> **Cách sử dụng**: Copy từng prompt và paste vào Google Design Stitch. Mỗi prompt = 1 màn hình. Có thể tùy chỉnh màu sắc, font theo brand riêng.

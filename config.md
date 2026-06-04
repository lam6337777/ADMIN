# System Architecture & Design Principles

## Color Palette (Monochrome Focus)

- **Primary Colors**:
  - Background: `#FFFFFF` (Pure White)
  - Foreground: `#000000` (Pure Black)
- **Secondary / Effect Colors**:
  - Hover / Active State: `#F5F5F5` (Light Gray) / `rgba(0,0,0,0.05)`
  - Borders: `#E5E5E5` (Soft Gray)
  - Subtext / Muted: `#737373` (Medium Gray)
  - Accent / Contrast: `#171717` (Charcoal Black)

## Theme Rules

- **Strict Mode**: Chỉ sử dụng tông màu đen, trắng và xám (Monochrome).
- **No Dark Mode**: Không hỗ trợ chế độ Dark Mode của hệ thống. Ứng dụng luôn duy trì giao diện sáng tối giản.
- **Interactions**: Sử dụng hiệu ứng `transition: all 0.2s ease-in-out` cho các trạng thái hover/active.
- **Typography**: Ưu tiên các font chữ không chân (sans-serif) hiện đại để tạo cảm giác tinh tế.
  ## 2. Hướng dẫn sử dụng

  ### 2.1. Trong file CSS (`globals.css`)
  Các biến này được khai báo trong `:root` (mặc định Light Mode) và `.dark` (Dark Mode).

  ```css
  :root {
    /* Functional */
    --color-up: #00C087;
    --color-down: #FF4D4F;
    --color-warning: #F0B90B;
    --color-primary: #1890FF;

    /* Light Mode */
    --bg-primary: #FFFFFF;
    --bg-secondary: #F5F5F5;
    --text-primary: #141414;
    --text-secondary: #8C8C8C;
    --border-color: #E8E8E8;
    --bg-hover: #f0f0f0; /* Ví dụ cho light mode */
  }

  .dark {
    /* Dark Mode */
    --bg-primary: #0B0E11;
    --bg-secondary: #1E2329;
    --text-primary: #EAECEF;
    --text-secondary: #848E9C;
    --border-color: #323943;
    --bg-hover: #2B3139;
  }
  ```

  ### 2.2. Trong CSS Modules (`*.module.css`)
  Luôn sử dụng biến CSS thay vì hardcode mã hex.

  ```css
  /* button.module.css */
  .btnBuy {
    background-color: var(--color-up);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 4px;
  }

  .card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
  }
  ```

  ### 2.3. Trong Component React
  Import và sử dụng thông qua đối tượng `styles`.

  ```tsx
  import styles from './Trade.module.css';

  export default function TradeButton() {
    return (
      <button className={styles.btnBuy}>
        Buy
      </button>
    );
  }
  ```
  ### 2.4 Luôn phải responsive
  ## 3. Cấu trúc dự án (Project Structure)
  Dự án được tổ chức theo mô hình Next.js App Router với các quy định cụ thể cho từng thư mục:

  - **/app**: Trung tâm của ứng dụng. Chứa các routes (files `page.tsx`), layouts (`layout.tsx`), và providers.
  - **/components**: Chứa các UI Components. **Tuyệt đối không để file component lẻ tẻ trực tiếp trong thư mục này.**
      - **/ui**: Các atomic components dùng chung toàn dự án (Button, Modal, Input, Scrollbar...).
      - **/layout**: Các thành phần khung của ứng dụng (Navbar, Sidebar, Footer).
      - **/shared**: Các components phức hợp dùng chung cho nhiều tính năng nhưng không phải atomic UI.
      - **/[feature-name]**: Các thư mục theo chức năng cụ thể (ví dụ: `/trade`, `/wallet`, `/auth`, `/market`). Mỗi thư mục này chứa các components chỉ phục vụ riêng cho chức năng đó.
  - **/lib**: Chứa các tiện ích (utilities), cấu hình API client, và các helper functions dùng chung (ví dụ: `utils.ts` chứa hàm `cn`).
  - **/hooks**: Chứa các Custom React Hooks để xử lý logic state hoặc side effects tách biệt khỏi UI.
  - **/services**: Chứa các logic gọi API, tích hợp dịch vụ bên ngoài hoặc kết nối database.
  - **/types**: Nơi tập trung tất cả các định nghĩa TypeScript (Interfaces, Types) của hệ thống.
  - **/store**: Nơi tập trung logic quản lý State Global.
      - **/redux**: Chứa các Slices, Store configuration, và Middlewares của **Redux Toolkit**.
      - **/context**: (Nếu cần) Chứa các React Context cho các state đơn giản hoặc UI-only.
  - **/public**: Chứa tài nguyên tĩnh: Images, Icons, Fonts, và các file public khác.   
  ## 4. Quản lý State (State Management)
  Dự án **VixEx** sử dụng bộ thư viện sau để quản lý trạng thái:

  ### 4.1. Redux Toolkit (RTK)
  Sử dụng cho các trạng thái phức tạp, dữ liệu trading (Order Book, Trade History, User Balance).
  - **Thư mục**: `/store/redux`
  - **Quy tắc**:
      - Sử dụng `createSlice` để định nghĩa logic reducer và action.
      - Sử dụng `createAsyncThunk` cho các API calls bất đồng bộ.
      - Luôn sử dụng `useAppSelector` và `useAppDispatch` (typed hooks) để truy xuất dữ liệu.

  ### 4.2. Local State & Context
  - **useState / useReducer**: Sử dụng cho logic nội bộ của component.
  - **React Context**: Sử dụng cho các trạng thái đơn giản liên quan đến giao diện (ví dụ: Theme, Sidebar Toggle, Language) mà không cần sự phức tạp của Redux.

  ## 5. Nguyên tắc viết code (Coding Principles)

  ### 5.1. TypeScript & Type Safety
  - Luôn định nghĩa kiểu dữ liệu cho props, giá trị trả về của hàm và biến.
  - Tuyệt đối hạn chế sử dụng `any`. Trong trường hợp chưa rõ kiểu, hãy sử dụng `unknown`.

  ### 5.2. Quy trình viết Component
  - **Atomic Design & Functional Grouping**: 
      - Chia nhỏ component để dễ quản lý. Một component không nên vượt quá 250 dòng code.
      - **Tổ chức thư mục**: Mỗi chức năng lớn (Feature) phải có thư mục riêng trong `/components/[feature-name]`. **Không viết tràn lan các file component trực tiếp trong thư mục `/components`.**
      - Nếu một component chỉ dùng ở một trang duy nhất và không tái sử dụng, có thể cân nhắc đặt trong thư mục `_components` bên trong thư mục của trang đó trong `/app`.
  - **Server Components**: Mặc định sử dụng Server Components. Chỉ sử dụng `'use client'` khi có tương tác người dùng (hooks, event listeners).
  - **Props**: Luôn sử dụng destructing cho props và định nghĩa kiểu dữ liệu rõ ràng.

  ### 5.3. Styling (Custom CSS & CSS Modules)
  - **Tuyệt đối không sử dụng Tailwind CSS**.
  - Sử dụng **CSS Modules** (`*.module.css`) cho từng component để tránh xung đột style.
  - Tất cả các mã màu phải sử dụng biến CSS từ `globals.css` (ví dụ: `var(--bg-primary)`).
  - Không hardcode mã màu hex/rgb trực tiếp trong file CSS.

  ### 5.4. Naming Convention (Quy ước đặt tên)
  - **Thư mục & File**: camelCase hoặc kebab-case (nhất quán theo cấu trúc hiện tại).
  - **React Components**: PascalCase (ví dụ: `TradeOrderPanel.tsx`).
  - **Function & Variables**: camelCase (ví dụ: `handleOrderSubmit`).
  - **Constants**: UPPER_SNAKE_CASE (ví dụ: `BASE_URL`).

  ### 5.5. Comments & Documentation
  - **Ngôn ngữ**: Viết comment bằng **Tiếng Việt**.
  - Viết comment ngắn gọn tập trung vào **giải thích logic xử lý phức tạp** hoặc **nghiệp vụ đặc thù**. Không cần comment cho những đoạn code quá hiển nhiên.
  - Sử dụng JSDoc cho các hàm quan trọng để hỗ trợ gợi ý code (IntelliSense).

  ## 6. Tối ưu hóa & Bảo trì (Optimization & Maintenance)
  Code không chỉ cần chạy đúng mà còn phải hiệu quả và dễ dàng bảo trì trong tương lai.

  ### 6.1. Hiệu suất (Performance)
  - **Tối ưu Re-render**: Sử dụng `useMemo` cho các tính toán nặng và `useCallback` cho các function truyền vào memoized components.
  - **Lazy Loading**: Sử dụng `next/dynamic` cho các components lớn (ví dụ: Biểu đồ TradingView) hoặc các phần không hiển thị ngay lập tức (Modals, Drawers).
  - **Xử lý dữ liệu lớn**: Với các bảng dữ liệu (Order Book, Trade History), ưu tiên sử dụng virtual scrolling hoặc pagination để đảm bảo mượt mà.

  ### 6.2. Khả năng bảo trì (Clean Code)
  - **Nguyên tắc DRY (Don't Repeat Yourself)**: Logic dùng từ 2 lần trở lên phải được tách ra thành Custom Hooks hoặc Utility Functions (`/lib`).
  - **Single Responsibility**: Mỗi component/hàm chỉ nên làm một việc duy nhất và làm tốt việc đó.
  - **Biến/Hàm tự giải thích**: Tên biến và hàm phải phản ánh đúng ý nghĩa và tác dụng, hạn chế sử dụng từ viết tắt khó hiểu.

  ### 6.3. Refactoring định kỳ
  - Luôn dành thời gian Review và Refactor lại các đoạn code "tạm thời" ngay khi có thể.
  - Xóa bỏ các đoạn code thừa, file không sử dụng (dead code) để giữ project gọn nhẹ.

  ## 7. Thư viện UI & Icons (UI Libraries & Icons)
  Để đảm bảo giao diện chuyên nghiệp và nhất quán, dự án sử dụng các thư viện sau:

  ### 7.1. Ant Design (Antd)
  - **Mục đích**: Sử dụng cho các component phức tạp (Table, Modal, Select, DatePicker, Form).
  - **Quy tắc**:
      - Ưu tiên sử dụng các components của Antd nếu chúng đáp ứng được yêu cầu về chức năng.
      - Style lại thông qua **ConfigProvider** (Theme customization) hoặc ghi đè bằng **CSS Modules** nếu cần thiết.

  ### 7.2. Icons
  - **Tuyệt đối không sử dụng icon sẵn (emojis) hoặc icon tự vẽ lẻ tẻ**.
  - Sử dụng thư viện: **`lucide-react`** hoặc **`@ant-design/icons`**.
  - **Quy tắc**: Luôn sử dụng icon từ thư viện để đảm bảo độ sắc nét (SVG) và tính nhất quán (stroke weight, size).
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nút dev của Next.js mặc định ở góc trái dưới sẽ che nút "Xem cửa hàng" của sidebar
  devIndicators: { position: 'bottom-right' },
};

export default nextConfig;

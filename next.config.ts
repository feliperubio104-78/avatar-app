import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Evita el error/advertencia de Turbopack cuando hay config tipo webpack (next-pwa)
  turbopack: {},
};

export default withPWA(nextConfig);
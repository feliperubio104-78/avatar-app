// types/next-pwa.d.ts
declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAPluginOptions = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    [key: string]: any;
  };

  export default function withPWAInit(
    options?: PWAPluginOptions
  ): (nextConfig: NextConfig) => NextConfig;
}
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mantemos a config simples de propósito: este é um app pessoal onde
  // frescor dos dados (editados até por IA via API) importa mais do que
  // otimizações agressivas de cache.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

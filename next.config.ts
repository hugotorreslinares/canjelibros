import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El catálogo pasó de /catalogo a la raíz. La dirección vieja estaba en el
  // sitemap, así que redirige en vez de dar 404 y se lleva consigo lo que
  // hubiera ganado en los buscadores. Permanente = 308.
  async redirects() {
    return [{ source: "/catalogo", destination: "/", permanent: true }];
  },
};

export default nextConfig;

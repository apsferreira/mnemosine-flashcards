import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone: cria um servidor Node.js mínimo e auto-contido para Docker.
  // Sem isso, o container precisaria de node_modules inteiro (~500MB).
  // Com isso: apenas os arquivos necessários são copiados (~50MB).
  output: "standalone",
};

export default nextConfig;

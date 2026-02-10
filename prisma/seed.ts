import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_SEED_PASSWORD environment variable is required for seeding");
  }
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@matri-x-algo.wiki" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@matri-x-algo.wiki",
      name: "Matri-X Admin",
      password: await hash(adminPassword, 12),
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Sample algorithm updates
  await prisma.algorithmUpdate.createMany({
    data: [
      {
        title: "リプライの重み付けが150xから120xに変更",
        description: "X社の最新コミットにより、リプライ+著者リプライの重み付けが150xから120xに引き下げられました。これにより、いいねやリポストの相対的な重要度が上がります。",
        source: "https://github.com/twitter/the-algorithm/commit/example1",
        impact: "HIGH",
        category: "エンゲージメント",
      },
      {
        title: "SimClusters v3への移行が進行中",
        description: "従来のSimClusters v2からv3への移行が進んでいます。v3ではクラスター数が145,000から200,000に増加し、よりきめ細かい推薦が可能になります。",
        source: "https://github.com/twitter/the-algorithm/commit/example2",
        impact: "CRITICAL",
        category: "SimClusters",
      },
      {
        title: "動画コンテンツのブースト倍率が3.0xから3.5xに上昇",
        description: "動画コンテンツの推薦スコアブースト倍率が引き上げられました。ショート動画（60秒未満）に対してはさらに+0.5xの追加ブーストが適用されます。",
        source: "https://github.com/twitter/the-algorithm/commit/example3",
        impact: "MEDIUM",
        category: "メディア",
      },
    ],
  });
  console.log("Sample algorithm updates created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

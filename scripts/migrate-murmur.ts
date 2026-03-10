/**
 * MURMUR → Whisper Migration Script
 * 
 * Migrates existing ForumPost records with category=MURMUR to the Whisper table.
 * - Preserves author, content (truncated to 280 chars), and createdAt
 * - Marks migrated ForumPosts as status=REMOVED
 * 
 * Usage:
 *   npx tsx scripts/migrate-murmur.ts --dry-run   # Preview only
 *   npx tsx scripts/migrate-murmur.ts              # Execute migration
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log(`\n🔄 MURMUR → Whisper Migration${isDryRun ? " (DRY RUN)" : ""}\n`);

  // Find all MURMUR posts that haven't been removed yet
  const murmurPosts = await prisma.forumPost.findMany({
    where: {
      category: "MURMUR",
      status: { not: "REMOVED" },
    },
    select: {
      id: true,
      content: true,
      authorId: true,
      createdAt: true,
      title: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📊 Found ${murmurPosts.length} MURMUR posts to migrate\n`);

  if (murmurPosts.length === 0) {
    console.log("✅ Nothing to migrate. All clean!");
    return;
  }

  // Preview
  for (const post of murmurPosts) {
    const truncated = post.content.slice(0, 50).replace(/\n/g, " ");
    console.log(`  - [${post.id.slice(0, 8)}] "${post.title}" → "${truncated}..."`);
  }

  if (isDryRun) {
    console.log(`\n⏸️  Dry run complete. ${murmurPosts.length} posts would be migrated.`);
    console.log("   Run without --dry-run to execute.\n");
    return;
  }

  // Execute migration in a transaction
  let migrated = 0;
  let skipped = 0;

  await prisma.$transaction(async (tx) => {
    for (const post of murmurPosts) {
      try {
        // Create Whisper from MURMUR post
        await tx.whisper.create({
          data: {
            content: post.content.slice(0, 280), // Whisper has 280 char limit
            authorId: post.authorId,
            createdAt: post.createdAt,
          },
        });

        // Mark original ForumPost as REMOVED
        await tx.forumPost.update({
          where: { id: post.id },
          data: { status: "REMOVED" },
        });

        migrated++;
      } catch (error) {
        console.error(`  ❌ Failed to migrate post ${post.id}:`, error);
        skipped++;
      }
    }
  });

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Total MURMUR posts processed: ${murmurPosts.length}\n`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { v4 as uuid }from "uuid"

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function ulid(): string {
  // Simple ULID-compatible stub (timestamp + random) for seeding purposes.
  // In production your schema handles this via @default(ulid()).
  const timestamp = Date.now().toString(36).toUpperCase().padStart(10, "0");
  const random = Math.random().toString(36).slice(2, 18).toUpperCase().padStart(16, "0");
  return (timestamp + random).slice(0, 26);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Message Templates ───────────────────────────────────────────────────────

const messagePool = [
  "Hey, how are you doing?",
  "Did you see the game last night?",
  "Can we sync up later today?",
  "Just pushed the fix, can you review it?",
  "What time works for a call?",
  "I'll send the files over shortly.",
  "That sounds like a great idea!",
  "Let me check and get back to you.",
  "Are you free this weekend?",
  "The build is finally passing 🎉",
  "Can you share the docs link?",
  "I think we need to rethink this approach.",
  "On it! Give me 10 minutes.",
  "Sounds good, let's do it.",
  "Have you read that article I sent?",
  "lol yeah that was unexpected 😂",
  "Meeting got pushed to 3pm FYI.",
  "Almost done with the feature, just testing now.",
  "Want to grab coffee virtually?",
  "Good morning! Ready for the sprint review?",
  "I'll be a few minutes late, sorry!",
  "Ping me when you're free.",
  "The client loved the new design.",
  "We're shipping tomorrow, fingers crossed 🤞",
  "Can someone help me with this bug?",
  "Deployed to staging — please test.",
  "Thanks, really appreciate the help!",
  "I think there's a conflict in the PR.",
  "All tests passing ✅",
  "Running late, start without me.",
  "Quick question about the API schema.",
  "Does this look right to you?",
  "Looks great, ship it!",
  "Just saw your message, sorry for the delay.",
  "Can you take a look at issue #42?",
  "The database migration ran successfully.",
  "I'm getting a 401 on that endpoint.",
  "Fixed! It was a missing env variable.",
  "Happy Friday! Almost there 🙌",
  "Let's move this to a separate ticket.",
  "Who's on call this week?",
  "Can you update the README?",
  "I'll handle the deployment.",
  "Retro at 4pm, don't forget!",
  "The feature flag is live.",
  "Rolling back — found a regression.",
  "New release notes are up.",
  "Standup in 5 minutes!",
  "This is taking longer than expected.",
  "LGTM 👍",
];

// ─── Users ───────────────────────────────────────────────────────────────────

const usersData = [
  {
    email: "alice@example.com",
    userName: "alice",
    name: "Alice Johnson",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    role: "USER" as const,
  },
  {
    email: "bob@example.com",
    userName: "bob",
    name: "Bob Smith",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    role: "USER" as const,
  },
  {
    email: "carol@example.com",
    userName: "carol",
    name: "Carol Williams",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    role: "USER" as const,
  },
  {
    email: "dave@example.com",
    userName: "dave",
    name: "Dave Brown",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dave",
    role: "USER" as const,
  },
  {
    email: "eve@example.com",
    userName: "eve",
    name: "Eve Davis",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=eve",
    role: "USER" as const,
  },
  {
    email: "admin@example.com",
    userName: "admin",
    name: "Admin User",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    role: "ADMIN" as const,
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Clean existing data (order matters for FK constraints) ──────────────
  console.log("🗑️  Cleaning existing data...");
  await prisma.message.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log("   Done.\n");

  // ── 2. Create users ────────────────────────────────────────────────────────
  console.log("👤 Creating users...");
  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.create({
        data: {
          id: ulid(),
          email: u.email,
          userName: u.userName,
          name: u.name,
          avatarUrl: u.avatarUrl,
          role: u.role,
          emailVerified: true,
          // password omitted — use Better Auth / OAuth in practice
        },
      })
    )
  );
  console.log(`   Created ${users.length} users.\n`);

  // ── 3. Create sessions for each user ──────────────────────────────────────
  console.log("🔐 Creating sessions...");
  await Promise.all(
    users.map((user) =>
      prisma.session.create({
        data: {
          id: uuid(),
          token: uuid(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 (seed script)",
        },
      })
    )
  );
  console.log(`   Created ${users.length} sessions.\n`);

  // ── 4. Build conversation pairs ────────────────────────────────────────────
  // Every unique pair of users gets a conversation thread.
  type Pair = { a: (typeof users)[0]; b: (typeof users)[0] };
  const pairs: Pair[] = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      pairs.push({ a: users[i], b: users[j] });
    }
  }

  // ── 5. Seed messages ───────────────────────────────────────────────────────
  //   • Alice ↔ Bob  : 120 messages (deep pagination test)
  //   • Other pairs  : 40 messages each
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180);

  console.log("💬 Seeding messages...");

  let totalMessages = 0;

  for (const { a, b } of pairs) {
    const isAliceBob =
      (a.userName === "alice" && b.userName === "bob") ||
      (a.userName === "bob" && b.userName === "alice");

    const count = isAliceBob ? 120 : 40;

    const messages = Array.from({ length: count }, (_, idx) => {
      // Alternate sender so the conversation feels natural
      const senderIsA = idx % 2 === 0;
      const senderId = senderIsA ? a.id : b.id;
      const receiverId = senderIsA ? b.id : a.id;

      // Space messages evenly across the date range so cursor-based
      // pagination can page through them chronologically.
      const fraction = idx / count;
      const createdAt = new Date(
        sixMonthsAgo.getTime() + fraction * (now.getTime() - sixMonthsAgo.getTime())
      );

      return {
        id: uuid(),
        text: pickRandom(messagePool),
        senderId,
        receiverId,
        createdAt,
        updatedAt: createdAt,
      };
    });

    // Batch insert with createMany for speed
    await prisma.message.createMany({ data: messages });
    totalMessages += messages.length;

    console.log(
      `   ${a.userName} ↔ ${b.userName}: ${count} messages seeded.`
    );
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Users    : ${users.length}`);
  console.log(`   Sessions : ${users.length}`);
  console.log(`   Messages : ${totalMessages}`);
  console.log(`\nTest credentials (no password set — use OAuth / magic link):`);
  users.forEach((u) => console.log(`   • ${u.email}  [${u.role}]`));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
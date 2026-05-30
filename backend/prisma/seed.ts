import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function ulid(): string {
  const timestamp = Date.now().toString(36).toUpperCase().padStart(10, "0");
  const random = Math.random().toString(36).slice(2, 18).toUpperCase().padStart(16, "0");
  return (timestamp + random).slice(0, 26);
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

// ─── Rooms ────────────────────────────────────────────────────────────────────

const roomsData = [
  {
    slug: "general",
    description: "General discussion for everyone",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=general",
  },
  {
    slug: "engineering",
    description: "Engineering team chat",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=engineering",
  },
  {
    slug: "random",
    description: "Off-topic and fun stuff",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=random",
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Clean existing data (order matters for FK constraints) ──────────────
  console.log("🗑️  Cleaning existing data...");
  await prisma.message.deleteMany();
  await prisma.room.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log("   Done.\n");

  // ── 2. Create users ────────────────────────────────────────────────────────
  console.log("👤 Creating users...");
  const DEFAULT_PASSWORD = "Password@123";
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

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
          password: hashedPassword,
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

  // ── 4. Create rooms ────────────────────────────────────────────────────────
  // admin user is the admin of all rooms; all users are members.
  console.log("🏠 Creating rooms...");
  const adminUser = users.find((u) => u.userName === "admin")!;
  const regularUsers = users.filter((u) => u.userName !== "admin");

  const rooms = await Promise.all(
    roomsData.map((r) =>
      prisma.room.create({
        data: {
          id: ulid(),
          slug: r.slug,
          description: r.description,
          avatarUrl: r.avatarUrl,
          adminId: adminUser.id,
          member: {
            connect: users.map((u) => ({ id: u.id })),
          },
        },
      })
    )
  );
  console.log(`   Created ${rooms.length} rooms.\n`);

  // ── 5. Seed direct messages ────────────────────────────────────────────────
  //   • Alice ↔ Bob  : 120 messages (deep pagination test)
  //   • Other pairs  : 40 messages each
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180);

  type Pair = { a: (typeof users)[0]; b: (typeof users)[0] };
  const pairs: Pair[] = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      pairs.push({ a: users[i], b: users[j] });
    }
  }

  console.log("💬 Seeding direct messages...");
  let totalDMs = 0;

  for (const { a, b } of pairs) {
    const isAliceBob =
      (a.userName === "alice" && b.userName === "bob") ||
      (a.userName === "bob" && b.userName === "alice");

    const count = isAliceBob ? 120 : 40;

    const messages = Array.from({ length: count }, (_, idx) => {
      const senderIsA = idx % 2 === 0;
      const senderId = senderIsA ? a.id : b.id;
      const receiverId = senderIsA ? b.id : a.id;

      const fraction = idx / count;
      const createdAt = new Date(
        sixMonthsAgo.getTime() +
          fraction * (now.getTime() - sixMonthsAgo.getTime())
      );

      return {
        id: uuid(),
        text: pickRandom(messagePool),
        senderId,
        receiverId,
        roomId: null,
        createdAt,
        updatedAt: createdAt,
      };
    });

    await prisma.message.createMany({ data: messages });
    totalDMs += messages.length;

    console.log(
      `   ${a.userName} ↔ ${b.userName}: ${count} messages seeded.`
    );
  }

  // ── 6. Seed room messages ──────────────────────────────────────────────────
  console.log("\n💬 Seeding room messages...");
  let totalRoomMessages = 0;

  for (const room of rooms) {
    // Each room gets 60 messages spread across all members
    const count = 60;

    const messages = Array.from({ length: count }, (_, idx) => {
      const sender = pickRandom(users);
      const fraction = idx / count;
      const createdAt = new Date(
        sixMonthsAgo.getTime() +
          fraction * (now.getTime() - sixMonthsAgo.getTime())
      );

      return {
        id: uuid(),
        text: pickRandom(messagePool),
        senderId: sender.id,
        receiverId: null,
        roomId: room.id,
        createdAt,
        updatedAt: createdAt,
      };
    });

    await prisma.message.createMany({ data: messages });
    totalRoomMessages += messages.length;

    console.log(`   #${room.slug}: ${count} messages seeded.`);
  }

  // ── 7. Summary ─────────────────────────────────────────────────────────────
  console.log(`\n✅ Seed complete!`);
  console.log(`   Users         : ${users.length}`);
  console.log(`   Sessions      : ${users.length}`);
  console.log(`   Rooms         : ${rooms.length}`);
  console.log(`   Direct msgs   : ${totalDMs}`);
  console.log(`   Room msgs     : ${totalRoomMessages}`);
  console.log(
    `   Total msgs    : ${totalDMs + totalRoomMessages}`
  );
  console.log(
    `\nTest credentials (no password set — use OAuth / magic link):`
  );
  users.forEach((u) => console.log(`   • ${u.email}  [${u.role}]  password: ${DEFAULT_PASSWORD}`));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
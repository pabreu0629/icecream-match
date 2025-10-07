import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PEOPLE = [
  "Akshay", "Beth", "Carmen", "Christina", "Dan", "Felipe",
  "Greg", "Jeff", "John Heflin", "John Petrie", "Mei Lan", "Nitin",
  "Steve"
];

const MANAGER_PICKS: Record<string, { flavor: string; reason: string }> = {
  Greg:        { flavor: "Brown Butter Almond Brittle", reason: "Quiet, steady, but with unforgettable bursts of greatness — like his ESPN-highlight moment. A classic with hidden crunch and flair." },
  Beth:        { flavor: "Brambleberry Crisp",         reason: "Rustic, vibrant, and deeply connected to nature — just like her love for the outdoors. The tart berries and oat streusel reflect her adventurous side and wholesome, family-centered roots." },
  Mei_Lan:     { flavor: "Gooey Butter Cake",          reason: "The team’s secret weapon. Understated at first, but once you know it, it’s rich, layered, and loved by everyone." },
  John_Heflin: { flavor: "Nebula Berry",               reason: "The behind-the-scenes problem solver. Rare, mysterious, and layered, just like his ability to take on complexity and make life easier for the team." },
  John_Petrie: { flavor: "Miso Butterscotch Brownie",  reason: "Organized, refined, and curates with thoughtfulness. The miso twist makes this classy and unique, just like John’s ability to find that special differentiator." },
  Akshay:      { flavor: "Darkest Chocolate",          reason: "The anchor leader. Bold, intense, and uncompromising, it reflects his intellect and the strength he brings to guiding the team while balancing family life." },
  Felipe:      { flavor: "Pineapple Upside Down Cake", reason: "Passionate and action-oriented with Latin flair. Bright, bold, and full of energy — the perfect reflection of his leadership style." },
  Jeff:        { flavor: "Powdered Jelly Donut",       reason: "Playful, outgoing, and full of comfort-food energy. Just like Jeff’s fast-food love, it’s fun, nostalgic, and impossible not to smile at." },
  Dan:         { flavor: "Sweet Cream",                reason: "The bedrock of finance. Pure, dependable, and essential — the flavor that quietly makes everything else possible, just like Dan." },
  Carmen:      { flavor: "Strawberry Buttermilk",      reason: "Quiet yet warm, rooted in family, and jovial in spirit. A gentle classic that uplifts without being loud." },
  Steve:       { flavor: "Skillet Cinnamon Roll",      reason: "The mentor and family guy. Warm, comforting, and shareable — just like his teaching spirit and protective care for the team." },
  Nitin:       { flavor: "Middle West Whiskey & Pecans", reason: "The bachelor-at-heart. Bold, indulgent, and sophisticated, it reflects his fast cars, weekend adventures, and cosmopolitan flair." },
  Christina:   { flavor: "Watermelon Taffy",           reason: "Expressive, bold, and impossible to miss — you always know what she’s thinking, just like you always know what this vibrant flavor is." }
};

async function main() {
  const host = (() => {
    try { return new URL(process.env.DATABASE_URL || "").host || "(no DATABASE_URL)"; }
    catch { return "(invalid DATABASE_URL)"; }
  })();
  console.log("Seeding DB host:", host);

  // If you want to hard-sync names (delete others), uncomment:
  await prisma.person.deleteMany({ where: { name: { notIn: PEOPLE } } });

  for (const name of PEOPLE) {
    const key = name.replace(/\s+/g, "_");         // supports both "John Heflin" and "John_Heflin"
    const pick = MANAGER_PICKS[key] ?? MANAGER_PICKS[name] ?? null;

    console.log(`Upserting: ${name}  →  ${pick?.flavor ?? "(no manager pick)"}`);

    await prisma.person.upsert({
      where: { name },
      update: {
        managerFlavor: pick?.flavor ?? null,
        managerReason: pick?.reason ?? null,
      },
      create: {
        name,
        managerFlavor: pick?.flavor ?? null,
        managerReason: pick?.reason ?? null,
      },
    });
  }

  console.log("✅ Seed completed.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error("❌ Seed failed:", e); await prisma.$disconnect(); process.exit(1); });

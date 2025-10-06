import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// EDIT THESE two arrays to match your exact session
const PEOPLE = [
  "Alex", "Bailey", "Casey", "Drew", "Emerson", "Finley",
  "Gray", "Harper", "Indie", "Jules", "Kai", "Logan"
];

const FLAVORS = [
  "Vanilla", "Chocolate", "Strawberry", "Mint Chip", "Cookie Dough", "Rocky Road",
  "Pistachio", "Salted Caramel", "Coffee", "Cookies & Cream", "Mango", "Ube"
];

const MANAGER_PICKS: Record<string, { flavor: string; reason: string }> = {
  Alex: { flavor: "Mint Chip", reason: "Always fresh and sharp under pressure." },
  Bailey: { flavor: "Vanilla", reason: "Consistent, reliable, crowd-pleaser." },
  Casey: { flavor: "Pistachio", reason: "Distinctive taste and creative ideas." },
  Drew: { flavor: "Chocolate", reason: "Classic strength—never lets you down." },
  Emerson: { flavor: "Coffee", reason: "Energizes the team and keeps momentum." },
  Finley: { flavor: "Mango", reason: "Bright, positive, and refreshing." },
  Gray: { flavor: "Salted Caramel", reason: "Balanced sweet-and-savory collaborator." },
  Harper: { flavor: "Cookie Dough", reason: "Fun, flexible, and future-focused." },
  Indie: { flavor: "Ube", reason: "Unique perspective with depth." },
  Jules: { flavor: "Cookies & Cream", reason: "Great mix of skills and teamwork." },
  Kai: { flavor: "Rocky Road", reason: "Embraces challenges and adds texture." },
  Logan: { flavor: "Strawberry", reason: "Sweet, approachable, and vibrant." }
};

async function main() {
  // Create Persons
  for (const name of PEOPLE) {
    const pick = MANAGER_PICKS[name];
    await prisma.person.upsert({
      where: { name },
      update: {},
      create: {
        name,
        managerFlavor: pick?.flavor,
        managerReason: pick?.reason,
      },
    });
  }

  // Optionally create a dummy submission for smoketest
  const first = await prisma.person.findFirst();
  if (first) {
    await prisma.submission.create({
      data: { personId: first.id, flavor: FLAVORS[0], reason: "Starter note for testing." },
    });
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
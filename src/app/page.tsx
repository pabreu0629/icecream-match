import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function createSubmission(formData: FormData) {
  "use server";
  const personId = String(formData.get("personId") || "");
  const flavor = String(formData.get("flavor") || "");
  const reason = String(formData.get("reason") || "");
  if (!personId || !flavor || !reason) return;
  await prisma.submission.create({ data: { personId, flavor, reason } });
  redirect("/thanks");
}

export default async function Page() {
  const people = await prisma.person.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const flavors = [
    "Vanilla","Chocolate","Strawberry","Mint Chip","Cookie Dough","Rocky Road",
    "Pistachio","Salted Caramel","Coffee","Cookies & Cream","Mango","Ube"
  ];

  return (
    <div className="card">
      <h1>Pick a flavor for a teammate 🍦</h1>
      <p className="small">It’s anonymous. Choose a teammate, select a flavor, and tell us why!</p>
      <form action={createSubmission} className="grid" style={{ gap: 16 }}>
        <div>
          <label htmlFor="personId">Teammate</label>
          <select id="personId" name="personId" defaultValue="">
            <option value="">Select a person…</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="flavor">Flavor</label>
          <select id="flavor" name="flavor" defaultValue="">
            <option value="">Choose a flavor…</option>
            {flavors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="reason">Why?</label>
          <textarea id="reason" name="reason" rows={5} placeholder="A short note…" required />
        </div>

        <button>Submit</button>
      </form>
    </div>
  );
}

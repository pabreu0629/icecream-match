import { prisma } from "@/lib/db";
import StatsBars from "@/components/StatsBars";
import Link from "next/link";

async function getData(personId: string) {
  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) return null;
  const subs = await prisma.submission.findMany({ where: { personId }, select: { flavor: true, reason: true } });
  const counts = new Map<string, number>();
  subs.forEach(s => counts.set(s.flavor, (counts.get(s.flavor) || 0) + 1));
  const total = subs.length || 1;
  const top = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count, pct: (count / total) * 100 }))
    .sort((a,b)=> b.count - a.count)
    .slice(0, 3);

  const summary = await prisma.summaryCache.findUnique({ where: { personId } });

  return { person, top, total, notes: subs.map(s=>s.reason), cachedSummary: summary?.summary };
}

export default async function PersonDetail({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
  if (!data) return <div className="card">Not found</div>;
  const { person, top, total, notes, cachedSummary } = data;

  async function summarize() {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/summarize`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ personId: person!.id })
    });
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Link className="link" href="/admin">← Back</Link>
      <div className="card">
        <h1>{person.name}</h1>
        <p className="small">Total submissions: {total}</p>
        <h3>Top flavors</h3>
        <StatsBars rows={top} />
      </div>

      <div className="card">
        <h3>Manager's pick</h3>
        {person.managerFlavor ? (
          <p><strong>{person.managerFlavor}</strong> — {person.managerReason}</p>
        ) : <p className="small">No manager pick set.</p>}
      </div>

      <div className="card">
        <form action={summarize}>
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <h3>Summary</h3>
            <button type="submit">Re-summarize</button>
          </div>
        </form>
        {cachedSummary ? <p>{cachedSummary}</p> : <p className="small">No summary yet.</p>}
      </div>

      <div className="card">
        <h3>Raw notes (latest first)</h3>
        {notes.length === 0 ? <p className="small">No notes yet.</p> : (
          <ul>
            {notes.slice().reverse().map((n,i)=> (<li key={i} style={{ marginBottom: 8 }}>{n}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}

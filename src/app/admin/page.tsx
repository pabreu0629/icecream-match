"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Person = { id: string; name: string };

type Row = { id: string; name: string; count: number };

export default function AdminGrid() {
  const [people, setPeople] = useState<Person[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/people");
      const data = await res.json();
      setPeople(data.people);
      // fetch initial counts
      const statsRes = await fetch("/api/stats");
      const stats = await statsRes.json();
      setCounts(stats.counts || {});
    })();

    // subscribe realtime to submissions
    const channel = supabase
      .channel("realtime:submissions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Submission" }, (payload) => {
        const personId = payload.new.personId as string;
        setCounts((c) => ({ ...c, [personId]: (c[personId] || 0) + 1 }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const rows: Row[] = useMemo(() => people.map(p => ({ id: p.id, name: p.name, count: counts[p.id] || 0 })), [people, counts]);

  return (
    <div className="grid cols-3">
      {rows.map(r => (
        <Link key={r.id} href={`/admin/${r.id}`} className="card" style={{ textDecoration: "none" }}>
          <h3>{r.name}</h3>
          <div className="small">{r.count} submission{r.count===1?"":"s"}</div>
        </Link>
      ))}
      <form action="/api/reset" method="post" className="card" style={{ gridColumn: "span 3" }}>
        <h3>Reset all data</h3>
        <p className="small">Type <code>RESET</code> to confirm.</p>
        <input className="input" name="confirm" placeholder="RESET" />
        <button style={{ marginTop: 8 }}>Reset</button>
      </form>
    </div>
  );
}

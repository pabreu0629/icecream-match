"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


type Person = { id: string; name: string };


type Row = { id: string; name: string; count: number };


export default function AdminGrid() {
const [people, setPeople] = useState<Person[]>([]);
const [counts, setCounts] = useState<Record<string, number>>({});


async function refreshCounts() {
const res = await fetch("/api/stats", { cache: "no-store" });
const data = await res.json();
setCounts(data.counts || {});
}


useEffect(() => {
(async () => {
const res = await fetch("/api/people", { cache: "no-store" });
const data = await res.json();
setPeople(data.people);
await refreshCounts();
})();


// Subscribe realtime and re-fetch counts on each insert to avoid drift
const channel = supabase
.channel("realtime:submissions")
.on(
"postgres_changes",
{ event: "INSERT", schema: "public", table: "Submission" },
() => { refreshCounts(); }
)
.subscribe();


return () => { supabase.removeChannel(channel); };
}, []);


const rows: Row[] = useMemo(
() => people.map(p => ({ id: p.id, name: p.name, count: counts[p.id] || 0 })),
[people, counts]
);


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

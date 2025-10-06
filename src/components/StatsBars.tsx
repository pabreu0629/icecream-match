export default function StatsBars({ rows }: { rows: { label: string; count: number; pct: number }[] }) {
  return (
    <div className="grid" style={{ gap: 8 }}>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <div><strong>{r.label}</strong></div>
            <div className="small">{r.count} · {Math.round(r.pct)}%</div>
          </div>
          <div className="bar"><div style={{ width: `${r.pct}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

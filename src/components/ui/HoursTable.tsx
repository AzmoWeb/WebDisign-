import type { OpeningHours } from "@/lib/types";

export function HoursTable({ hours, compact }: { hours: OpeningHours; compact?: boolean }) {
  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">Horaires d&apos;ouverture</caption>
      <tbody>
        {hours.map((h) => (
          <tr key={h.day} className={compact ? "" : "border-b border-line last:border-0"}>
            <th scope="row" className={`pr-4 text-left font-normal ${compact ? "py-0.5" : "py-3"}`}>
              {compact ? h.day.slice(0, 3) + "." : h.day}
            </th>
            <td className={`text-right tabular-nums ${compact ? "py-0.5" : "py-3"}`}>
              {h.closed || !h.open ? "Fermé" : `${h.open} – ${h.close}${h.open2 ? ` · ${h.open2} – ${h.close2}` : ""}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AuditEntry } from "./types";

const ACTION_STYLES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  executed: "bg-purple-100 text-purple-700",
  re_submitted: "bg-yellow-100 text-yellow-700",
};

interface Props {
  trail: AuditEntry[];
}

export function AuditTrailView({ trail }: Props) {
  const [open, setOpen] = useState(false);

  if (!trail || trail.length === 0) return null;

  return (
    <div className="mt-4 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 text-sm text-slate-300 hover:bg-slate-750"
      >
        <span className="font-medium">Audit Trail ({trail.length} events)</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="divide-y divide-slate-700/50 bg-slate-900">
          {trail.map((entry, i) => (
            <div key={i} className="px-4 py-3 flex gap-3">
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <div className="w-2 h-2 rounded-full bg-slate-500 mt-1" />
                {i < trail.length - 1 && (
                  <div className="w-px flex-1 bg-slate-700 min-h-[16px]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${ACTION_STYLES[entry.action] || "bg-slate-700 text-slate-300"}`}
                  >
                    {entry.action.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">
                    {entry.performedByName}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-auto">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-xs text-slate-400 mt-0.5">{entry.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

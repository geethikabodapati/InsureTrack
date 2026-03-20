const CONFIG = {
  OPEN:          { bg: "bg-blue-100 text-blue-800",    label: "Open"          },
  INVESTIGATING: { bg: "bg-yellow-100 text-yellow-800",label: "Investigating" },
  SETTLED:       { bg: "bg-green-100 text-green-800",  label: "Settled"       },
  DENIED:        { bg: "bg-red-100 text-red-800",      label: "Denied"        },
  CLOSED:        { bg: "bg-gray-100 text-gray-700",    label: "Closed"        },
  HIGH:          { bg: "bg-red-100 text-red-800",      label: "High"          },
  MEDIUM:        { bg: "bg-yellow-100 text-yellow-800",label: "Medium"        },
  LOW:           { bg: "bg-green-100 text-green-800",  label: "Low"           },
  PAID:          { bg: "bg-green-100 text-green-800",  label: "Paid"          },
};
export function StatusBadge({ status }) {
  const cfg = CONFIG[(status||"").toUpperCase()] || { bg: "bg-gray-100 text-gray-700", label: status };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg}`}>{cfg.label}</span>;
}

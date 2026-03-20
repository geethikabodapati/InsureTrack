import { User, Mail, Shield, Hash, Wifi } from "lucide-react";

const ADJUSTER = {
  name:     "Vasudha",
  initials: "VA",
  role:     "Senior Adjuster",
  email:    "vasudha@insuretrack.com",
  userId:   5,
  status:   "Active",
};

const DETAILS = [
  { icon: User,   label: "Full Name", value: ADJUSTER.name   },
  { icon: Mail,   label: "Email",     value: ADJUSTER.email  },
  { icon: Shield, label: "Role",      value: ADJUSTER.role   },
  { icon: Hash,   label: "User ID",   value: `#${ADJUSTER.userId}` },
  { icon: Wifi,   label: "Status",    value: ADJUSTER.status },
];

export function Settings() {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Your account details</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 ring-4 ring-white/30">
            {ADJUSTER.initials}
          </div>
          <p className="text-xl font-bold text-white">{ADJUSTER.name}</p>
          <p className="text-sm text-blue-200 mt-0.5">{ADJUSTER.role}</p>
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-white/15 rounded-full text-xs text-white font-medium">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            {ADJUSTER.status}
          </span>
        </div>

        {/* Details list */}
        <div className="divide-y divide-gray-100">
          {DETAILS.map(item => (
            <div key={item.label} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

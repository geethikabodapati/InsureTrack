import { User, Mail, Shield, Hash, Phone } from "lucide-react";
import '../styles/adjuster.css';
 
export function Settings() {
  // 1. LocalStorage nundi logged-in user data ni theeskuntunnam
  const user = JSON.parse(localStorage.getItem("user"));
 
  // Adjuster initials logic (e.g., "Adjuster" -> "AD")
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "AD";
 
  // Dynamic Details Array
  const DETAILS = [
    { icon: User,   label: "Full Name", value: user?.name || "N/A" },
    { icon: Mail,   label: "Email",     value: user?.email || "N/A" },
    { icon: Shield, label: "Role",      value: user?.role || "ADJUSTER" },
    { icon: Hash,   label: "User ID",   value: `#${user?.userId || "5"}` },
    { icon: Phone,  label: "Phone",     value: user?.phone || "956781234" },
  ];
 
  // Security Check: Oka vela user role ADJUSTER kakapothe view block cheyochu
  if (user?.role !== "ADJUSTER") {
    return (
      <div className="adj-page" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: 'red' }}>Access Denied</h2>
        <p>This settings page is only accessible to Adjusters.</p>
      </div>
    );
  }
 
  return (
    <div className="adj-page" style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Settings</h1>
          <p className="adj-page-sub">Your personal account details</p>
        </div>
      </div>
 
      <div style={{ background: "var(--adj-card-bg)", border: "1px solid var(--adj-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
       
        {/* Dynamic Header */}
        <div className="adj-profile-header">
          <div className="adj-profile-avatar-lg">{initials}</div>
          <p className="adj-profile-name">{user?.name}</p>
          <p className="adj-profile-role">{user?.role} Portal</p>
          <div className="adj-profile-status">
            <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} />
            Active Session
          </div>
        </div>
 
        {/* Dynamic Detail Rows */}
        <div>
          {DETAILS.map(item => (
            <div key={item.label} className="adj-profile-detail-row" style={{ borderBottom: "1px solid var(--adj-border)" }}>
              <div className="adj-profile-detail-icon">
                <item.icon size={16} />
              </div>
              <div>
                <p className="adj-profile-detail-label" style={{ color: "var(--adj-text-sub)" }}>{item.label}</p>
                <p className="adj-profile-detail-value" style={{ color: "var(--adj-text-main)" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
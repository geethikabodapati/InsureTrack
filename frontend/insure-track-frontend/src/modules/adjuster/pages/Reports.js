import { useState, useEffect } from "react";
import { BarChart3, RefreshCw, AlertCircle, FileText, DollarSign,HandCoins,IndianRupee, CheckCircle, XCircle, Clock,FileCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../../core/services/api";
import '../styles/adjuster.css';
 
const PIE_COLORS = { OPEN:"#3b82f6", INVESTIGATING:"#f59e0b",ADJUDICATED: "#6366f1", SETTLED:"#10b981", DENIED:"#ef4444", CLOSED:"#6b7280" };
 
function badgeClass(s){const m={OPEN:"adj-badge adj-badge-open",INVESTIGATING:"adj-badge adj-badge-investigating",SETTLED:"adj-badge adj-badge-settled",DENIED:"adj-badge adj-badge-denied",CLOSED:"adj-badge adj-badge-closed"};return m[s]||"adj-badge adj-badge-closed";}
 
export function Reports() {
  const [data,setData]     = useState(null);
  const [loading,setLoading] = useState(false);
  const [toast,setToast]   = useState(null);
 
  const showToast=(type,text)=>{setToast({type,text});setTimeout(()=>setToast(null),4000);};
 
  const fetchReport=async()=>{
    setLoading(true);
    try{const res=await api.get("/adjuster/reports/summary");setData(res.data);}
    catch(err){showToast("error",err.message||"Failed to load report");}
    finally{setLoading(false);}
  };
 
  useEffect(()=>{fetchReport();},[]);
 
  const STAT_CARDS = data ? [
    {label:"Total Claims",  value:data.totalClaims,                                    Icon:FileText,   },
    {label:"Open",          value:data.openClaims,                                     Icon:Clock,       },
    {label:"Investigating", value:data.investigatingClaims,                            Icon:BarChart3, },
    // { label: "Adjudicated",   value: data.adjudicatedClaims,                            Icon: FileCheck,    },
    {label:"Settled",       value:data.settledClaims,                                  Icon:HandCoins,},
    {label:"Denied",        value:data.deniedClaims,                                   Icon:XCircle,  },
    {label:"Closed",        value:data.closedClaims,                                   Icon:CheckCircle,},
    {label:"Total Reserved",value:`₹${(data.totalReserveAmount||0).toLocaleString()}`, Icon:IndianRupee,},
    {label:"Total Settled", value:`₹${(data.totalSettlementAmount||0).toLocaleString()}`,Icon:IndianRupee,},
  ] : [];
 
  return (
    <div className="adj-page">
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Reports & Analytics</h1>
          <p className="adj-page-sub">Live data from your backend</p>
        </div>
        <button onClick={fetchReport} disabled={loading} className="adj-btn adj-btn-primary">
          <RefreshCw size={14} className={loading?"adj-spin":""}/> {loading?"Loading...":"Refresh"}
        </button>
      </div>
 
      {toast&&(<div className={`adj-toast ${toast.type==="success"?"adj-toast-success":"adj-toast-error"}`}><AlertCircle size={16} style={{flexShrink:0}}/>{toast.text}</div>)}
 
      {loading&&!data&&(<div className="adj-loading"><RefreshCw size={32} className="adj-spin"/><span>Loading report data...</span></div>)}
 
      {data&&(
        <>
          <div className="adj-stat-grid" style={{ marginBottom: 20 }}>
  {STAT_CARDS.map((c, i) => (
    <div key={i} className="adj-stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div>
        <p className="adj-stat-label">{c.label}</p>
        <p className="adj-stat-value">{c.value}</p>
      </div>
     
      {/* Updated Icon Container with Absolute Positioning */}
      <div
        className={`adj-stat-icon ${c.iconClass}`}
        style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          margin: 0
        }}
      >
        <c.Icon size={18} />
      </div>
    </div>
  ))}
</div>
 
          <div className="adj-charts-grid">
            <div className="adj-chart-card">
              <p className="adj-chart-title">Claims by Status</p>
              {data.claimsByStatus&&data.claimsByStatus.length>0?(
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.claimsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={95}
                      label={({status,count})=>`${status}: ${count}`} labelLine={false}>
                      {data.claimsByStatus.map((entry,i)=>(<Cell key={i} fill={PIE_COLORS[entry.status]||"#9ca3af"}/>))}
                    </Pie>
                    <Tooltip/><Legend/>
                  </PieChart>
                </ResponsiveContainer>
              ):(
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:260,color:"#9ca3af",fontSize:13}}>No data</div>
              )}
            </div>
 
            <div className="adj-chart-card">
              <p className="adj-chart-title">Reserve vs Settlement Amount</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[{label:"Reserved",amount:data.totalReserveAmount||0},{label:"Settled",amount:data.totalSettlementAmount||0}]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="label" fontSize={12} stroke="#9ca3af"/>
                  <YAxis fontSize={11} stroke="#9ca3af" tickFormatter={v=>v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
                  <Tooltip formatter={v=>`$${v.toLocaleString()}`}/>
                  <Bar dataKey="amount" radius={[6,6,0,0]} fill="#3b82f6" label={{position:"top",fontSize:11,formatter:v=>`$${v.toLocaleString()}`}}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
 
          {data.recentClaims&&data.recentClaims.length>0&&(
            <div className="adj-table-wrap">
              <div className="adj-table-header">Recent Claims</div>
              <table className="adj-table">
                <thead><tr>{["Claim ID","Type","Reported Date","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.recentClaims.map((c,i)=>(
                    <tr key={i}>
                      <td className="adj-table-id">#{c.claimId}</td>
                      <td>{c.claimType}</td>
                      <td style={{color:"#6b7280"}}>{c.reportedDate}</td>
                      <td><span className={badgeClass(c.status)}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
 
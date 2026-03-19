import { useNavigate } from "react-router-dom"

const Navbar=()=>{
    const navigate=useNavigate();
    const user=JSON.parse(localStorage.getItem("user"));
    const handleLogout=()=>{
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("user")
        navigate("/login");
    };
    return(
        <div style={{display:"flex",
            justifyContent:"space-between",
            padding:"15px 40px",
            background:'#2563eb',
            color:'white'
        }}>
            <h3>InsureCore</h3>
            <div>
                <span style={{marginRight:"20px"}}>
                {user?.email}
                </span>
                <button onClick={handleLogout}
                style={{padding:"6px 12px",
                    border:"none",
                    background:"white",
                    color:"#2563eb",
                    borderRadius:"4px",
                    cursor:"pointer"
                }}>Logout</button>
            </div>
        </div>
    )
}
export default Navbar;
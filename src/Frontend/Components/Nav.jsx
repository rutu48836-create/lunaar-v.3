
import {useState,useEffect} from "react"
import styles from "../Styles/Nav.module.css"
import {SendHorizontal,UserCircle,CircleQuestionMark,StickyNote,PlusCircle,SquarePen,Tags,PanelRightOpen,Banknote,X,LogOut,Menu,AlignCenter} from "lucide-react"
import { useAuth } from "./AuthContext"
import {Form_container} from "./Chatbot_creation.jsx"
import {useNavigate} from "react-router"
import {supabase} from "./supabase.js"

export function Nav_bar({active,setActive}){

    const [showForm,setShowForm] = useState(false)
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [profile_active,setProfile_active] = useState(false)

    const BACKEND_URL = import.meta.env.BACKEND_URL

       const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/Sign-In")
  }

    const handleUpgrade = async () => {
    const res = await fetch(`${BACKEND_URL}/api/billing/create-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        plan_id: "pro",
      }),
    });

      const sub = await res.json();

    const options = {
      key: "rzp_live_SueBoDdYYBiFIM",
      subscription_id: sub.id,
      name: "Lunaar",
      description: "Pro Plan",
      theme: { color: "#6366f1" },
      handler: function (response) {
        console.log("Payment done (not final)", response);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  }


return(

<div className={styles.Nav_wrapper}>
<div className={styles.Left_side}>

    <h3><SendHorizontal size={24} /> </h3> <p style={{color:"#ccc"}}>/</p> <span>{user?.user_metadata?.name || user?.email}</span>

</div>

<div className={styles.Links_wrapper}>
    <ul>
        <li  onClick={() => setProfile_active(true)}><UserCircle size={23} strokeWidth={1.50} color="#726c6c"/></li>
                                <li onClick={() => navigate("/privacy-policy")}><StickyNote size={23} strokeWidth={1.50} color="#726c6c" /></li>
                                  <li onClick={ () => setActive(!active) }><Menu size={23} strokeWidth={1.50} color="#726c6c" /></li>
                                  <li></li> <li onClick={() => handleUpgrade()}>Upgrade</li>
    </ul>
</div>


{profile_active && (
        <div className={styles.profile_module_wrapper}>
          <div className={styles.profile_card}>
            <div className={styles.profile_card_head}>
              <h2>Profile</h2>
              <button onClick={() => setProfile_active(false)}><X size={20} color="#000"/></button>
            </div>
            <div className={styles.profile_details_wrapper}>
              <ul>
                <li><h3>Display name</h3> <span>{user?.user_metadata?.name || user?.email}</span></li>
                <li><h3>Email</h3> <span>{user?.email}</span></li>
                <li><h3>Plan</h3> <span>Free</span></li>
                <li>
                  <h3>Log out</h3>
                  <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#aaa5a5", cursor: "pointer" }}>
                    <LogOut size={20} />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>

)
}

export function SideBar({profile_active,setProfile_active,active,setActive}){

    const { user, loading } = useAuth()
    const [showForm,setShowForm] = useState(false)
    const [usage,setUsage] = useState([])
    const [user_details,setUser_details] = useState({})
    const navigate = useNavigate()
  

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL


    useEffect(() => {

    const fetchUsage = async () => {

    const {data,error} = await supabase
    .from("chatbots")
    .select("*")
    .eq("owner_id",user.id)

    if(error) {console.error(error); return}

    setUsage(data)

    }

    fetchUsage()

    },[user])

    useEffect(() => {

    const fetchUsage = async () => {

      if (!user) return;

    const {data,error} = await supabase
    .from("profiles")
    .select("*")
    .eq("id",user.id)
    .single()

    if(error) {console.error(error); return}

    setUser_details(data)

    }

    fetchUsage()

    },[user])


   const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/Sign-In")
  }

  const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

   const handleUpgrade = async () => {


      const loaded = await loadRazorpay();
  if (!loaded) { alert("Failed to load payment SDK"); return; }

    const res = await fetch(`${BACKEND_URL}/api/billing/create-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        plan_id: "Growth",
      }),
    });

      const sub = await res.json();

    const options = {
      key: "rzp_live_SueBoDdYYBiFIM",
      subscription_id: sub.id,
      name: "Lunaar",
      description: "Growth Plan",
      theme: { color: "#6366f1" },
      handler: function (response) {
        console.log("Payment done (not final)", response);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  }

  if(showForm) return <Form_container onComplete={() => setShowForm(false)} />


    return(
        <div className={`${styles.Sidebar_container} ${active ? styles.sidebar_active : styles.sidebar_disabled}`} onMouseEnter={() => setActive(true)}>
            <div className={styles.Sidebar_close}>
              {active && ( 
                
                <button onClick={() => setActive(false)}><PanelRightOpen size={22} strokeWidth={1.50}/></button>
              )}
            </div>
            <ul>
                <li onClick={() => setShowForm(true)}><SquarePen  size={22} strokeWidth={1.50} color="#353232"/>{active && <span> New Chatbot</span>}</li>
                <li onClick={() => navigate("/privacy-policy")}><StickyNote  size={22} strokeWidth={1.50} color="#353232"/>{active && <span>Privacy Policy</span>}</li>
                <li onClick={() => setProfile_active(true)}><UserCircle  size={22} strokeWidth={1.50} color="#353232" onClick={() => setProfile_active(true)}/>{active && <span>User Profile</span>}</li>      
                <li onClick={() => navigate('/refund')}><Banknote size={22} strokeWidth={1.50} color="#353232"/>{active && <span>Refund Policy</span>}</li>      

            </ul>

            {active && (
              <div className={styles.Upgrade_wrapper}>
                
                <div className={styles.row}>  
                <span>User Plan</span> <h4>{user_details.plan}</h4>
                </div>


                              <div className={styles.row}>
                <span>Chatbots</span> <h4>{usage?.length || 0} / {user_details.chatbot_limit}</h4>
                </div>

                              <div className={styles.row}>  
                <span>Messsage Counts</span> <h4>{user_details.total_messages || 0} / {user_details.total_messages_limit || 100}</h4>
                </div>
                
                 <button onClick={() => navigate("/pricing")} className={styles.Upgrade_btn}>Unlock More</button>
                </div>
            )}


{profile_active && (
        <div className={styles.profile_module_wrapper}>
          <div className={styles.profile_card}>
            <div className={styles.profile_card_head}>
              <h2>Profile</h2>
              <button onClick={() => setProfile_active(false)}><X size={20} color="#000"/></button>
            </div>
            <div className={styles.profile_details_wrapper}>
              <ul>
                <li><h3>Display name</h3> <span>{user?.user_metadata?.name || user?.email}</span></li>
                <li><h3>Email</h3> <span>{user?.email}</span></li>
                <li><h3>Plan</h3> <span>{user_details.plan}</span></li>
                <li>
                  <h3>Log out</h3>
                  <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#aaa5a5", cursor: "pointer" }}>
                    <LogOut size={20} />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



    

import {useState,useEffect} from "react"
import styles from "../Styles/Nav.module.css"
import {SendHorizontal,UserCircle,CircleQuestionMark,StickyNote,PlusCircle,SquarePen,Tags,PanelRightOpen , X,LogOut} from "lucide-react"
import { useAuth } from "./AuthContext"

export function Nav_bar(){

    const { user, loading } = useAuth()
    const [profile_active,setProfile_active] = useState(false)

       const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/Sign-In")
  }

return(

<div className={styles.Nav_wrapper}>
<div className={styles.Left_side}>

    <h3><SendHorizontal size={24} /> </h3> <p style={{color:"#ccc"}}>/</p> <span>{user?.displayName || user?.email}</span>

</div>

<div className={styles.Links_wrapper}>
    <ul>
        <li  onClick={() => setProfile_active(true)}><UserCircle size={23} strokeWidth={1.50} color="#726c6c"/></li>
                <li><CircleQuestionMark size={23} strokeWidth={1.50} color="#726c6c" /></li>
                                <li><StickyNote size={23} strokeWidth={1.50} color="#726c6c" /></li>

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

export function SideBar({profile_active,setProfile_active}){

    const { user, loading } = useAuth()
    const [active,setActive] = useState(false)

   const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/Sign-In")
  }

    return(
        <div className={`${styles.Sidebar_container} ${active ? styles.sidebar_active : styles.sidebar_disabled}`} onMouseEnter={() => setActive(true)}>
            <div className={styles.Sidebar_close}>
              {active &&  <button onClick={() => setActive(false)}><PanelRightOpen size={20} strokeWidth={1.50}/></button>}
            </div>
            <ul>
                <li><SquarePen  size={22} strokeWidth={1.50} color="#353232"/>{active && <span> New Chatbot</span>}</li>
                                             {//   <li><Tags size={22} strokeWidth={1.50} color="#353232"/>{active && <span>Subscription Plans</span>}</li>
                                                }   <li><UserCircle  size={22} strokeWidth={1.50} color="#353232" onClick={() => setProfile_active(true)}/>{active && <span>Account</span>}</li>

            </ul>

            {active &&
            
            <div className={styles.BETA_NOTICE}>
             <h2>Lunnar is currently BETA</h2>
             <p>dear users, lunaar is currently still in testing mode and new features will be coming soon</p>
                </div>
            
            }

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



    
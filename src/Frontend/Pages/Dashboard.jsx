import {useState, useEffect} from "react"
import styles from "../Styles/Dashboard.module.css"
import { Nav_bar } from "../Components/Nav"
import { useAuth } from "../Components/AuthContext"
import { SideBar } from "../Components/Nav"
import { Plus, Pointer } from "lucide-react"
import { Form_container } from "../Components/Chatbot_creation"
import { supabase } from "../Components/supabase"
import { Share } from "lucide-react"
import { Navigate, useNavigate} from "react-router"
import {Ellipsis,Trash2,Zap,SquarePen,CalendarDays,MoveRight,Link} from "lucide-react"
import {Step_4} from "../Components/Chatbot_creation.jsx"
import calendar from "../assets/calendar.jpg"
import instagram from "../assets/instagram.avif"

function Main_Content(){

  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const frontend_url = import.meta.env.VITE_FRONTEND_URL;

  const navigate = useNavigate()
  const {user,loading} = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [chatbots, setChatbots] = useState([])
  const [lead_list, setLead_list] = useState([])
  const [selected_chatbot, setSelected_chatbot] = useState(null)
  const [leads_loading, setLeads_loading] = useState(false)
  const [task_list_active,setTask_list_active] = useState(null)
  const [step,setStep] = useState(1)
  const [chatbotId, setChatbotId] = useState(null)
  const [chatbot_id_for_ig,setChatbot_id_for_ig] = useState(null)
  
  const [profile,setProfile] = useState(null)


useEffect(() => {

const Profile_Check = async () => {

  if(loading) return (<h2>loading.....</h2>)
if(!user && !loading) navigate("/auth");

const {data,error} = await supabase
.from("profiles")
.select("*")
.eq("id",user.id)

if(error){
  console.error(error)
  return;
}

setProfile(data[0])

}

Profile_Check()

},[user,loading])


  useEffect(() => {
    const check_bots = async() => {
      if(!user) return;
      const {data, error} = await supabase
        .from("chatbots")
        .select("*")
        .eq("owner_id", user.id)
      if(error) { console.error(error); return; }
      setChatbots(data)
    }
    check_bots()
  }, [user])

  const Fetch_leads = async (chatbot) => {
    setSelected_chatbot(chatbot)
    setLeads_loading(true)
    const {data, error} = await supabase
      .from("leads")
      .select("*")
      .eq("chatbot_id", chatbot.id)
      .order("created_at", { ascending: false })
    if(error) { console.error(error); setLeads_loading(false); return; }
    setLead_list(data)
    setLeads_loading(false)
  }

  const delete_chatbot = async(id) => {
    if(!id) return;
    const { error } = await supabase.from("chatbots").delete().eq("id", id);
    if(error) { console.error(error); return; }
    setChatbots(chatbots.filter((bot) => bot.id !== id));
  }

  const getInitials = (name) => {
    if(!name) return "?"
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    })
  }

  const connectGoogleCalendar = (chatbot) => {
  const params = new URLSearchParams({
  chatbot_id: chatbot.id,
  owner_id: user.id,
  });
  window.location.href = `${backend_url}/auth/google?${params}`;
};

  if(showForm) return <Form_container onComplete={() => setShowForm(false)} setStep={setStep} step={step} chatbotId={chatbotId} setChatbotId={setChatbotId}/>

  return(
    <div className={styles.Main_content}>

      <div className={styles.Main_content_head}>
        <h2>Projects</h2>
        <button onClick={() => setShowForm(true)}><SquarePen size={20}/><span>New Chatbot</span></button>
      </div>

      <div className={styles.new_project}>        <button onClick={() => setShowForm(true)}><SquarePen size={20}/><span>New Chatbot</span></button>
</div>

      <div className={styles.Chatbots_wrapper}>
        {chatbots.length === 0
          ? <h1>No agents</h1>
          : chatbots.map((chatbot) => (
            <div key={chatbot.id} className={styles.chatbot_card}>
              <div className={styles.Chatbot_logo} style={{         background: `linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%), linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%), ${chatbot?.color}`,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)", }}>
               <div className={styles.chatbot_page_preview} style={{         background: `linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%), linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%), ${chatbot?.color}`,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)", }}>
                <div className={styles.preview_header}>
                 <div className={styles.preview_left_head}>
                   <img src={chatbot?.logo_url} alt='logo' className={styles.preview_logo}/>
                   <h3>{chatbot.name}</h3>
                  </div>
                  </div>

                  <div className={styles.preview_body}>
                    <div className={styles.preview_message_1} style={{         background: `linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%), linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%), ${chatbot?.color}`,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)", }}/>
                    <div className={styles.preview_message_2}/>    
                    </div>

                </div>
              </div>
              <div className={styles.Chatbot_Main_Content}>
                <div className={styles.Head}>
                <div className={styles.left_side_head}>
                  <img src={chatbot?.logo_url}/> <span>{chatbot.name}</span>
                  </div>
                  <div className={styles.right_side_head} style={{ position: 'relative' }}>
                    <button onClick={() => delete_chatbot(chatbot.id)}><Trash2 size={20} color="#f54d4d"/></button>
  <button onClick={() => setTask_list_active(task_list_active?.id === chatbot.id ? null : chatbot)}>
    <Ellipsis size={16}/>
  </button>                       {task_list_active?.id === chatbot.id && (
    <div className={styles.task_list_card}>
      
    <div className={styles.task_list_btns}>
          {chatbot.type === "Leads"  && <button onClick={() => Fetch_leads(chatbot)} className={styles.lead_button}>Check Leads <MoveRight size={20}/></button> } 
                 {chatbot.type === "Appointment"  && <button onClick={() => connectGoogleCalendar(chatbot)} className={styles.calendar_button}>Connect with <img src={calendar} alt="cal" style={{width:"34px",height:"34px"}}/></button>} 
         
         
         <button className={styles.instagram_button} onClick={() => 
          setChatbot_id_for_ig(chatbot.id)
         } disabled={profile?.plan !== "Growth"}>Connect with <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c850c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg></button>        
         </div>
      <ul>
        <li><span>type</span> <h4>{chatbot.type}</h4></li>
                <li><span>Message</span> <h4>{chatbot.message_count || 0}</h4></li>
                <li><span>Message Tokens</span> <h4>{chatbot.message_limit}</h4></li>
                <li><span>Copy link</span> <button className={styles.copy_link_btn} onClick={() => {
                  navigator.clipboard.writeText(`${frontend_url}/chat/${chatbot.share_token}`)
                  alert('link copied')
                }}><Link size={18}/></button></li>

      </ul>
    </div>
  )}        
                    </div>
                </div>
              
              </div>
            </div>
          ))
        }
      </div>

      {chatbot_id_for_ig && <Step_4 chatbotId={chatbot_id_for_ig} setChatbot_id={setChatbot_id_for_ig} /> }


      {selected_chatbot && (
        <div className={styles.leads_overlay}>
          <div className={styles.leads_panel}>

            <div className={styles.leads_panel_head}>
              <div className={styles.leads_panel_title}>
                <h2>Leads</h2>
                <span className={styles.leads_badge}>{lead_list.length} leads</span>
              </div>
              <button className={styles.back_btn} onClick={() => setSelected_chatbot(null)}>← Back</button>
            </div>

            {leads_loading ? (
              <p className={styles.leads_empty}>Loading...</p>
            ) : lead_list.length === 0 ? (
              <p className={styles.leads_empty}>No leads captured yet.</p>
            ) : (

              <div className={styles.leads_body}> 
              <table className={styles.leads_table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Interest In</th>
                  </tr>
                </thead>
                <tbody>
                  {lead_list.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div className={styles.name_cell}>
                          <div className={styles.avatar}>{getInitials(lead.name)}</div>
                          {lead.name || "—"}
                        </div>
                      </td>
                      <td><span className={styles.phone}>{lead.phone_no || "—"}</span></td>
                      <td><span className={styles.date}>{formatDate(lead.created_at)}</span></td>
                                            <td><span className={styles.phone}>{ lead.interest_in|| "—"}</span></td>

                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}

          </div>
        </div>
      
      )}

    </div>
  )
}

export function Dashboard(){

  const [profile_active,setProfile_active] = useState(false)
    const [active,setActive] = useState(false)


  return(
    <div className={styles.Dashboard_page_container}>
      <Nav_bar active={active} setActive={setActive}/>
      <div className={styles.Dashboard_Main_Content_wrapper}>
        <SideBar profile_active={profile_active} setProfile_active={setProfile_active} active={active} setActive={setActive}/><Main_Content/>
      </div>
    </div>
  )
}
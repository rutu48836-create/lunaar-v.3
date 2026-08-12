import { useState, useEffect, useMemo } from "react";
import styles from "../Styles/Nav.module.css"
import { supabase } from "../components/supabaseConfig";
import { X, SendHorizontal, LogOut, PanelLeft, Home, CircleUserRound, File, MessageSquare, ListSortDescending, Ellipse, Ellipsis,Trash2 } from "lucide-react"
import { useAuth } from "./AuthContext.tsx";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: CircleUserRound, label: "Profile", path: "/profile", isProfile: true },
    { icon: File, label: "Guide", path: "/docs" },
]

function groupChatsByDate(chats) {
    const groups = { Today: [], Yesterday: [], Earlier: [] }
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)

    chats.forEach((chat) => {
        const created = new Date(chat.created_at)
        if (created >= startOfToday) groups.Today.push(chat)
        else if (created >= startOfYesterday) groups.Yesterday.push(chat)
        else groups.Earlier.push(chat)
    })

    return Object.entries(groups).filter(([, items]) => items.length > 0)
}

function ProfileCard({ user, onClose }) {
    const displayName = useMemo(() => {
        if (!user?.email) return "—"
        const local = user.email.split("@")[0]
        return local.charAt(0).toUpperCase() + local.slice(1)
    }, [user])

   const [user_details,setUser_details] = useState(null)

   useEffect(() => {
    const check = async () => {
         if(!user.id) return
        const {data,error} = await supabase
        .from("profiles")
        .select("*")
        .eq("id",user.id)
        .single()

        if(error){
            throw new error
        }

        setUser_details(data)
    }

    check()
   },[user])

    return (
        <div className={styles.profile_wrapper} onClick={onClose}>
            <div className={styles.profile_card} onClick={(e) => e.stopPropagation()}>
                <div className={styles.profile_head}>
                    <button onClick={onClose} aria-label="Close profile"><X size={18} /></button>
                    <h2>Profile</h2>
                </div>

                <div className={styles.card_content}>
                    <div className={styles.row}>
                        <span>Display Name</span> <h3>{displayName}</h3>
                    </div>

                    <div className={styles.row}>
                        <span>Email id</span> <h3>{user?.email}</h3>
                    </div>

                    <div className={styles.row}>
                        <span>Plan</span> <h3>Free</h3>
                    </div>

                    <div className={styles.row}>
                        <span>Log out?</span>
                        <button aria-label="Log out"><LogOut size={17} /></button>
                    </div>

                    <div className={styles.row}>
                        <span>Video tokens</span> <h3>6</h3>
                    </div>

                    <div className={styles.row}>
                        <span>Video tokens used</span> <h3>{user_details?.current_video_req}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ChatHistory({ navigate, expanded }) {
    const { user } = useAuth()
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        const fetchChats = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from("conversations")
                .select("*")
                .eq("id", user?.id)
                .order("created_at", { ascending: false })

            if (cancelled) return

            if (error) {
                console.log("error fetch chats", error)
            }
            if (data) {
                setChats(data)
            }
            setLoading(false)
        }

        if (user?.id) fetchChats()

        return () => { cancelled = true }
    }, [user])

    if (!expanded) return null

    const grouped = groupChatsByDate(chats)

    const delete_chat = async (chatbot_id) => {

     const delete_convo = await fetch(`http://localhost:8000/db/delete/${chatbot_id}`, {
            method: "DELETE"
        });

       if(delete_convo.ok){
                setChats(prev => prev.filter(chat => chat.chatbot_id !== chatbot_id));
       }

    }

    return (
        <div className={styles.sidebar_history}>
            <h3 className={styles.recent}>History</h3>

            {loading && (
                <div className={styles.history_skeleton}>
                    <div className={styles.skeleton_line} />
                    <div className={styles.skeleton_line} />
                    <div className={styles.skeleton_line} />
                </div>
            )}

            {!loading && chats.length === 0 && (
                <p className={styles.history_empty}>No conversations yet</p>
            )}

            {!loading && grouped.map(([label, items]) => (
                <div key={label} className={styles.history_group}>
                    <span className={styles.history_group_label}>{label}</span>
                    {items.map((chat) => (
                        <div
                            key={chat.id ?? chat.chatbot_id}
                            className={styles.chat_item}
                            onClick={() => navigate(`/chat/${chat.chatbot_id}`)}
                        >
                            <MessageSquare size={13} strokeWidth={1.8} className={styles.chat_item_icon} />
                            <p>{chat.message}</p> <button onClick={() => delete_chat(chat.chatbot_id)}><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

function NavItems({ sidebar_active, navigate, currentPath, setProfile, profile }) {
    const { user } = useAuth()
    return (
        <>
            <ul className={`${styles.nav_list} ${sidebar_active ? styles.nav_list_active : ''}`}>
                {NAV_ITEMS.map(({ icon: Icon, label, path, isProfile }) => {
                    const isActive = currentPath.startsWith(path)
                    return (
                        <li
                            key={path}
                            className={`${styles.nav_item} ${sidebar_active ? styles.nav_item_active : ''} ${isActive ? styles.nav_item_current : ''}`}
                            onClick={() => isProfile ? setProfile(true) : navigate(path)}
                        >
                            <Icon size={16} strokeWidth={isActive ? 2.1 : 1.8} />
                            {sidebar_active && <span>{label}</span>}
                        </li>
                    )
                })}
            </ul>

            <ChatHistory navigate={navigate} expanded={sidebar_active} />

            {profile && <ProfileCard user={user} onClose={() => setProfile(false)} />}
        </>
    )
}

export function Navbar() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebar_active, setSidebar_active] = useState(false)
    const [profile, setProfile] = useState(false)

    return (
        <div className={styles.navbar_container}>
            <div className={styles.left_side_content}>
                <SendHorizontal size={19} strokeWidth={2} className={styles.brand_icon} />
                <span className={styles.divider_dot}>|</span>
                <h3>{user?.email}</h3>
            </div>

            <button
                className={styles.menu_trigger}
                onClick={() => setSidebar_active(true)}
                aria-label="Open menu"
            >
                <ListSortDescending size={20} strokeWidth={1.8} />
            </button>

            {sidebar_active &&
                <div className={styles.sidebar_overlay} onClick={() => setSidebar_active(false)}>
                    <div
                        className={`${styles.sidebar} ${styles.sidebar_active}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.logo_active}>
                            <div className={styles.logo_wrap}>
                                <SendHorizontal size={18} strokeWidth={2} className={styles.brand_icon} />
                                <h3 className={styles.logo_text}>Lunaar</h3>
                            </div>
                            <button onClick={() => setSidebar_active(false)} aria-label="Close menu">
                                <PanelLeft size={19} strokeWidth={1.8} />
                            </button>
                        </div>
                        <div className={styles.logo_hairline} />
                        <NavItems
                            setProfile={setProfile}
                            profile={profile}
                            sidebar_active={true}
                            navigate={(p) => { navigate(p); setSidebar_active(false) }}
                            currentPath={location.pathname}
                        />
                    </div>
                </div>
            }
        </div>
    )
}

export function Sidebar({ sidebar_active, setSidebar_active }) {
    
    const navigate = useNavigate()
    const location = useLocation()
    const {user} = useAuth()
    const [profile, setProfile] = useState(false)
     const displayName = useMemo(() => {
        if (!user?.email) return "—"
        const local = user.email.split("@")[0]
        return local.charAt(0).toUpperCase() + local.slice(1)
    }, [user])

    const getInitals = (user_name) => {
        return user_name[0].toUpperCase()
    }

    const name = getInitals(displayName)

    return (
        <div
            className={`${styles.sidebar} ${sidebar_active ? styles.sidebar_active : ''}`}
            onMouseEnter={() => setSidebar_active(true)}
        >
            <div className={sidebar_active ? styles.logo_active : styles.logo_off}>
                {!sidebar_active &&
                    <button onClick={() => setSidebar_active(true)} aria-label="Expand sidebar">
                        <SendHorizontal size={18} strokeWidth={2} className={styles.brand_icon} />
                    </button>
                }
                {sidebar_active &&
                    <>
                        <div className={styles.logo_wrap}>
                            <SendHorizontal size={18} strokeWidth={2} className={styles.brand_icon} />
                            <h3 className={styles.logo_text}>Lunaar</h3>
                        </div>
                        <button onClick={() => setSidebar_active(false)} aria-label="Collapse sidebar">
                            <PanelLeft size={19} strokeWidth={1.8} />
                        </button>
                    </>
                }

            </div>

            <div className={sidebar_active ? styles.logo_hairline : styles.logo_hairline_off} />

            <NavItems
                profile={profile}
                setProfile={setProfile}
                sidebar_active={sidebar_active}
                navigate={navigate}
                currentPath={location.pathname}
            />

          <div className={sidebar_active ? styles.user_info_container_active : styles.user_info_disabled}>
             <div className={styles.user_intial}>
                <h2>{name}</h2>
             </div>
             {sidebar_active && (
                <>
                <div className={styles.user_details}>
                   <h3>{displayName}</h3>
                   <span>free</span>
                    </div>

                    <button className={styles.user_details_btn} onClick={() => setProfile(true)}><Ellipsis size={16}/></button>
                    </>
             )}
          </div>
        </div>
    )
}
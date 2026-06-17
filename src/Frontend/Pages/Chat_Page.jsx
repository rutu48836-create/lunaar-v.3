import { useState, useEffect, useRef } from "react";
import { supabase } from "../Components/supabase";
import styles from "../Styles/Chat_Page.module.css";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { Share, Send } from "lucide-react";

export function ChatPage() {

  const { user, loading } = useAuth();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get("embed") === "true";
  const [chatbot, setChatbot] = useState(null);
  const [user_message, setUser_message] = useState("");
  const [messages, setMessages] = useState([]);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const historyRef = useRef([]);
  const share_token = token;

  useEffect(() => {
    const check_chatbot = async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setChatbot(data);
    };

    check_chatbot();
  }, [token]);

  // When embedded, the page renders inside a small fixed-size iframe
  // (controlled by widget.js on the host site), not a full browser tab.
  // Tag <html>/<body> so embed-only CSS overrides in Chat_Page.module.css
  // can target this state without touching the standalone page.
  useEffect(() => {
    if (isEmbedded) {
      document.documentElement.classList.add(styles.embedded_root || "embedded-root");
      document.body.style.margin = "0";
      document.body.style.background = "transparent";
    }
  }, [isEmbedded]);


  const Send_Message = async () => {
    const backend_url = import.meta.env.VITE_BACKEND_URL;

    if (!user_message.trim()) return;

    try {
      const userMessage = { role: "user", content: user_message };
      historyRef.current.push({ role: "user", content: user_message });
      setMessages(prev => [...prev, userMessage]);
      setUser_message("");

      const res = await fetch(`${backend_url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_token, user_message, history: historyRef.current })
      });

      const data = await res.json();
      historyRef.current.push({ role: "assistant", content: data.reply });
      const botMessage = { role: "assistant", content: data.reply };
      setMessages(prev => [...prev, botMessage]);

      const { data: profile, error: profile_error } = await supabase
        .from("profiles")
        .select("total_messages")
        .eq("id", chatbot.owner_id)
        .single();

      if (profile_error) {
        console.log(profile_error);
        return;
      }

      const { error: increment_error } = await supabase
        .from("profiles")
        .update({ total_messages: (profile.total_messages || 0) + 1 })
        .eq("id", chatbot.owner_id);

      if (increment_error) {
        console.log(increment_error);
        return;
      }

      if (chatbot.type === "Leads" && data.lead?.detected === true) {
        const { error } = await supabase
          .from("leads")
          .insert({
            chatbot_id: chatbot.id,
            name: data.lead.name,
            phone_no: data.lead.phone,
            interest_in: data.lead.interest_in,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error(error);
          return;
        }
      }

      if (chatbot.type === "Appointment" && data.appointment) {
        setBookedAppointment(data.appointment);
      }

    } catch (err) {
      console.log(err);
    }
  };


  const Check_limit_and_message = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("total_messages_limit,total_messages")
      .eq("id", chatbot.owner_id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    if (data.total_messages >= data.total_messages_limit) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "This chatbot has reached its message limit for the month. Please try again later."
      }]);
      return;
    }

    Send_Message();
  };


  function getTextColor(bgColor) {
    let r, g, b;

    if (!bgColor || bgColor === "#ffffff" || bgColor === "#fff") {
      return "#000000";
    }

    if (bgColor.startsWith("rgb")) {
      [r, g, b] = bgColor.match(/\d+/g).map(Number);
    } else {
      const hex = bgColor.replace("#", "").substring(0, 6);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  const userMessageStyle = {
    padding: ".6rem .9rem",
    borderRadius: "20px",
    maxWidth: "60%",
    wordWrap: "break-word",
    display: "flex",
    alignSelf: "flex-end",
    marginRight: "20px",
    backgroundColor: "#ebe5e5",
    color: "#202020",
    boxShadow: `rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px`,
  };

  const botMessageStyle = {
    ...userMessageStyle,
    background: `linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%), linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%), ${chatbot?.color}`,
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    color: getTextColor(chatbot?.color),
    alignSelf: "flex-start",
    marginLeft: "20px",
    justifySelf: "flex-end",
    whiteSpace: "pre-line"
  };

  if (!chatbot) return null;

  return (
    <div
      className={styles.Chat_Page_Container}
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%), linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%), ${chatbot?.color}`,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        color: getTextColor(chatbot?.color),
        // Inside the widget iframe there's no surrounding browser chrome,
        // so round the outer corners and fill the iframe exactly.
        ...(isEmbedded && {
          borderRadius: "16px",
          height: "100vh",
          width: "100vw",
          overflow: "hidden"
        })
      }}
    >

      <div className={styles.Chatbot_Head} style={{ color: getTextColor(chatbot.color) }}>
        <div className={styles.left_side}>
          <img src={chatbot?.logo_url} style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
          <h3>{chatbot?.name}</h3>
        </div>
        {/* Share link is redundant once embedded — the visitor is already
            on the host site, and clipboard access is unreliable inside
            third-party iframes without explicit permissions anyway. */}
        {!isEmbedded && (
          <div className={styles.Right_side}>
            <Share size={20} onClick={async () => {
              await navigator.clipboard.writeText(`https://lunaar.online/chat/${chatbot.share_token}`);
              alert("Link copied!");
            }} />
          </div>
        )}
      </div>

      <div className={styles.Chat_box_container} style={{ background: "#fff" }}>

        <div className={styles.Welcome_message} style={{ ...botMessageStyle, marginLeft: "20px" }}>
          <span>Hi I am {chatbot.name}, how can I help you?</span>
        </div>

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px"
            }}
          >
            <div style={msg.role === "user" ? userMessageStyle : botMessageStyle}>
              {msg.content}
            </div>
          </div>
        ))}

        {bookedAppointment && (
          <div style={{
            margin: "16px 20px",
            padding: "16px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
            border: "1px solid #a5d6a7",
            color: "#1b5e20",
            fontSize: "14px",
            lineHeight: "1.8"
          }}>
            <div style={{ fontWeight: "600", marginBottom: "8px", fontSize: "15px" }}>✅ Appointment Confirmed</div>
            <div>👤 {bookedAppointment.name}</div>
            <div>📧 {bookedAppointment.email}</div>
            <div>📅 {bookedAppointment.date}</div>
            <div>🕐 {bookedAppointment.time}</div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#388e3c" }}>A calendar invite has been sent to your email.</div>
          </div>
        )}

      </div>

      <div className={styles.Input_Container}>
        <input
          type="text"
          value={user_message}
          onChange={(e) => setUser_message(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && Check_limit_and_message()}
          placeholder="AI agent is made using lunaar.online"
        />
        <button
          onClick={Check_limit_and_message}
          style={{
            "--bot-color": chatbot ? `color-mix(in srgb, ${chatbot.color} 84%, white)` : "#ffffff",
            color: getTextColor(chatbot.color)
          }}
        >
          <Send size={18} />
        </button>
      </div>

    </div>
  );
}
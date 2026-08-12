import {useState,useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {useRef} from 'react'
import styles from "../Styles/Chat.module.css"
import {useAuth} from '../components/AuthContext'
import { Share, Send, Lock, X, Phone, Paperclip, ArrowUp,TextAlignStart } from "lucide-react";
import {supabase} from '../components/supabaseConfig.js'
import { Sidebar } from '../components/Nav'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isVideo?:boolean
}

 export function Chat() {
  
    const { chatbot_id: paramChatbotId } = useParams();
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [user_message, setUser_message] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const historyRef = useRef<ChatMessage[]>([]);
    const [type,setType] = useState<string>("text")
    const [chatbot_id,setChatbot_id] = useState<string | null>(null)
    const {user} = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sidebar_active,setSidebar_active] = useState<boolean>(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

   useEffect(() => {
    if (!paramChatbotId || !user?.id) return;

    const loadConversation = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("chatbot_id", paramChatbotId)
        .eq("id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.log("error loading conversation", error);
        return;
      }

      const loaded = (data ?? []).map(row => ({
        role: row.role,
        content: row.message,
        isVideo: row.role === "assistant" && row.message?.startsWith("http") ? row.message : undefined
      }));

      setMessages(loaded);
      historyRef.current = loaded;
      localStorage.setItem("chatbot_id", paramChatbotId); 
    };

    loadConversation();
  }, [paramChatbotId, user]);



   const Send_Message = async () => {
    if (!user_message.trim() || isWaiting) return;

    const originalMessage = user_message;
    setUser_message("");
    setIsWaiting(true);
    const chatbot_id = paramChatbotId
    
    const userMessage = { 
      role: "user" as const, 
      content: originalMessage 
    };

    historyRef.current.push(userMessage);
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: originalMessage, history: historyRef.current, type: type,user_id:user?.id,chatbot_id:chatbot_id })
      });

      const data = await res.json();
      console.log('data received:', data.videoUrl);
      console.log('data text',data.message)

      const aiResponse = data.message

      const botMessage = { 
        role: "assistant" as const, 
        content: aiResponse,
        isVideo:data.videoUrl
      };

      historyRef.current.push(botMessage);
      setMessages(prev => [...prev, botMessage]);
      setIsWaiting(false)

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
    }
  };

  return (
    <>
    <div className={styles.Chat_wrapper}>
                      <div className={styles.Nav_container}><button onClick={() => setSidebar_active(true)}><TextAlignStart size={18} /></button></div>
      
      <div className={styles.chats}>
        <div className={styles.messages}>
          
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`${styles.message_bubble} ${msg.role === 'user' ? styles.user : styles.assistant}`}
          >

            {msg.isVideo ? (
              <div className={styles.video_container}>
      <video 
        src={msg.isVideo} 
        className={styles.ai_video} 
        controls 
        preload="metadata"
        width="100%"
      >
        Your browser does not support the video tag.
      </video>
      </div>
    ) : (
      <p>{msg.content}</p>
    )}
    </div>
        ))}
         {isWaiting === true && (
          <div className={styles.assistant}>
            <p>Desiging...</p>
          </div>
        )}
    
</div>
  

         <div className={styles.input_container_t}>
        <textarea 
          placeholder="Enter Prompt here...." 
          value={user_message}
          onChange={(e) => setUser_message(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              Send_Message()
            }
          }}
        />
        <div className={styles.input_btns}>
          <div className={styles.left}>
            <button><Paperclip size={16}/></button>
          </div>
          <button 
            className={styles.send} 
            disabled={isWaiting}
            onClick={Send_Message}
          >
            <ArrowUp size={18}/>
          </button>
        </div>
      </div>

        <div ref={messagesEndRef} />
      </div>  
    
      </div>

            <Sidebar sidebar_active={sidebar_active} setSidebar_active={setSidebar_active} />
</>
  );
}
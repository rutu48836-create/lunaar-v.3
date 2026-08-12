import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react";
import { supabase } from "../components/supabaseConfig.js";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Share, Send, Lock, X, Phone, Paperclip, ArrowUp, Image as ImageIcon, TextAlignStart } from "lucide-react";
import { Sidebar, Navbar } from "../components/Nav.jsx";
import styles from "../Styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isVideo?: string;
}

type Asset = {
    file: File;
    role: "logo" | "product" | "background" | "person";
    preview: string;
    id: string;
};

interface ChatProp {
  messages: ChatMessage[];
  isWaiting: boolean;
  user_message: string;
  setUser_message: Dispatch<SetStateAction<string>>;
  Send_Message: () => void;
  assets: Asset[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAsset: (id: string) => void;
  setSelectedAsset: Dispatch<SetStateAction<Asset | null>>;
  setSelect_ai: Dispatch<SetStateAction<boolean>>;
  setSidebar_active: Dispatch<SetStateAction<boolean>>;
  activeChatbotId: string,
}

function Chat({
  messages,
  isWaiting,
  user_message,
  setUser_message,
  Send_Message,
  assets,
  handleFileChange,
  removeAsset,
  setSelectedAsset,
  setSelect_ai,
  setSidebar_active,
  activeChatbotId
}: ChatProp) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

    const texts: string[] = ["Thinking....", "Thinking..", "thinking..","thinking.","this may take some time..."];
  const [currentText, setCurrentText] = useState<string>(texts[0]);

  useEffect(() => {
    for(let i = 0; i < texts.length;i++){
       setTimeout(() => {
        setCurrentText(texts[i]);
      }, i * 4000);
    }
  },[])

  return (
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
          {isWaiting && (
            <div className={styles.assistant}>
              {currentText}
            </div>
          )}
        </div>

        <div className={styles.input_container_t}>
          {assets.length > 0 && (
            <div className={styles.Image_wrap}>
              {assets.map(asset => (
                <div className={styles.image_preview_wrapper} key={asset.id}>
                  <img
                    src={asset.preview}
                    width={100}
                    onClick={() => setSelectedAsset(asset)}
                  />
                  <button onClick={() => removeAsset(asset.id)} className={styles.image_preview_btn}><X size={16}/></button>
                </div>
              ))}
            </div>
          )}

          <textarea
            placeholder="Enter Prompt here...."
            value={user_message}
            onChange={(e) => setUser_message(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                Send_Message();
              }
            }}
          />
          <div className={styles.input_btns}>
            <div className={styles.left}>
              <button onClick={() => setSelect_ai(true)}><Paperclip size={16} /></button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="Image_file_chat"
                name="Image_file_chat"
              />
              <label
                htmlFor="Image_file_chat"
                style={{ padding: "8px", cursor: "pointer", borderRadius: "4px" }}
              >
                <ImageIcon size={16} />
              </label>
            </div>
            <button
              className={styles.send}
              disabled={isWaiting}
              onClick={Send_Message}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

interface MainProps {
  sidebar_active: boolean,
  setSidebar_active: Dispatch<SetStateAction<boolean>>
}

function Main_content({ sidebar_active, setSidebar_active }: MainProps) {

  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [user_message, setUser_message] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const historyRef = useRef<ChatMessage[]>([]);
  const [type, setType] = useState<string>("text");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [res_data,setRes_data] = useState<null | []>(null)
  const [jobId, setJobId] = useState<string | null>(null);

  const chatbotIdRef = useRef<string | null>(null);

  const [chatbot_id, setChatbot_id] = useState<string>("");

  const { user } = useAuth();
  const [select_ai, setSelect_ai] = useState<boolean>(false);
  const [ai_provider, setAi_provider] = useState<string>(() => localStorage.getItem("ai_provider") || "Gemini");
  const [ai_model, setAi_model] = useState<string>(() => localStorage.getItem("ai_model") || "gemini-2.5-flash-lite");
  const [apikey, setAPI_key] = useState<string>(() => localStorage.getItem("ai_api_key") || "");

  const navigate = useNavigate()


  useEffect(() => {
    localStorage.setItem("ai_provider", ai_provider);
  }, [ai_provider]);

  useEffect(() => {
    localStorage.setItem("ai_model", ai_model);
  }, [ai_model]);

  useEffect(() => {
    localStorage.setItem("ai_api_key", apikey);
  }, [apikey]);

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.id === id
          ? { ...asset, ...updates }
          : asset
      )
    );
  };

  const clearAssets = () => {
    setAssets(prev => {
      prev.forEach(asset => URL.revokeObjectURL(asset.preview));
      return [];
    });
  };

  useEffect(() => {
    if(!user) navigate('/login');
  },[user])

    useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const checkStatus = await fetch(`${BACKEND_URL}/ai/job/${jobId}`, {
          method: "GET"
        });

        const data = await checkStatus.json();
        console.log(data, 'data status');

        if (cancelled) return;

        if(data.state === 'active'){
          setIsWaiting(true)
        }

        else if(data.state === 'waiting'){
          setIsWaiting(true)
        }

    else if (data.state === "completed") {
  const botMessage: ChatMessage = {
    role: "assistant",
    content: data.result?.message || "",
    isVideo: data.result?.videoUrl
  };
  historyRef.current = [...historyRef.current, botMessage];
  setMessages(prev => [...prev, botMessage]);
  setIsWaiting(false);
  clearAssets();
  return;
}

        else {
          const errorMessage: ChatMessage = {
            role: "assistant",
            content: "Something went wrong generating that. Please try again."
          };
          historyRef.current = [...historyRef.current, errorMessage];
          setMessages(prev => [...prev, errorMessage]);
          setIsWaiting(false);
          return;
        }

        setTimeout(fetchStatus, 500);

      } catch (err) {
        console.error("Polling error:", err);
        if (!cancelled) setTimeout(fetchStatus, 500);
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [jobId]);


  const Send_Message = async () => {

    if (!user_message.trim() || isWaiting) return;
    setIsWaiting(true);
    
    let activeChatbotId = chatbotIdRef.current;
    if (!activeChatbotId) {
      activeChatbotId = crypto.randomUUID();
      chatbotIdRef.current = activeChatbotId;
      setChatbot_id(activeChatbotId);
    }

    const formData = new FormData();

    const originalMessage = user_message;
    setUser_message("");

    const userMessage: ChatMessage = {
      role: "user",
      content: originalMessage,
    };

    historyRef.current = [...historyRef.current, userMessage];
    setMessages(prev => [...prev, userMessage]);

    formData.append("user_message", originalMessage);
    formData.append("history", JSON.stringify(historyRef.current));
    formData.append("type", type);
    formData.append("user_id", user?.id ?? "");
    formData.append("chatbot_id", activeChatbotId);
    formData.append("ai_provider", ai_provider);
    formData.append("ai_model", ai_model);
    formData.append("api_key", apikey);

    assets.forEach(asset => {
      formData.append("images", asset.file);
      formData.append("roles", asset.role);
      formData.append("assetIds", asset.id);
    });

    try {
      const res = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        body: formData
      });

            let aiResponse;


      if (!res.ok) {
       aiResponse = "you have a request in process.... try after it is completed"
      }

      const data = await res.json();

      setJobId(data.jobId)


      if(data.message === "You already have a request in progress"){
       aiResponse = "you have a request in process.... try after it is completed"
      }
     else{
       aiResponse = data.message;
     }

      const botMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse || "",
        isVideo: data.videoUrl
      };

      historyRef.current = [...historyRef.current, botMessage];
      setMessages(prev => [...prev, botMessage]);
      clearAssets();

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Something went wrong sending that. Please try again.",
      };
      historyRef.current = [...historyRef.current, errorMessage];
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsWaiting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    const newAssets: Asset[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      role: "product",
      preview: URL.createObjectURL(file)
    }));

    setAssets(prev => [...prev, ...newAssets]);
    e.target.value = "";
  };

  const removeAsset = (id: string) => {
    setAssets(prev => {
      const asset = prev.find(a => a.id === id);

      if (asset) {
        URL.revokeObjectURL(asset.preview);
      }

      return prev.filter(a => a.id !== id);
    });
  };

  return (
    <div className={styles.Main_content_wrapper}>
      {messages.length === 0 ? (
        <>
          <div className={styles.Nav_container}><button onClick={() => setSidebar_active(true)}><TextAlignStart size={18} /></button></div>
          <h2>Ready to sketch?</h2>
          <div className={styles.input_container}>

            <div className={styles.Image_wrap}>
              {assets.map(asset => (
                <div className={styles.image_preview_wrapper} key={asset.id}>
                  <img
                    src={asset.preview}
                    width={100}
                    onClick={() => setSelectedAsset(asset)}
                  />
                  <button onClick={() => removeAsset(asset.id)} className={styles.image_preview_btn}><X size={16}/></button>
                </div>
              ))}
            </div>

            <textarea
              placeholder="Enter Prompt here...."
              value={user_message}
              onChange={(e) => setUser_message(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  Send_Message();
                }
              }}
            />
            <div className={styles.input_btns}>
              <div className={styles.left}>
                <button onClick={() => setSelect_ai(true)}><Paperclip size={16} /></button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="Image_file"
                  name="Image_file"
                />
                <label
                  htmlFor="Image_file"
                  style={{ padding: "8px", cursor: "pointer", borderRadius: "4px" }}
                >
                  <ImageIcon size={16} />
                </label>
              </div>
              <button
                className={styles.send}
                onClick={Send_Message}
                disabled={isWaiting}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>

          <div className={styles.prompts_wrapper}>
  <div className={styles.prompt} onClick={() => setUser_message("Create a Duolingo styled animation with a friendly mascot character bouncing in, celebratory confetti burst, and a streak counter incrementing with a satisfying pop sound cue")}>
    <span>Create a duolingo styled animations</span>
  </div>
  <div className={styles.prompt} onClick={() => setUser_message("Create a 15 second promo clip for a fitness app showing a person's workout progress, animated stats counting up (calories burned, steps, streak days), and a bold call-to-action to download the app")}>
    <span>Create a promo clip for fitness app</span>
  </div>
  <div className={styles.prompt} onClick={() => setUser_message("Create a data visualization clip showing India's population growth over the decades with an animated bar chart, key milestone callouts, and a map highlighting major cities by population density")}>
    <span>Create a clip for showing indian population stats</span>
  </div>
  <div className={styles.prompt} onClick={() => setUser_message("Create a biography clip on Elon Musk covering his early life, founding of PayPal, Tesla, SpaceX, and Neuralink, with animated timeline transitions and key milestone highlights")}>
    <span>Create a clip showing biography of elon musk</span>
  </div>
  <div className={styles.prompt} onClick={() => setUser_message("Create a motion graphic showing Apple's rise to success, highlighting key product launches (Mac, iPod, iPhone, iPad), animated revenue growth chart, and market cap milestones")}>
    <span>Create a showing apple's success</span>
  </div>
  <div className={styles.prompt} onClick={() => setUser_message("Create a visual graphic comparing Marvel vs DC fanbases with animated bar charts of fan counts, box office revenue comparison, and iconic character silhouettes from each universe")}>
    <span>Create a visual graphic showing fans of marvel vs dc</span>
  </div>
</div>
        </>
      ) : (
        <Chat
          messages={messages}
          isWaiting={isWaiting}
          user_message={user_message}
          setUser_message={setUser_message}
          Send_Message={Send_Message}
          assets={assets}
          handleFileChange={handleFileChange}
          removeAsset={removeAsset}
          setSelectedAsset={setSelectedAsset}
          setSelect_ai={setSelect_ai}
          setSidebar_active={setSidebar_active}
          activeChatbotId={chatbot_id}
        />
      )}

      {selectedAsset && (
        <div className={styles.select_ai_overlay}>
          <div className={styles.Img_upload_card}>
            <div className={styles.card_nav}>
              <h3>Select Role</h3>
              <button onClick={() => setSelect_ai(false)}><X size={16}/></button>
            </div>
            <label>Role</label><br/>

            <select
              value={selectedAsset.role}
              onChange={(e) => {
                const role = e.target.value as Asset["role"];

                updateAsset(selectedAsset.id, { role });

                setSelectedAsset(prev =>
                  prev ? { ...prev, role } : null
                );
              }}
            >
              <option value="logo">Logo</option>
              <option value="product">Product</option>
              <option value="background">Background</option>
              <option value="person">Person</option>
            </select>
<br/>
            <button onClick={() => setSelectedAsset(null)} className={styles.close_btn}>
              Close
            </button>
          </div>
        </div>
      )}

      {select_ai && (
        <div className={styles.select_ai_overlay}>
          <div className={styles.select_ai_model_card}>
            <div className={styles.card_nav}>
              <h3>Select Model</h3>
              <button onClick={() => setSelect_ai(false)}><X size={16}/></button>
            </div>

            <div className={styles.card_main_content}>
              <label>Choose AI</label>
              <select value={ai_provider} onChange={(e) => setAi_provider(e.target.value)}>
                <option value="Gemini">Gemini</option>
                <option value="Groq">Groq</option>
                <option value="Claude">Claude</option>
              </select><br />

              <label>Choose model</label>
              {ai_provider === "Gemini" && (
                <select value={ai_model} onChange={(e) => setAi_model(e.target.value)}>
                  <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                </select>
              )}

              {ai_provider === "Groq" && (
                <select value={ai_model} onChange={(e) => setAi_model(e.target.value)}>
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                  <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                </select>
              )}<br />

               {ai_provider === "Claude" && (
                <select value={ai_model} onChange={(e) => setAi_model(e.target.value)}>
                  <option value="claude-sonnet-5">claude-sonnet-5</option>
                  <option value="claude-haiku-4-5-20251001">claude-haiku-4-5-20251001</option>
                  <option value="claude-opus-5">claude-opus-5</option>
                </select>
              )}<br />

              <label>API key</label>
              <input
                type="text"
                placeholder="Enter key"
                value={apikey}
                onChange={(e) => setAPI_key(e.target.value)}
              />
              <br />

              <button onClick={() => setSelect_ai(false)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const [sidebar_active, setSidebar_active] = useState<boolean>(false);

  return (
    <div className={styles.Dashboard_wrapper}>
      <Sidebar sidebar_active={sidebar_active} setSidebar_active={setSidebar_active} />
      <Main_content sidebar_active={sidebar_active} setSidebar_active={setSidebar_active} />
    </div>
  );
}
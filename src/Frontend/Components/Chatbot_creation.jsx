import {useState,useEffect} from "react";
import styles from "../Styles/Chatbot_creation.module.css"
import {supabase} from "./supabase.js"
import {SendHorizontal,MoveLeft } from "lucide-react"
import { useAuth } from "./AuthContext.jsx";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function Step_1({onNext,step,name,color,type,logo,setName,setType,setColor,setLogo}){

    return(
        <div className={styles.Steps_container}>

       <div className={styles.Head}>
        
        <h3 onClick={() => window.location.reload()}><MoveLeft size={14}/>Back</h3>
        
        </div> 
            <div className={styles.Steps_card}>
              
<h1>Let your docs talk</h1>
                <small>let your docs talk and solve queries for your customer</small><br/>
            
            <label>Chatbot Name</label><br/>
    <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required/><br/>

                <label style={{marginTop:"30px"}}>Use Case</label><br/>
   <select onChange={(e) => setType(e.target.value)} value={type}>
    <option>Customer Care</option>
    <option value="Leads">Leads</option>
        <option value="Appointment">Appointement</option>
   </select>

  <div className={styles.btn_wrapper}>
    <button onClick={onNext}>Continue</button>
    <button onClick={() => window.location.reload()}>Cancel</button>
  </div>
           </div>

        </div>
    )
}

function Step_2({onNext,setStep,name,color,type,logo,setName,setType,setColor,setLogo}){

const {user,loading} = useAuth();

    return(
        <div className={styles.Steps_container}>
                 <div className={styles.Head}>
        
        <h3 onClick={() => window.location.reload()}><MoveLeft size={14}/>Back</h3>
        
        </div> 
            <div className={styles.Steps_card}>
<h1>Style you Agent</h1>
                <small>Add custom branding to make it look professinal</small><br/>
            
            <label>Agent-Logo</label><br/>
    <input type="file" style={{fontSize:"8px"}} accept="image/*"  onChange={(e) => setLogo(e.target.files[0])} required
 id="logo"/>

 <label htmlFor="logo" className={styles.custom_button} placeholder="Upload Pdfs,text,spreadsheet  🗎">
 <small>📂 Upload Logo</small>
</label><br/>

<label style={{marginTop:"30px"}}>Choose Color</label><br/>
<input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>

  <div className={styles.btn_wrapper}>
    <button onClick={() => setStep(3)}>Continue</button>
    <button onClick={() => setStep(1)}>Previous</button>
  </div>
           </div>

        </div>
    )
}


function Step_3({onNext,setStep,name,color,type,logo,setName,setType,setColor,setLogo,setPrompt,prompt,setChatbotId,profile}){

const {user,loading} = useAuth();
const [trainingFile,setTrainingFile] = useState(null)
const [creating,setLoading] = useState(false)

const Upload_logo = async () => {
if(!logo) return null;
        const filePath = `chatbot-logos/${Date.now()}-${logo.name}`
        const { error } = await supabase.storage.from("chatbot-logos").upload(filePath, logo)
        if(error){ console.error(error); return null }
        const { data } = supabase.storage.from("chatbot-logos").getPublicUrl(filePath)
        return data.publicUrl
}

const Extract_and_store = async (file) => {
  if (!file) return null;
  if (!(file instanceof File)) {
    console.error("Expected a File object, got:", typeof file, file);
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
};

const Create_bot = async () => {

  if (!name) return alert("Enter a name!");
  if (!user) return alert("No user found");
  if(logo === null) return alert("Upload a logo");

  setLoading(true)

  const logoUrl = await Upload_logo();

  const generate_token = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);;

  const { data, error } = await supabase.from("chatbots")
    .insert({ owner_id: user.id, name, logo_url: logoUrl, type, color, prompt,message_limit:200,share_token:generate_token()})
    .select()
    .single();

  if (error) { console.error(error); return; }

  const {data:profile,error:profileErr} = await supabase
  .from("profiles")
  .update({chatbot_count:(data.chatbot_count || 0) + 1})
  .eq("id", user.id)
  .single();

  const trainingText = await Extract_and_store(trainingFile);

  const { error: updateError } = await supabase.from("chatbots")
    .update({ file_text: trainingText })
    .eq("id", data.id);

  if (updateError) { console.error(updateError); return; }

  const {data:user,error:userror} = await supabase
  .from("profiles")
  .update({ chatbot_count: (profile.chatbot_count || 0) + 1 })

  setChatbotId(data.id)
  if(data.plan != "free"){
    setStep(4)
  }
  else{
     window.location.reload()
  }
};

    return(
        <div className={styles.Steps_container}>
                 <div className={styles.Head}>
        
        <h3 onClick={() => window.location.reload()}><MoveLeft size={14}/>Back</h3>
        
        </div> 
            <div className={styles.Steps_card}>
<h1>Train your Agent</h1>
                <small>Train your chat agent by adding different kind of sources</small><br/>
            
            <label>Prompt</label><br/>
    <textarea type="text" style={{fontSize:"12px"}} onChange={(e) => setPrompt(e.target.value)} value={prompt} placeholder="Type something"
 required/><br/>

                <label style={{marginTop:"30px"}}>Upload Knowledge</label><br/>
<input type="file" onChange={(e) => setTrainingFile(e.target.files[0])} accept="application/pdf, text/plain, text/csv, text/markdown" id="file-upload"/>

<label htmlFor="file-upload" className={styles.custom_button} placeholder="Upload Pdfs,text,spreadsheet  🗎">
 <small>📄 Upload Pdfs,text,spreadsheet</small>
</label>

  <div className={styles.btn_wrapper}>
    <button onClick={() => Create_bot()} disabled={creating}>Create</button>
    <button onClick={() => setStep(2)}>Previous</button>
  </div>
           </div>

        </div>
    )
}

export function Step_4({ chatbotId }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const connectInstagram = () => {
    if (!chatbotId) return alert("Chatbot not ready, please wait.")
    window.location.href = `${BACKEND_URL}/auth/instagram?chatbotId=${chatbotId}`
  }

  return (
    <div className={styles.Steps_container}>
      <div className={styles.Head}>
        <h3 onClick={() => window.location.reload()}><MoveLeft size={14} />Back</h3>
      </div>
      <div className={styles.Steps_card}>
        <h1>Connect Instagram</h1>
        <small>Link your Instagram Business account so your chatbot can reply to DMs automatically.</small>
        <div className={styles.btn_wrapper}>
          <button onClick={connectInstagram}>
            Connect Instagram
          </button>
          <button onClick={() => window.location.reload()}>Skip for now</button>
        </div>
      </div>
    </div>
  )
}

export function Form_container({onComplete}){

const [step,setStep] = useState(1)
const [chatbotId, setChatbotId] = useState(null)
const [name,setName] = useState("")
const [type,setType] = useState("Customer_Care")
const [color,setColor] = useState("#ffffff")
const [logo,setLogo] = useState(null)
const [prompt,setPrompt] = useState("")
const [profile,setData] = useState(null)

const {user} = useAuth();

useEffect(() => {

const Profile_Check = async () => {

const {data,error} = await supabase
.from("profiles")
.select("*")
.eq("id",user.id)

if(error){
  console.error(error)
  return;
}

setData(data[0])

}

Profile_Check()

},[])


if(step === 1) return <Step_1 onNext={() => setStep(2)} step={step} name={name} setName={setName} type={type} setType={setType} color={color} setColor={setColor}/>
if(step === 2) return <Step_2 step={step} setStep={setStep} name={name} setName={setName} type={type} setType={setType} color={color} setColor={setColor} logo={logo} setLogo={setLogo} prompt={prompt} setPrompt={setPrompt}/>
if(step === 3) return <Step_3 step={step} setStep={setStep} name={name} setName={setName} type={type} setType={setType} color={color} setColor={setColor} logo={logo} setLogo={setLogo} prompt={prompt} setPrompt={setPrompt} setChatbotId={setChatbotId} profile={profile}/>
if(step === 4 && data.plan === "Growth") return <Step_4 chatbotId={chatbotId} />

}
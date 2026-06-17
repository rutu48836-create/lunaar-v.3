import { useState } from "react";
import { supabase } from "../Components/supabase";
import styles from "../Styles/sign_in.module.css"
import { Send, SendHorizonal } from "lucide-react";
import {useNavigate} from "react-router-dom"
import space from "../assets/space.png"
import mobile from "../assets/mobile.png"

export function Sign_In(){


 const [email,setEmail] = useState("")
 const navigate = useNavigate()

 async function login(email){

      const { error } = await supabase.auth.signInWithOtp({
    email
  })

  if (error) {
    alert("Error sending OTP")
  } else {
    alert("Check your email for login link")
  }


 }

const handleGoogleLogin = async () => {
  supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `http://localhost:5173/dashboard`
  }
})
}

const handleGitLogin = async () => {
  supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `https://lunaar.online/dashboard`
  }
})
}



 return (
    <>
    
    <div className={styles.Sign_in_wrapper}>
      <div className={styles.Sign_in_head}>
        <h2 onClick={() => navigate('/')}>Home</h2><span></span>
      </div>
        <div className={styles.Main_form}>
        <div className={styles.solar_bg}>     
        </div>

        <div className={styles.content}>
          <h1><Send size={30}/></h1>
            <h2>Welcome to lunaar</h2>
            <span>Create a account or login in seconds</span>           
           <div className={styles.Sign_in_provider}>
            <div className={styles.provider_card} onClick={handleGoogleLogin}>
              <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <rect width="28" height="28" rx="4" fill="transparent"/>
  <g fill="none" stroke="#ffffff" strokeWidth="1.2">
    <path d="M25.5 14.3c0-.79-.07-1.55-.2-2.28H14.2v4.31h6.36c-.27 1.47-1.1 2.72-2.36 3.55v2.95h3.8c2.22-2.05 3.5-5.07 3.5-8.53z"/>
    <path d="M14.2 25.6c3.2 0 5.88-1.06 7.84-2.86l-3.8-2.95c-1.06.71-2.42 1.13-4.04 1.13-3.1 0-5.73-2.1-6.67-4.92H3.6v3.05C5.55 23.1 9.55 25.6 14.2 25.6z"/>
    <path d="M7.53 16c-.25-.71-.4-1.47-.4-2.25s.15-1.54.4-2.25v-3.05H3.6A11.6 11.6 0 0 0 2.4 13.75c0 1.87.45 3.64 1.2 5.3l3.93-3.05z"/>
    <path d="M14.2 6.84c1.77 0 3.34.61 4.59 1.8l3.35-3.35C20.07 3.4 17.4 2.4 14.2 2.4c-4.65 0-8.65 2.5-10.6 6.3l3.93 3.05c.94-2.82 3.57-4.91 6.67-4.91z"/>
  </g>
</svg>Continue with Google</div>

          <div className={styles.provider_card_2} onClick={handleGitLogin}>
            <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <rect width="28" height="28" rx="4" fill="transparent"/>
  <g fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M25.1 12.7L15.3 2.9c-.6-.6-1.5-.6-2.1 0l-2 2 2.6 2.6c.6-.2 1.3-.1 1.8.4.5.5.6 1.2.4 1.8l2.5 2.5c.6-.2 1.3-.1 1.8.4.7.7.7 1.9 0 2.6-.7.7-1.9.7-2.6 0-.5-.5-.7-1.3-.4-1.9l-2.3-2.3v6.1c.2.1.3.2.5.3.7.7.7 1.9 0 2.6-.7.7-1.9.7-2.6 0-.7-.7-.7-1.9 0-2.6.2-.2.4-.3.6-.4v-6.2c-.2-.1-.4-.2-.6-.4-.5-.5-.6-1.3-.4-1.9L9.5 6.2l-6.6 6.6c-.6.6-.6 1.5 0 2.1l9.8 9.8c.6.6 1.5.6 2.1 0l10.3-10.3c.6-.6.6-1.5 0-2.1z"/>
    <circle cx="9.1" cy="5.9" r="0.6" fill="#ffffff" stroke="none"/>
  </g>
</svg>Continue with Git</div>

<small className={styles.caution_msg}>by creating a account you agree to our <a href="/privacy-policy"> Privacy policy</a></small>
           
           </div>

  
</div></div></div>

    </>
 )


}
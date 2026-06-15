
import {useState, useEffect} from "react"
import {useAuth} from "../Components/AuthContext.jsx"
import { supabase } from "../Components/supabase"
import styles from "../Styles/Pricing_Page.module.css"
import {useNavigate} from "react-router-dom"
import {Check} from "lucide-react"
import {Navbar} from "./Landing.jsx"

export function Pricing_Page(){

const {user} = useAuth()
const navigate = useNavigate()

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL


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

const Pro_plan = async () => {

if(!user){
    navigate("/Auth")
    return
}

 handleUpgrade()

}

return(

    <div className={styles.Page_Container}>
        <Navbar/>

    <h1 className={styles.Page_Title}>Pricing Plan</h1>

    <div className={styles.Pricing_cards_wrapper}>
        <div className={styles.Pricing_card}>
            <h2>Free</h2>
            <span>great for new users and businesses who are trying out the platform</span>

            <div className={styles.Price}><h1>$0</h1>/<p>per month</p></div>

          <div className={styles.Including_list}>
            <h3>Includes</h3>
            <ul>
                <li><div className={styles.check}><Check size={14}/></div>1 chatbot</li>
                                <li><div className={styles.check}><Check size={14}/></div>only f&q chatbot</li>
                <li><div className={styles.check}><Check size={14}/></div>link intergation</li>
                <li><div className={styles.check}><Check size={14}/></div>50 messages per month</li>
            </ul>

            <button onClick={() => navigate("/Dashboard")}>Get Started</button>
          </div>

        </div>

           <div className={styles.Pricing_card}>
            <h2>Pro</h2>
            <span>great for businesses who need more features and advance intergation</span>

            <div className={styles.Price}><h1>₹299</h1>/<p>per month</p></div>

          <div className={styles.Including_list}>
            <h3>Includes</h3>
            <ul>
                <li><div className={styles.check}><Check size={14}/></div>3 chatbot</li>
                                                <li><div className={styles.check}><Check size={14}/></div>3 types of chatbot</li>
                <li><div className={styles.check}><Check size={14}/></div>link & instagram intergation</li>
                <li><div className={styles.check}><Check size={14}/></div>1000 messages per month</li>
            </ul>

            <button onClick={() => Pro_plan()} className={styles.upgrade_btn}>Upgrade</button>
          </div>

        </div>
    </div>



    </div>







)

}

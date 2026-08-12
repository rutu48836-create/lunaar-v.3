import { useState } from "react"
import styles from "../Styles/Landing.module.css"
import { Navbar } from "../components/landing_nav"
import { Share, Send, Lock, X, Phone, Paperclip, ArrowUp, Image as ImageIcon, TextAlignStart } from "lucide-react";

function Hero() {
  return (
    <div className={styles.hero_wrapper}>
      <Navbar />
      <div className={styles.Main_content_hero}>
        <h1>Make motion graphics from prompt</h1>
        <span>create visual graphics,demos,promo...</span>
        <div className={styles.input_container}>
          <textarea placeholder="Enter Prompt here...." />
          <div className={styles.input_btns}>
            <div className={styles.left}>
              <button><Paperclip size={16} /></button>
              <input
                type="file"
                accept="image/*"
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
            <button className={styles.send}>
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Video_details() {
  return (
    <div className={styles.Video_wrapper}>
      <h2>Explore the limits</h2>
      <div className={styles.Videos}>
        <video src="https://kdnkfexczicoctzszrzd.supabase.co/storage/v1/object/public/videos/752671.mp4" width="200" autoPlay muted loop playsInline controls />
        <video src="https://kdnkfexczicoctzszrzd.supabase.co/storage/v1/object/public/videos/944547.mp4" autoPlay muted loop playsInline controls />
        <video src="https://kdnkfexczicoctzszrzd.supabase.co/storage/v1/object/public/videos/625728.mp4" autoPlay muted loop playsInline controls />
        <video src="https://kdnkfexczicoctzszrzd.supabase.co/storage/v1/object/public/videos/692668.mp4" width="200" autoPlay muted loop playsInline controls />
        <video src="https://kdnkfexczicoctzszrzd.supabase.co/storage/v1/object/public/videos/285885.mp4" autoPlay muted loop playsInline controls />
        <video src="https://kdnkfexczicoctzszrzd.supabase.co/storage/v1/object/public/videos/930956.mp4" autoPlay muted loop playsInline controls />
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className={styles.Landing_page_wrapper}>
      <Hero />
      <Video_details />
    </div>
  )
}

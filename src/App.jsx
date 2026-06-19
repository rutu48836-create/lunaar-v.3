
import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './Frontend/Pages/Dashboard'
import { Sign_In } from './Frontend/Pages/sign_in'
import { AuthProvider } from './Frontend/Components/AuthContext'
import {ChatPage} from "./Frontend/Pages/Chat_Page.jsx"
import {Landing} from "./Frontend/Pages/Landing.jsx"
import { Features } from './Frontend/Pages/Features.jsx'
import { PrivacyPolicy } from './Frontend/Pages/Privacy_policy.jsx'
import {Pricing_Page} from "./Frontend/Pages/Pricing_Page.jsx"
import Refund from "./Frontend/Pages/Refund.jsx"

function App() {

  return (
    <AuthProvider>
<BrowserRouter>
      <Routes>
                        <Route path="/" element={<Landing />}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/auth" element={<Sign_In/>} />
                <Route path="/chat/:token" element = {<ChatPage/>} />
                <Route path="/features" element={<Features/>} />
                <Route path="privacy-policy" element={<PrivacyPolicy/>}/>
                 <Route path="/pricing" element={<Pricing_Page/>}/>
                 <Route path="/refund" element={<Refund/>}/>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App

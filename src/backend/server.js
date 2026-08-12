import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import chatbotRouter from "./routes/chat.js";
import dbRouter from "./routes/db_query.js"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 8000

app.use("/ai", chatbotRouter)
app.use("/db",dbRouter)

app.listen((PORT), () => {
    console.log('port is running on 8000')
})
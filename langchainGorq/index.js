const express = require("express");
const dotenv = require("dotenv");
const {ChatGoogleGenerativeAI} = require("@langchain/google-genai")
const {ChatGroq} = require("@langchain/groq")
dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());

const llm = new ChatGroq({
    model:"llama-3.3-70b-versatile",
    temperature:0.7,
    maxTokens:30
})

app.post("/ai",async(req,res)=>{
    const {input} = req.body 
    const response=await llm.invoke([
        {role:"system",content:"You are jarvis an ai assistant"},
        {role:"human",content:input}
    ])
    return res.status(200).json({"ai: ": response.content})
})



app.get("/", (req, res) => {
    res.json({
        message: "HELLO FROM level4",
    });
});

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
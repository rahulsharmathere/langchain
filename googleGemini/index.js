const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = 5000;

app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
    const ai = new GoogleGenAI({});

    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: "Explain how AI works in a few words"
    });
    console.log(interaction.output_text);

}
main();


app.post("/ai",async (req,res)=>{
    const {prompt}=req.body;
    const ai = new GoogleGenAI({});

    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: prompt
    });
    res.status(200).json({"message" : `${interaction.output_text}`})
    
})

app.get("/", (req, res) => {
    res.json({
        message: "HELLO FROM level4",
    });
});

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
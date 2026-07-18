const express = require("express");
const dotenv = require("dotenv");
const {ChatGoogleGenerativeAI} = require("@langchain/google-genai")
const {ChatGroq} = require("@langchain/groq");
const { Annotation, StateGraph, MessagesAnnotation, MemorySaver } = require("@langchain/langgraph");
const { ToolNode } = require("@langchain/langgraph/prebuilt")
const { TavilySearch } = require("@langchain/tavily")
dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());

const tool = new TavilySearch({
    maxResults:5,
    topic:"general"
});

const checkPointer=new MemorySaver()


const tools=[tool]
const toolNode=new ToolNode(tools) 



const llm = new ChatGroq({
    model:"llama-3.1-8b-instant",
    temperature:0.7,
    maxTokens:30,
    maxRetries:2
}).bindTools(tools)


const callLLM=async(state)=>{
    console.log("State:",state)
    
    const response=await llm.invoke([
        {role:"system",content:"You are jarvis an ai assistant. Use memory of conversation first. Only use tools when answer requires external real time information , not for simple conversations,greetings,or personal context. if you dont know answer dont give wrong answer call relevent tool"},
        ...state.messages
    ])

    return {messages:[response]}
}

const shouldContinue=async(state)=>{
    const lastMessage=state.messages[state.messages.length-1]
    if(lastMessage.tool_calls.length>0){
        return "tools"
    }
    return "__end__"
    
}

const graph = new StateGraph(MessagesAnnotation)
.addNode("agent",callLLM)
.addNode("tools",toolNode)  
.addEdge("__start__","agent")
.addEdge("tools","agent")
.addConditionalEdges("agent",shouldContinue)
.compile({checkpointer:checkPointer})

// .addEdge("agent","__end__")

app.post("/ai",async(req,res)=>{
    const {input} = req.body 
    const response=await graph.invoke({
        messages:[
        {
            role:"user",
            content:input
        }
        ]},
        {configurable:{thread_id:"user123"}}
    )
    console.log(response)
    return res.status(200).json({"ai: ": response.messages[response.messages.length-1].content})
})



app.get("/", (req, res) => {
    res.json({
        message: "HELLO FROM level4",
    });
});

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
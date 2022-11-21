const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://simran1002:Simran10@cluster0.lapfqtf.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connection successful");
}).catch((e)=>{
    console.log(e)
    console.log("no connection");
})
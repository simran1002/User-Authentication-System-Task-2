const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    nickname:{
        type:String,
        required:true,
    },
    
    password:{
        type:String,
        required:true,
    },
    confirmpassword:{
        type:String,
        required:true,
    },
    role:{
        type:[{
            type:String,
            enum:["user","admin"]
        }],
        default:["user"]
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    last_logged_in:{
        type:Date,
        default:Date.now
    }
});


userSchema.methods.generateAuthToken=async function(){
    try {
        console.log(this._id)
        const token=jwt.sign({_id:this._id.toString},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (e) {
        console.log(e);
        res.send(e);
    }
}

userSchema.methods.generateresetToken=async function(){
    try {
        
        console.log(this._id.toString());

        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY,{
            expiresIn:"15m"
        });
        this.tokens=this.tokens.concat({token:token});
        return token;
    } catch (e) {
        console.log(e);
        res.send(e);
    }
}





userSchema.pre("save",async function(next){
    if(this.isModified("password")){
       
        this.password=await bcrypt.hash(this.password,10);
       

        this.confirmpassword=await bcrypt.hash(this.password,10);;
    }

    next();

});

userSchema.pre("updateOne",async function(next){
    if(this.isModified("password")){
        
        this.password=await bcrypt.hash(this.password,10);
       

        this.confirmpassword=await bcrypt.hash(this.password,10);;
    }

    next();

});


const Register=mongoose.model("User",userSchema);

module.exports=Register;


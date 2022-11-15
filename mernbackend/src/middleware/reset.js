const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");


userSchema.methods.generateAToken=async function(){
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
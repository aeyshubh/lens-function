const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
    walletAddress:{type: String,required:true,},
    lens_id:{type:String,required:true,},
    nature:{type:String,required:true,enum:{
        values:["Earth","Water","Fire","Nature"],
    }},
    attack1:{type:Number,required:true,},attack2:{type:Number,required:true,},attack3:{type:Number,required:true,},
})

module.exports= mongoose.model('Attribute',modelSchema)
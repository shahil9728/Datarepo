const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/laden').then(()=>{
    console.log('mongodb connection established');
}).catch(()=>{
    console.log('connection Error');
})
const employe= new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    roll:{
        type:Number,
        required:true,
        unique:true
    },
    section:{
        type:String,
        required:true,
        unique:true
    },
    reg:{
        type:String,
        required:true,
        unique:true
    }
});
const Register=mongoose.model('Register',employe);
module.exports = { Register };
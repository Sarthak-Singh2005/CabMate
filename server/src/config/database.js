const mongoose = require("mongoose");
const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGOURL);
        console.log("MongoDb Connected");
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}
module.exports = connectDb;
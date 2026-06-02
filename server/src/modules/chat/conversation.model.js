const mongoose = require("mongoose");

const conversationSchema =
new mongoose.Schema({
   rideId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Ride",
   },
   participants:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"User",
      }
   ],

},
{
   timestamps:true,
});

module.exports =
mongoose.model(
   "Conversation",
   conversationSchema
);
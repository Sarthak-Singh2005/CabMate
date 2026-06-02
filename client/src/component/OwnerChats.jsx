import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function OwnerChats() {
  const { rideId } = useParams();
  const [message, setMessage] = useState("");
  const [acceptreq, setAcceptreq] = useState("");
  const [accept,setAccept] =useState(false);
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [ownerId, setOwnerId] = useState("");

  const fetchChats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/ride/${rideId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations);
      } else {
        setMessage(data.message);
      }
      setOwnerId(data.ownerId);
    } catch (err) {
      console.log(err);
    }
  };
  const acceptBooking = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/rides/bookingconfirm",
        {
          method: "GET",
          credentials: "include",
        },
      );
      const acceptreq = await res.json();
      console.log("yes", acceptreq);
      if(acceptreq==true){
        setAccept(true);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchChats();
  }, []);
  useEffect(() => {
    acceptBooking();
  }, []);

  return (
    <div className="owner-chat-page">
      <h1 className="OwnMessHead">People Who Contacted You</h1>
      {message && <h2 className="OwnMessHead">{message}</h2>}
      {conversations.map((conversation) => {
        const passenger = conversation.participants.find(
          (p) => p._id.toString() !== ownerId.toString(),
        );

        return (
          <div
            key={conversation._id}
            className="chat-user-card"
            
          >
            <div className="avatar">
              {passenger?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="chat-info">
              <h2>{passenger?.name}</h2>
              <button className="createbutton" onClick={() => navigate(`/chat/${conversation._id}`)}>Click to open conversation</button>
            </div>
            {accept&&<div className="acceptbtn">
              <h2>{passenger?.name} requested to join in cab</h2>
              <button className="createbutton" onClick={()=>alert("Working")}>Accept</button>
            </div>}
          </div>
        );
      })}
    </div>
  );
}

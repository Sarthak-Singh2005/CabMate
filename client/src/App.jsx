import React from "react";
import { Route, Routes } from "react-router-dom";
import Rides from "./component/Rides";
import Home from "./component/Home";
import Createride from "./component/Createride";
import Chat1 from "./component/Chat1";
import OwnerChats from "./component/OwnerChats";
export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/createride" element={<Createride/>} />
        <Route path="/:id1/edit" element={<Createride/>} />
        <Route path="/chat/:id" element={<Chat1 />} />
        <Route path="/ownerchats/:rideId" element={<OwnerChats />} />
      </Routes>
    </div>
  );
}

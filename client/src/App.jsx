import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { socket } from "./socket";
import Rides from "./component/Rides";
import Home from "./component/Home";
import Createride from "./component/Createride";
import Chat1 from "./component/Chat1";
import OwnerChats from "./component/OwnerChats";
import { Toaster, toast } from "react-hot-toast";
export default function App() {
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("join", userId);
    }
  }, []);

  useEffect(() => {
    const handleNotification = (notification) => {
      const handlers = {
        booking_request: () => {
          toast.success(
            notification.message || "New booking request received.",
          );
        },

        booking_accepted: () => {
          toast.success(
            notification.message || "Your booking request was accepted.",
          );
        },

        booking_rejected: () => {
          toast.error(
            notification.message || "Your booking request was rejected.",
          );
        },

        new_message: () => {
          toast(notification.message || "You have a new message.");
        },
      };

      handlers[notification.type]?.();
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/createride" element={<Createride />} />
        <Route path="/:id1/edit" element={<Createride />} />
        <Route path="/chat/:id" element={<Chat1 />} />
        <Route path="/ownerchats/:rideId" element={<OwnerChats />} />
      </Routes>
    </div>
  );
}

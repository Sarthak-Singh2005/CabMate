import React from "react";
import { Route,Routes } from "react-router-dom";
import Rides from "./component/Rides";
import Home from "./component/Home";
export default function App(){
  return(
  <div>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/rides" element={<Rides/>}/>
    </Routes>
  </div>
)
}
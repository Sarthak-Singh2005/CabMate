import React from "react";
import { Route,Routes } from "react-router-dom";
import Rides from "./component/Rides";
import Home from "./component/Home";
import Createride from "./component/Createride"
export default function App(){
  return(
  <div>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/rides" element={<Rides/>}/>
      <Route path="/createride" element={<Createride/>}/>
    </Routes>
  </div>
)
}
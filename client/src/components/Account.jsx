import React, { useState } from "react";
import Login from "./Login";
import Sign from "./Sign";
export default function Account() {
  const [isLogin, setIslogin] = useState(true);
  return (
    <div>
      {isLogin ? <Login setIslogin={setIslogin} /> : <Sign setIslogin={setIslogin}/>}
    </div>
  );
}

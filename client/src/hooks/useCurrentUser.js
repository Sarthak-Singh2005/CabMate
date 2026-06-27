import { useEffect, useState } from "react";
import { socket } from "../socket";

export function useCurrentUser() {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  useEffect(() => {
    const syncUser = () => {
      setUserId(localStorage.getItem("userId"));
    };

    const handleSocketAuthError = () => {
      localStorage.removeItem("userId");

      syncUser();
    };

    window.addEventListener("storage", syncUser);

    window.addEventListener("cabmate-auth-change", syncUser);

    window.addEventListener("focus", syncUser);

    socket.on("connect_error", handleSocketAuthError);

    return () => {
      window.removeEventListener("storage", syncUser);

      window.removeEventListener("cabmate-auth-change", syncUser);

      window.removeEventListener("focus", syncUser);

      socket.off("connect_error", handleSocketAuthError);
    };
  }, []);

  return userId;
}

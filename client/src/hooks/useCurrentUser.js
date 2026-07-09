import { useEffect, useState } from "react";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";

export function useCurrentUser() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem("userId") || undefined,
  );

  useEffect(() => {
    let isMounted = true;

    const setCurrentUserId = (nextUserId) => {
      if (nextUserId) {
        localStorage.setItem("userId", nextUserId);
      } else {
        localStorage.removeItem("userId");
      }

      if (isMounted) {
        setUserId(nextUserId || null);
      }
    };

    const verifyCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!isMounted) {
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.user?.id);
          return;
        }

        if (res.status === 401) {
          setCurrentUserId(null);
          return;
        }

        if (!localStorage.getItem("userId")) {
          setUserId(null);
        }
      } catch {
        if (isMounted && !localStorage.getItem("userId")) {
          setUserId(null);
        }
      }
    };

    const syncUser = () => {
      setUserId(localStorage.getItem("userId") || null);
    };

    const syncAndVerifyUser = () => {
      syncUser();
      verifyCurrentUser();
    };

    const handleSocketAuthError = () => {
      setCurrentUserId(null);
    };

    window.addEventListener("storage", syncAndVerifyUser);

    window.addEventListener("cabmate-auth-change", syncAndVerifyUser);

    window.addEventListener("focus", verifyCurrentUser);

    socket.on("connect_error", handleSocketAuthError);

    verifyCurrentUser();

    return () => {
      isMounted = false;

      window.removeEventListener("storage", syncAndVerifyUser);

      window.removeEventListener("cabmate-auth-change", syncAndVerifyUser);

      window.removeEventListener("focus", verifyCurrentUser);

      socket.off("connect_error", handleSocketAuthError);
    };
  }, []);

  return userId;
}

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function ActiveTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const updateActive = async () => {
      try {
        await axios.post("/api/profile/active");
      } catch (error) {
        // Silent error
      }
    };

    // Initial update
    updateActive();

    // Update every 2 minutes
    const interval = setInterval(updateActive, 120000);

    return () => clearInterval(interval);
  }, [status]);

  return null;
}

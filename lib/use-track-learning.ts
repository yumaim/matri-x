"use client";

import { useEffect } from "react";

export function useTrackLearning(...topicIds: string[]) {
  useEffect(() => {
    topicIds.forEach((topicId) => {
      fetch("/api/users/progress/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, completed: true }),
      }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

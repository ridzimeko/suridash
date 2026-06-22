import { useEffect, useState } from "react";
import { getSession } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    getSession()
      .then((data: any) => {
        if (isMounted) {
          setUser(data?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    loading,
  };
}

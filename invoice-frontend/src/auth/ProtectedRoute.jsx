import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "./AuthContext";

const PILARGROUP_URL = import.meta.env.VITE_PILARGROUP_URL || "https://pilargroup.id";
const APP_KEY = "billforge";

export default function ProtectedRoute({ children }) {
  const { user, loading, redirectToLogin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      redirectToLogin();
      return;
    }

    if (!user.apps?.includes(APP_KEY)) {
      window.location.href = `${PILARGROUP_URL}/dashboard`;
    }
  }, [loading, user, redirectToLogin]);

  if (loading || !user || !user.apps?.includes(APP_KEY)) {
    return (
      <>
        {/* loading */}
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <CircularProgress size={36} sx={{ color: "#4F46E5" }} />
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", color: "rgba(14,60,110,0.5)" }}>
            {loading ? "Memverifikasi sesi..." : "Mengarahkan..."}
          </Typography>
        </Box>
      </>
    );
  }

  return children;
}
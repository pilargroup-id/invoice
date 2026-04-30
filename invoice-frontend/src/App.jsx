import { useRef, useState } from "react";
import axios from "axios";
import { Box, Snackbar, Stack, Typography } from "@mui/material";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ProcessStatus from "./components/ProcessStatus";
import ResultCard from "./components/ResultCard";
import UploadCard from "./components/UploadCard";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { BackgroundMain, Header, Sidebar } from "./templateComponents";
import "./templateComponents/templateComponents.css";

const API_BASE = "";
const POLL_INTERVAL_MS = 1500;

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, #root": {
          margin: 0,
          padding: 0,
          minHeight: "100%",
          width: "100%",
        },
      },
    },
  },
});

const snackbarConfig = {
  success: {
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />,
    bg: "linear-gradient(135deg, #059669, #10B981)",
    shadow: "0 8px 24px rgba(16,185,129,0.35)",
  },
  error: {
    icon: <ErrorRoundedIcon sx={{ fontSize: 20 }} />,
    bg: "linear-gradient(135deg, #DC2626, #EF4444)",
    shadow: "0 8px 24px rgba(220,38,38,0.35)",
  },
  warning: {
    icon: <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />,
    bg: "linear-gradient(135deg, #D97706, #FBBF24)",
    shadow: "0 8px 24px rgba(217,119,6,0.35)",
  },
  info: {
    icon: <InfoRoundedIcon sx={{ fontSize: 20 }} />,
    bg: "linear-gradient(135deg, #233971, #4A7FC1)",
    shadow: "0 8px 24px rgba(35,57,113,0.30)",
  },
};

function InvoiceApp() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [outputFolder, setOutputFolder] = useState("invoices_output");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Belum ada proses.");
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [jobStatus, setJobStatus] = useState("idle");
  const [currentInvoice, setCurrentInvoice] = useState("");
  const [currentCount, setCurrentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, severity, message });
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/progress/${jobId}`);
        const data = res.data;
        setJobStatus(data.status);
        setProgress(data.percent ?? 0);
        setStatusText(data.message ?? "");
        setCurrentInvoice(data.current_invoice ?? "");
        setCurrentCount(data.current ?? 0);
        setTotalCount(data.total ?? 0);

        if (data.status === "completed") {
          stopPolling();
          setIsProcessing(false);
          setResult(data);
          showSnackbar(
            data.message || `${data.total_invoices ?? data.total} invoice berhasil dibuat.`,
            "success"
          );
        }

        if (data.status === "failed") {
          stopPolling();
          setIsProcessing(false);
          setErrorMsg(data.error ?? "Terjadi kesalahan.");
          setStatusText("Terjadi kesalahan saat proses generate.");
          setProgress(0);
          showSnackbar(data.error || "Gagal memproses invoice.", "error");
        }
      } catch (err) {
        console.warn("[polling error]", err);
      }
    }, POLL_INTERVAL_MS);
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setResult(null);
    setStatusText("File siap diproses.");
    setProgress(0);
    setJobStatus("idle");
    setCurrentInvoice("");
    setCurrentCount(0);
    setTotalCount(0);
    setErrorMsg("");
  };

  const handleReset = () => {
    stopPolling();
    setSelectedFile(null);
    setOutputFolder("invoices_output");
    setIsProcessing(false);
    setProgress(0);
    setStatusText("Belum ada proses.");
    setResult(null);
    setJobStatus("idle");
    setCurrentInvoice("");
    setCurrentCount(0);
    setTotalCount(0);
    setErrorMsg("");
    showSnackbar("Form berhasil direset.", "info");
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      showSnackbar("Silakan pilih file Excel terlebih dahulu.", "warning");
      return;
    }

    stopPolling();
    setIsProcessing(true);
    setProgress(10);
    setStatusText("Menyiapkan upload file...");
    setResult(null);
    setJobStatus("queued");
    setCurrentInvoice("");
    setCurrentCount(0);
    setTotalCount(0);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("output_folder", outputFolder);

      setProgress(25);
      setStatusText("Mengunggah file ke backend...");

      const response = await axios.post(`${API_BASE}/generate-invoices`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const mappedProgress = Math.min(20 + Math.round(percent * 0.4), 60);
          setProgress(mappedProgress);
          setStatusText(`Upload file... ${percent}%`);
        },
      });

      const data = response.data;

      if (!data.job_id) {
        setResult(data);
        setProgress(100);
        setJobStatus("completed");
        setStatusText(data.message || "Generate invoice selesai.");
        showSnackbar(data.message || "Invoice berhasil dibuat.", "success");
        setIsProcessing(false);
        return;
      }

      setStatusText("File berhasil diupload, menunggu proses backend...");
      setJobStatus("queued");
      startPolling(data.job_id);
    } catch (error) {
      console.error("Generate invoice error:", error);

      let errorMessage = "Gagal memproses invoice.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      stopPolling();
      setJobStatus("failed");
      setErrorMsg(errorMessage);
      setStatusText("Terjadi kesalahan saat proses generate.");
      setProgress(0);
      setResult(null);
      setIsProcessing(false);
      showSnackbar(errorMessage, "error");
    }
  };

  const handleSidebarAction = (action) => {
    if (action === "logout") {
      logout();
    }
  };

  const cfg = snackbarConfig[snackbar.severity] ?? snackbarConfig.info;

  const shellClass = [
    "dashboard-shell",
    sidebarCollapsed ? "dashboard-shell--sidebar-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <BackgroundMain />

      <div className={shellClass}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        activePath="/"
        userName={user?.name ?? "User"}
        userRole={user?.job_position ?? user?.department ?? "Invoice System"}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onCloseMobile={() => setSidebarMobileOpen(false)}
        onAction={handleSidebarAction}
      />

      <div className="dashboard-stage">
        <Header
          title="Bill Forge"
          breadcrumb={[{ label: "Invoice Generator", active: true }]}
          showMenuButton
          onMenuToggle={() => setSidebarMobileOpen((v) => !v)}
        />

        <main className="dashboard-main">
          <Stack spacing={3}>
            <UploadCard
              selectedFile={selectedFile}
              outputFolder={outputFolder}
              setOutputFolder={setOutputFolder}
              onFileChange={handleFileChange}
              onGenerate={handleGenerate}
              onReset={handleReset}
              isProcessing={isProcessing}
              jobStatus={jobStatus}
              statusText={statusText}
              current={currentCount}
              total={totalCount}
            />

            <ProcessStatus
              isProcessing={isProcessing}
              progress={progress}
              statusText={statusText}
              selectedFile={selectedFile}
              jobStatus={jobStatus}
              currentInvoice={currentInvoice}
              current={currentCount}
              total={totalCount}
              error={errorMsg}
            />

            {result && <ResultCard result={result} />}
          </Stack>

          <Box sx={{ mt: 5, mb: 1, textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(35,57,113,0.45)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              © 2026 PT Pilar Niaga Makmur. All rights reserved.
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(35,57,113,0.45)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Developed by IT Team PT Pilar Niaga Makmur.
            </Typography>
          </Box>
        </main>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            borderRadius: "16px",
            background: cfg.bg,
            boxShadow: cfg.shadow,
            color: "#fff",
            minWidth: 260,
            maxWidth: 400,
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            "@keyframes slide-up": {
              from: { opacity: 0, transform: "translateY(16px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
            animation: "slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <Box sx={{ flexShrink: 0, display: "flex" }}>{cfg.icon}</Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.87rem",
              flex: 1,
              lineHeight: 1.4,
            }}
          >
            {snackbar.message}
          </Typography>
          <Box
            onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{
              cursor: "pointer",
              opacity: 0.7,
              fontSize: "1.1rem",
              lineHeight: 1,
              flexShrink: 0,
              "&:hover": { opacity: 1 },
              userSelect: "none",
            }}
          >
            ×
          </Box>
        </Box>
      </Snackbar>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProtectedRoute>
          <InvoiceApp />
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}
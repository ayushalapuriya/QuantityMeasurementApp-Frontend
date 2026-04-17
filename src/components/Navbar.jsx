import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HistoryIcon from "@mui/icons-material/History";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate, useLocation } from "react-router-dom";
import { isGuest, removeToken } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("mode");
    navigate("/");
  };

  const isHistoryPage = location.pathname === "/history";

  return (
    <AppBar position="static" elevation={3}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
        >
          Quantity Measurement App
        </Typography>

        <Box>
          {isGuest() ? (
            // 👤 Guest Mode
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LoginIcon />} // 👈 Adds icon to the left
              onClick={() => {
                localStorage.removeItem("mode");
                navigate("/");
              }}
              sx={{
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Login
            </Button>
          ) : (
            <>
              {/* 🔁 Dashboard button ONLY on history page */}
              {isHistoryPage && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate("/dashboard")}
                  sx={{ borderColor: "white", mr: 2 }}
                >
                  Dashboard
                </Button>
              )}

              {/* 📜 History Button */}
              {!isHistoryPage && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate("/history")}
                  sx={{ borderColor: "white", mr: 2 }}
                >
                  History
                </Button>
              )}

              {/* 🚪 Logout */}
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

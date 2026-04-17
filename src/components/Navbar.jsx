import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate } from "react-router-dom";
import { isGuest, removeToken } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("mode"); // clear guest mode if any
    navigate("/");
  };

  return (
    <AppBar position="static" elevation={3}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* App Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            letterSpacing: 0.5,
          }}
        >
          Quantity Measurement App
        </Typography>

        {/* Right Side Buttons */}
        <Box>
          {isGuest() ? (
            // 👤 Guest Mode → Show Login Button
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => {
                localStorage.removeItem("mode"); // exit guest mode
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
            // 🔐 Logged-in Mode → Show History + Logout
            <>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<HistoryIcon />}
                onClick={() => navigate("/history")}
                sx={{ borderColor: "white", mr: 2 }}
              >
                History
              </Button>

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

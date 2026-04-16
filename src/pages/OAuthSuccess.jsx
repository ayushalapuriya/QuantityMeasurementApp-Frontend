import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveToken } from "../utils/auth";

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      saveToken(token);
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <p>Logging you in...</p>;
}

export default OAuthSuccess;
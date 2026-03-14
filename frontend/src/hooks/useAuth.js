import { useNavigate } from "react-router-dom";
import { clearAuthSession, getCurrentUser, isAuthenticated } from "../utils/helper";
import { disconnectSocket } from "../services/socketService";

const useAuth = () => {
  const navigate = useNavigate();

  const logout = () => {
    disconnectSocket();
    clearAuthSession();
    navigate("/login");
  };

  return {
    user: getCurrentUser(),
    isLoggedIn: isAuthenticated(),
    logout
  };
};

export default useAuth;

import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    login, 
    signup, 
    logout, 
    googleLogin, 
    completeGoogleRegistration,
    forgotPassword, 
    updateProfile 
  } = useAuthContext();
  
  return {
    user,
    loading,
    isAuthenticated,
    isReader: user?.role === "reader",
    isAuthor: user?.role === "author",
    isAdmin: user?.role === "admin",
    login,
    signup,
    register: signup, // Backward-compatible alias
    logout,
    googleLogin,
    loginWithGoogle: googleLogin, // Backward-compatible alias
    completeGoogleRegistration,
    forgotPassword,
    updateProfile
  };
};

export default useAuth;

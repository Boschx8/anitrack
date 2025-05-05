import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const login = () => loginWithRedirect();

  const logoutUser = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      }
    });
  };

  return {
    isAuthenticated,
    user,
    login,
    logout: logoutUser,
    isLoading,
    getAccessTokenSilently,
  };
};
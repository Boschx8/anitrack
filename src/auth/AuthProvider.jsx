import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const domain = "dev-ujx6mu4palvd72gp.us.auth0.com";  
  const clientId = "IsR59xZDwe26WkGVH1JKo33FFZcuaTQY";
  const redirectUri = window.location.origin;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
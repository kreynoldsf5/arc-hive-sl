// authProvider.js
import { MsalAuthProvider, LoginType } from 'react-aad-msal';
 
const config = {
  auth: {
    authority: process.env.REACT_APP_OIDC_AUTH,
    clientId: process.env.REACT_APP_OIDC_CLIENTID,
    redirectUri: process.env.REACT_APP_OIDC_REDIR
  },
  cache: {
    cacheLocation: "sessionStorage", //Session || Local
    storeAuthStateInCookie: false
  }
};
 
const authenticationParameters = {
  scopes: [
    'openid',
    'profile',
    'offline_access',
    process.env.REACT_APP_OIDC_MAGIC_SCOPE
  ]
}
 
export const authProvider = new MsalAuthProvider(config, authenticationParameters, LoginType.Redirect)

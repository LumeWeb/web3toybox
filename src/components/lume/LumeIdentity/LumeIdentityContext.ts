import React from "react";

export type Session = string;
export const LumeIdentityContext = React.createContext<{
  session: Session | undefined;
  setSession: React.Dispatch<React.SetStateAction<Session | undefined>>;
} | undefined>(undefined);
export function useLumeIndentity() {
  const contextValue = React.useContext(LumeIdentityContext);

  // When the `session` changes we want to update the `session` in the local storage?
  React.useEffect(() => {
    if (contextValue?.session) {
      localStorage.setItem('lume-session', contextValue.session);
    } else {
      localStorage.removeItem('lume-session');
    }
  }, [contextValue?.session]);

  // Get the session from the local storage
  React.useEffect(() => {
    const session = localStorage.getItem('lume-session');
    if (session) {
      contextValue?.setSession(session);
    }
  }, []);

  if (contextValue === undefined) {
    throw new Error('useLumeIndentity hook is being used outside of its context. Please ensure that it is wrapped within a <LumeIdentityProvider>.');
  }

  return {
    isSignedIn: !!contextValue.session,
    signIn: (key: string) => {
      console.log('signing in with key', key);
      // TODO: From the key generate a session, and store it
      contextValue.setSession('session');
    },
    signOut: () => {
      contextValue.setSession(undefined);
    },
  };
}
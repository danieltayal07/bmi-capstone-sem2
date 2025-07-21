import React from 'react';
import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const SignedIn = ({ children }) => {
  const [user] = useAuthState(auth);
  if (!user) return null;

  return <>{children}</>;
};

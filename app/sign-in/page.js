'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';

export default function Page() {
  const router = useRouter();
  const [signInUserWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const userCredential = await signInUserWithEmailAndPassword(email, password);
      if (userCredential) {
        router.push('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Google sign-in failed');
    }
    setLoading(false);
  };

  return (
    <div className="sign-in-wrapper">
  <h1 className="sign-in-heading">Sign In</h1>

  <button onClick={handleGoogleSignIn} className="google-btn">
    <IconBrandGoogle className="google-icon" />
    Sign in with Google
  </button>

  <input
    type="text"
    onChange={(e) => setEmail(e.target.value)}
    value={email}
    placeholder="Email"
    className="auth-input"
  />
  <input
    type="password"
    onChange={(e) => setPassword(e.target.value)}
    value={password}
    placeholder="Password"
    className="auth-input"
  />

  <button onClick={onSubmit} className="sign-in-btn">
    SIGN IN
  </button>
</div>

  );
}

'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { IconFidgetSpinner, IconBrandGoogle } from '@tabler/icons-react';
import {
  useCreateUserWithEmailAndPassword,
  useSendEmailVerification,
} from 'react-firebase-hooks/auth';

export default function Page() {
  const router = useRouter();
  const [createUser] = useCreateUserWithEmailAndPassword(auth);
  const [sendEmailVerification] = useSendEmailVerification(auth);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    setLoading(true);
    try {
      const userCredential = await createUser(email, password);
      if (userCredential) {
        await sendEmailVerification();
        router.push('/');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Google sign-up failed:', error);
      alert('Google sign-up failed');
    }
    setLoading(false);
  };

  return (
    <div className="signup-wrapper">
  <h1 className="signup-heading">Create account</h1>

  {loading ? (
    <IconFidgetSpinner className="spinner-small" />
  ) : (
    <>
      <button onClick={handleGoogleSignup} className="google-btn">
        <IconBrandGoogle className="google-icon" />
        Sign up with Google
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

      <button onClick={onSubmit} className="signup-btn">
        SIGN UP
      </button>
    </>
  )}
</div>

  );
}

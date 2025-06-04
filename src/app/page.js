"use client";
import React, { useState } from 'react';
import { API_URL } from './config/url';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError('Both fields are required!');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/builder-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Login successful:', data);

      localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user);
      alert('Login successful!');
      window.location.href = '/pagebuilder';

      setEmail('');
      setPassword('');
      setError('');
    } else {

      setError(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Something went wrong. Please try again later.');
  }
};


  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Please login to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            style={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>Login</button>
        </form>


      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #74ebd5, #9face6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '10px',
    fontSize: '24px',
    color: '#333',
  },
  subtitle: {
    marginBottom: '20px',
    color: '#777',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    transition: 'border 0.3s ease',
    outline: 'none',
    color: 'black',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    margin: 0,
  },
  button: {
    padding: '12px',
    backgroundColor: '#4a69bd',
    color: '#fff',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#555',
  },
  link: {
    color: '#4a69bd',
    textDecoration: 'none',
  },
};

export default Login;
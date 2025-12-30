import React, { useState } from "react";
import "../style/login.css";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const nav = useNavigate();

  const toggleForm = () => setIsActive(!isActive);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );
      alert("Registration successful! You can now login.");
      setIsActive(false);
      setRegisterData({ email: "", password: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      alert("Login successful!");
      nav("/dashboardone");
    } catch (error) {
      alert("Invalid credentials. " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google login successful!");
      nav("/dashboardone");
    } catch (error) {
      alert("Google sign-in failed: " + error.message);
    }
  };

  return (
    <div class="login-page">
        <div className={`container ${isActive ? "active" : ""}`}>
        {/* Login Form */}
        <div className="form-box login">
            <form className="form" onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
                <input
                type="email"
                placeholder="E-mail"
                value={loginData.email}
                onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                }
                required
                />
                <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-box">
                <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                }
                required
                />
                <i className="fa-solid fa-lock"></i>
            </div>
            <div className="forget-link">
                <a href="#">Forgot Password</a>
            </div>
            <button type="submit" className="btn" style={{margin:"5px"}}>Login</button>
            <button
                type="button"
                className="btn google-btn"
                style={{margin:"5px"}}
                onClick={handleGoogleLogin}
            >
                <i className="fa-brands fa-google"></i> Sign in with Google
            </button>
            </form>
        </div>

        {/* Registration Form */}
        <div className="form-box register">
            <form className="form" onSubmit={handleRegister}>
            <h1>Registration</h1>
            <div className="input-box">
                <input
                type="email"
                placeholder="E-mail"
                value={registerData.email}
                onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                }
                required
                />
                <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-box">
                <input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                }
                required
                />
                <i className="fa-solid fa-lock"></i>
            </div>
            <button type="submit" className="btn" style={{margin:"5px"}}>Register</button>
            <button
                type="button"
                className="btn google-btn"
                style={{margin:"5px"}}
                onClick={handleGoogleLogin}
            >
                <i className="fa-brands fa-google"></i> Sign in with Google
            </button>
            </form>
        </div>

        {/* Toggle Panel */}
        <div className="toggle-box">
            <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don’t have an account?</p>
            <button className="btn register-btn" onClick={toggleForm}>
                Register
            </button>
            </div>
            <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button className="btn login-btn" onClick={toggleForm}>
                Login
            </button>
            </div>
        </div>
        </div>
    </div>
  );
};

export default Login;

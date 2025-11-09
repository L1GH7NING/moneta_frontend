import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, XCircle, LogIn } from "lucide-react";
import api from "../api/axios";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import MonetaLogo from "../assets/MonetaTextOnly.png";
import { useAuth } from '../context/AuthProvider';

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const response = await api.post("/auth/google", {
          code: codeResponse.code,
        });
        setUser(response.data);
        navigate("/dashboard");
      } catch (err) {
        setMessage(
          "error|Google login failed: " +
            (err.response?.data?.message || err.message)
        );
      }
    },
    onError: (errorResponse) => {
      console.error("Google login failed:", errorResponse);
      setMessage("error|Google login failed");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login", form);
      setUser(response.data);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.message) {
        setMessage(
          `error|${
            err.response.data.message.charAt(0).toUpperCase() +
            err.response.data.message.slice(1)
          }`
        );
      } else {
        setMessage("error|Invalid credentials or server error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const messageText = message.split("|")[1];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4 font-alan">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white bg-opacity-70 rounded-lg shadow-2xl border border-white border-opacity-30 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-4">
              <Link to={"/"}>
                <img
                  src={MonetaLogo}
                  alt="Moneta Logo"
                  className=" h-12 w-auto"
                />
              </Link>
            </div>
            <h2 className="text-3xl text-gray-800 mb-2 font-bold">
              Welcome Back
            </h2>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl backdrop-blur-sm flex items-start gap-3 bg-red-100 bg-opacity-50 border border-red-200`}
            >
              <XCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{messageText}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="email"
                  name="email"
                  placeholder=" "
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white bg-opacity-60 backdrop-blur-sm border border-gray-200 border-opacity-50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800 peer"
                />
                <label className="absolute left-11 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm transition-all pointer-events-none peer-focus:top-0 peer-focus:left-3 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-white peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-white">
                  Email
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white bg-opacity-60 backdrop-blur-sm border border-gray-200 border-opacity-50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800 peer"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <label className="absolute left-11 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm transition-all pointer-events-none peer-focus:top-0 peer-focus:left-3 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-white peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-white">
                  Password
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r hover:outline-none from-orange-500 to-orange-600 text-white py-3.5 rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={() => googleLogin()}
            className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

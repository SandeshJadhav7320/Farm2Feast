import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useState } from "react";

export default function SignUp() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  // Frontend validation
  if (!form.name.trim()) {
    setError("Please enter your name.");
    return;
  }

  if (!form.email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  if (form.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  // Confirm password is checked ONLY on frontend
  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  // Only backend fields
  const userData = {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
  };

  try {
    const response = await fetch("http://localhost:8080/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to create account. Please try again."
      );
    }

    console.log("Account created successfully:", data);

    // Account created → go to sign in
    navigate("/signin");
  } catch (err) {
    console.error("Signup error:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">

        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-primary-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/10 p-8 md:p-10 border border-cream-200">

          {/* Logo */}
          <div className="text-center mb-7">
            <Link
              to="/"
              className="inline-flex flex-col items-center"
            >
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-3">
                <span className="font-display font-bold text-white text-lg">
                  F2F
                </span>

                <div className="absolute inset-0 rounded-full border-2 border-primary-300/50 animate-pulse-ring" />
              </div>

              <h1 className="font-display text-2xl font-bold text-ink-900">
                Farm2Feast
              </h1>

              <span className="text-[9px] tracking-[0.25em] text-primary-600 uppercase">
                Makhana
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h2 className="font-display text-2xl font-bold text-ink-900">
              Create Your Account
            </h2>

            <p className="text-sm text-ink-500 mt-2">
              Join Farm2Feast and discover premium Makhana
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />

                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />

                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Live password match indicator */}
              {form.confirmPassword && (
                <p
                  className={`text-xs mt-2 ${
                    form.password === form.confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {form.password === form.confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-cream-300 text-primary-600 focus:ring-primary-500"
              />

              <span className="text-xs leading-relaxed text-ink-500">
                I agree to the{" "}
                <span className="text-primary-600 font-medium">
                  Terms & Conditions
                </span>{" "}
                and{" "}
                <span className="text-primary-600 font-medium">
                  Privacy Policy
                </span>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all mt-2"
            >
              Create Account
            </button>
          </form>

          {/* Sign In */}
          <p className="text-center text-sm text-ink-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-ink-400 mt-6">
          © {new Date().getFullYear()} Farm2Feast. All rights reserved.
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import { saveAuthSession } from "../utils/helper";
import { mergeUserWithProfileMeta } from "../utils/profileStore";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(form);
      const mergedUser = mergeUserWithProfileMeta(data.user);
      saveAuthSession(data.token, mergedUser);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          Login
        </h1>

        <p className="text-gray-400 mb-6">
          Welcome back to your finance dashboard
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
            required
          />

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 p-3 rounded hover:bg-green-600"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-green-400 hover:text-green-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

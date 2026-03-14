import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../services/authService";
import { saveProfileMeta } from "../utils/profileStore";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "adult",
    isParent: false,
    gender: "other",
    profileImage: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      ...(e.target.name === "role" && e.target.value !== "adult" ? { isParent: false } : {})
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        profileImage: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        isParent: form.role === "adult" ? form.isParent : false,
        gender: form.gender,
        profileImage: form.profileImage
      });
      saveProfileMeta(form.email, {
        roleLabel: form.role,
        role: form.role,
        isParent: form.role === "adult" ? form.isParent : false,
        gender: form.gender,
        profileImage: form.profileImage
      });
      toast.success("Registration successful");
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          Register
        </h1>

        <p className="text-gray-400 mb-6">
          Create your finance account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
            required
          />

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

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
          >
            <option value="student">Student</option>
            <option value="adult">Adult</option>
          </select>

          {form.role === "adult" && (
            <label className="bg-gray-700 p-3 rounded flex items-center justify-between">
              <span className="text-sm text-gray-200">
                Are you a parent?
              </span>
              <input
                type="checkbox"
                checked={form.isParent}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  isParent: e.target.checked
                }))}
                className="h-4 w-4 accent-green-500"
              />
            </label>
          )}

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
          >
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="bg-gray-700 p-3 rounded"
          />

          {form.profileImage && (
            <img
              src={form.profileImage}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}

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
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-400 hover:text-green-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

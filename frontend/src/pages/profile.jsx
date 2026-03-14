import { useState } from "react";
import toast from "react-hot-toast";
import { getCurrentUser, isParentAccount, isStudentAccount, saveAuthSession } from "../utils/helper";
import { updateCurrentUserProfile } from "../utils/profileStore";
import { linkStudent, updateProfile as updateProfileRequest } from "../services/authService";

const Profile = () => {
  const user = getCurrentUser() || {};
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "adult",
    gender: user.gender || "other",
    profileImage: user.profileImage || "",
    isParent: Boolean(user.isParent)
  });
  const [childEmail, setChildEmail] = useState("");
  const [childCode, setChildCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "adult" ? { isParent: false } : {})
    }));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfileRequest({
        name: form.name,
        role: form.role,
        gender: form.gender,
        profileImage: form.profileImage,
        isParent: form.role === "adult" ? form.isParent : false
      });

      updateCurrentUserProfile({
        ...res.user,
        roleLabel: res.user.role
      });
      saveAuthSession(localStorage.getItem("token"), {
        ...user,
        ...res.user,
        roleLabel: res.user.role
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!childEmail.trim() && !childCode.trim()) {
      toast.error("Enter student email or secure student ID");
      return;
    }

    setLinking(true);
    try {
      await linkStudent({
        childEmail: childEmail.trim() || undefined,
        childCode: childCode.trim().toUpperCase() || undefined
      });
      toast.success("Student linked successfully");
      setChildEmail("");
      setChildCode("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to link student");
    } finally {
      setLinking(false);
    }
  };

  const handleCopyStudentCode = async () => {
    if (!user.studentCode) {
      toast.error("Student ID not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(user.studentCode);
      setCopied(true);
      toast.success("Secure student ID copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy student ID");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        Profile
      </h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {form.profileImage ? (
            <img
              src={form.profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
              User
            </div>
          )}

          <div>
            <p className="font-semibold text-lg">{form.name || "User"}</p>
            <p className="text-sm text-gray-400">{form.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
            placeholder="Name"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="bg-gray-700 p-3 rounded opacity-80"
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

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="bg-gray-700 p-3 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {form.role === "adult" && (
            <label className="col-span-1 flex items-center justify-between rounded bg-gray-700 p-3 md:col-span-2">
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

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="col-span-1 rounded bg-gray-700 p-3 md:col-span-2"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {isParentAccount(form) && (
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-3">
              Parent monitoring setup
            </p>

            <div className="grid grid-cols-1 gap-3">
              <input
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder="Student Email"
                className="bg-gray-800 p-3 rounded"
              />

              <input
                type="text"
                value={childCode}
                onChange={(e) => setChildCode(e.target.value.toUpperCase())}
                placeholder="Secure Student ID"
                className="bg-gray-800 p-3 rounded"
              />
            </div>

            <button
              type="button"
              onClick={handleLinkStudent}
              disabled={linking}
              className="mt-3 bg-cyan-500 px-4 py-2 rounded hover:bg-cyan-600"
            >
              {linking ? "Connecting..." : "Connect Student"}
            </button>

            <p className="text-xs text-gray-400 mt-3">
              Connect using the student's email or the secure student ID shown on the student profile.
            </p>
          </div>
        )}

        {isStudentAccount(form) && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Secure Student ID
                  </p>
                  <p className="text-xl font-bold tracking-wider text-green-300">
                    {user.studentCode || "Reload login to generate code"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyStudentCode}
                  className="rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300 transition hover:bg-green-500/15"
                >
                  {copied ? "Copied" : "Copy ID"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Share this secure ID with your parent so they can connect using email or this ID.
              </p>
            </div>

            {user.linkedParent?.name && (
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">
                  Connected Parent
                </p>
                <p className="text-white font-semibold">
                  {user.linkedParent.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {user.linkedParent.email}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

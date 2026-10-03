import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import apiClient from "../api/apiClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/admin/login", { username, password });
      const token = response.data?.token;
      if (!response.data?.success || typeof token !== "string") {
        throw new Error(response.data?.message || "Admin login failed");
      }

      localStorage.setItem("admin_token", token);
      await router.replace("/dashboard");
    } catch (loginError: any) {
      setError(loginError.response?.data?.message || loginError.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Use your server-configured administrator account.</p>

        <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          required
        />

        <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="relative mt-2">
          <LockKeyhole size={17} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            required
          />
        </div>

        {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Incorrect password. Please try again.");
            sessionStorage.setItem("admin_auth", "true");
            router.replace("/admin");
        } catch (err) {
            setError(err.message || "Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
                <h1 className="font-playfair text-2xl font-bold mb-1" style={{ color: "#0B2E6F" }}>Admin Login</h1>
                <p className="text-sm text-gray-400 mb-6">Enter your password to access the admin panel.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter admin password" className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400" style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#333" }} required autoComplete="current-password" />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ background: "#0B2E6F" }}>{loading ? "Signing in..." : "Login"}</button>
                </form>
            </div>
        </div>
    );
}

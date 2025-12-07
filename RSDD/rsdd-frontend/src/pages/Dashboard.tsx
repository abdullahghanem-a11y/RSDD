import React from "react";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: 12 }}>{user?.full_name || user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={{ marginTop: 24 }}>
        <p>Welcome, {user?.username}!</p>
        <pre style={{ background: "#f4f4f4", padding: 12 }}>{JSON.stringify(user, null, 2)}</pre>
      </main>
    </div>
  );
}

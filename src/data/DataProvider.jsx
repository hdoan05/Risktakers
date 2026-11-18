import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { BrowserRouter, Link, MemoryRouter, useLocation } from "react-router-dom";
import { supabase, supabaseConfigError } from "../lib/supabase.js";
import { fetchAppData } from "./api.js";
import { events, leaderboard, currentUser, myBetEventIds } from "./mockData.js";

const MOCK_DATA = { events, leaderboard, currentUser, myBetEventIds };

const DataContext = createContext(null);

function isUsableAppData(data) {
  return Boolean(
    data &&
      Array.isArray(data.events) &&
      Array.isArray(data.leaderboard) &&
      Array.isArray(data.myBetEventIds) &&
      data.currentUser &&
      typeof data.currentUser.balance === "number" &&
      typeof data.currentUser.rank === "number" &&
      typeof data.currentUser.changePct === "number"
  );
}

function AppShell() {
  const location = useLocation();
  const { currentUser: user } = useContext(DataContext);

  const linkStyle = (path) => ({
    padding: "8px 16px",
    borderRadius: 6,
    color: location.pathname === path ? "var(--color-accent)" : "var(--color-text)",
    borderBottom: location.pathname === path ? "2px solid var(--color-accent)" : "2px solid transparent",
  });

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <strong>VTRisk</strong>
      <nav style={{ display: "flex", gap: 8 }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/leaderboard" style={linkStyle("/leaderboard")}>Leaderboard</Link>
        <Link to="/events" style={linkStyle("/events")}>Events</Link>
      </nav>
      <div className="card" style={{ padding: "6px 14px" }}>
        Balance <span className="accent-text">{user.balance.toLocaleString()}</span>
      </div>
    </header>
  );
}

function withAppShell(children) {
  return Children.map(children, (child) => {
    if (isValidElement(child) && (child.type === BrowserRouter || child.type === MemoryRouter)) {
      return cloneElement(
        child,
        undefined,
        <>
          <AppShell />
          {child.props.children}
        </>
      );
    }
    return child;
  });
}

// Loads the app's data once, from Supabase if it's configured and from
// mockData.js otherwise, and holds the app until it's ready.
export function DataProvider({ children }) {
  const [data, setData] = useState(supabase || supabaseConfigError ? null : MOCK_DATA);
  const [error, setError] = useState(supabaseConfigError);

  useEffect(() => {
    if (!supabase) return;
    fetchAppData()
      .then((payload) => {
        if (!isUsableAppData(payload)) {
          throw new Error("invalid data received");
        }
        setData(payload);
      })
      .catch(setError);
  }, []);

  if (error) {
    return <p className="page">Couldn't load data from Supabase: {error.message}</p>;
  }
  if (!data) {
    return <p className="page muted">Loading…</p>;
  }
  return (
    <DataContext.Provider value={data}>
      {withAppShell(children)}
    </DataContext.Provider>
  );
}

// { events, leaderboard, currentUser, myBetEventIds }
export function useData() {
  return useContext(DataContext);
}

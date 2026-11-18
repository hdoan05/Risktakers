import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

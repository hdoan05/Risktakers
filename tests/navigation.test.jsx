import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { DataProvider } from "../src/data/DataProvider.jsx";
import App from "../src/App.jsx";
import Home from "../src/pages/Home.jsx";
import Leaderboard from "../src/pages/Leaderboard.jsx";
import Events from "../src/pages/Events.jsx";

function renderApp(initialPath = "/") {
  return render(
    <DataProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="events" element={<Events />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </DataProvider>
  );
}

describe("BB-NAV page navigation", () => {
  it("BB-NAV-01 renders the home page and the primary nav links", () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Current Bets" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument();
  });

  it("BB-NAV-02 navigates to the leaderboard page via the nav link", async () => {
    const user = userEvent.setup();
    renderApp("/");
    await user.click(screen.getByRole("link", { name: "Leaderboard" }));
    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
  });

  it("BB-NAV-03 navigates to the events page via the nav link", async () => {
    const user = userEvent.setup();
    renderApp("/");
    await user.click(screen.getByRole("link", { name: "Events" }));
    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
  });

  it("BB-NAV-04 supports a direct deep link to /events", () => {
    renderApp("/events");
    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Current Bets" })).not.toBeInTheDocument();
  });

  it("BB-NAV-05 renders the app shell for an unknown route without crashing", () => {
    renderApp("/does-not-exist");
    expect(screen.getByText("VTRisk")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Current Bets" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Events" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Leaderboard" })).not.toBeInTheDocument();
  });

  it("BB-NAV-06 marks the active nav link", () => {
    renderApp("/");
    const homeLink = screen.getByRole("link", { name: "Home" });
    const eventsLink = screen.getByRole("link", { name: "Events" });
    expect(homeLink.style.borderBottom).toContain("accent");
    expect(eventsLink.style.borderBottom).not.toContain("accent");
  });
});

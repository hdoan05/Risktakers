import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../src/lib/supabase.js", () => ({
  supabase: { from: () => ({}) },
  supabaseConfigError: null,
}));
vi.mock("../src/data/api.js", () => ({ fetchAppData: vi.fn() }));

import { fetchAppData } from "../src/data/api.js";
import { DataProvider } from "../src/data/DataProvider.jsx";
import LeaderboardTable from "../src/components/LeaderboardTable.jsx";
import TestErrorBoundary from "./TestErrorBoundary.jsx";
import { makeAppData } from "./fixtures.js";

function renderTable(data) {
  fetchAppData.mockResolvedValue(data);
  return render(
    <DataProvider>
      <LeaderboardTable />
    </DataProvider>
  );
}

async function loaded() {
  await screen.findByText("Maya K.");
}

function bodyRows(container) {
  return Array.from(container.querySelectorAll("tbody tr"));
}

describe("BB-LEADER leaderboard display", () => {
  beforeEach(() => {
    fetchAppData.mockReset();
  });

  it("BB-LEADER-01 renders rows in rank order", async () => {
    const { container } = renderTable(makeAppData());
    await loaded();
    const names = bodyRows(container).map((row) => row.querySelectorAll("td")[1].textContent);
    expect(names).toEqual(["Maya K.", "Derek T.", "Sam P.", "Rae C.", "Jordan L."]);
    const ranks = bodyRows(container).map((row) => row.querySelector(".lb-rank").textContent);
    expect(ranks).toEqual(["🥇1", "🥈2", "🥉3", "4", "5"]);
  });

  it("BB-LEADER-02 formats points with thousands separators", async () => {
    const { container } = renderTable(makeAppData());
    await loaded();
    const points = bodyRows(container).map((row) => row.querySelectorAll("td")[4].textContent);
    expect(points).toEqual(["18,920", "17,405", "16,110", "15,860", "14,995"]);
  });

  it("BB-LEADER-03 shows the current user's position and gap", async () => {
    renderTable(makeAppData());
    await loaded();
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText(/pts behind #5/)).toBeInTheDocument();
    expect(screen.getByText("2,480")).toBeInTheDocument();
  });

  it("BB-LEADER-04 renders tied players without dropping either row", async () => {
    const tied = [
      { rank: 1, initials: "AA", name: "Alex A.", detail: "Senior · CS", points: 100, trend: "up" },
      { rank: 2, initials: "BB", name: "Blair B.", detail: "Junior · EE", points: 100, trend: "down" },
    ];
    const { container } = renderTable(makeAppData({ leaderboard: tied }));
    await screen.findByText("Alex A.");
    expect(screen.getByText("Blair B.")).toBeInTheDocument();
    const points = bodyRows(container).map((row) => row.querySelectorAll("td")[4].textContent);
    expect(points).toEqual(["100", "100"]);
  });

  it("BB-LEADER-05 renders long player names in full", async () => {
    const longName = "Alexandria Montgomery-Worthington";
    const rows = [
      { rank: 1, initials: "AM", name: longName, detail: "Senior · Computer Science", points: 12345, trend: "up" },
    ];
    renderTable(makeAppData({ leaderboard: rows }));
    expect(await screen.findByText(longName)).toBeInTheDocument();
  });

  it("BB-LEADER-06 renders an empty state instead of crashing with no players", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      fetchAppData.mockResolvedValue(makeAppData({ leaderboard: [] }));
      render(
        <TestErrorBoundary>
          <DataProvider>
            <LeaderboardTable />
          </DataProvider>
        </TestErrorBoundary>
      );
      await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());
      expect(screen.queryByText(/CRASHED/)).not.toBeInTheDocument();
      expect(screen.getByText(/no players|no leaderboard|empty/i)).toBeInTheDocument();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("BB-LEADER-07 shows a loading state while data is pending", () => {
    fetchAppData.mockReturnValue(new Promise(() => {}));
    render(
      <DataProvider>
        <LeaderboardTable />
      </DataProvider>
    );
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });
});

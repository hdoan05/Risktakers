import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../src/lib/supabase.js", () => ({
  supabase: { from: () => ({}) },
  supabaseConfigError: null,
}));
vi.mock("../src/data/api.js", () => ({ fetchAppData: vi.fn() }));

import { fetchAppData } from "../src/data/api.js";
import { DataProvider } from "../src/data/DataProvider.jsx";
import Home from "../src/pages/Home.jsx";
import TestErrorBoundary from "./TestErrorBoundary.jsx";

function renderHome() {
  return render(
    <DataProvider>
      <Home />
    </DataProvider>
  );
}

describe("BB-DATA-FAIL data-loading failure", () => {
  beforeEach(() => {
    fetchAppData.mockReset();
  });

  it("BB-DATA-FAIL-01 surfaces an error when the request is rejected", async () => {
    fetchAppData.mockRejectedValue(new Error("network down"));
    renderHome();
    expect(await screen.findByText(/Couldn't load data from Supabase/)).toBeInTheDocument();
    expect(screen.getByText(/network down/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Current Bets" })).not.toBeInTheDocument();
  });

  it("BB-DATA-FAIL-02 surfaces an error on a timeout", async () => {
    fetchAppData.mockRejectedValue(Object.assign(new Error("Request timed out"), { name: "TimeoutError" }));
    renderHome();
    expect(await screen.findByText(/Couldn't load data from Supabase/)).toBeInTheDocument();
    expect(screen.getByText(/timed out/)).toBeInTheDocument();
  });

  it("BB-DATA-FAIL-03 falls back safely when the payload is missing fields", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      fetchAppData.mockResolvedValue({ events: null, leaderboard: [], currentUser: null, myBetEventIds: [] });
      render(
        <TestErrorBoundary>
          <DataProvider>
            <Home />
          </DataProvider>
        </TestErrorBoundary>
      );
      await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());
      expect(screen.queryByText(/CRASHED/)).not.toBeInTheDocument();
      expect(screen.getByText(/Couldn't load data|Something went wrong|empty/i)).toBeInTheDocument();
    } finally {
      errorSpy.mockRestore();
    }
  });
});

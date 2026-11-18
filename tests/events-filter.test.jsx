import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../src/lib/supabase.js", () => ({
  supabase: { from: () => ({}) },
  supabaseConfigError: null,
}));
vi.mock("../src/data/api.js", () => ({ fetchAppData: vi.fn() }));

import { fetchAppData } from "../src/data/api.js";
import { DataProvider } from "../src/data/DataProvider.jsx";
import Events from "../src/pages/Events.jsx";
import { makeAppData } from "./fixtures.js";

function renderEvents(data) {
  fetchAppData.mockResolvedValue(data);
  return render(
    <DataProvider>
      <Events />
    </DataProvider>
  );
}

async function loaded() {
  await screen.findByRole("heading", { name: "Events" });
}

describe("BB-FILTER category filtering", () => {
  beforeEach(() => {
    fetchAppData.mockReset();
  });

  it("BB-FILTER-01 shows all events and an active All tab by default", async () => {
    renderEvents(makeAppData());
    await loaded();
    const allTab = screen.getByRole("button", { name: "All" });
    expect(allTab.className).toContain("ev-tab--active");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("BB-FILTER-02 shows only events in the selected category", async () => {
    const user = userEvent.setup();
    renderEvents(makeAppData());
    await loaded();
    await user.click(screen.getByRole("button", { name: "Football" }));
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Hokies vs Cavaliers", "Hokies Make the ACC Championship?"]);
    expect(screen.queryByText("Trivia Night Pool")).not.toBeInTheDocument();
  });

  it("BB-FILTER-03 handles a single-result category", async () => {
    const user = userEvent.setup();
    renderEvents(makeAppData());
    await loaded();
    await user.click(screen.getByRole("button", { name: "Campus" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(screen.getByText("Trivia Night Pool")).toBeInTheDocument();
  });

  it("BB-FILTER-04 resets to all events when All is reselected", async () => {
    const user = userEvent.setup();
    renderEvents(makeAppData());
    await loaded();
    await user.click(screen.getByRole("button", { name: "Football" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByRole("button", { name: "All" }).className).toContain("ev-tab--active");
  });

  it("BB-FILTER-05 renders an empty grid without crashing when there are no events", async () => {
    renderEvents(makeAppData({ events: [] }));
    await loaded();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Football" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });
});

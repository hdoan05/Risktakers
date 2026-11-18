import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../src/lib/supabase.js", () => ({
  supabase: null,
  supabaseConfigError: new Error("Invalid supabaseUrl"),
}));
vi.mock("../src/data/api.js", () => ({ fetchAppData: vi.fn() }));

import { fetchAppData } from "../src/data/api.js";
import { DataProvider } from "../src/data/DataProvider.jsx";
import Home from "../src/pages/Home.jsx";

describe("BB-DATA-FAIL configuration failure", () => {
  it("BB-DATA-FAIL-04 surfaces a configuration error without calling the API", () => {
    render(
      <DataProvider>
        <Home />
      </DataProvider>
    );
    expect(screen.getByText(/Couldn't load data from Supabase/)).toBeInTheDocument();
    expect(screen.getByText(/Invalid supabaseUrl/)).toBeInTheDocument();
    expect(fetchAppData).not.toHaveBeenCalled();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EventCard from "../src/components/EventCard.jsx";
import { footballEvent } from "./fixtures.js";

function getOption(name) {
  return screen.getByRole("button", { name: new RegExp(name) });
}

describe("BB-BET bet selection", () => {
  it("BB-BET-01 starts with no option selected", () => {
    render(<EventCard event={footballEvent} />);
    expect(getOption("VT")).toHaveAttribute("aria-pressed", "false");
    expect(getOption("UVA")).toHaveAttribute("aria-pressed", "false");
  });

  it("BB-BET-02 selects an option and deselects it on a second click", async () => {
    const user = userEvent.setup();
    render(<EventCard event={footballEvent} />);
    await user.click(getOption("VT"));
    expect(getOption("VT")).toHaveAttribute("aria-pressed", "true");
    await user.click(getOption("VT"));
    expect(getOption("VT")).toHaveAttribute("aria-pressed", "false");
  });

  it("BB-BET-03 changing selection deselects the previous option", async () => {
    const user = userEvent.setup();
    render(<EventCard event={footballEvent} />);
    await user.click(getOption("VT"));
    await user.click(getOption("UVA"));
    expect(getOption("UVA")).toHaveAttribute("aria-pressed", "true");
    expect(getOption("VT")).toHaveAttribute("aria-pressed", "false");
  });

  it("BB-BET-04 rapid duplicate clicks leave the option deselected", async () => {
    const user = userEvent.setup();
    render(<EventCard event={footballEvent} />);
    await user.dblClick(getOption("VT"));
    expect(getOption("VT")).toHaveAttribute("aria-pressed", "false");
  });

  it("BB-BET-05 option buttons cannot submit a form", () => {
    render(<EventCard event={footballEvent} />);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button");
    }
  });

  it("BB-BET-06 supports keyboard selection", async () => {
    const user = userEvent.setup();
    render(<EventCard event={footballEvent} />);
    await user.tab();
    expect(getOption("VT")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(getOption("VT")).toHaveAttribute("aria-pressed", "true");
  });
});

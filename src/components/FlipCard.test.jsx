import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FlipCard from "./FlipCard";

describe("FlipCard", () => {
  test("renders with initial value", () => {
    render(<FlipCard value="A" />);
    const elements = screen.getAllByText("A");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  test("updates display value after prop change", async () => {
    const { rerender } = render(<FlipCard value="A" />);
    rerender(<FlipCard value="B" />);

    await waitFor(() => {
      expect(screen.getAllByText("B").length).toBeGreaterThanOrEqual(1);
    }, { timeout: 1000 }); // match or slightly exceed the animation duration
  });
});

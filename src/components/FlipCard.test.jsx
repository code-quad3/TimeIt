import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FlipCard from "./FlipCard";
import { ThemeContext } from "../context/ThemeContext";

describe("FlipCard", () => {
  const renderWithTheme = (ui, { darkMode = false } = {}) => {
    return render(
      <ThemeContext.Provider value={{ darkMode }}>
        {ui}
      </ThemeContext.Provider>
    );
  };

  test("renders with initial value", () => {
    renderWithTheme(<FlipCard value="A" />);
    // Should show the initial value at least once
    const elements = screen.getAllByText("A");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  test("updates display value after prop change", async () => {
    const { rerender } = renderWithTheme(<FlipCard value="A" />);
    rerender(
      <ThemeContext.Provider value={{ darkMode: false }}>
        <FlipCard value="B" />
      </ThemeContext.Provider>
    );

    // Wait for animation to finish and value to update
    await waitFor(
      () => {
        expect(screen.getAllByText("B").length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 1200 } // buffer above 600ms animation
    );
  });
});

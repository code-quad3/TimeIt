import React from "react";
import { render, screen } from "@testing-library/react";
// Import the matchers to enable .toHaveClass and other DOM assertions
import "@testing-library/jest-dom"; 
import ProfileCard from "./Card";
import { ThemeContext } from "../context/ThemeContext";

describe("ProfileCard", () => {
  const renderWithTheme = (ui, { darkMode = false } = {}) => {
    return render(
      <ThemeContext.Provider value={{ darkMode }}>
        {ui}
      </ThemeContext.Provider>
    );
  };

  const mockProps = {
    img: "https://example.com/profile.jpg",
    name: "John Doe",
    time: "2:30 PM",
  };

  test("renders name, time, and image in light mode", () => {
    renderWithTheme(<ProfileCard {...mockProps} />, { darkMode: false });

    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText(mockProps.time)).toBeInTheDocument();

    const imgEl = screen.getByAltText("Profile");
    expect(imgEl).toHaveAttribute("src", mockProps.img);
  });

  test("renders with dark mode classes", () => {
    const { container } = renderWithTheme(<ProfileCard {...mockProps} />, {
      darkMode: true,
    });

    // The container div should have dark mode bg class
    expect(container.firstChild).toHaveClass("bg-gray-800");
    expect(container.firstChild).toHaveClass("text-white");
  });
});


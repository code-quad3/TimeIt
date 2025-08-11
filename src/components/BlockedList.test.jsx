import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import BlockedList from "./BlockedList";
import { ThemeContext } from "../context/ThemeContext";

describe("BlockedList", () => {
  // A helper function to render the component wrapped in the ThemeContext
  const renderWithTheme = (ui, { darkMode = false } = {}) => {
    return render(
      <ThemeContext.Provider value={{ darkMode }}>
        {ui}
      </ThemeContext.Provider>
    );
  };

  test("renders the blocked domain name", () => {
    // Renders the component with a dummy onUnblock function
    const handleUnblock = jest.fn();
    renderWithTheme(<BlockedList name="example.com" onUnblock={handleUnblock} />);

    // Check if the domain name is in the document
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  test("applies dark mode classes when darkMode is true", () => {
    // Render the component in dark mode and get the container
    const { container } = renderWithTheme(<BlockedList name="test.com" onUnblock={() => {}} />, {
      darkMode: true,
    });
    
    // The main list item should have the correct dark mode classes
    const listItem = container.querySelector("li");
    expect(listItem).toHaveClass("bg-gray-800");
    expect(listItem).toHaveClass("text-white");
  });

  test("calls onUnblock when the unblock button is clicked", () => {
    const handleUnblock = jest.fn();
    renderWithTheme(<BlockedList name="test.com" onUnblock={handleUnblock} />);

    // Find and click the menu button (the three dots)
    const menuButton = screen.getByText("⋮");
    fireEvent.click(menuButton);

    // The unblock button should now be visible, so we find and click it
    const unblockButton = screen.getByText("Unblock");
    fireEvent.click(unblockButton);

    // Verify that the onUnblock function was called
    expect(handleUnblock).toHaveBeenCalledTimes(1);
  });

  test("closes the menu when clicking outside", () => {
    const handleUnblock = jest.fn();
    renderWithTheme(<BlockedList name="test.com" onUnblock={handleUnblock} />);

    // Open the menu by clicking the menu button
    const menuButton = screen.getByText("⋮");
    fireEvent.click(menuButton);

    // Click outside the menu by clicking the document body
    fireEvent.mouseDown(document.body);

    // The unblock button should no longer be in the document, confirming the menu is closed
    expect(screen.queryByText("Unblock")).not.toBeInTheDocument();
  });
});
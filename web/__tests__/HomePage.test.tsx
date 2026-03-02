import { render, screen } from "@testing-library/react";

describe("Basic Test", () => {
  it("should pass a simple truth test", () => {
    expect(true).toBe(true);
  });

  it("renders text correctly", () => {
    render(<h1>J’s Ashanti Store</h1>);
    expect(screen.getByText("J’s Ashanti Store")).toBeInTheDocument();
  });
});

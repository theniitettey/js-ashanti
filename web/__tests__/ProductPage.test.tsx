import { render, screen } from "@testing-library/react";

describe("Product Page", () => {
  it("renders product details correctly", () => {
    render(
      <div>
        <h1>Security Camera</h1>
        <p>Price: ₵500</p>
        <button>Add to Cart</button>
      </div>
    );

    expect(screen.getByText("Security Camera")).toBeInTheDocument();
    expect(screen.getByText("Price: ₵500")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });
});

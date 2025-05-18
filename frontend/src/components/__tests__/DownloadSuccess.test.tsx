import { render, screen, fireEvent } from "@testing-library/react";
import DownloadSuccess from "../DownloadSuccess";

// Basic UI Tests, buttons correctly rendering and the right functions are called.

describe("DownloadSuccess", () => {
  it("renders success message and buttons", () => {
    const mockReset = jest.fn();
    const mockUrl = "https://example.com/file.pdf";

    render(<DownloadSuccess downloadUrl={mockUrl} onReset={mockReset} />);

    expect(
      screen.getByText(/File converted successfully/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Convert another/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Download file/i }),
    ).toBeInTheDocument();
  });

  it("calls onReset when Convert Another is clicked", () => {
    const mockReset = jest.fn();
    const mockUrl = "https://example.com/file.pdf";

    render(<DownloadSuccess downloadUrl={mockUrl} onReset={mockReset} />);

    fireEvent.click(screen.getByRole("button", { name: /Convert another/i }));
    expect(mockReset).toHaveBeenCalled();
  });
});

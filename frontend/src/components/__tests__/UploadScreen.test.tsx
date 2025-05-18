import { render, screen } from "@testing-library/react";
import UploadScreen from "../UploadScreen";

describe("UploadScreen", () => {
  const mockFile = new File(["data"], "example.pptx", {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  it("displays file info and loading state", () => {
    render(<UploadScreen file={mockFile} />);

    expect(screen.getByText("example.pptx")).toBeInTheDocument();
    expect(screen.getByText(/Converting your file/i)).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeDisabled(); // Cancel
    expect(buttons[1]).toBeDisabled(); // Spinner button, both of which are disabled.
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import FileDropzone from "../FileDropzone";
import "@testing-library/jest-dom";

describe("FileDropzone", () => {
  it("renders upload prompt", () => {
    render(<FileDropzone onFileSelected={jest.fn()} onError={jest.fn()} />);
    expect(
      screen.getByText(/drag and drop a powerpoint file/i),
    ).toBeInTheDocument();
  });

  it("rejects non-pptx files", () => {
    const onError = jest.fn();
    render(<FileDropzone onFileSelected={jest.fn()} onError={onError} />);

    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, {
      target: { files: [new File(["fake content"], "test.txt")] },
    });

    expect(onError).toHaveBeenCalledWith("Only .pptx files are supported.");
  });

  it("rejects .pptx files larger than 20MB", () => {
    const onError = jest.fn();
    render(<FileDropzone onFileSelected={jest.fn()} onError={onError} />);

    // Create a large fake file: 21MB
    const largeFile = new File(
      [new ArrayBuffer(21 * 1024 * 1024)],
      "large.pptx",
      {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    );

    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, {
      target: { files: [largeFile] },
    });

    expect(onError).toHaveBeenCalledWith("File size exceeds 20MB limit.");
  });
});

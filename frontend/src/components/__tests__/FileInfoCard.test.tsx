import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import FileInfoCard from "../FileInfoCard";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";

beforeAll(() => {
  jest.useFakeTimers();
});

//Integrations tests for Mock Axios API Calls, using fake timers from JEST.
describe("FileInfoCard - API Integration Tests", () => {
  const mockFile = new File(["content"], "test.pptx", {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  const mockProps = {
    file: mockFile,
    setStatus: jest.fn(),
    setDownloadUrl: jest.fn(),
    setErrorMessage: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Properly converts a file, the downloadlink is there, and the status is done and acknowledged when pinging.
  it("handles successful file conversion flow", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { job_id: "test-job-123" },
    });

    mockedAxios.get
      .mockResolvedValueOnce({ data: { status: "pending" } })
      .mockResolvedValueOnce({
        data: {
          status: "done",
          download_url: "https://example.com/download/test-job-123",
        },
      });

    render(<FileInfoCard {...mockProps} />);

    // Click convert button
    fireEvent.click(screen.getByRole("button", { name: /Convert/i }));
    expect(mockProps.setStatus).toHaveBeenCalledWith("uploading");
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );

    // Fast-forward timers to trigger status checks
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockProps.setStatus).toHaveBeenCalledWith("uploading");
    });
  });

  //If backend API refuses to connect
  it("handles upload API error", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<FileInfoCard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Convert/i }));

    // Should set error
    await waitFor(() => {
      expect(mockProps.setStatus).toHaveBeenCalledWith("idle");
      expect(mockProps.setErrorMessage).toHaveBeenCalledWith(
        "Something went wrong while converting. Please try again.",
      );
    });
  });

  //For example, if unoserver fails and the backend API establishes a successful connection, but throws an error during polling.
  it("shows error if job status is 'error' during polling", async () => {
    render(<FileInfoCard {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Convert/i }));

    (axios.post as jest.Mock).mockResolvedValue({ data: { job_id: "abc123" } });
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { status: "error" },
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockProps.setErrorMessage).toHaveBeenCalledWith(
        "Something went wrong while converting. Please try again.",
      );
    });

    expect(mockProps.setStatus).toHaveBeenCalledWith("idle");
    expect(mockProps.setDownloadUrl).not.toHaveBeenCalled();
  });

  it("shows timeout error after 30 polling attempts", async () => {
    render(<FileInfoCard {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Convert/i }));

    (axios.post as jest.Mock).mockResolvedValue({
      data: { job_id: "timeout-job" },
    });
    (axios.get as jest.Mock).mockResolvedValue({
      data: { status: "converting" },
    });

    await act(async () => {
      // Simulate 31 intervals
      for (let i = 0; i <= 31; i++) {
        jest.advanceTimersByTime(2000);
      }
    });

    expect(mockProps.setErrorMessage).toHaveBeenCalledWith(
      "Conversion timed out. Please try again.",
    );
    expect(mockProps.setStatus).toHaveBeenCalledWith("idle");
  });
});

//Basic UI rendering.
describe("FileInfoCard - Basic UI", () => {
  const mockFile = new File(["content"], "test.pptx", {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  const mockProps = {
    file: mockFile,
    setStatus: jest.fn(),
    setDownloadUrl: jest.fn(),
    setErrorMessage: jest.fn(),
    onCancel: jest.fn(),
  };

  it("displays file name and size", () => {
    render(<FileInfoCard {...mockProps} />);

    expect(screen.getByText(/test\.pptx/i)).toBeInTheDocument();
    expect(screen.getByText(/MB/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Convert/i }),
    ).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", () => {
    render(<FileInfoCard {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
});

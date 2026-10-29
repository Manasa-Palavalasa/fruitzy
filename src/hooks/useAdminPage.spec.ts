import { renderHook, act } from "@testing-library/react";
import { useAdminUsersPage } from "@/hooks/useAdminUsersPage.hooks";
import { useAdminUsers } from "@/hooks/useAdminUsers.hooks";
import { useModal } from "@/contexts/ModalProvider";

jest.mock("@/hooks/useAdminUsers.hooks");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("@/contexts/ModalProvider");

describe("useAdminUsersPage", () => {
  const mockMutate = jest.fn();
  const mockConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAdminUsers as jest.Mock).mockReturnValue({
      users: [{ _id: "1", name: "Test User" }],
      totalPages: 5,
      isLoading: false,
      promoteUserMutation: {
        mutate: mockMutate,
      },
    });

    (useModal as jest.Mock).mockReturnValue({
      confirm: mockConfirm,
    });
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useAdminUsersPage());

    expect(result.current.search).toBe("");
    expect(result.current.page).toBe(1);
    expect(result.current.users).toEqual([{ _id: "1", name: "Test User" }]);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.isLoading).toBe(false);
  });

  it("should update search and reset page on handleSearchChange", () => {
    const { result } = renderHook(() => useAdminUsersPage());

    act(() => {
      result.current.handleSearchChange("admin");
    });

    expect(result.current.search).toBe("admin");
    expect(result.current.page).toBe(1);
  });

  it("should update page on handlePageChange", () => {
    const { result } = renderHook(() => useAdminUsersPage());

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.page).toBe(3);
  });

  it("should call confirm and mutate on handlePromote success", async () => {
    mockConfirm.mockResolvedValue(true);

    const { result } = renderHook(() => useAdminUsersPage());

    await act(async () => {
      await result.current.handlePromote({ _id: "1", name: "Test User",email:"test@gmail.com",role:"user" });
    });

    expect(mockConfirm).toHaveBeenCalledWith("Make Test User an admin?");
    expect(mockMutate).toHaveBeenCalledWith(
      { userId: "1" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });
});
import { render, screen } from "@testing-library/react";
import React from "react";
import * as profileHook from "@/hooks/useProfile.hooks";
import * as authHook from "@/hooks/useAuthGuard.hooks";
import ProfilePage from '@/pages/user/profile';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalProvider } from "@/contexts/ModalProvider";

const renderWithProviders = (ui: React.ReactNode) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ModalProvider>{ui}</ModalProvider>
    </QueryClientProvider>
  );
};

describe("ProfilePage", () => {
  let authGuardSpy: jest.SpyInstance;
  let useProfileSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  afterEach(() => {
    authGuardSpy?.mockRestore();
    useProfileSpy?.mockRestore();
  });

  it("renders unauthorized message if user is not authorized", () => {
    authGuardSpy = jest.spyOn(authHook, "useAuthGuard").mockReturnValue({
      isLoading: false,
      isAuthorized: false,
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  it("renders profile data when authorized", () => {
    authGuardSpy = jest.spyOn(authHook, "useAuthGuard").mockReturnValue({
      isLoading: false,
      isAuthorized: true,
    });

    useProfileSpy = jest.spyOn(profileHook, "useProfile").mockReturnValue({
      isLoading: false,
      isError: false,
      profile: {
        _id: "abc123",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        addresses: [],
      },
      handleAddAddress: jest.fn(),
      handleDeleteAddress: jest.fn(),
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});

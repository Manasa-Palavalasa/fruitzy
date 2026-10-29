import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "@/pages/index";

const MockBrowseByCategories = () => <div data-testid="BrowseByCategories" />;
MockBrowseByCategories.displayName = "MockBrowseByCategories";
jest.mock("@/components/common/BrowseByCategories", () => {
  const Mock = () => <MockBrowseByCategories />;
  Mock.displayName = "MockBrowseByCategories";
  return Mock;
});

const MockCarousel = () => <div data-testid="Carousel" />;
MockCarousel.displayName = "MockCarousel";
jest.mock("@/components/common/Carousel", () => {
  const Mock = () => <MockCarousel />;
  Mock.displayName = "MockCarousel";
  return Mock;
});

const MockPopularFruits = () => <div data-testid="PopularFruits" />;
MockPopularFruits.displayName = "MockPopularFruits";
jest.mock("@/components/common/PopularFruits", () => {
  const Mock = () => <MockPopularFruits />;
  Mock.displayName = "MockPopularFruits";
  return Mock;
});

jest.mock("@/components/content/PublishedCampaigns", () => {
  const Mock = () => <div data-testid="PublishedCampaigns" />;
  return Mock;
});

describe("Home page", () => {
  it("renders Carousel, PopularFruits, and BrowseByCategories components", () => {
    render(<Home />);
    expect(screen.getByTestId("Carousel")).toBeInTheDocument();
    expect(screen.getByTestId("PublishedCampaigns")).toBeInTheDocument();
    expect(screen.getByTestId("PopularFruits")).toBeInTheDocument();
    expect(screen.getByTestId("BrowseByCategories")).toBeInTheDocument();
  });
});


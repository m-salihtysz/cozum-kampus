import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NOW, adminData } from "./fixtures";
import { WorkTrackingView } from "./WorkTrackingView";

const assignees = { 1: "Ayşe Yıldız", 3: "Mehmet Usta", 4: "Ayşe Yıldız" };

describe("WorkTrackingView", () => {
  it("summarises ongoing and completed work", () => {
    render(<WorkTrackingView data={adminData} assignees={assignees} now={NOW} />);
    // Only the routed open report (#1) counts as ongoing; #2 has no unit yet.
    expect(screen.getByLabelText("Devam eden iş sayısı")).toHaveTextContent("1");
    expect(screen.getByLabelText("Bu hafta tamamlanan sayısı")).toHaveTextContent("2");
  });

  it("lists ongoing jobs with their technician and links to the report", () => {
    render(<WorkTrackingView data={adminData} assignees={assignees} now={NOW} />);
    const row = screen.getByRole("row", { name: /Koridor lambası yanmıyor/ });
    expect(within(row).getByText("Ayşe Yıldız")).toBeInTheDocument();
    expect(within(row).getByRole("link")).toHaveAttribute("href", "/yonetim/bildirimler?q=%231");
  });

  it("switches to completed jobs and flags the unverified one", () => {
    render(<WorkTrackingView data={adminData} assignees={assignees} now={NOW} />);
    fireEvent.click(screen.getByRole("button", { name: "Tamamlanan" }));
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(within(screen.getByRole("table")).getByText("Doğrulanmadı")).toBeInTheDocument();
  });
});

import { StudentFrame } from "@/components/layout/StudentFrame";
import { TopNav } from "@/components/layout/TopNav";

export default function StudentLayout({ children }: LayoutProps<"/">) {
  return (
    <StudentFrame>
      <a className="skip" href="#icerik">
        Ana içeriğe geç
      </a>
      <TopNav />
      {children}
    </StudentFrame>
  );
}

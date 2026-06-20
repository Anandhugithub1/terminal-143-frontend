import TopNav from "../../components/Layout/TopNavigation";
import BottomNav from "../../components/Layout/BottomNavigation";

export default function PageLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen pb-20 flex flex-col ${className}`}>
      <TopNav />
      {children}
      <BottomNav />
    </div>
  );
}

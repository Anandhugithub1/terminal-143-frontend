import {
  X,
  Home,
  Circle,
  Users,
  UserCheck,
  Heart,
  Settings,
  LogOut,
  Bell,
  MessageCircle,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useMyProfile } from "../../../UserProfile/Hooks/useMyProfile";
import { DEFAULT_AVATAR } from "../../utils/postDisplay";

export default function Sidebar({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("home");
  const { data: myProfile } = useMyProfile();

  const menuItems = [
    { id: "home", label: "Home", icon: Home, color: "text-gray-600" },
    { id: "circles", label: "My Circles", icon: Circle, color: "text-gray-600" },
    { id: "matches", label: "Matches", icon: Users, color: "text-gray-600" },
    { id: "likes", label: "Likes", icon: Heart, color: "text-gray-600" },
    { id: "messages", label: "Messages", icon: MessageCircle, color: "text-gray-600" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "text-gray-600" },
  ];

  const accountItems = [
    { id: "profile", label: "Profile", icon: UserCheck, color: "text-gray-600" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-gray-600" },
    { id: "privacy", label: "Privacy", icon: Shield, color: "text-gray-600" },
    { id: "help", label: "Help Center", icon: HelpCircle, color: "text-gray-600" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-clr bg-gradient-to-r from-primary/5 to-transparent">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Circles
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Connect & Share</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-5 border-b border-border-clr">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={myProfile?.profilePhoto || DEFAULT_AVATAR}
                alt="User"
                className="w-14 h-14 rounded-full object-cover shadow-md"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-sec">{myProfile?.name || "User"}</h3>
              {myProfile?.username && (
                <p className="text-xs text-gray-500">@{myProfile.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Main Menu */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Add navigation logic here
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1 ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? "text-primary" : item.color}`} />
                  <span className={`text-sm font-medium ${activeTab === item.id ? "text-primary" : "text-text-sec"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Account Section */}
          <div className="px-3 py-2 border-t border-border-clr">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Account
            </p>
            {accountItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-gray-100 mb-1"
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium text-text-sec">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-clr">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-red-50 group">
            <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-red-500">Log Out</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">
            Version 1.0.0 • © 2024 Circles
          </p>
        </div>
      </div>
    </>
  );
}

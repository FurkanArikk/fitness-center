import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Activity,
  Users,
  Calendar,
  Award,
  CreditCard,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <Activity size={24} />,
      gradient: "from-violet-600 via-purple-600 to-blue-600",
      hoverGradient: "from-violet-500 via-purple-500 to-blue-500",
      bgLight: "bg-violet-50",
      textColor: "text-violet-700",
      shadowColor: "shadow-violet-500/30",
    },
    {
      path: "/members",
      label: "Members",
      icon: <Users size={24} />,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      hoverGradient: "from-emerald-400 via-teal-400 to-cyan-400",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
      shadowColor: "shadow-emerald-500/30",
    },
    {
      path: "/classes",
      label: "Classes",
      icon: <Calendar size={24} />,
      gradient: "from-pink-500 via-rose-500 to-orange-500",
      hoverGradient: "from-pink-400 via-rose-400 to-orange-400",
      bgLight: "bg-pink-50",
      textColor: "text-pink-700",
      shadowColor: "shadow-pink-500/30",
    },
    {
      path: "/trainers",
      label: "Trainers",
      icon: <Award size={24} />,
      gradient: "from-amber-500 via-yellow-500 to-lime-500",
      hoverGradient: "from-amber-400 via-yellow-400 to-lime-400",
      bgLight: "bg-amber-50",
      textColor: "text-amber-700",
      shadowColor: "shadow-amber-500/30",
    },
    {
      path: "/facility",
      label: "Facility",
      icon: <Dumbbell size={24} />,
      gradient: "from-indigo-600 via-blue-600 to-purple-600",
      hoverGradient: "from-indigo-500 via-blue-500 to-purple-500",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-700",
      shadowColor: "shadow-indigo-500/30",
    },
    {
      path: "/payments",
      label: "Payments",
      icon: <CreditCard size={24} />,
      gradient: "from-rose-500 via-red-500 to-pink-500",
      hoverGradient: "from-rose-400 via-red-400 to-pink-400",
      bgLight: "bg-rose-50",
      textColor: "text-rose-700",
      shadowColor: "shadow-rose-500/30",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-4 top-4 bottom-4 z-30 w-80 transform transition-all duration-700 ease-out`}
      >
        {/* Ultra Modern Glassmorphism Container */}
        <div className="w-full bg-gradient-to-br from-white/70 via-white/50 to-white/30 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden relative">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-blue-500/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]"></div>

          {/* Header with enhanced branding */}
          <div className="relative p-8 border-b border-white/20">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 via-purple-100/30 to-blue-100/50 animate-gradient-x"></div>

            <div className="relative flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-bounce">
                <Dumbbell size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                  FitManager
                </h1>
                <p className="text-sm text-gray-600 font-bold tracking-wide">
                  💪 Power Your Fitness
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-8">
            <nav className="space-y-4">
              {navItems.map((item, index) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="group block"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`relative w-full flex items-center space-x-5 p-5 rounded-2xl transition-all duration-500 transform ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl ${item.shadowColor} scale-105 -rotate-1`
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-white/50 hover:to-gray-50/50 hover:shadow-2xl hover:scale-105 hover:rotate-1 hover:-translate-y-2"
                      } group-hover:shadow-2xl`}
                    >
                      {/* Ultra vibrant active glow */}
                      {isActive && (
                        <>
                          <div
                            className={`absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-12 bg-gradient-to-b from-white via-yellow-300 to-white rounded-full shadow-lg animate-pulse`}
                          ></div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${item.hoverGradient} opacity-0 animate-pulse rounded-2xl`}
                          ></div>
                        </>
                      )}

                      {/* Icon container with enhanced effects */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isActive
                            ? "bg-white/25 backdrop-blur-lg shadow-2xl scale-110"
                            : `group-hover:${item.bgLight} group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-xl`
                        }`}
                      >
                        <div
                          className={
                            isActive
                              ? "text-white drop-shadow-lg"
                              : `group-hover:${item.textColor} transition-all duration-500 group-hover:scale-110`
                          }
                        >
                          {item.icon}
                        </div>
                      </div>

                      {/* Label with enhanced typography */}
                      <span
                        className={`font-bold text-lg transition-all duration-500 tracking-wide ${
                          isActive
                            ? "text-white drop-shadow-lg"
                            : "group-hover:font-black group-hover:text-xl"
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Animated hover indicator */}
                      {!isActive && (
                        <div
                          className={`ml-auto w-3 h-3 rounded-full bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-150 group-hover:animate-ping`}
                        ></div>
                      )}

                      {/* Active item particle effect */}
                      {isActive && (
                        <div className="ml-auto flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "100ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "200ms" }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer with animated gradient */}
          <div className="relative mt-auto p-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full backdrop-blur-lg border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar with enhanced effects */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-96 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-500 ease-out`}
      >
        {/* Mobile Ultra Glassmorphism Container */}
        <div className="h-full bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-2xl border-r border-white/30 shadow-2xl overflow-hidden relative">
          {/* Mobile animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-blue-500/15 animate-pulse"></div>

          {/* Mobile Header */}
          <div className="relative p-8 border-b border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100/60 via-purple-100/40 to-blue-100/60"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                  <Dumbbell size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    FitManager
                  </h1>
                  <p className="text-sm text-gray-600 font-bold">
                    💪 Power Your Fitness
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 flex items-center justify-center transition-all duration-300 text-white shadow-lg hover:shadow-2xl hover:scale-110"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="p-8">
            <nav className="space-y-4">
              {navItems.map((item, index) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="group block"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`relative w-full flex items-center space-x-5 p-5 rounded-2xl transition-all duration-500 ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl ${item.shadowColor} scale-105`
                          : "text-gray-700 hover:bg-white/40 hover:shadow-xl hover:scale-105"
                      }`}
                    >
                      {/* Mobile active indicator */}
                      {isActive && (
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-12 bg-white rounded-full shadow-lg animate-pulse"></div>
                      )}

                      {/* Mobile icon container */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isActive
                            ? "bg-white/25 backdrop-blur-lg"
                            : `group-hover:${item.bgLight} group-hover:scale-110`
                        }`}
                      >
                        <div
                          className={
                            isActive
                              ? "text-white"
                              : `group-hover:${item.textColor} transition-colors duration-300`
                          }
                        >
                          {item.icon}
                        </div>
                      </div>

                      {/* Mobile label */}
                      <span
                        className={`font-bold text-lg transition-all duration-300 ${
                          isActive ? "text-white" : "group-hover:font-black"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Ultra Modern Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-gradient-to-r from-white/80 via-white/70 to-white/80 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl shadow-purple-500/20">
        <div className="flex justify-around items-center p-4">
          {navItems.slice(0, 5).map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-500 ${
                  isActive
                    ? `bg-gradient-to-t ${item.gradient} text-white shadow-xl ${item.shadowColor} scale-110`
                    : "text-gray-600 hover:text-gray-800 hover:scale-110"
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center transition-all duration-300 ${
                    isActive ? "" : "hover:scale-125"
                  }`}
                >
                  {React.cloneElement(item.icon, { size: 22 })}
                </div>
                <span className="text-xs font-bold mt-1">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-white rounded-full mt-1 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

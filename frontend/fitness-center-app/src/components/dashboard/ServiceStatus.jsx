import React from "react";
import {
  Server,
  Database,
  Shield,
  CreditCard,
  Users,
  Dumbbell,
  Wifi,
  Activity,
} from "lucide-react";

const ServiceStatus = ({ servicesHealth }) => {
  const serviceIcons = {
    "member-service": {
      icon: <Users size={24} />,
      label: "Members",
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      shadowColor: "shadow-blue-500/20",
      bgPattern: "from-blue-50/50 via-blue-100/30 to-blue-50/50",
      accentColor: "blue",
    },
    "staff-service": {
      icon: <Shield size={24} />,
      label: "Staff",
      gradient: "from-emerald-500 via-emerald-600 to-emerald-700",
      shadowColor: "shadow-emerald-500/20",
      bgPattern: "from-emerald-50/50 via-emerald-100/30 to-emerald-50/50",
      accentColor: "emerald",
    },
    "payment-service": {
      icon: <CreditCard size={24} />,
      label: "Payments",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      shadowColor: "shadow-purple-500/20",
      bgPattern: "from-purple-50/50 via-purple-100/30 to-purple-50/50",
      accentColor: "purple",
    },
    "facility-service": {
      icon: <Dumbbell size={24} />,
      label: "Facilities",
      gradient: "from-orange-500 via-orange-600 to-orange-700",
      shadowColor: "shadow-orange-500/20",
      bgPattern: "from-orange-50/50 via-orange-100/30 to-orange-50/50",
      accentColor: "orange",
    },
    "class-service": {
      icon: <Activity size={24} />,
      label: "Classes",
      gradient: "from-pink-500 via-pink-600 to-pink-700",
      shadowColor: "shadow-pink-500/20",
      bgPattern: "from-pink-50/50 via-pink-100/30 to-pink-50/50",
      accentColor: "pink",
    },
    "auth-service": {
      icon: <Database size={24} />,
      label: "Auth",
      gradient: "from-indigo-500 via-indigo-600 to-indigo-700",
      shadowColor: "shadow-indigo-500/20",
      bgPattern: "from-indigo-50/50 via-indigo-100/30 to-indigo-50/50",
      accentColor: "indigo",
    },
  };

  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white rounded-3xl p-8 shadow-2xl border border-gray-100/50 backdrop-blur-sm">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 rounded-3xl opacity-60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] rounded-3xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)] rounded-3xl"></div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-2">
              Service Status
            </h2>
            <p className="text-gray-600 text-lg">
              Real-time microservices monitoring
            </p>
          </div>

          {/* Live indicator with pulsing animation */}
          <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-2xl border border-emerald-200/50 shadow-lg">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <Wifi size={18} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Live Monitoring
            </span>
          </div>
        </div>

        {/* Enhanced Service Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Object.entries(servicesHealth).map(([service, isHealthy], index) => {
            const serviceConfig = serviceIcons[service] || {
              icon: <Server size={24} />,
              label: service.replace("-service", ""),
              gradient: "from-gray-500 via-gray-600 to-gray-700",
              shadowColor: "shadow-gray-500/20",
              bgPattern: "from-gray-50/50 via-gray-100/30 to-gray-50/50",
              accentColor: "gray",
            };

            return (
              <div
                key={service}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer ${
                  isHealthy
                    ? "bg-gradient-to-br from-white via-gray-50/50 to-white shadow-xl hover:shadow-2xl"
                    : "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 shadow-lg hover:shadow-xl"
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: "slideInUp 0.6s ease-out forwards",
                }}
              >
                {/* Background Pattern */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${serviceConfig.bgPattern} opacity-80`}
                ></div>

                {/* Status Border Animation */}
                {isHealthy && (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${serviceConfig.gradient} opacity-10 rounded-2xl`}
                    ></div>
                    <div
                      className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${serviceConfig.gradient} rounded-2xl`}
                      style={{
                        mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                        maskComposite: "xor",
                        WebkitMask:
                          "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                      }}
                    ></div>
                  </>
                )}

                <div className="relative z-10 p-6">
                  {/* Status indicator with enhanced animations */}
                  <div className="absolute top-4 right-4">
                    {isHealthy ? (
                      <div className="relative">
                        <div
                          className={`w-4 h-4 bg-emerald-500 rounded-full shadow-lg animate-pulse`}
                        ></div>
                        <div
                          className={`absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping`}
                        ></div>
                        <div
                          className={`absolute inset-0 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-75`}
                        ></div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          className={`w-4 h-4 bg-red-500 rounded-full shadow-lg`}
                        ></div>
                        <div
                          className={`absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-pulse opacity-75`}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Icon with 3D effect */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${serviceConfig.gradient} rounded-2xl flex items-center justify-center text-white mb-4 shadow-2xl ${serviceConfig.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden`}
                  >
                    {/* Icon shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-2xl"></div>
                    <div className="relative z-10">{serviceConfig.icon}</div>

                    {/* Animated background particles */}
                    {isHealthy && (
                      <div className="absolute inset-0 opacity-30">
                        <div
                          className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping"
                          style={{ animationDelay: "0s" }}
                        ></div>
                        <div
                          className="absolute bottom-3 right-3 w-1 h-1 bg-white rounded-full animate-ping"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-ping"
                          style={{ animationDelay: "1s" }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Service info with enhanced typography */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-gray-900 transition-colors duration-300">
                      {serviceConfig.label}
                    </h3>

                    {/* Enhanced status badge */}
                    <div
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                        isHealthy
                          ? `bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 shadow-lg shadow-emerald-200/50 border border-emerald-200`
                          : `bg-gradient-to-r from-red-100 to-red-50 text-red-800 shadow-lg shadow-red-200/50 border border-red-200`
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          isHealthy
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {isHealthy ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>

                {/* Hover overlay effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${serviceConfig.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Enhanced statistics summary */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {Object.values(servicesHealth).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Services Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {
                  Object.values(servicesHealth).filter((status) => !status)
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Services Offline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(
                  (Object.values(servicesHealth).filter(Boolean).length /
                    Object.values(servicesHealth).length) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceStatus;

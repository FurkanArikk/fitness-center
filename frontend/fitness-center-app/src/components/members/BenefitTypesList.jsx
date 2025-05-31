import React, { useState } from "react";
import { Plus, Filter, ChevronDown, Sparkles, Gift, Star } from "lucide-react";
import Card from "../common/Card";
import Loader from "../common/Loader";

const BenefitTypesList = ({
  benefits = [],
  memberships = [],
  loading,
  onEdit,
  onDelete,
}) => {
  // Filtreleme için state
  const [selectedMembershipId, setSelectedMembershipId] = useState("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Filtrelenmiş benefit'leri hesaplama
  const filteredBenefits =
    selectedMembershipId === "all"
      ? benefits
      : benefits.filter((benefit) => {
          const benefitMembershipId =
            benefit.membershipId || benefit.membership_id;
          return benefitMembershipId === parseInt(selectedMembershipId);
        });

  // Get theme colors based on membership type
  const getThemeColors = (membershipName) => {
    const lowerName = membershipName?.toLowerCase() || "";

    // Primary tier colors
    if (lowerName.includes("basic")) {
      return {
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
        border: "border-blue-200",
        text: "text-blue-600",
        badge: "bg-blue-100 text-blue-700",
        accent: "bg-blue-500",
        ring: "ring-blue-200",
      };
    } else if (lowerName.includes("premium")) {
      return {
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
        border: "border-purple-200",
        text: "text-purple-600",
        badge: "bg-purple-100 text-purple-700",
        accent: "bg-purple-500",
        ring: "ring-purple-200",
      };
    } else if (lowerName.includes("gold")) {
      return {
        gradient: "from-amber-500 to-yellow-500",
        bg: "bg-gradient-to-br from-amber-50 to-yellow-100/50",
        border: "border-amber-200",
        text: "text-amber-600",
        badge: "bg-amber-100 text-amber-700",
        accent: "bg-amber-500",
        ring: "ring-amber-200",
      };
    } else if (lowerName.includes("platinum")) {
      return {
        gradient: "from-slate-600 to-slate-700",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50",
        border: "border-slate-300",
        text: "text-slate-600",
        badge: "bg-slate-100 text-slate-700",
        accent: "bg-slate-600",
        ring: "ring-slate-200",
      };
    }

    // Extended color palette for new membership types
    else if (
      lowerName.includes("emerald") ||
      lowerName.includes("elite") ||
      lowerName.includes("pro")
    ) {
      return {
        gradient: "from-emerald-500 to-emerald-600",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
        border: "border-emerald-200",
        text: "text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700",
        accent: "bg-emerald-500",
        ring: "ring-emerald-200",
      };
    } else if (
      lowerName.includes("ruby") ||
      lowerName.includes("vip") ||
      lowerName.includes("executive")
    ) {
      return {
        gradient: "from-rose-500 to-pink-500",
        bg: "bg-gradient-to-br from-rose-50 to-pink-100/50",
        border: "border-rose-200",
        text: "text-rose-600",
        badge: "bg-rose-100 text-rose-700",
        accent: "bg-rose-500",
        ring: "ring-rose-200",
      };
    } else if (
      lowerName.includes("sapphire") ||
      lowerName.includes("royal") ||
      lowerName.includes("diamond")
    ) {
      return {
        gradient: "from-indigo-500 to-blue-600",
        bg: "bg-gradient-to-br from-indigo-50 to-blue-100/50",
        border: "border-indigo-200",
        text: "text-indigo-600",
        badge: "bg-indigo-100 text-indigo-700",
        accent: "bg-indigo-500",
        ring: "ring-indigo-200",
      };
    } else if (
      lowerName.includes("teal") ||
      lowerName.includes("aqua") ||
      lowerName.includes("wellness")
    ) {
      return {
        gradient: "from-teal-500 to-cyan-500",
        bg: "bg-gradient-to-br from-teal-50 to-cyan-100/50",
        border: "border-teal-200",
        text: "text-teal-600",
        badge: "bg-teal-100 text-teal-700",
        accent: "bg-teal-500",
        ring: "ring-teal-200",
      };
    } else if (
      lowerName.includes("orange") ||
      lowerName.includes("energy") ||
      lowerName.includes("boost")
    ) {
      return {
        gradient: "from-orange-500 to-red-500",
        bg: "bg-gradient-to-br from-orange-50 to-red-100/50",
        border: "border-orange-200",
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-700",
        accent: "bg-orange-500",
        ring: "ring-orange-200",
      };
    } else if (
      lowerName.includes("lime") ||
      lowerName.includes("fresh") ||
      lowerName.includes("nature")
    ) {
      return {
        gradient: "from-lime-500 to-green-500",
        bg: "bg-gradient-to-br from-lime-50 to-green-100/50",
        border: "border-lime-200",
        text: "text-lime-600",
        badge: "bg-lime-100 text-lime-700",
        accent: "bg-lime-500",
        ring: "ring-lime-200",
      };
    } else if (
      lowerName.includes("violet") ||
      lowerName.includes("cosmic") ||
      lowerName.includes("mystic")
    ) {
      return {
        gradient: "from-violet-500 to-purple-600",
        bg: "bg-gradient-to-br from-violet-50 to-purple-100/50",
        border: "border-violet-200",
        text: "text-violet-600",
        badge: "bg-violet-100 text-violet-700",
        accent: "bg-violet-500",
        ring: "ring-violet-200",
      };
    } else if (
      lowerName.includes("fuchsia") ||
      lowerName.includes("luxury") ||
      lowerName.includes("exclusive")
    ) {
      return {
        gradient: "from-fuchsia-500 to-pink-600",
        bg: "bg-gradient-to-br from-fuchsia-50 to-pink-100/50",
        border: "border-fuchsia-200",
        text: "text-fuchsia-600",
        badge: "bg-fuchsia-100 text-fuchsia-700",
        accent: "bg-fuchsia-500",
        ring: "ring-fuchsia-200",
      };
    } else if (
      lowerName.includes("sky") ||
      lowerName.includes("cloud") ||
      lowerName.includes("horizon")
    ) {
      return {
        gradient: "from-sky-500 to-blue-500",
        bg: "bg-gradient-to-br from-sky-50 to-blue-100/50",
        border: "border-sky-200",
        text: "text-sky-600",
        badge: "bg-sky-100 text-sky-700",
        accent: "bg-sky-500",
        ring: "ring-sky-200",
      };
    } else if (
      lowerName.includes("bronze") ||
      lowerName.includes("copper") ||
      lowerName.includes("starter")
    ) {
      return {
        gradient: "from-amber-600 to-orange-600",
        bg: "bg-gradient-to-br from-amber-50 to-orange-100/50",
        border: "border-amber-300",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-800",
        accent: "bg-amber-600",
        ring: "ring-amber-200",
      };
    } else if (
      lowerName.includes("silver") ||
      lowerName.includes("steel") ||
      lowerName.includes("standard")
    ) {
      return {
        gradient: "from-gray-400 to-slate-500",
        bg: "bg-gradient-to-br from-gray-50 to-slate-100/50",
        border: "border-gray-300",
        text: "text-gray-600",
        badge: "bg-gray-100 text-gray-700",
        accent: "bg-gray-400",
        ring: "ring-gray-200",
      };
    } else if (
      lowerName.includes("rainbow") ||
      lowerName.includes("ultimate") ||
      lowerName.includes("supreme")
    ) {
      return {
        gradient: "from-pink-500 via-purple-500 to-indigo-500",
        bg: "bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100/50",
        border: "border-pink-200",
        text: "text-purple-600",
        badge: "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700",
        accent: "bg-gradient-to-r from-pink-500 to-purple-500",
        ring: "ring-purple-200",
      };
    }

    // Dynamic color assignment based on name hash for truly unique colors
    else {
      const colorPalettes = [
        {
          gradient: "from-green-500 to-emerald-600",
          bg: "bg-gradient-to-br from-green-50 to-emerald-100/50",
          border: "border-green-200",
          text: "text-green-600",
          badge: "bg-green-100 text-green-700",
          accent: "bg-green-500",
          ring: "ring-green-200",
        },
        {
          gradient: "from-red-500 to-rose-600",
          bg: "bg-gradient-to-br from-red-50 to-rose-100/50",
          border: "border-red-200",
          text: "text-red-600",
          badge: "bg-red-100 text-red-700",
          accent: "bg-red-500",
          ring: "ring-red-200",
        },
        {
          gradient: "from-yellow-500 to-amber-600",
          bg: "bg-gradient-to-br from-yellow-50 to-amber-100/50",
          border: "border-yellow-200",
          text: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-700",
          accent: "bg-yellow-500",
          ring: "ring-yellow-200",
        },
        {
          gradient: "from-pink-500 to-rose-600",
          bg: "bg-gradient-to-br from-pink-50 to-rose-100/50",
          border: "border-pink-200",
          text: "text-pink-600",
          badge: "bg-pink-100 text-pink-700",
          accent: "bg-pink-500",
          ring: "ring-pink-200",
        },
        {
          gradient: "from-cyan-500 to-blue-600",
          bg: "bg-gradient-to-br from-cyan-50 to-blue-100/50",
          border: "border-cyan-200",
          text: "text-cyan-600",
          badge: "bg-cyan-100 text-cyan-700",
          accent: "bg-cyan-500",
          ring: "ring-cyan-200",
        },
        {
          gradient: "from-stone-500 to-neutral-600",
          bg: "bg-gradient-to-br from-stone-50 to-neutral-100/50",
          border: "border-stone-200",
          text: "text-stone-600",
          badge: "bg-stone-100 text-stone-700",
          accent: "bg-stone-500",
          ring: "ring-stone-200",
        },
        {
          gradient: "from-zinc-500 to-gray-600",
          bg: "bg-gradient-to-br from-zinc-50 to-gray-100/50",
          border: "border-zinc-200",
          text: "text-zinc-600",
          badge: "bg-zinc-100 text-zinc-700",
          accent: "bg-zinc-500",
          ring: "ring-zinc-200",
        },
      ];

      // Create a simple hash from the membership name
      let hash = 0;
      for (let i = 0; i < lowerName.length; i++) {
        const char = lowerName.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      // Use hash to select a color palette
      const paletteIndex = Math.abs(hash) % colorPalettes.length;
      return colorPalettes[paletteIndex];
    }
  };

  // Filtre menü butonunu render etme
  const renderFilterButton = () => {
    // Seçilen membership'in adını bulma
    const selectedMembership = memberships.find(
      (m) => m.id === parseInt(selectedMembershipId)
    );
    const buttonLabel =
      selectedMembershipId === "all"
        ? "All Plans"
        : selectedMembership?.membershipName || "Selected Membership";

    return (
      <div className="relative">
        <button
          className="group flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
          onClick={() => setFilterMenuOpen(!filterMenuOpen)}
        >
          <div className="p-1 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
            <Filter size={16} className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-700">{buttonLabel}</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transform transition-transform duration-300 ${
              filterMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {filterMenuOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border-2 border-gray-100 rounded-2xl z-20 min-w-[240px] overflow-hidden">
            <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 px-3 py-1">
                Filter by Membership
              </p>
            </div>

            <button
              className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                selectedMembershipId === "all"
                  ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedMembershipId("all");
                setFilterMenuOpen(false);
              }}
            >
              <div className="flex items-center space-x-2">
                <Star
                  size={16}
                  className={
                    selectedMembershipId === "all"
                      ? "text-blue-500"
                      : "text-gray-400"
                  }
                />
                <span className="font-medium">All Plans</span>
              </div>
            </button>

            {memberships.map((membership) => {
              const theme = getThemeColors(membership.membershipName);
              const isSelected = selectedMembershipId === membership.id;

              return (
                <button
                  key={membership.id}
                  className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                    isSelected
                      ? `${theme.bg} ${theme.text} border-r-4 ${theme.border}`
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedMembershipId(membership.id);
                    setFilterMenuOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${theme.accent}`}
                    ></div>
                    <span className="font-medium">
                      {membership.membershipName}
                    </span>
                    <span
                      className={`ml-auto text-xs px-2 py-1 rounded-full ${theme.badge}`}
                    >
                      ${membership.price}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Benefit Types
            </h3>
            <p className="text-gray-500 mt-1">
              Manage benefits for different membership plans
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Gift className="w-4 h-4" />
              <span>{filteredBenefits.length} Benefits Available</span>
            </div>
            {renderFilterButton()}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8">
          <Loader size="small" message="Loading benefit types..." />
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBenefits.length > 0 ? (
              filteredBenefits.map((benefit) => {
                // Find related membership
                const benefitMembershipId =
                  benefit.membershipId || benefit.membership_id;
                const relatedMembership = memberships.find(
                  (m) => m.id === benefitMembershipId
                );
                const membershipName = relatedMembership
                  ? relatedMembership.membershipName
                  : `Membership #${benefitMembershipId}`;
                const theme = getThemeColors(membershipName);

                return (
                  <div
                    key={benefit.id || benefit.benefit_id}
                    className={`group relative overflow-hidden rounded-2xl ${theme.bg} ${theme.border} border-2 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out`}
                  >
                    {/* Accent Border */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient}`}
                    ></div>

                    {/* Content */}
                    <div className="p-6 relative">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {benefit.benefitName || benefit.benefit_name}
                          </h4>
                          {benefitMembershipId && (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${theme.badge} ring-1 ring-inset ${theme.ring}`}
                            >
                              <div
                                className={`w-1.5 h-1.5 ${theme.accent} rounded-full mr-1.5`}
                              ></div>
                              {membershipName}
                            </span>
                          )}
                        </div>

                        {/* Premium Badge for higher tier plans */}
                        {(membershipName?.toLowerCase().includes("premium") ||
                          membershipName?.toLowerCase().includes("gold") ||
                          membershipName
                            ?.toLowerCase()
                            .includes("platinum")) && (
                          <div
                            className={`relative ${theme.accent} rounded-full p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                        <p className="text-gray-600 text-sm line-clamp-3 min-h-[3rem]">
                          {benefit.benefitDescription ||
                            benefit.benefit_description ||
                            "No description available"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`flex-1 min-w-[80px] px-3 py-2 text-sm font-medium rounded-lg border-2 ${theme.border} ${theme.text} hover:bg-white/80 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1`}
                          onClick={() => onEdit(benefit)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          className="flex-1 min-w-[80px] px-3 py-2 text-sm font-medium rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1"
                          onClick={() => onDelete(benefit)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${theme.gradient} transition-opacity duration-300 pointer-events-none`}
                    ></div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedMembershipId === "all"
                      ? "No benefit types found"
                      : `No benefits for this membership`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedMembershipId === "all"
                      ? "Create your first benefit to get started"
                      : "Add benefits to make this membership more attractive"}
                  </p>
                  <button
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 space-x-2"
                    onClick={() =>
                      onEdit({
                        // Eğer bir membership filtresi uygulanmışsa, o membership ID'sini default olarak ayarla
                        ...(selectedMembershipId !== "all" && {
                          membership_id: selectedMembershipId,
                        }),
                      })
                    }
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Benefit Type</span>
                  </button>
                </div>
              </div>
            )}

            {/* Yeni Benefit Tipi Ekleme Kartı */}
            {filteredBenefits.length > 0 && (
              <div
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out cursor-pointer"
                onClick={() =>
                  onEdit({
                    // Eğer bir membership filtresi uygulanmışsa, o membership ID'sini default olarak ayarla
                    ...(selectedMembershipId !== "all" && {
                      membership_id: selectedMembershipId,
                    }),
                  })
                }
              >
                <div className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                  {/* Animated Plus Icon */}
                  <div className="relative mb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Plus className="w-8 h-8 text-white transform group-hover:rotate-90 transition-transform duration-300" />
                    </div>

                    {/* Sparkle Animation */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      <div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                      <div
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping"
                        style={{ animationDelay: "0.6s" }}
                      ></div>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-gray-700 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                    Add New Benefit Type
                  </h4>
                  <p className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                    Create a new benefit for your memberships
                  </p>
                </div>

                {/* Hover Background Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-blue-500 to-purple-600 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BenefitTypesList;

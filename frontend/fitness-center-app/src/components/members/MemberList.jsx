import React from "react";
import {
  Edit,
  Trash2,
  CreditCard,
  Info,
  ActivitySquare,
  User,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/formatters";

const MemberList = ({
  members = [],
  onEdit,
  onDelete,
  onAssignMembership,
  onViewDetails,
  onViewAssessments,
}) => {
  console.log("[MemberList] Received members:", members);
  console.log("[MemberList] Members length:", members.length);

  if (!members.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Members Found
        </h3>
        <p className="text-gray-500">
          Start by adding your first member to the fitness center.
        </p>
      </div>
    );
  }

  // Generate avatar initials and colors
  const getAvatarData = (member) => {
    const firstName = member.firstName || member.first_name || "";
    const lastName = member.lastName || member.last_name || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();

    // Generate consistent color based on name
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-red-400 to-red-600",
      "bg-gradient-to-br from-yellow-400 to-yellow-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
    ];

    const colorIndex =
      (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  // Enhanced membership badge styling
  const getMembershipBadgeClass = (type) => {
    const predefinedColors = {
      basic:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200",
      premium:
        "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200",
      gold: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200",
      platinum:
        "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 border border-gray-600",
    };

    if (type && predefinedColors[type.toLowerCase()]) {
      return predefinedColors[type.toLowerCase()];
    }

    if (type) {
      const firstChar = type.charAt(0).toLowerCase();
      if ("abcd".includes(firstChar)) {
        return "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200";
      } else if ("efgh".includes(firstChar)) {
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200";
      } else if ("ijkl".includes(firstChar)) {
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200";
      } else if ("mnop".includes(firstChar)) {
        return "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-200";
      } else if ("qrst".includes(firstChar)) {
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200";
      } else {
        return "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-200";
      }
    }

    return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200";
  };

  // Enhanced status styling
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-200";
      case "inactive":
      case "de_active":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200";
      case "on_hold":
        return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-white" />
          </div>
          Member Directory
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {members.length} members
          </span>
        </h2>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Avatar
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Member
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Membership
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Join Date
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {members.map((member, index) => {
              const avatarData = getAvatarData(member);
              return (
                <tr
                  key={member.id}
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* Avatar Column */}
                  <td className="py-6 px-6">
                    <div
                      className={`w-12 h-12 rounded-full ${avatarData.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {avatarData.initials}
                    </div>
                  </td>

                  {/* Member Info Column */}
                  <td className="py-6 px-6">
                    <div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {`${member.firstName || member.first_name || ""} ${
                          member.lastName || member.last_name || ""
                        }`.trim()}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        ID: #{member.id}
                      </div>
                    </div>
                  </td>

                  {/* Contact Column */}
                  <td className="py-6 px-6">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {member.email}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {member.phone}
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="py-6 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusBadgeClass(
                        member.status
                      )}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          member.status?.toLowerCase() === "active"
                            ? "bg-emerald-500"
                            : member.status?.toLowerCase() === "on_hold"
                            ? "bg-amber-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      {member.status === "de_active"
                        ? "Inactive"
                        : member.status === "on_hold"
                        ? "On Hold"
                        : member.status || "Unknown"}
                    </span>
                  </td>

                  {/* Membership Column */}
                  <td className="py-6 px-6">
                    {member.activeMembership ? (
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${getMembershipBadgeClass(
                          member.activeMembership.membershipName
                        )}`}
                      >
                        ⭐ {member.activeMembership.membershipName || "Unknown"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                        No Membership
                      </span>
                    )}
                  </td>

                  {/* Join Date Column */}
                  <td className="py-6 px-6">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatDate(member.joinDate || member.join_date)}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-6 px-6">
                    <div className="flex space-x-2">
                      <button
                        className="group p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:shadow-md border border-transparent hover:border-blue-200"
                        onClick={() => onEdit && onEdit(member)}
                        title="Edit Member"
                      >
                        <Edit
                          size={18}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      </button>
                      <button
                        className="group p-2.5 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all duration-200 hover:shadow-md border border-transparent hover:border-emerald-200"
                        onClick={() =>
                          onAssignMembership && onAssignMembership(member)
                        }
                        title="Assign Membership"
                      >
                        <CreditCard
                          size={18}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      </button>
                      <button
                        className="group p-2.5 text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-200 hover:shadow-md border border-transparent hover:border-purple-200"
                        onClick={() => onViewDetails && onViewDetails(member)}
                        title="Member Details"
                      >
                        <Info
                          size={18}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      </button>
                      <button
                        className="group p-2.5 text-amber-600 hover:bg-amber-100 rounded-xl transition-all duration-200 hover:shadow-md border border-transparent hover:border-amber-200"
                        onClick={() =>
                          onViewAssessments && onViewAssessments(member)
                        }
                        title="View Assessments"
                      >
                        <ActivitySquare
                          size={18}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      </button>
                      <button
                        className="group p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200"
                        onClick={() => onDelete && onDelete(member.id)}
                        title="Delete Member"
                      >
                        <Trash2
                          size={18}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">
            Showing {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 font-medium">
            Live Data • Auto-updating
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberList;

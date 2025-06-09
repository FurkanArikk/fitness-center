import React, { useState, useEffect } from "react";
import {
  X,
  LogIn,
  User,
  MapPin,
  Calendar,
  Clock,
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  Activity,
} from "lucide-react";
import Button from "../common/Button";

const CheckInModal = ({
  isOpen,
  onClose,
  onSave,
  facilities = [],
  members = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    member_id: "",
    facility_id: "",
    check_in_time: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setFormData({
        member_id: "",
        facility_id: "",
        check_in_time: localDateTime,
      });
      setErrors({});
      setSearchTerm("");
      setShowMemberDropdown(false);
    }
  }, [isOpen]);

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName || member.first_name || ""} ${
      member.lastName || member.last_name || ""
    }`.toLowerCase();
    const email = (member.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      member.id.toString().includes(search)
    );
  });

  const getMemberDisplayName = (member) => {
    const firstName = member.firstName || member.first_name || "";
    const lastName = member.lastName || member.last_name || "";
    return `${firstName} ${lastName}`.trim() || `Member #${member.id}`;
  };

  const selectedMember = members.find(
    (m) => m.id === parseInt(formData.member_id)
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.member_id) {
      newErrors.member_id = "Üye seçimi zorunludur";
    }

    if (!formData.facility_id) {
      newErrors.facility_id = "Tesis seçimi zorunludur";
    }

    if (!formData.check_in_time) {
      newErrors.check_in_time = "Giriş zamanı seçilmelidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      member_id: parseInt(formData.member_id),
      facility_id: parseInt(formData.facility_id),
      check_in_time: new Date(formData.check_in_time).toISOString(),
    };

    onSave(submitData);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleMemberSelect = (member) => {
    handleInputChange("member_id", member.id);
    setSearchTerm(getMemberDisplayName(member));
    setShowMemberDropdown(false);
  };

  const getMemberAvatar = (member) => {
    const colors = [
      "bg-gradient-to-br from-violet-400 via-purple-500 to-purple-600",
      "bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600",
      "bg-gradient-to-br from-emerald-400 via-green-500 to-green-600",
      "bg-gradient-to-br from-pink-400 via-rose-500 to-red-600",
      "bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600",
      "bg-gradient-to-br from-indigo-400 via-blue-500 to-blue-600",
    ];

    const colorIndex = member.id % colors.length;
    const firstName = member.firstName || member.first_name || "";
    const lastName = member.lastName || member.last_name || "";
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "M";

    return {
      initials,
      color: colors[colorIndex],
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100/50 transform animate-in zoom-in-95 duration-300">
        {/* Enhanced Header with Animated Gradient */}
        <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-violet-700 p-8 rounded-t-3xl overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  Üye Girişi
                </h2>
                <p className="text-white/80 text-lg font-medium">
                  Yeni tesis ziyareti kaydı oluştur
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-white/70 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Form with Modern Cards */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 bg-gradient-to-b from-gray-50/50 to-white"
        >
          {/* Member Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-6 hover:shadow-xl transition-all duration-300">
            <label className="flex items-center text-lg font-bold text-gray-800 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              Üye Seçimi
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowMemberDropdown(true);
                    if (!e.target.value) {
                      handleInputChange("member_id", "");
                    }
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  placeholder="Üyeleri ad, email veya ID ile ara..."
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white ${
                    errors.member_id
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              </div>

              {/* Enhanced Member Dropdown */}
              {showMemberDropdown && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => {
                      const avatar = getMemberAvatar(member);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMemberSelect(member)}
                          className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center space-x-4 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
                        >
                          <div
                            className={`w-12 h-12 rounded-xl ${avatar.color} flex items-center justify-center text-white font-bold shadow-lg`}
                          >
                            {avatar.initials}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-lg">
                              {getMemberDisplayName(member)}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {member.email} • ID: {member.id}
                            </div>
                          </div>
                          <Activity className="w-5 h-5 text-gray-400" />
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-6 py-8 text-gray-500 text-center">
                      <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium">Üye bulunamadı</p>
                    </div>
                  )}
                </div>
              )}

              {showMemberDropdown && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMemberDropdown(false)}
                />
              )}
            </div>

            {/* Enhanced Selected Member Preview */}
            {selectedMember && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200/50 rounded-2xl shadow-inner">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${
                      getMemberAvatar(selectedMember).color
                    } flex items-center justify-center text-white font-bold text-lg shadow-xl`}
                  >
                    {getMemberAvatar(selectedMember).initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-xl">
                      {getMemberDisplayName(selectedMember)}
                    </div>
                    <div className="text-gray-700 font-medium">
                      {selectedMember.email} • Durum:{" "}
                      <span className="text-green-600 font-bold">
                        {selectedMember.status || "Aktif"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            )}

            {errors.member_id && (
              <p className="text-red-600 text-sm flex items-center mt-3 font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.member_id}
              </p>
            )}
          </div>

          {/* Facility Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-6 hover:shadow-xl transition-all duration-300">
            <label className="flex items-center text-lg font-bold text-gray-800 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Tesis Seçimi
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.facility_id}
                onChange={(e) =>
                  handleInputChange("facility_id", e.target.value)
                }
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white ${
                  errors.facility_id
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <option value="">Tesis seçin...</option>
                {facilities.map((facility) => (
                  <option
                    key={facility.facility_id}
                    value={facility.facility_id}
                  >
                    🏢 {facility.name} - {facility.type}
                  </option>
                ))}
              </select>
            </div>
            {errors.facility_id && (
              <p className="text-red-600 text-sm flex items-center mt-3 font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.facility_id}
              </p>
            )}
          </div>

          {/* Check-in Time Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-6 hover:shadow-xl transition-all duration-300">
            <label className="flex items-center text-lg font-bold text-gray-800 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Giriş Zamanı
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={formData.check_in_time}
                onChange={(e) =>
                  handleInputChange("check_in_time", e.target.value)
                }
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-gray-50/50 hover:bg-white ${
                  errors.check_in_time
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              />
            </div>
            {errors.check_in_time && (
              <p className="text-red-600 text-sm flex items-center mt-3 font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.check_in_time}
              </p>
            )}
          </div>

          {/* Enhanced Summary Card */}
          {formData.member_id && formData.facility_id && (
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200/50 rounded-2xl p-6 shadow-lg transform animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-800">
                  Giriş Özeti
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
                  <span className="text-gray-700 font-medium">Üye:</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {selectedMember
                      ? getMemberDisplayName(selectedMember)
                      : `Üye #${formData.member_id}`}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
                  <span className="text-gray-700 font-medium">Tesis:</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {facilities.find(
                      (f) => f.facility_id === parseInt(formData.facility_id)
                    )?.name || "Seçili Tesis"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
                  <span className="text-gray-700 font-medium">Zaman:</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {formData.check_in_time
                      ? new Date(formData.check_in_time).toLocaleString("tr-TR")
                      : "Şimdi"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="px-8 py-3 text-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="w-5 h-5" />
                  <span>Giriş Kaydet</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;

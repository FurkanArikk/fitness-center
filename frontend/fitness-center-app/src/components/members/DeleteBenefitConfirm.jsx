import React from "react";
import { AlertTriangle, X, Trash2, Shield } from "lucide-react";

const DeleteBenefitConfirm = ({ benefit, onClose, onConfirm, isLoading }) => {
  if (!benefit) return null;

  const benefitName =
    benefit.benefitName || benefit.benefit_name || "this benefit";
  const benefitId = benefit.id || benefit.benefit_id;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 overflow-hidden">
        {/* Header with warning gradient */}
        <div className="relative p-6 bg-gradient-to-r from-red-500 to-red-600 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-12 w-8 h-8 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Delete Benefit Type</h3>
                <p className="text-white/80 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <button
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Warning indicator animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 right-16 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-8 left-20 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-12 left-1/2 w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Confirmation Message */}
          <div className="text-center">
            <p className="text-lg text-gray-700 font-medium mb-2">
              Are you sure you want to delete this benefit type?
            </p>
            <p className="text-gray-500 text-sm">
              This will permanently remove the benefit and all its associations.
            </p>
          </div>

          {/* Benefit Details Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Benefit Name
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {benefitName}
                  </p>
                </div>

                {(benefit.benefitDescription ||
                  benefit.benefit_description) && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.benefitDescription ||
                        benefit.benefit_description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Benefit ID
                  </p>
                  <p className="text-gray-600 font-mono text-sm">
                    #{benefitId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Section */}
          <div className="bg-gradient-to-r from-amber-50 to-red-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800 mb-3">
                  ⚠️ Important Warning
                </p>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>This action cannot be undone or reversed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Benefit will be permanently removed from all associated
                      memberships
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Members with access to this benefit may be affected
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Button Content */}
              <div className="relative flex items-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" />
                    <span>Delete Benefit</span>
                  </>
                )}
              </div>

              {/* Pulse Effect */}
              {!isLoading && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  <div
                    className="absolute top-3 right-4 w-1 h-1 bg-white rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="absolute bottom-2 left-6 w-1 h-1 bg-white rounded-full animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBenefitConfirm;

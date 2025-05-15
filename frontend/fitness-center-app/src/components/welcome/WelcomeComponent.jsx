import React from "react";
import Link from "next/link";

const WelcomeComponent = () => {
  return (
    <div className="flex w-full min-h-screen">
      {/* Sol taraf - Login formu */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo ve başlık */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold">e</span>
              <div className="text-xl">
                <div className="font-semibold">FITNESS</div>
                <div className="text-sm text-gray-500">Gym management</div>
              </div>
            </div>
          </div>

          {/* Giriş formu */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Log in</h2>

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>

            {/* Login seçenekleri */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Keep me logged in</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Butonlar */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all">
                Log in
              </button>
              <p className="text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-gray-900">
                Terms of Use
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2  h-screen  flex justify-center items-center bg-gradient-to-tr from-[#ff9ec3] via-[#c87fff] to-[#9ec3ff]">
        <img
          src="/assets/images/welcome.png"
          className="object-contain w-auto h-[400px] "
          alt="Welcome"
        />
      </div>
    </div>
  );
};

export default WelcomeComponent;

import { useState, useEffect } from "react";
import { Link } from "react-router";

export default function Hero() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true); // show the button
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show the install prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);

    // Reset
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative px-6 sm:px-12"
      style={{
        backgroundImage: "url('bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 -z-0"></div>

      {/* Hero Card */}
      <div className="relative z-10 rounded-2xl p-10 max-w-2xl text-center">
        <img src="./seaneb-logo-white.png" alt="Logo" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Become a Consultant
        </h1>
        <p className="text-white mb-8 text-base sm:text-lg">
          Join our professional network to connect with clients and grow your
          consulting business.
        </p>
        <div className="flex flex-col items-center gap-4">
          {/* Register Button */}
          <Link
            to="/consultant-registration"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-lg shadow-lg 
               transition-all hover:scale-105 duration-300 animate-bounce"
          >
            Register as Consultant
          </Link>

          {/* Download App Button */}
          {showInstall && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600
                 text-white font-semibold px-8 py-3 rounded-lg shadow-xl 
                 hover:from-green-600 hover:to-green-700 hover:scale-105
                 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300
                 animate-bounce-slow"
            >
              {/* Optional download icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v8m0 0l-4-4m4 4l4-4M12 4v8"
                />
              </svg>
              Download App
            </button>
          )}
        </div>


        {/* Login Link */}
        <p className="text-white mt-4">
          Already have an account?{" "}
          <Link to="/login" className="underline font-semibold hover:text-gray-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

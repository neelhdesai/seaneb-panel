import { Link } from "react-router";

export default function Hero() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative px-6 sm:px-12"
      style={{
        backgroundImage: "url('bg.png')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 -z-0"></div>

      {/* Hero Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-2xl text-center">
        <img
          src="./seaneb-offers.png"
          alt="Logo"
          className="h-20 w-auto mx-auto mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Become a Consultant
        </h1>
        <p className="text-gray-700 mb-8 text-base sm:text-lg">
          Join our professional network to connect with clients and grow your
          consulting business.
        </p>
        <Link
          to="/consultant-registration"
          className="inline-block bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all animate-bounce"
        >
          Register as Consultant
        </Link>
      </div>
    </div>
  );
}

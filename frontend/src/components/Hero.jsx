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
      <div className="relative z-10 rounded-2xl p-10 max-w-2xl text-center">
        <img
          src="./seaneb-logo-white.png"
          alt="Logo"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Become a Consultant
        </h1>
        <p className="text-white mb-8 text-base sm:text-lg">
          Join our professional network to connect with clients and grow your
          consulting business.
        </p>
        <Link
          to="/consultant-registration"
          className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-lg shadow-lg transition-all animate-bounce mb-4"
        >
          Register as Consultant
        </Link>
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

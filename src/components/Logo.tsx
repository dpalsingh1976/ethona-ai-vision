const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 800 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circuit E Icon */}
      <g transform="translate(20, 40)">
        {/* Outer circuit paths */}
        <path
          d="M 60 10 L 80 10 L 80 0 M 60 30 L 80 30 L 80 40 M 60 50 L 80 50 L 80 60 M 60 70 L 80 70 L 80 80"
          stroke="url(#gradient1)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* E shape with circuit design */}
        <path
          d="M 10 10 L 50 10 M 10 10 L 10 80 M 10 45 L 45 45 M 10 80 L 50 80"
          stroke="url(#gradient1)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Circuit nodes */}
        <circle cx="60" cy="10" r="5" fill="url(#gradient1)" />
        <circle cx="60" cy="30" r="5" fill="url(#gradient1)" />
        <circle cx="60" cy="50" r="5" fill="url(#gradient1)" />
        <circle cx="60" cy="70" r="5" fill="url(#gradient1)" />
        <circle cx="10" cy="10" r="5" fill="url(#gradient1)" />
        <circle cx="10" cy="45" r="5" fill="url(#gradient1)" />
        <circle cx="10" cy="80" r="5" fill="url(#gradient1)" />
      </g>

      {/* Ethona Text */}
      <text
        x="130"
        y="90"
        fontFamily="Poppins, sans-serif"
        fontSize="48"
        fontWeight="700"
        fill="#374151"
      >
        Ethona
      </text>

      {/* Digital Lab Text */}
      <text
        x="130"
        y="135"
        fontFamily="Poppins, sans-serif"
        fontSize="48"
        fontWeight="700"
        fill="url(#gradient2)"
      >
        Digital Lab
      </text>

      {/* Tagline */}
      <text
        x="130"
        y="165"
        fontFamily="Poppins, sans-serif"
        fontSize="20"
        fontWeight="400"
        fill="#6B7280"
      >
        Where strategy meets AI
      </text>

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;


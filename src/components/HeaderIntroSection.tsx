import {
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa6";

export const HeaderIntroSection = () => {
  const avatarUrl = "/profile.webp";

  return (
    <div className="w-full" style={{ backgroundColor: "#050796" }}>
      {/* Container max-w-[980px] matching .hib in XML */}
      <div className="max-w-[980px] mx-auto px-4 py-8 sm:py-10 text-white font-['Poppins','Karla',sans-serif]">
        <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-7">
          {/* LEFT: photo + name + tagline (38% width on desktop) */}
          <div className="w-full md:w-[38%] md:flex-shrink-0 flex flex-col items-center text-center p-6 sm:p-7 rounded-[18px] bg-white/[0.08] border border-white/[0.18] shadow-lg">
            {/* 150px circular photo with white ring and shadow */}
            <div className="w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] rounded-full p-[5px] bg-white shadow-[0_0_0_7px_rgba(255,255,255,0.12)] mb-4 overflow-hidden flex-shrink-0">
              <img
                src={avatarUrl}
                alt="MD. Shinha Sarder"
                className="w-full h-full rounded-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.src = "/profile.webp";
                }}
              />
            </div>

            {/* Name with Verified SVG Badge */}
            <h2 className="text-2xl sm:text-[26px] font-bold text-white leading-tight mb-1.5 flex items-center justify-center gap-1.5">
              <span>MD. Shinha Sarder</span>
              <svg
                aria-label="Verified"
                className="w-[20px] h-[20px] min-w-[20px] flex-shrink-0"
                viewBox="0 0 22 22"
              >
                <path
                  d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                  fill="#1d9bf0"
                />
              </svg>
            </h2>

            {/* Tagline */}
            <p className="text-[15px] font-medium text-[#cfd8ff] tracking-wide mb-2">
              Developer | Entrepreneur
            </p>
          </div>

          {/* RIGHT: short biography */}
          <div className="flex-1 flex flex-col justify-center p-2 sm:p-4 text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3.5 pb-2.5 border-b border-white/[0.22]">
              Biography
            </h3>
            <p className="text-[15px] leading-[1.85] text-[#e7ebff] text-justify sm:text-left">
              MD. Shinha Sarder is the Founder &amp; CEO of IT Tech BD and Biostar TV World, born on 5 November 2004. He is an engineer, developer, entrepreneur, musical artist, author, researcher, YouTuber and content creator, and he regularly uploads content on YouTube, Facebook and other social media.
            </p>
          </div>
        </div>

        {/* Real Social Media SVG Icons with Authentic Brand Colors */}
        <ul className="flex items-center justify-center flex-wrap gap-3 mt-6 pt-4">
          <li>
            <a
              href="https://www.facebook.com/md.shinha.sarder"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              aria-label="Facebook"
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-md"
              style={{ backgroundColor: "#1877f2" }}
            >
              <FaFacebookF size={18} />
            </a>
          </li>
          <li>
            <a
              href="https://x.com/mdshinhasarder"
              target="_blank"
              rel="noopener noreferrer"
              title="X / Twitter"
              aria-label="X"
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-md"
              style={{ backgroundColor: "#000000" }}
            >
              <FaXTwitter size={18} />
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/@MD-Shinha-Sarder"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
              aria-label="YouTube"
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-md"
              style={{ backgroundColor: "#ff0000" }}
            >
              <FaYoutube size={20} />
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/md_shinha_sarder"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              aria-label="Instagram"
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-md"
              style={{
                background:
                  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
              }}
            >
              <FaInstagram size={20} />
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/md-shinha-sarder/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              aria-label="LinkedIn"
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-md"
              style={{ backgroundColor: "#0a66c2" }}
            >
              <FaLinkedinIn size={18} />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/md-shinha-sarder"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label="GitHub"
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-md"
              style={{ backgroundColor: "#24292e" }}
            >
              <FaGithub size={20} />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderIntroSection;

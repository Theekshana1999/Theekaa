// SocialMediaIconSection.tsx
import React from "react";
import facebookIcon from "../assets/facebook.png";
import instagramIcon from "../assets/instagram.png";
import tiktokIcon from "../assets/tiktok.png";

interface SocialItem {
  name: string;
  icon: string;
  link: string;
  gradient: string;
}

const SocialMediaIconSection: React.FC = () => {
  const socials: SocialItem[] = [
    {
      name: "Facebook",
      icon: facebookIcon,
      link: "https://www.facebook.com/theeka.99",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      name: "Instagram",
      icon: instagramIcon,
      link: "https://www.instagram.com/theeka.99?igsh=Y2F3cm9zaXRhcXR2",
      gradient: "from-pink-500 via-purple-500 to-indigo-500",
    },
    {
      name: "TikTok",
      icon: tiktokIcon,
      link: "https://www.tiktok.com/@theekabro?_r=1&_t=ZS-95OuCezIc0f",
      gradient: "from-gray-700 to-gray-900",
    },
  ];

  return (
    <div className="text-center">

      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
        Follow Our Community
      </h2>

      <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
        Stay connected with us on social media for updates, success stories,
        and new opportunities to find your perfect match.
      </p>

      <div className="flex justify-center gap-5 flex-wrap">
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2"
          >
            <div className={`p-[2px] rounded-2xl bg-gradient-to-br ${social.gradient} shadow-md group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300`}>
              <div className="w-14 h-14 rounded-[14px] bg-white flex items-center justify-center">
                <img src={social.icon} alt={social.name} className="w-7 h-7" />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium group-hover:text-gray-600 transition">
              {social.name}
            </span>
          </a>
        ))}
      </div>

    </div>
  );
};

export default SocialMediaIconSection;
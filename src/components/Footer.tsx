import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (target.startsWith("#")) {
      e.preventDefault();
      if (location.pathname !== "/") {
        window.location.href = `/${target}`;
      } else {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const productLinks = [
    { name: "Features", href: "#features" },
    { name: "Architecture", href: "#architecture" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <footer className="py-32 px-6 border-t border-white/5 relative overflow-hidden bg-bg">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-24 relative z-10">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-4 mb-10 group">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-lg shadow-accent/20">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            <span className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">
              Release<span className="text-accent not-italic">Mind</span>
            </span>
          </Link>
          <p className="text-white/40 text-xl max-w-sm leading-relaxed font-light">
            The next generation of multi-agent intelligence for elite engineering teams.
          </p>
        </div>

        <div>
          <h4 className="text-accent font-bold mb-10 text-xs uppercase tracking-[0.4em]">Product</h4>
          <ul className="space-y-5">
            {productLinks.map((item) => (
              <li key={item.name}>
                {item.href.startsWith("#") ? (
                  <a 
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-white/40 hover:text-white text-xs transition-colors font-black uppercase tracking-widest"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link to={item.href} className="text-white/40 hover:text-white text-xs transition-colors font-black uppercase tracking-widest">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-accent font-bold mb-10 text-xs uppercase tracking-[0.4em]">Connect</h4>
          <div className="flex items-center gap-5">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <Link
                key={i}
                to="#"
                className="w-14 h-14 rounded-2xl glass border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-accent/50 hover:bg-accent/5 transition-all duration-500"
              >
                <Icon className="w-6 h-6" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
        <p className="text-white/20 text-xs uppercase tracking-[0.2em] font-black">
          © 2026 ReleaseMind AI. ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center gap-16">
          <Link to="#" className="text-white/20 hover:text-white text-xs uppercase tracking-[0.2em] font-black transition-colors">PRIVACY POLICY</Link>
          <Link to="#" className="text-white/20 hover:text-white text-xs uppercase tracking-[0.2em] font-black transition-colors">TERMS OF SERVICE</Link>
        </div>
      </div>

      {/* Background Atmosphere */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-accent/10 blur-[150px] rounded-full -z-10 opacity-50" />
    </footer>
  );
}

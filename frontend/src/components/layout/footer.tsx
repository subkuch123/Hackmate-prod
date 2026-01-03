import HackMateLogo from "@/assets/HackMate-logo.png";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Github, Linkedin, Mail, Twitter, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const socialLinks = [
  { icon: Github, href: "https://github.com/hackmate", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/hackmate", label: "Twitter" },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/110005121/admin/dashboard/",
    label: "LinkedIn",
  },
  { icon: Mail, href: "mailto:hack.mate17@gmail.com", label: "Email" },
];

// const footerSections = [
//   {
//     title: "Platform",
//     links: [
//       { name: "Dashboard", href: "/dashboard" },
//       { name: "Lobbies", href: "/lobbies" },
//       { name: "Teams", href: "/teams" },
//       { name: "Donation", href: "/donation" },
//     ],
//     target: "_self",
//   },
//   {
//     title: "Community",
//     links: [
//       {
//         name: "Whatsapp",
//         href: " https://chat.whatsapp.com/K9mhVxBuBVg3eW2dq6oG9l?mode=wwt",
//       },
//       {
//         name: "Linkedin",
//         href: "https://www.linkedin.com/in/hack-mate-6b619337b/?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
//       },
//       {
//         name: "Instagram",
//         href: "https://www.instagram.com/hackmate_official/",
//       },
//     ],
//     target: "_blank",
//   },
//   {
//     title: "Resources",
//     links: [
//       { name: "Support", href: "/dashboard?support" },
//       { name: "Contact Us", href: "/contact-us" }, //form
//       // { name: 'Tutorials', href: '/tutorials' },
//       // { name: 'Support', href: '/support' }
//     ],
//     target: "_self",
//   },
//   {
//     title: "About Us",
//     links: [
//       { name: "About", href: "/about" },
//       { name: "Careers", href: "/careers" },
//       { name: "Privacy", href: "/privacy" },
//       { name: "Terms", href: "/terms" },
//     ],
//     target: "_self",
//   },
// ];

export function Footer() {
  const location = useLocation();
  const footerSections = [
  {
    title: "Platform",
    links: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Lobbies", href: "/lobbies" },
      { name: "Teams", href: "/teams" },
      { name: "Donation", href: "/donation" },
    ],
    target: "_self",
  },
  {
    title: "Community",
    links: [
      {
        name: "Whatsapp",
        href: " https://chat.whatsapp.com/K9mhVxBuBVg3eW2dq6oG9l?mode=wwt",
      },
      {
        name: "Linkedin",
        href: "https://www.linkedin.com/company/110005121/admin/dashboard/",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/hackmate_official/",
      },
    ],
    target: "_blank",
  },
  {
    title: "Resources",
    links: [
      { name: "Support", href: `${location.pathname}?support` },
      { name: "Contact Us", href: "/contact-us" }, //form
      // { name: 'Tutorials', href: '/tutorials' },
      // { name: 'Support', href: '/support' }
    ],
    target: "_self",
  },
  {
    title: "About Us",
    links: [
      { name: "About", href: "/about" },
      // { name: "Careers", href: "/careers" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
    target: "_self",
  },
];
  return (
    <footer className="mt-20 border-t border-glass-border">
      <div className="">
        <GlassCard className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={HackMateLogo} alt="HackMate" className="w-8 h-8" />
                <span className="font-orbitron font-bold text-xl text-foreground">
                  HackMate
                </span>
                <Zap className="w-4 h-4 text-neon-cyan animate-pulse" />
              </div>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Where skills meet challenges. Join the ultimate platform for
                hackathons, team formation, and competitive coding.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary hover:bg-primary/10"
                    asChild
                  >
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-orbitron font-semibold text-foreground mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-300"
                        target={section?.target || "_self"}
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : ""
                        }
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 HackMate. All rights reserved.
            </p>
            <div className="flex gap-12 text-sm md:pr-16">
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              {/* <Link
                to="/cookies"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookies
              </Link> */}
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import {
  Navbar, NavBody, NavItems, MobileNav, NavbarLogo, NavbarButton,
  MobileNavHeader, MobileNavToggle, MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Features",     link: "#features" },
  { name: "How it works", link: "#how-it-works" },
  { name: "Extension",    link: "#extension" },
];

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-3">
          <NavbarButton href="/login"  variant="secondary">Log in</NavbarButton>
          <NavbarButton href="/signup" variant="gradient">Get started free</NavbarButton>
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-gray-300 hover:text-white transition-colors w-full py-1"
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full flex-col gap-2 pt-2 border-t border-white/[0.07]">
            <NavbarButton href="/login"  variant="dark"     className="w-full text-center" as="a">Log in</NavbarButton>
            <NavbarButton href="/signup" variant="gradient" className="w-full text-center" as="a">Get started free</NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

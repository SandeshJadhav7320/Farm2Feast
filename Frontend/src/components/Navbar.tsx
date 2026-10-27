import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  ShoppingBag,
  ChevronDown,
  LogOut,
  User,
  Package,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "/shop" },
  { label: "Why Us", href: "#features" },
  { label: "Our Story", href: "#story" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Wholesale", href: "#b2b" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  /* =========================
     CHECK LOGIN STATUS
  ========================= */

  useEffect(() => {
    const checkLogin = () => {
      const token = sessionStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();

    // Listen for login/logout changes
    window.addEventListener("auth-change", checkLogin);

    return () => {
      window.removeEventListener("auth-change", checkLogin);
    };
  }, []);

  /* =========================
     SCROLL
  ========================= */

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handler, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  /* =========================
     SECTION NAVIGATION
  ========================= */

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setOpen(false);

    // Products → Shop
    if (href === "/shop") {
      navigate("/shop");
      return;
    }

    // Section links on Home
    if (location.pathname === "/") {
      const element = document.querySelector(href);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    // From another page → Home section
    navigate(`/${href}`);
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setIsLoggedIn(false);
    setOpen(false);

    // Tell other components that authentication changed
    window.dispatchEvent(new Event("auth-change"));

    navigate("/");
  };

  return (
    <>
      {/* =========================
          TOP BAR
      ========================= */}

      <div className="hidden lg:block bg-ink-900 text-cream-100 text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          <p className="font-light tracking-wide">
            Straight from the ponds of Mithila, Bihar
          </p>

          <div className="flex items-center gap-6">

            <a
              href="tel:+917479656531"
              className="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              +91 7479 656531
            </a>

            <a
              href="#b2b"
              className="hover:text-primary-400 transition-colors"
            >
              Bulk / B2B Orders
            </a>

            {/* LOGIN / LOGOUT */}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            ) : (
              <Link
                to="/signin"
                className="hover:text-primary-400 transition-colors"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>


      {/* =========================
          MAIN NAV
      ========================= */}

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream-50/95 backdrop-blur-md shadow-lg shadow-ink-900/5"
            : "bg-transparent"
        }`}
      >

        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">

              <span className="font-display font-bold text-white text-lg">
                F2F
              </span>

              <div className="absolute inset-0 rounded-full border-2 border-primary-300/50 animate-pulse-ring" />

            </div>

            <div className="leading-none">

              <span className="font-display text-2xl font-bold text-ink-900 block">
                Farm2Feast
              </span>

              <span className="text-[10px] tracking-[0.2em] text-primary-600 uppercase">
                Makhana
              </span>

            </div>
          </Link>


          {/* DESKTOP LINKS */}

          <ul className="hidden lg:flex items-center gap-1">

            {navLinks.map((link) => (
              <li key={link.href}>

                <a
                  href={link.href}
                  onClick={(e) =>
                    handleSectionClick(e, link.href)
                  }
                  className="relative px-4 py-2 text-sm font-medium text-ink-700 hover:text-primary-600 transition-colors group"
                >

                  {link.label}

                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 rounded-full group-hover:w-3/4 transition-all duration-300" />

                </a>

              </li>
            ))}

          </ul>


          {/* CTA */}

          <div className="hidden lg:flex items-center gap-3">

            {/* CART */}

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-white text-ink-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 hover:shadow-md"
              aria-label="View cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            {isLoggedIn && (
              <Link
                to="/my-orders"
                className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-ink-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
            )}


            {/* USER / LOGIN */}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center gap-2 bg-ink-900 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg hover:bg-ink-800 hover:-translate-y-0.5 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/shop"
                className="relative inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm px-6 py-3 rounded-full overflow-hidden group shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >

                <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <ShoppingBag className="w-4 h-4 relative z-10" />

                <span className="relative z-10">
                  Shop Now
                </span>

              </Link>
            )}

          </div>


          {/* MOBILE TOGGLE */}

          <button
            className="lg:hidden p-2 text-ink-800"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

        </nav>


        {/* =========================
            MOBILE MENU
        ========================= */}

        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            open
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >

          <div className="bg-cream-50 border-t border-cream-200 px-6 py-4 space-y-1">

            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) =>
                  handleSectionClick(e, link.href)
                }
                className="flex items-center justify-between py-3 px-4 rounded-xl text-ink-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {link.label}

                <ChevronDown className="w-4 h-4 -rotate-90" />
              </a>
            ))}


            {/* MOBILE LOGIN / LOGOUT */}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-ink-900 text-white font-semibold px-6 py-3 rounded-full mt-3"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/signin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 border border-primary-500 text-primary-600 font-semibold px-6 py-3 rounded-full mt-3"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}

            {isLoggedIn && (
              <Link
                to="/my-orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 font-medium text-ink-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                <Package className="h-5 w-5" />
                My Orders
              </Link>
            )}


            {/* MOBILE SHOP */}

            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-full mt-3"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>

          </div>

        </div>

      </header>
    </>
  );
}
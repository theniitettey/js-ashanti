"use client";

import { useState, useEffect, useRef } from "react";
import { 
  CiSearch, 
  CiMenuFries } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { ModeToggle } from "@/components/layout/toogleMode";
import Link from "next/link";
import { categories } from "@/data/data";
import { SearcModal } from "@/components/products/SearchModal";
import { CartIcon } from "@/components/cart/cartIcon"
import { usePathname } from "next/navigation";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
} from "@tabler/icons-react";
import { FaStore } from "react-icons/fa6";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
const pathname = usePathname();
const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect (() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
    <header
    ref={headerRef}
    className="fixed top-0 left-0 right-0 z-50 
    lg:w-[1100px] xl:w-[1250px]  
    mx-auto bg-white/90 dark:bg-black/40 dark:text-white 
    border-b border-white/20 shadow-sm md:rounded-full"
>

    <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex gap-4">
            {/* Hamburger Icon - only mobile */}
            
             {/*    <button
                className="block lg:hidden landscape:hidden text-xl focus:outline-none transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {
                  isOpen ? ( <IoClose /> ) : (
                    <CiMenuFries />
                  )
                }
              </button> */}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
             <h1 className={`text-[10px] md:text-md lg:text-2xl font-bold logo`}>J'S Ashantis</h1>
            </Link>
          </div>
          

          {/* Desktop Navigation */}
          <div className="flex gap-4">
            <nav className="hidden md:flex landscape:flex landscape:space-x-6 space-x-4 font-medium">
              {
                categories.map((category, index) => (
                  <Link 
                    key={index} 
                    href={category.link} 
                    className="hover:text-red-700 transition text-[12px] landscape:text-[12px]"
                  >
                    {category.title}
                  </Link>
                ))
              }
            </nav>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <CiSearch 
            className="text-2xl hidden md:block landscape:block cursor-pointer" 
            onClick={() => setOpenSearch(true)}
            />
            <CartIcon className="hidden md:block landscape:block cursor-pointer" />
            <ModeToggle />

            
          </div>

          
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-black dark:text-white shadow-inner ${
          isOpen ? "h-dvh py-4 w-1/2" : "max-h-0 opacity-0 w-1/2"
        }`}
      >
        <nav className="flex flex-col items-start space-y-3 px-6 text-gray-700 font-medium">
        {
                categories.map((category, index) => (
                  <Link 
                    key={index} 
                    href={category.link} 
                    className="hover:text-red-700 transition"
                  >
                    {category.title}
                  </Link>
                ))
              }
        </nav>
      </div>
      <MobileHeader />
    </header>
    <SearcModal isOpen={openSearch} onClose={() => setOpenSearch(false)} />
    </>
  );
}


export function MobileHeader() {
  const [openSearch, setOpenSearch] = useState(false);
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },

    {
      title: "Store",
      icon: (
        <FaStore className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/products",
    },
    {
      title: "Search",
      icon: (
        <CiSearch 
            className="text-2xl" 
            onClick={() => setOpenSearch(true)}
            />
      ),
      href: "/search",
    },
    {
      title: "Cart",
      icon: (
        <CartIcon />
      ),
      href: "/cart",
    },
    
  ];
  return (
    <div className="flex items-center justify-center w-full">
      <FloatingDock
        items={links}
      />
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';

const MobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    const handleOpenRegisterModal = () => {
      setIsRegisterModalOpen(true);
    };

    document.addEventListener('openLoginModal', handleOpenLoginModal);
    document.addEventListener('openRegisterModal', handleOpenRegisterModal);

    return () => {
      document.removeEventListener('openLoginModal', handleOpenLoginModal);
      document.removeEventListener('openRegisterModal', handleOpenRegisterModal);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent px-6 py-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#2F584F] to-[#8CA29D] bg-clip-text text-transparent hover:from-[#8CA29D] hover:to-[#2F584F] transition-all duration-300">savvy</span>
            </Link>
          </div>

          <button
            onClick={toggleMenu}
            className="text-[#8CA29D] hover:text-[#2F584F] focus:outline-none transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white mt-1 py-4 px-6 rounded-b-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link
                href="/contact"
                className="text-gray-800 hover:text-[#2F584F] font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                ติดต่อพวกเรา
              </Link>
              <Link
                href="/doc"
                className="text-gray-800 hover:text-[#2F584F] font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                Doc
              </Link>
              <Link
                href="/faq"
                className="text-gray-800 hover:text-[#2F584F] font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                FAQ
              </Link>
              <button
                className="text-gray-800 hover:text-[#2F584F] font-medium transition-colors py-2 text-left w-full"
                onClick={openRegisterModal}
              >
                ลงทะเบียน
              </button>
              <button
                className="text-gray-800 hover:text-[#2F584F] font-medium transition-colors py-2 text-left w-full"
                onClick={openLoginModal}
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
      />
    </>
  );
};

export default MobileNavbar;
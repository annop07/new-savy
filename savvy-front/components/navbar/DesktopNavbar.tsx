'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';

const DesktopNavbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent px-6 py-4">
        <div className="max-w-[100rem] mx-auto flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-[#000] text-3xl font-bold tracking-tight bg-gradient-to-r from-[#2F584F] to-[#8CA29D] bg-clip-text text-transparent hover:from-[#8CA29D] hover:to-[#2F584F] transition-all duration-300">savvy</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/doc" className="text-[#000] hover:text-gray-200 font-medium transition-colors">
              Doc
            </Link>
            <Link href="/faq" className="text-[#000] hover:text-gray-200 font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="text-[#000] hover:text-gray-200 font-medium transition-colors">
              ติดต่อพวกเรา
            </Link>
            <div className='flex items-center space-x-0 ml-5'>
              <button
                onClick={openLoginModal}
                className="px-4 py-2 bg-[#2F584F] text-white rounded-md hover:bg-[#8CA29D] transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 text-[#000] hover:text-gray-200 font-medium transition-colors"
              >
                ลงทะเบียน
              </button>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={openRegisterModal}
        />
      <RegisterModal
        onSwitchToLogin={openLoginModal}
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
      />
    </>
  );
};

export default DesktopNavbar;
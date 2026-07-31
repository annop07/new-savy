'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { LoginModalProps } from '@/types';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData.email, formData.password);
      
      await login(response.access_token);
      
      onClose();
      router.push('/user/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Card className="bg-white p-8 rounded-lg shadow-lg w-full border border-gray-200 z-10">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              เข้าสู่ระบบ
            </h1>

            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">อีเมล</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  placeholder="example@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">รหัสผ่าน</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  placeholder="รหัสผ่านของคุณ"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2F584F] text-white py-2 px-4 rounded-md hover:bg-[#8CA29D] transition-colors"
                disabled={loading}
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                ยังไม่มีบัญชี?{" "}
                <button 
                  onClick={onSwitchToRegister} 
                  className="text-[#2F584F] hover:underline"
                >
                  ลงทะเบียน
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
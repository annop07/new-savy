'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { RegisterModalProps } from '@/types';
import { registerUser } from '@/lib/api';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }
    
    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined
      });
      
      onClose();
      
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
      
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      } else {
        setError('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
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
              ลงทะเบียน
            </h1>
            
            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 mb-2">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  required
                />
              </div>
              
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
                <label htmlFor="full_name" className="block text-gray-700 mb-2">ชื่อ-นามสกุล (ไม่บังคับ)</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
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
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#2F584F] text-white py-2 px-4 rounded-md hover:bg-[#8CA29D] transition-colors"
                disabled={loading}
              >
                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                มีบัญชีอยู่แล้ว? <button onClick={onSwitchToLogin} className="text-[#2F584F] hover:underline">เข้าสู่ระบบ</button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
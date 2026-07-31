'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaEnvelope, FaKey, FaServer, FaSave, FaSpinner } from 'react-icons/fa';
import { createImapSetting, syncEmails } from '@/lib/api';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EmailSettingsModal({ isOpen, onClose, onSuccess }: EmailSettingsModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    server: '',
    port: '993', // Default IMAP SSL port
    username: '',
    use_ssl: true,
    folder: 'INBOX' // Default folder
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (name === 'email' && !formData.username) {
      setFormData(prev => ({
        ...prev,
        username: value
      }));
    }
  };

  const handleServerPreset = (preset: string) => {
    switch(preset) {
      case 'gmail':
        setFormData(prev => ({
          ...prev,
          server: 'imap.gmail.com',
          port: '993',
          use_ssl: true
        }));
        break;
      case 'outlook':
        setFormData(prev => ({
          ...prev,
          server: 'outlook.office365.com',
          port: '993',
          use_ssl: true
        }));
        break;
      case 'yahoo':
        setFormData(prev => ({
          ...prev,
          server: 'imap.mail.yahoo.com',
          port: '993',
          use_ssl: true
        }));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    try {
      // Call API to create IMAP setting
      const response = await createImapSetting({
        email: formData.email,
        server: formData.server,
        port: parseInt(formData.port),
        username: formData.username,
        password: formData.password,
        use_ssl: formData.use_ssl,
        folder: formData.folder
      });
      
      // Start syncing emails in background
      try {
        await syncEmails(response.id, 30, 50);
      } catch (syncError) {
        console.error("Error starting email sync:", syncError);
        // Continue anyway since setting was created successfully
      }
      
      setSuccess('บันทึกการตั้งค่าสำเร็จ และเริ่มดึงข้อมูลอีเมลในเบื้องหลังแล้ว');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        server: '',
        port: '993',
        username: '',
        use_ssl: true,
        folder: 'INBOX'
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (err: any) {
      console.error("Error saving IMAP settings:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Close button */}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
              <FaEnvelope className="mr-2 text-[#2F584F]" />
              ตั้งค่าการเชื่อมต่ออีเมล
            </h1>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-4">
              <p className="text-sm text-blue-700">การเชื่อมต่ออีเมลช่วยให้ระบบสามารถดึงข้อมูลบิลและใบเสร็จจากอีเมลของคุณโดยอัตโนมัติ</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick setup buttons */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-gray-500">เลือกผู้ให้บริการ:</span>
                <button 
                  type="button" 
                  onClick={() => handleServerPreset('gmail')}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Gmail
                </button>
                <button 
                  type="button" 
                  onClick={() => handleServerPreset('outlook')}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Outlook
                </button>
                <button 
                  type="button" 
                  onClick={() => handleServerPreset('yahoo')}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Yahoo Mail
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">อีเมลที่ใช้รับบิลและใบเสร็จ</label>
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
                <label htmlFor="username" className="block text-gray-700 mb-2">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  placeholder="ปกติคือที่อยู่อีเมลของคุณ"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">รหัสผ่านแอพ</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  placeholder="รหัสผ่านแอพของคุณ"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  แนะนำให้ใช้รหัสผ่านแอพแทนรหัสผ่านปกติเพื่อความปลอดภัย 
                  <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-[#2F584F] ml-1">
                    เรียนรู้เพิ่มเติม
                  </a>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="server" className="block text-gray-700 mb-2">เซิร์ฟเวอร์ IMAP</label>
                  <input
                    type="text"
                    id="server"
                    name="server"
                    value={formData.server}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                    placeholder="imap.example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="port" className="block text-gray-700 mb-2">พอร์ต</label>
                  <input
                    type="number"
                    id="port"
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                    placeholder="993"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="use_ssl"
                  name="use_ssl"
                  checked={formData.use_ssl}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#2F584F] focus:ring-[#2F584F] border-gray-300 rounded"
                />
                <label htmlFor="use_ssl" className="ml-2 block text-gray-700">
                  ใช้ SSL (แนะนำให้เปิดใช้งานเพื่อความปลอดภัย)
                </label>
              </div>
              
              <div className="mb-4">
                <label htmlFor="folder" className="block text-gray-700 mb-2">โฟลเดอร์ที่ต้องการตรวจสอบ</label>
                <input
                  type="text"
                  id="folder"
                  name="folder"
                  value={formData.folder}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                  placeholder="INBOX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ค่าเริ่มต้น "INBOX" เพื่อตรวจสอบกล่องจดหมายขาเข้า
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#2F584F] text-white py-2 px-4 rounded-md hover:bg-[#8CA29D] transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    บันทึกการตั้งค่า
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
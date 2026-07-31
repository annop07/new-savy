"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DesktopNavbar from '@/components/navbar/DesktopNavbar';
import MobileNavbar from '@/components/navbar/MobileNavbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อของคุณ';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมลของคุณ';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'กรุณากรอกอีเมลที่ถูกต้อง';
    }
    
    if (formData.phone && !/^[0-9]{9,10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'กรุณากรอกข้อความของคุณ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setSubmitSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <DesktopNavbar />
      <MobileNavbar />
      
      {/* Background animation similar to main page */}
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="relative w-[40vmin] h-[40vmin] bg-[#2F584F]/50 rounded-[100%] blur-[50px] sm:blur-[200px] animate-[one_90s_infinite]"></div>
      </div>
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="relative w-[40vmin] h-[40vmin] bg-[#8CA29D]/50 rounded-[100%] blur-[50px] sm:blur-[200px] animate-[two_90s_infinite]"></div>
      </div>
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="relative w-[40vmin] h-[40vmin] bg-[#d1dad8]/50 rounded-[100%] blur-[50px] sm:blur-[200px] animate-[three_90s_infinite]"></div>
      </div>
      
      <main className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#2F584F] to-[#8CA29D] bg-clip-text text-transparent mb-4">ติดต่อพวกเรา</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">มีคำถามหรือข้อเสนอแนะเกี่ยวกับ Savvy? เราพร้อมรับฟังและช่วยเหลือคุณ</p>
          </div>
          
          <Card className="bg-white shadow-lg border border-gray-200 py-7">
            <CardHeader>
              <CardTitle className="text-2xl text-[#2F584F]">แบบฟอร์มติดต่อ</CardTitle>
              <CardDescription>กรอกข้อมูลด้านล่างเพื่อส่งข้อความถึงทีมงานของเรา</CardDescription>
            </CardHeader>
            <CardContent>
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                  ส่งข้อความสำเร็จ! ขอบคุณที่ติดต่อเรา เราจะตอบกลับโดยเร็วที่สุด
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="กรุณากรอกชื่อของคุณ"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="example@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    เบอร์โทรศัพท์ <span className="text-gray-400">(ไม่บังคับ)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0812345678"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    ข้อความ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="กรุณากรอกข้อความของคุณ"
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#2F584F] hover:bg-[#8CA29D] text-white py-2 px-4 rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="w-12 h-12 bg-[#2F584F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2F584F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">อีเมล</h3>
              <p className="text-gray-600">support@savvy.com</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="w-12 h-12 bg-[#2F584F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2F584F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">โทรศัพท์</h3>
              <p className="text-gray-600">02-123-4567</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="w-12 h-12 bg-[#2F584F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2F584F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ที่อยู่</h3>
              <p className="text-gray-600">SC09 9525</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
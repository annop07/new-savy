"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Cardmanagefirstsetting() {
    const [formData, setFormData] = useState({
        email: '',
        appPassword: '',
        imapServer: '',
        port: '993', // Default IMAP SSL port
        ssl: true,
        checkInterval: '300', // Default 5 minutes (300 seconds)
        folder: 'INBOX' // Default folder
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Here you would typically send the data to your backend
    };

    return (
        <Card className='mb-6 py-5 w-[600px]'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg'>ตั้งค่าการเชื่อมต่ออีเมล</CardTitle>
                <CardDescription>กรอกข้อมูลเพื่อเชื่อมต่อกับเซิร์ฟเวอร์อีเมลของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <label htmlFor='email' className='block text-sm font-medium'>
                            อีเมลที่ใช้รับบิลและใบเสร็จ
                        </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]'
                            placeholder='example@example.com'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <label htmlFor='appPassword' className='block text-sm font-medium'>
                            รหัสผ่านแอพ 
                            
                        </label>
                        <input
                            type='password'
                            id='appPassword'
                            name='appPassword'
                            value={formData.appPassword}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]'
                            placeholder='รหัสผ่านแอพของคุณ'
                            required
                        />
                        <p className='text-xs text-gray-500'>ใช้รหัสผ่านแอพแทนรหัสผ่านปกติเพื่อความปลอดภัย</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <label htmlFor='imapServer' className='block text-sm font-medium'>
                                เซิร์ฟเวอร์ IMAP
                            </label>
                            <input
                                type='text'
                                id='imapServer'
                                name='imapServer'
                                value={formData.imapServer}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]'
                                placeholder='imap.example.com'
                                required
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor='port' className='block text-sm font-medium'>
                                พอร์ต
                            </label>
                            <input
                                type='number'
                                id='port'
                                name='port'
                                value={formData.port}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]'
                                placeholder='993'
                                required
                            />
                        </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <input
                            type='checkbox'
                            id='ssl'
                            name='ssl'
                            checked={formData.ssl}
                            onChange={handleChange}
                            className='h-4 w-4 text-green-600 focus:ring-[#2F584F] border-gray-300 rounded'
                        />
                        <label htmlFor='ssl' className='block text-sm font-medium'>
                            ใช้ SSL
                        </label>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <label htmlFor='checkInterval' className='block text-sm font-medium'>
                                ตรวจสอบทุกๆ (วินาที)
                            </label>
                            <input
                                type='number'
                                id='checkInterval'
                                name='checkInterval'
                                value={formData.checkInterval}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]'
                                placeholder='300'
                                min='60'
                                required
                            />
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor='folder' className='block text-sm font-medium'>
                                โฟลเดอร์ที่จะตรวจสอบ
                            </label>
                            <input
                                type='text'
                                id='folder'
                                name='folder'
                                value={formData.folder}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]'
                                placeholder='INBOX'
                            />
                        </div>
                    </div>

                    <div className='pt-4 flex items-center justify-between'>
                        <Link href="/user/dashboard">
                            <Button
                                type='submit'
                                className='bg-[#2F584F] hover:bg-[#8CA29D] text-white'
                            >
                                บันทึกการตั้งค่า
                            </Button>
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>


    );
}

export default Cardmanagefirstsetting;
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FaQuestionCircle, FaServer, FaKey, FaEnvelope } from 'react-icons/fa';

const EmailSettingsGuide = () => {
    const [activeTab, setActiveTab] = useState('common');

    const commonServers = [
        { provider: 'Gmail', imap: 'imap.gmail.com', port: '993', notes: 'ต้องเปิดใช้งาน IMAP ในการตั้งค่า Gmail และใช้รหัสผ่านแอพ' },
        { provider: 'Outlook/Hotmail', imap: 'outlook.office365.com', port: '993', notes: 'ต้องเปิดใช้งาน IMAP ในการตั้งค่า Outlook' },
        { provider: 'Yahoo Mail', imap: 'imap.mail.yahoo.com', port: '993', notes: 'ต้องเปิดใช้งาน IMAP ในการตั้งค่า Yahoo Mail และใช้รหัสผ่านแอพ' },
        { provider: 'iCloud Mail', imap: 'imap.mail.me.com', port: '993', notes: 'ต้องเปิดใช้งาน IMAP ในการตั้งค่า iCloud และใช้รหัสผ่านแอพ' },
    ];

    return (
        <Card className='mb-6 py-5 w-[600px]'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg flex items-center'>
                    <FaQuestionCircle className="mr-2 text-[#2F584F]" />
                    คำแนะนำการตั้งค่าอีเมล
                </CardTitle>
                <CardDescription>ข้อมูลที่เป็นประโยชน์สำหรับการตั้งค่าการเชื่อมต่ออีเมลของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex border-b">
                    <button 
                        onClick={() => setActiveTab('common')} 
                        className={`py-2 px-4 ${activeTab === 'common' ? 'border-b-2 border-[#2F584F] text-[#2F584F] font-medium' : 'text-gray-500'}`}
                    >
                        เซิร์ฟเวอร์ทั่วไป
                    </button>
                    <button 
                        onClick={() => setActiveTab('appPassword')} 
                        className={`py-2 px-4 ${activeTab === 'appPassword' ? 'border-b-2 border-[#2F584F] text-[#2F584F] font-medium' : 'text-gray-500'}`}
                    >
                        รหัสผ่านแอพ
                    </button>
                    <button 
                        onClick={() => setActiveTab('tips')} 
                        className={`py-2 px-4 ${activeTab === 'tips' ? 'border-b-2 border-[#2F584F] text-[#2F584F] font-medium' : 'text-gray-500'}`}
                    >
                        เคล็ดลับ
                    </button>
                </div>

                {activeTab === 'common' && (
                    <div className="space-y-4">
                        <div className="flex items-center mb-2">
                            <FaServer className="mr-2 text-[#2F584F]" />
                            <h3 className="font-medium">เซิร์ฟเวอร์ IMAP ทั่วไป</h3>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3 text-sm font-medium">ผู้ให้บริการ</th>
                                        <th className="text-left py-2 px-3 text-sm font-medium">เซิร์ฟเวอร์ IMAP</th>
                                        <th className="text-left py-2 px-3 text-sm font-medium">พอร์ต</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commonServers.map((server, index) => (
                                        <tr key={index} className={index !== commonServers.length - 1 ? "border-b" : ""}>
                                            <td className="py-2 px-3 text-sm">{server.provider}</td>
                                            <td className="py-2 px-3 text-sm font-mono">{server.imap}</td>
                                            <td className="py-2 px-3 text-sm">{server.port}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">หมายเหตุ: แนะนำให้ใช้ SSL สำหรับการเชื่อมต่อทั้งหมด</p>
                    </div>
                )}

                {activeTab === 'appPassword' && (
                    <div className="space-y-4">
                        <div className="flex items-center mb-2">
                            <FaKey className="mr-2 text-[#2F584F]" />
                            <h3 className="font-medium">วิธีรับรหัสผ่านแอพ</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-md p-3">
                                <h4 className="font-medium mb-2">Gmail</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>ไปที่ <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-[#2F584F] underline">การตั้งค่าความปลอดภัยของ Google</a></li>
                                    <li>เลือก "การยืนยันตัวตนแบบ 2 ขั้นตอน"</li>
                                    <li>เลื่อนลงและเลือก "รหัสผ่านแอพ"</li>
                                    <li>สร้างรหัสผ่านใหม่สำหรับแอพ "อื่นๆ"</li>
                                </ol>
                            </div>
                            <div className="bg-gray-50 rounded-md p-3">
                                <h4 className="font-medium mb-2">Outlook/Hotmail</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>ไปที่ <a href="https://account.live.com/proofs/Manage" target="_blank" rel="noopener noreferrer" className="text-[#2F584F] underline">การตั้งค่าความปลอดภัยของ Microsoft</a></li>
                                    <li>เลือก "ตัวเลือกความปลอดภัยเพิ่มเติม"</li>
                                    <li>เลือก "สร้างรหัสผ่านแอพใหม่"</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tips' && (
                    <div className="space-y-4">
                        <div className="flex items-center mb-2">
                            <FaEnvelope className="mr-2 text-[#2F584F]" />
                            <h3 className="font-medium">เคล็ดลับการตั้งค่า</h3>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3 space-y-3">
                            <div>
                                <h4 className="font-medium mb-1">ความถี่ในการตรวจสอบ</h4>
                                <p className="text-sm">ตั้งค่าความถี่ในการตรวจสอบอีเมลให้เหมาะสม แนะนำอย่างน้อย 5 นาที (300 วินาที) เพื่อไม่ให้เซิร์ฟเวอร์อีเมลบล็อกการเชื่อมต่อ</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">โฟลเดอร์ที่ควรตรวจสอบ</h4>
                                <p className="text-sm">หากคุณใช้กฎการกรองอีเมลเพื่อย้ายอีเมลไปยังโฟลเดอร์เฉพาะ ให้ระบุชื่อโฟลเดอร์นั้นแทน "INBOX"</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">การแก้ไขปัญหาทั่วไป</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>ตรวจสอบให้แน่ใจว่าได้เปิดใช้งาน IMAP ในการตั้งค่าอีเมลของคุณ</li>
                                    <li>ใช้รหัสผ่านแอพแทนรหัสผ่านปกติเพื่อความปลอดภัย</li>
                                    <li>ตรวจสอบว่าไม่มีการบล็อกการเข้าถึงจากแอพพลิเคชันภายนอก</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EmailSettingsGuide;
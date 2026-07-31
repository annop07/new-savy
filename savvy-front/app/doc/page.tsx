"use client";

import React, { useState } from 'react';
import DesktopNavbar from '@/components/navbar/DesktopNavbar';
import MobileNavbar from '@/components/navbar/MobileNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FaEnvelope, FaFileInvoiceDollar, FaChartPie, FaQuestionCircle, FaServer, FaKey } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { TbMoneybag, TbGraphFilled } from 'react-icons/tb';
import { RiFileList2Fill } from 'react-icons/ri';

const DocPage = () => {
    const [activeTab, setActiveTab] = useState('getting-started');

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <DesktopNavbar />
            <MobileNavbar />

            <main className="pt-24 pb-16 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#2F584F] to-[#8CA29D] bg-clip-text text-transparent mb-4">คู่มือการใช้งาน Savvy</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">เรียนรู้วิธีการใช้งานแพลตฟอร์มของเราเพื่อจัดการบิล ใบเสร็จ และงบประมาณของคุณอย่างมีประสิทธิภาพ</p>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-6 mb-12 shadow-xl border border-gray-200">
                        <Tabs defaultValue="getting-started" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
                                <TabsTrigger value="getting-started">เริ่มต้นใช้งาน</TabsTrigger>
                                <TabsTrigger value="email-setup">ตั้งค่าอีเมล</TabsTrigger>
                                <TabsTrigger value="budget">จัดการงบประมาณ</TabsTrigger>
                            </TabsList>

                            <TabsContent value="getting-started" className="space-y-8">
                                <Card className="bg-white border-gray-200 py-7">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-[#2F584F] flex items-center">
                                            <span className="bg-[#2F584F] text-white p-2 rounded-full mr-3 text-xl">✨</span>
                                            เริ่มต้นใช้งาน Savvy
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">เริ่มต้นการเดินทางสู่การจัดการการเงินอย่างชาญฉลาด</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <div className="bg-[#2F584F] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</div>
                                                <h3 className="text-xl font-medium text-gray-800">สร้างบัญชีและเริ่มต้นใช้งาน</h3>
                                            </div>
                                            <div className="ml-11 space-y-3 text-gray-600 bg-gray-50 p-4 rounded-md border-l-4 border-[#8CA29D]">
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> คลิกที่ปุ่ม "ลงทะเบียน" ที่มุมขวาบนของหน้าแรก</p>
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> สร้างบัญชีด้วยอีเมลที่ใช้งานจริงเพื่อรับการแจ้งเตือนและอัปเดตสำคัญ</p>
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> ตั้งรหัสผ่านที่รัดกุมเพื่อปกป้องข้อมูลทางการเงินของคุณ</p>
                                                <div className="bg-[#e8f0ee] p-3 rounded mt-2">
                                                    <p className="text-sm flex items-center"><span className="text-amber-600 mr-2">💡</span> <strong>เคล็ดลับ : </strong>ใช้รหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร ผสมตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <div className="bg-[#2F584F] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</div>
                                                <h3 className="text-xl font-medium text-gray-800">สำรวจแดชบอร์ดอัจฉริยะ</h3>
                                            </div>
                                            <div className="ml-11 space-y-3 text-gray-600 bg-gray-50 p-4 rounded-md border-l-4 border-[#8CA29D]">
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> แดชบอร์ดนำเสนอภาพรวมทางการเงินแบบเรียลไทม์ด้วยกราฟและแผนภูมิที่เข้าใจง่าย</p>
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> ดูแนวโน้มค่าใช้จ่ายและรายจ่ายตามหมวดหมู่ที่แสดงด้วยสีสันสวยงาม</p>
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> ใช้เมนูนำทางด้านซ้ายเพื่อเข้าถึงฟีเจอร์ต่างๆ ได้อย่างรวดเร็ว</p>
                                                <div className="bg-[#e8f0ee] p-3 rounded mt-2">
                                                    <p className="text-sm flex items-center"><span className="text-amber-600 mr-2">💡</span> <strong>เคล็ดลับ : </strong> ปรับแต่งแดชบอร์ดโดยการลากและวางวิดเจ็ตเพื่อให้ตรงกับความต้องการของคุณ</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <div className="bg-[#2F584F] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</div>
                                                <h3 className="text-xl font-medium text-gray-800">เชื่อมต่ออีเมลเพื่อการจัดการอัตโนมัติ</h3>
                                            </div>
                                            <div className="ml-11 space-y-3 text-gray-600 bg-gray-50 p-4 rounded-md border-l-4 border-[#8CA29D]">
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> เชื่อมต่ออีเมลของคุณเพื่อให้ Savvy ติดตามค่าใช้จ่ายโดยอัตโนมัติ</p>
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> ตั้งค่าการเชื่อมต่อได้ง่ายๆ ในหน้า "ตั้งค่าการเชื่อมต่ออีเมล"</p>
                                                <p className="flex items-center"><span className="text-[#2F584F] mr-2">→</span> ระบบจะประมวลผลอีเมลที่เกี่ยวข้องกับการเงินเท่านั้น เพื่อความเป็นส่วนตัวสูงสุด</p>
                                                <div className="bg-[#e8f0ee] p-3 rounded mt-2">
                                                    <p className="text-sm flex items-center"><span className="text-amber-600 mr-2">💡</span> <strong>เคล็ดลับ : </strong> ใช้รหัสผ่านแอพแทนรหัสผ่านปกติของอีเมลเพื่อความปลอดภัยเพิ่มเติม</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                      
                            </TabsContent>

                            <TabsContent value="email-setup" className="space-y-8">
                                <Card className="bg-white border-gray-200 py-7">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-[#2F584F] flex items-center">
                                            <span className="bg-[#2F584F] text-white p-2 rounded-full mr-3"><IoMail className="text-xl" /></span>
                                            การตั้งค่าการเชื่อมต่ออีเมล
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">เชื่อมต่ออีเมลของคุณเพื่อการจัดการการเงินอัตโนมัติ</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6">
                                            <div className="flex items-start">
                                                <div className="text-blue-500 mr-3 mt-1"><FaKey size={18} /></div>
                                                <div>
                                                    <h4 className="font-medium text-blue-700">ทำไมต้องเชื่อมต่ออีเมล?</h4>
                                                    <p className="text-blue-600 text-sm">การเชื่อมต่ออีเมลช่วยให้ Savvy สามารถติดตามค่าใช้จ่ายของคุณโดยอัตโนมัติ ทำให้คุณไม่ต้องป้อนข้อมูลด้วยตนเอง และมีข้อมูลทางการเงินที่แม่นยำมากขึ้น</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-medium text-gray-800 flex items-center">
                                                <span className="bg-[#8CA29D] text-white p-1 rounded-md mr-2 text-sm">STEP BY STEP</span> 
                                                วิธีการเชื่อมต่ออีเมลของคุณ
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-3">
                                                        <div className="bg-[#2F584F] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</div>
                                                        <h4 className="font-medium">เข้าสู่หน้าตั้งค่าอีเมล</h4>
                                                    </div>
                                                    <p className="text-gray-600 text-sm ml-8">ไปที่เมนู "ตั้งค่า" และเลือก "การเชื่อมต่ออีเมล" จากเมนูด้านซ้าย</p>
                                                </div>
                                                
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-3">
                                                        <div className="bg-[#2F584F] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</div>
                                                        <h4 className="font-medium">เลือกผู้ให้บริการอีเมล</h4>
                                                    </div>
                                                    <p className="text-gray-600 text-sm ml-8">เลือกผู้ให้บริการอีเมลของคุณ (Gmail, Outlook, Yahoo) หรือตั้งค่าแบบกำหนดเอง</p>
                                                </div>
                                                
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-3">
                                                        <div className="bg-[#2F584F] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</div>
                                                        <h4 className="font-medium">ป้อนข้อมูลการเข้าถึง</h4>
                                                    </div>
                                                    <p className="text-gray-600 text-sm ml-8">ป้อนที่อยู่อีเมลและรหัสผ่านแอพ (ไม่ใช่รหัสผ่านปกติ) เพื่อความปลอดภัย</p>
                                                </div>
                                                
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-3">
                                                        <div className="bg-[#2F584F] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">4</div>
                                                        <h4 className="font-medium">ตั้งค่าการซิงค์</h4>
                                                    </div>
                                                    <p className="text-gray-600 text-sm ml-8">เลือกความถี่ในการตรวจสอบอีเมลและโฟลเดอร์ที่ต้องการให้ระบบตรวจสอบ</p>
                                                </div>
                                            </div>
                                        
                                        </div>
                                    </CardContent>

                                    <div className="space-y-4 px-6 pb-6">
                                        <h3 className="text-xl font-medium text-gray-800">เซิร์ฟเวอร์ IMAP ทั่วไป</h3>
                                        <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-300">
                                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">ผู้ให้บริการ</th>
                                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">เซิร์ฟเวอร์ IMAP</th>
                                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">พอร์ต</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-2 px-3 text-sm text-gray-700">Gmail</td>
                                                        <td className="py-2 px-3 text-sm font-mono text-gray-700">imap.gmail.com</td>
                                                        <td className="py-2 px-3 text-sm text-gray-700">993</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-2 px-3 text-sm text-gray-700">Outlook/Hotmail</td>
                                                        <td className="py-2 px-3 text-sm font-mono text-gray-700">outlook.office365.com</td>
                                                        <td className="py-2 px-3 text-sm text-gray-700">993</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-2 px-3 text-sm text-gray-700">Yahoo Mail</td>
                                                        <td className="py-2 px-3 text-sm font-mono text-gray-700">imap.mail.yahoo.com</td>
                                                        <td className="py-2 px-3 text-sm text-gray-700">993</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-2 px-3 text-sm text-gray-700">iCloud Mail</td>
                                                        <td className="py-2 px-3 text-sm font-mono text-gray-700">imap.mail.me.com</td>
                                                        <td className="py-2 px-3 text-sm text-gray-700">993</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="budget" className="space-y-8">
                                <Card className="bg-white border-gray-200  py-7">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-[#2F584F] flex items-center">
                                            <span className="bg-[#2F584F] text-white p-2 rounded-full mr-3"><TbMoneybag className="text-xl" /></span>
                                            การจัดการงบประมาณอัจฉริยะ
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">วางแผนและควบคุมการใช้จ่ายของคุณอย่างมีประสิทธิภาพ</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-6">
                                            <div className="flex items-start">
                                                <div className="text-amber-500 mr-3 mt-1">💰</div>
                                                <div>
                                                    <h4 className="font-medium text-amber-700">ทำไมการตั้งงบประมาณจึงสำคัญ?</h4>
                                                    <p className="text-amber-600 text-sm">การตั้งงบประมาณช่วยให้คุณควบคุมการใช้จ่าย บรรลุเป้าหมายทางการเงิน และลดความเครียดเกี่ยวกับเงิน การวางแผนที่ดีคือกุญแจสู่อิสรภาพทางการเงิน</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-medium text-gray-800 flex items-center">
                                                <span className="bg-[#8CA29D] text-white p-1 rounded-md mr-2 text-sm">SMART BUDGET</span> 
                                                สร้างงบประมาณแบบสมาร์ท
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-4">
                                                        <div className="bg-[#2F584F] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</div>
                                                        <h4 className="font-medium text-lg">เลือกประเภทงบประมาณ</h4>
                                                    </div>
                                                    <div className="ml-11">
                                                        <p className="text-gray-600 mb-3">เลือกระหว่างงบประมาณรายเดือน รายไตรมาส หรือรายปี ตามความต้องการของคุณ</p>
                                                        <div className="flex space-x-2 mb-3">
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded">รายเดือน</div>
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded">รายไตรมาส</div>
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded">รายปี</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-4">
                                                        <div className="bg-[#2F584F] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</div>
                                                        <h4 className="font-medium text-lg">กำหนดหมวดหมู่</h4>
                                                    </div>
                                                    <div className="ml-11">
                                                        <p className="text-gray-600 mb-3">แบ่งงบประมาณตามหมวดหมู่ค่าใช้จ่ายต่างๆ เพื่อการติดตามที่มีประสิทธิภาพ</p>
                                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded flex items-center"><span className="mr-1">🛍️</span> ชอปปิ้ง</div>
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded flex items-center"><span className="mr-1">🎮</span> ความบันเทิง</div>
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded flex items-center"><span className="mr-1">🏦</span> ธนาคาร</div>
                                                            <div className="bg-[#e8f0ee] text-[#2F584F] text-xs font-medium px-2 py-1 rounded flex items-center"><span className="mr-1">🚗</span> อื่นๆ</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center mb-4">
                                                    <div className="bg-[#2F584F] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</div>
                                                    <h4 className="font-medium text-lg">ติดตามและปรับแต่ง</h4>
                                                </div>
                                                <div className="ml-11">
                                                    <p className="text-gray-600 mb-4">ติดตามความคืบหน้าของงบประมาณและปรับแต่งตามความจำเป็น</p>
                                                    
                                                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                                        <h5 className="font-medium text-gray-700 mb-2">ตัวอย่าง: งบประมาณอาหารรายเดือน</h5>
                                                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                                                            <div className="bg-[#2F584F] h-4 rounded-full" style={{ width: '65%' }}></div>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>3,250 / 5,000 บาท</span>
                                                            <span>65% ใช้ไปแล้ว</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-[#e8f0ee] p-3 rounded">
                                                        <p className="text-sm text-gray-700 flex items-center">
                                                            <span className="text-amber-600 mr-2">💡</span> 
                                                            <strong className='mr-1'>เคล็ดลับ : </strong> ตั้งการแจ้งเตือนเมื่อใช้งบประมาณไปแล้ว 80% เพื่อป้องกันการใช้จ่ายเกิน
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 p-5 bg-gradient-to-r from-[#f0f7f5] to-[#e8f0ee] rounded-xl border border-[#d0e0dc]">
                                            <h3 className="text-xl font-medium text-[#2F584F] mb-4">เคล็ดลับการจัดการงบประมาณอย่างมีประสิทธิภาพ</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-start">
                                                    <div className="text-[#2F584F] mr-2">✓</div>
                                                    <p className="text-gray-700 text-sm">ใช้กฎ 50/30/20: 50% สำหรับความจำเป็น, 30% สำหรับความต้องการ, 20% สำหรับการออม</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="text-[#2F584F] mr-2">✓</div>
                                                    <p className="text-gray-700 text-sm">ทบทวนและปรับงบประมาณทุกเดือนตามสถานการณ์ที่เปลี่ยนแปลง</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="text-[#2F584F] mr-2">✓</div>
                                                    <p className="text-gray-700 text-sm">ตั้งเป้าหมายการออมที่ชัดเจนและสมจริง</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="text-[#2F584F] mr-2">✓</div>
                                                    <p className="text-gray-700 text-sm">ใช้ Savvy เพื่อติดตามค่าใช้จ่ายอัตโนมัติและรับข้อมูลเชิงลึก</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>


                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}
export default DocPage;
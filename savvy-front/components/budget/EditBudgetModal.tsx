// components/budget/EditBudgetModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getCategories, updateBudget } from '@/lib/api';
import { Category } from '@/types/category';
import { BudgetWithSpent } from '@/types/budget';
import { FaSave, FaSpinner, FaMoneyBillWave, FaCube, FaCalendarAlt, FaCoins, FaTimes } from 'react-icons/fa';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budget: BudgetWithSpent;
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  budget
}) => {
  const [formData, setFormData] = useState({
    category_id: budget.category_id.toString(),
    amount: budget.amount.toString(),
    month: budget.month.toString(),
    year: budget.year.toString()
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลหมวดหมู่เมื่อเปิด Modal
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // อัพเดทข้อมูลฟอร์มเมื่อ budget props เปลี่ยน
  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id.toString(),
        amount: budget.amount.toString(),
        month: budget.month.toString(),
        year: budget.year.toString()
      });
    }
  }, [budget]);

  // จัดการเมื่อมีการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // จัดการการกดปุ่มบันทึก
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ตรวจสอบความถูกต้องของข้อมูล
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      }

      const updatedBudget = {
        category_id: parseInt(formData.category_id),
        amount: amount,
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      };

      // เรียกใช้ API เพื่ออัพเดทงบประมาณ
      await updateBudget(budget.id, updatedBudget);
      
      // แสดงข้อความแจ้งเตือน (ใช้ alert แทน toast)
      alert('แก้ไขงบประมาณสำเร็จ');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating budget:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพเดทงบประมาณ');
    } finally {
      setLoading(false);
    }
  };

  // ชื่อเดือนภาษาไทย
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // ข้อมูลปีที่เลือกได้
  const years = [2023, 2024, 2025, 2026, 2027, 2028];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-md">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#2F584F] to-[#4a6f68] text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaMoneyBillWave className="mr-2" />
            <h2 className="text-xl font-semibold">แก้ไขงบประมาณ</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                <FaCube className="mr-1 text-[#2F584F]" /> หมวดหมู่
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] focus:border-[#2F584F]"
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                <FaCoins className="mr-1 text-[#2F584F]" /> งบประมาณ (บาท)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] focus:border-[#2F584F]"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaCalendarAlt className="mr-1 text-[#2F584F]" /> เดือน
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] focus:border-[#2F584F]"
                  required
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={(index + 1).toString()}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaCalendarAlt className="mr-1 text-[#2F584F]" /> ปี
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F] focus:border-[#2F584F]"
                  required
                >
                  {years.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#2F584F] text-white rounded-md hover:bg-[#3b6a60] focus:outline-none flex items-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    บันทึก
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBudgetModal;
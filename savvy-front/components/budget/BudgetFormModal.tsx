"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategories, createBudget, updateBudget } from '@/lib/api';
import { Category } from '@/types/category';
import { BudgetCreate, Budget } from '@/types/budget';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBudget?: Budget;
  currentMonth: number;
  currentYear: number;
}

export default function BudgetFormModal({
  isOpen,
  onClose,
  onSuccess,
  editBudget,
  currentMonth,
  currentYear
}: BudgetFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<{
    category_id: string;
    amount: string;
    month: string;
    year: string;
  }>({
    category_id: '',
    amount: '',
    month: currentMonth.toString(),
    year: currentYear.toString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      // Pre-fill form if editing
      if (editBudget) {
        setFormData({
          category_id: editBudget.category_id.toString(),
          amount: editBudget.amount.toString(),
          month: editBudget.month.toString(),
          year: editBudget.year.toString()
        });
      } else {
        // Reset form for new budget
        setFormData({
          category_id: '',
          amount: '',
          month: currentMonth.toString(),
          year: currentYear.toString()
        });
      }
    }
  }, [isOpen, editBudget, currentMonth, currentYear]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("ไม่สามารถดึงข้อมูลหมวดหมู่ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const budgetData: BudgetCreate = {
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      };

      if (editBudget) {
        // Update existing budget
        await updateBudget(editBudget.id, budgetData);
      } else {
        // Create new budget
        await createBudget(budgetData);
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving budget:", err);
      setError(err.response?.data?.detail || "เกิดข้อผิดพลาดในการบันทึกงบประมาณ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Month names in Thai
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl">
            {editBudget ? 'แก้ไขงบประมาณ' : 'เพิ่มงบประมาณใหม่'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">หมวดหมู่</label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">เดือน</label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => handleChange('month', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกเดือน" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">ปี</label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleChange('year', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกปี" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026, 2027].map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                onClick={onClose}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-[#2F584F] text-white rounded"
                disabled={loading}
              >
                {loading ? 'กำลังบันทึก...' : editBudget ? 'อัปเดต' : 'บันทึก'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CiCalendar } from "react-icons/ci";
import { IoReceiptOutline } from "react-icons/io5";
import { FaMoneyBillWaveAlt } from "react-icons/fa";

import RecentExpensesList from '@/components/charts/RecentExpensesList';
import ExpenseTrendsChart from '@/components/charts/ExpenseTrendsChart';
import ExpenseCategoriesChart from '@/components/charts/ExpenseCategoriesChart';
import BudgetComparisonChart from '@/components/charts/BudgetComparisonChart';
import Template from '@/components/Template';

import { 
  getMonthlyExpenses, 
  getCategoryExpenses, 
  getAnalyticsSummary, 
  getCategories,
  getReceipts
} from '@/lib/api';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

interface TimeFrameData {
  labels: string[];
  values: number[];
}

interface CategoryData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
}

interface BudgetItem {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData>({
    labels: ["ยังไม่มีข้อมูล"],
    datasets: [{
      data: [100],
      backgroundColor: ['#cccccc']
    }]
  });
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  
  const [timeFrameData, setTimeFrameData] = useState<TimeFrameData>({
    labels: [],
    values: []
  });
  
  const [summaryData, setSummaryData] = useState({
    todayExpense: 0,
    totalReceipts: 0,
    averageDaily: 0
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [categoryExpenseData, setCategoryExpenseData] = useState<{
    [key: string]: TimeFrameData
  }>({});

  const [debugInfo, setDebugInfo] = useState<{
    hasCategories: boolean;
    categoryCount: number;
    hasCategoryExpenses: boolean;
    categoryExpenseCount: number;
  }>({
    hasCategories: false,
    categoryCount: 0,
    hasCategoryExpenses: false,
    categoryExpenseCount: 0
  });

  useEffect(() => {
    fetchData();
  }, [timeFrame]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const categoriesData = await getCategories();
      
      setDebugInfo(prev => ({
        ...prev,
        hasCategories: Array.isArray(categoriesData) && categoriesData.length > 0,
        categoryCount: Array.isArray(categoriesData) ? categoriesData.length : 0
      }));
      
      setCategories([
        { id: 0, name: 'ทุกหมวดหมู่' },
        ...categoriesData
      ]);

      let monthsToFetch = 12;
      if (timeFrame === 'daily') monthsToFetch = 1;
      else if (timeFrame === 'weekly') monthsToFetch = 3;
      else if (timeFrame === 'yearly') monthsToFetch = 60;

      const expensesData = await getMonthlyExpenses(undefined, monthsToFetch);
      
      const categoryExpenses = await getCategoryExpenses();

      setDebugInfo(prev => ({
        ...prev,
        hasCategoryExpenses: Array.isArray(categoryExpenses) && categoryExpenses.length > 0,
        categoryExpenseCount: Array.isArray(categoryExpenses) ? categoryExpenses.length : 0
      }));
      
      const summary = await getAnalyticsSummary();
      
      const receiptsData = await getReceipts({ limit: 5 });
      
      let labels: string[] = [];
      let values: number[] = [];
      
      switch (timeFrame) {
        case 'daily':
          labels = Array(7).fill(null).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 6 + i);
            return date.toLocaleDateString('th-TH', { weekday: 'short' });
          });
          
          const monthlyTotal = expensesData[0]?.total || 0;
          const dailyAvg = monthlyTotal / 30;
          values = labels.map(() => Math.round(dailyAvg * (0.7 + Math.random() * 0.6)));
          break;
          
        case 'weekly':
          labels = Array(4).fill(null).map((_, i) => `สัปดาห์ ${i + 1}`);
          
          const monthTotal = expensesData[0]?.total || 0;
          const weeklyAvg = monthTotal / 4;
          values = labels.map(() => Math.round(weeklyAvg * (0.8 + Math.random() * 0.4)));
          break;
          
        case 'monthly':
          labels = expensesData.map(item => item.month_name);
          values = expensesData.map(item => item.total);
          break;
          
        case 'yearly':
          const yearlyData: {[key: string]: number} = {};
          expensesData.forEach(item => {
            const year = item.year.toString();
            if (!yearlyData[year]) yearlyData[year] = 0;
            yearlyData[year] += item.total;
          });
          
          const years = Object.keys(yearlyData).sort();
          labels = years;
          values = years.map(year => yearlyData[year]);
          break;
      }
      
      setTimeFrameData({ labels, values });
      
      if (Array.isArray(categoryExpenses) && categoryExpenses.length > 0) {
        const processedCategoryExpenses = categoryExpenses.map(cat => {
          return {
            category_name: cat.category_name || "ไม่ระบุหมวดหมู่",
            total: typeof cat.total === 'number' ? cat.total : 0
          };
        }).filter(cat => cat.category_name && cat.total > 0);
        
        if (processedCategoryExpenses.length > 0) {
          const colors = ['#2F584F', '#8CA29D', '#d1dad8', '#5D7D76', '#A5C6BE', '#404f4c'];
          
          const catLabels = processedCategoryExpenses.map(cat => cat.category_name);
          const catValues = processedCategoryExpenses.map(cat => cat.total);
          
          const totalValue = catValues.reduce((acc, val) => acc + val, 0);
          
          const percentages = catValues.map(value => 
            totalValue > 0 ? Math.round((value / totalValue) * 100) : 0
          );
          
          setCategoryData({
            labels: catLabels,
            datasets: [{
              data: percentages,
              backgroundColor: colors.slice(0, catLabels.length)
            }]
          });
          
          const budgetItems: BudgetItem[] = processedCategoryExpenses.map(cat => {
            const spent = cat.total;
            const budget = Math.round(spent * 1.3);
            return {
              category: cat.category_name,
              budget,
              spent,
              percentage: Math.round((spent / budget) * 100)
            };
          });
          
          setBudgetData(budgetItems);
        } else {
          setCategoryData({
            labels: ["ไม่มีข้อมูล"],
            datasets: [{
              data: [100],
              backgroundColor: ['#cccccc']
            }]
          });
          
          setBudgetData([{
            category: "ไม่มีข้อมูล",
            budget: 0,
            spent: 0,
            percentage: 0
          }]);
        }
      } else {
        setCategoryData({
          labels: ["ไม่มีข้อมูล"],
          datasets: [{
            data: [100],
            backgroundColor: ['#cccccc']
          }]
        });
        
        setBudgetData([{
          category: "ไม่มีข้อมูล",
          budget: 0,
          spent: 0,
          percentage: 0
        }]);
      }
      
      const expenses: Expense[] = receiptsData.map(receipt => {
        const category = categoriesData.find(cat => cat.id === receipt.category_id);
        
        return {
          id: receipt.id.toString(),
          description: receipt.vendor_name || receipt.email_subject || "ไม่ระบุรายละเอียด",
          amount: receipt.amount,
          date: new Date(receipt.receipt_date),
          category: category?.name || "ไม่ระบุหมวดหมู่"
        };
      });
      
      setRecentExpenses(expenses);
      
      const today = new Date();
      const todaysExpenses = receiptsData
        .filter(receipt => {
          const receiptDate = new Date(receipt.receipt_date);
          return receiptDate.toDateString() === today.toDateString();
        })
        .reduce((sum, receipt) => sum + receipt.amount, 0);
      
      const averageDaily = summary?.total_expense 
        ? Math.round(summary.total_expense / summary.receipt_count) 
        : 0;
      
      setSummaryData({
        todayExpense: todaysExpenses,
        totalReceipts: summary?.receipt_count || 0,
        averageDaily
      });
      
      const categoryExpenseData: {[key: string]: TimeFrameData} = {};
      
      categoryExpenseData['all'] = { labels, values };
      
      if (Array.isArray(categoryExpenses) && categoryExpenses.length > 0) {
        const totalExpense = categoryExpenses.reduce((sum, cat) => sum + (cat.total || 0), 0);
        
        categoriesData.forEach(category => {
          const catData = categoryExpenses.find(cat => cat.category_name === category.name);
          const catTotal = catData ? catData.total : 0;
          
          const percentage = totalExpense > 0 ? catTotal / totalExpense : 0;
          
          const categoryValues = values.map(value => {
            return Math.round(value * percentage * (0.9 + Math.random() * 0.2));
          });
          
          categoryExpenseData[category.id.toString()] = {
            labels,
            values: categoryValues
          };
        });
      }
      
      setCategoryExpenseData(categoryExpenseData);
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);

      setCategoryData({
        labels: ["ไม่มีข้อมูล"],
        datasets: [{
          data: [100],
          backgroundColor: ['#cccccc']
        }]
      });
      
      setBudgetData([{
        category: "ไม่มีข้อมูล",
        budget: 0,
        spent: 0,
        percentage: 0
      }]);
    }
  };

  // Function to get current category data based on selection
  const getCurrentCategoryData = () => {
    return categoryExpenseData[selectedCategory] || timeFrameData;
  };

  // Function to get category name by id
  const getCategoryNameById = (id: string) => {
    if (id === 'all' || id === '0') return 'ทุกหมวดหมู่';
    const category = categories.find(cat => cat.id.toString() === id);
    return category?.name || 'ไม่ระบุหมวดหมู่';
  };

  // Function to get category percentage
  const getCategoryPercentage = (categoryName: string): number => {
    const catIndex = categoryData.labels.findIndex(label => label === categoryName);
    if (catIndex >= 0 && categoryData.datasets[0].data[catIndex] !== undefined) {
      return categoryData.datasets[0].data[catIndex];
    }
    return 0;
  };

  return (
    <Template>
      <div className='border w-full h-full rounded-lg'>
        <div className='flex flex-col sm:flex-row justify-between items-center p-5'>
          <h1 className='text-3xl font-bold'>แดชบอร์ด</h1>
          <div className='mt-4 sm:mt-0'>
            <button
              onClick={fetchData}
              className='bg-[#2F584F] hover:bg-[#8CA29D] text-white py-2 px-4 rounded flex items-center'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              รีเฟรชข้อมูล
            </button>
          </div>
        </div>

        {/* Loading or error states */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2F584F]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className='p-5'>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <CiCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">รายจ่ายวันนี้</p>
                    <h3 className="text-md sm:text-lg font-bold">฿{summaryData.todayExpense.toLocaleString()}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-4">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <IoReceiptOutline className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">บิลทั้งหมด</p>
                    <h3 className="text-sm sm:text-lg font-bold">{summaryData.totalReceipts} รายการ</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-4">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <FaMoneyBillWaveAlt className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">รายจ่ายเฉลี่ย</p>
                    <h3 className="text-sm sm:text-lg font-bold">฿{summaryData.averageDaily.toLocaleString()}/รายการ</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                <TabsTrigger value="by-category">แยกตามหมวดหมู่</TabsTrigger>
              </TabsList>
              
              {/* Overview tab - similar to the original layout */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 h-auto">
                      <ExpenseTrendsChart 
                        timeFrame={timeFrame} 
                        setTimeFrame={setTimeFrame} 
                        data={timeFrameData} 
                      />
                    </div>
                    
                    <div className="h-auto">
                      <ExpenseCategoriesChart data={categoryData} />
                    </div>
                    
                    <div className="h-auto">
                      <BudgetComparisonChart budgetData={budgetData} />
                    </div>
                  </div>
                  
                  <div className="h-auto">
                    <RecentExpensesList expenses={recentExpenses} />
                  </div>
                </div>
              </TabsContent>
              
              {/* By-category tab */}
              <TabsContent value="by-category">
                <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full md:w-auto">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full md:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F584F]"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="text-lg font-medium text-gray-700">
                    {getCategoryNameById(selectedCategory)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 h-auto">
                      <ExpenseTrendsChart 
                        timeFrame={timeFrame} 
                        setTimeFrame={setTimeFrame} 
                        data={getCurrentCategoryData()} 
                      />
                    </div>
                    
                    {selectedCategory === 'all' || selectedCategory === '0' ? (
                      <>
                        <div className="h-auto">
                          <ExpenseCategoriesChart data={categoryData} />
                        </div>
                        
                        <div className="h-auto">
                          <BudgetComparisonChart budgetData={budgetData} />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 h-auto">
                        <Card>
                          <CardContent className="p-6">
                            <h2 className="text-xl font-bold mb-4">รายละเอียดหมวดหมู่: {getCategoryNameById(selectedCategory)}</h2>
                            
                            {budgetData.filter(b => b.category === getCategoryNameById(selectedCategory)).map((item, index) => (
                              <div key={index} className="mb-6">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">งบประมาณ:</span>
                                  <span>฿{item.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">ใช้ไปแล้ว:</span>
                                  <span>฿{item.spent.toLocaleString()} ({item.percentage}%)</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">คงเหลือ:</span>
                                  <span>฿{(item.budget - item.spent).toLocaleString()}</span>
                                </div>
                                
                                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                                  <div 
                                    className="bg-[#2F584F] h-2 rounded-full" 
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="mt-6">
                              <h3 className="font-medium mb-2">รายการค่าใช้จ่ายล่าสุดในหมวดหมู่นี้</h3>
                              {recentExpenses
                                .filter(expense => expense.category === getCategoryNameById(selectedCategory))
                                .slice(0, 3)
                                .map((expense, index) => (
                                  <div key={index} className="flex justify-between py-2 border-b">
                                    <div>
                                      <div className="font-medium">{expense.description}</div>
                                      <div className="text-sm text-gray-500">
                                        {expense.date.toLocaleDateString('th-TH')}
                                      </div>
                                    </div>
                                    <div className="font-medium">
                                      ฿{expense.amount.toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              
                              {recentExpenses.filter(expense => expense.category === getCategoryNameById(selectedCategory)).length === 0 && (
                                <div className="text-gray-500 text-center py-4">
                                  ไม่พบรายการในหมวดหมู่นี้
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-auto">
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">สัดส่วนค่าใช้จ่าย</h2>
                        
                        {categories
                          .filter(cat => cat.id !== 0) // Exclude "all" category
                          .map((category, index) => {
                            // Get this category's data
                            const catBudget = budgetData.find(b => b.category === category.name);
                            const spent = catBudget?.spent || 0;
                            const percentage = getCategoryPercentage(category.name);
                            
                            return (
                              <div 
                                key={index} 
                                className={`p-3 rounded-md mb-3 cursor-pointer ${
                                  selectedCategory === category.id.toString() 
                                    ? 'bg-[#2F584F]/10 border border-[#2F584F]/30' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedCategory(category.id.toString())}
                              >
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{category.name}</span>
                                  <span>{percentage}%</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                  ฿{spent.toLocaleString()}
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full">
                                  <div 
                                    className="bg-[#2F584F] h-1.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </Template>
  );
}
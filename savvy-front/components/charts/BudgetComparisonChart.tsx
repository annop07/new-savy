// เปรียบเทียบงบประมาณที่ตั้งไว้กับค่าใช้จ่ายจริง
"use client";
import React from 'react';
import { ChartWrapper } from './ChartWrapper';

// Budget progress bar component
interface BudgetBarProps {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

const BudgetBar = ({ category, budget, spent, percentage }: BudgetBarProps) => {
  const getColor = () => {
    if (percentage < 70) return '#8CA29D';
    if (percentage < 90) return '#5D7D76';
    return '#2F584F';
  };
  
  return (
    <div className="flex flex-col space-y-1 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between text-xs">
        <span className="font-medium truncate">{category}</span>
        <span className="text-muted-foreground text-[10px] sm:text-xs">{spent.toLocaleString()} / {budget.toLocaleString()} บาท</span>
      </div>
      <div className="h-2 sm:h-4 rounded-md bg-muted overflow-hidden relative">
        <div 
          className="h-full transition-all duration-300 ease-in-out rounded-md"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: getColor() 
          }}
        />
      </div>
      <div className="flex justify-end text-[10px] sm:text-xs text-muted-foreground">
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

interface BudgetComparisonChartProps {
  budgetData: Array<{
    category: string;
    budget: number;
    spent: number;
    percentage: number;
  }>;
}

const BudgetComparisonChart = ({ budgetData }: BudgetComparisonChartProps) => {
  return (
    <ChartWrapper 
      title="เปรียบเทียบงบประมาณ" 
      description="งบประมาณที่กำหนดและใช้ไปแล้ว"
      className="col-span-1 md:col-span-2 lg:col-span-2 h-full"
    >
      <div className="flex flex-col space-y-2 h-full justify-center">
        {budgetData.map((item, index) => (
          <BudgetBar 
            key={`budget-${index}`}
            category={item.category}
            budget={item.budget}
            spent={item.spent}
            percentage={item.percentage}
          />
        ))}
      </div>
    </ChartWrapper>
  );
};

export default BudgetComparisonChart;
export { BudgetBar };
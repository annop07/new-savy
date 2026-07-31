"use client";
import React from 'react';

interface BudgetBarCustomProps {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

const BudgetBarCustom = ({ category, budget, spent, percentage }: BudgetBarCustomProps) => {
    const getColor = () => {
        if (percentage < 70) return '#8CA29D';
        if (percentage < 90) return '#5D7D76';
        return '#2F584F';
      };
  
  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <span className="font-medium text-base truncate">{category}</span>
        <span className="text-muted-foreground text-sm">{spent.toLocaleString()} / {budget.toLocaleString()} บาท</span>
      </div>
      <div className="h-4 sm:h-5 rounded-md bg-muted overflow-hidden relative">
        <div 
          className="h-full transition-all duration-300 ease-in-out rounded-md"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: getColor() 
          }}
        />
      </div>
      <div className="flex justify-end text-sm text-muted-foreground">
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

export default BudgetBarCustom;
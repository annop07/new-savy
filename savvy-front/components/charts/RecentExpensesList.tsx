"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface ExpenseItemProps {
  description: string;
  amount: number;
  date: Date;
  category: string;
}

const ExpenseItem = ({ description, amount, date, category }: ExpenseItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 px-2">
      <div className="flex flex-col">
        <span className="font-medium text-sm">{description}</span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{category}</span>
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
      <span className="font-semibold text-right text-md">{amount.toLocaleString()} บาท</span>
    </div>
  );
};

interface RecentExpensesListProps {
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
    category: string;
  }>;
}

const RecentExpensesList = ({ expenses }: RecentExpensesListProps) => {
  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1 overflow-hidden h-full">
      <CardHeader className="py-2">
        <CardTitle className="text-md font-semibold">รายจ่ายล่าสุด</CardTitle>
        <CardDescription className="text-sm">5 รายการล่าสุดของคุณ</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-col">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              description={expense.description}
              amount={expense.amount}
              date={expense.date}
              category={expense.category}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentExpensesList;
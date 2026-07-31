// แสดงการกระจายค่าใช้จ่ายตามหมวดหมู่
"use client";
import React from 'react';
import { ChartWrapper } from './ChartWrapper';

// Custom pie chart component using divs
interface PieChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[]
    }>
  };
}

const PieChart = ({ data }: PieChartProps) => {
  // คำนวณผลรวมทั้งหมดเพื่อใช้คำนวณเปอร์เซ็นต์
  const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);

  // ถ้าไม่มีข้อมูล หรือผลรวมเป็น 0 ให้แสดงข้อความแจ้งเตือน
  if (data.labels.length === 0 || total === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-4">
        <div className="text-gray-400">ยังไม่มีข้อมูลค่าใช้จ่ายในขณะนี้</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row h-full">
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center pb-4 sm:pb-0">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40">
          {data.datasets[0].data.map((value, index) => {
            const percentage = (value / total) * 100;
            let cumulativePercentage = 0;

            for (let i = 0; i < index; i++) {
              cumulativePercentage += (data.datasets[0].data[i] / total) * 100;
            }

            return (
              <div
                key={index}
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `conic-gradient(transparent ${cumulativePercentage}%, ${data.datasets[0].backgroundColor[index]} ${cumulativePercentage}%, ${data.datasets[0].backgroundColor[index]} ${cumulativePercentage + percentage}%, transparent ${cumulativePercentage + percentage}%)`,
                  borderRadius: '50%'
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="w-full sm:w-1/2 flex flex-col justify-center">
        {data.labels.map((label, index) => {
          const percentage = Math.round((data.datasets[0].data[index] / total) * 100);
          return (
            <div key={index} className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
                style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
              />
              <span className="text-xs sm:text-sm truncate">{label}</span>
              <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ExpenseCategoriesChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[]
    }>;
  };
}

const ExpenseCategoriesChart = ({ data }: ExpenseCategoriesChartProps) => {
  return (
    <ChartWrapper
      title="หมวดหมู่ค่าใช้จ่าย"
      description="การกระจายค่าใช้จ่ายตามหมวดหมู่"
      className="h-full"
    >
      <PieChart data={data} />
    </ChartWrapper>
  );
};

export default ExpenseCategoriesChart;
export { PieChart };
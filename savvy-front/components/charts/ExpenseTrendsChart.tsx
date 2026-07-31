// แสดงแนวโน้มค่าใช้จ่ายตามช่วงเวลา
"use client";
import React, { useState } from "react";
import { ChartWrapper } from "@/components/charts/ChartWrapper";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom line chart component using divs
interface SimpleLineChartProps {
  data: { labels: string[]; values: number[] };
}

const SimpleLineChart = ({ data }: SimpleLineChartProps) => {
  const maxValue = Math.max(...data.values);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-end">
        {data.labels.map((label, labelIndex) => {
          const value = data.values[labelIndex];
          const height = (value / maxValue) * 100;

          return (
            <div
              key={labelIndex}
              className="flex-1 flex flex-col h-full justify-end"
            >
              <div className="flex flex-col h-[calc(100%-24px)] justify-end relative">
                <div
                  className="absolute w-full flex justify-center"
                  style={{ height: `${height}%`, bottom: 0 }}
                >
                  <div
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full"
                    style={{ backgroundColor: "#2F584F" }}
                  />
                  {labelIndex > 0 && (
                    <div
                      className="absolute right-1/2 w-full h-0.5"
                      style={{
                        backgroundColor: "#2F584F",
                        transform: `rotate(${calculateAngle(
                          data.values[labelIndex - 1],
                          data.values[labelIndex],
                          maxValue
                        )}deg)`,
                        transformOrigin: "left center",
                        width: "100%",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-center mt-1 sm:mt-2 text-muted-foreground truncate">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to calculate angle for line segments
const calculateAngle = (
  prevValue: number,
  currentValue: number,
  maxValue: number
) => {
  const prevHeight = (prevValue / maxValue) * 100;
  const currentHeight = (currentValue / maxValue) * 100;
  const heightDiff = currentHeight - prevHeight;
  return Math.atan2(heightDiff, 100) * (180 / Math.PI);
};

// Transform data for Recharts
const transformDataForRecharts = (labels: string[], values: number[]) => {
  return labels.map((label, index) => ({
    month: label,
    amount: values[index],
  }));
};

interface ExpenseTrendsChartProps {
  timeFrame: "daily" | "weekly" | "monthly" | "yearly";
  setTimeFrame: (timeFrame: "daily" | "weekly" | "monthly" | "yearly") => void;
  data: { labels: string[]; values: number[] };
}

const ExpenseTrendsChart = ({
  timeFrame,
  setTimeFrame,
  data,
}: ExpenseTrendsChartProps) => {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Transform data for Recharts
  const rechartsData = transformDataForRecharts(data.labels, data.values);

  // Colors for the chart
  const colors = ["#2F584F"];

  // Function to handle timeframe change
  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as "daily" | "weekly" | "monthly" | "yearly");
  };

  // Function to handle chart type change
  const handleChartTypeChange = (value: string) => {
    setChartType(value as "bar" | "line");
  };

  // Map Thai labels to values
  const timeFrameOptions = [
    { value: "daily", label: "รายวัน" },
    { value: "weekly", label: "รายสัปดาห์" },
    { value: "monthly", label: "รายเดือน" },
    { value: "yearly", label: "รายปี" },
  ];

  const chartTypeOptions = [
    { value: "bar", label: "กราฟแท่ง" },
    { value: "line", label: "กราฟเส้น" },
  ];

  return (
    <ChartWrapper
      title="สรุปรายจ่ายทั้งหมด"
      description="แนวโน้มรายจ่ายตามหมวดหมู่รายเดือน"
      className="col-span-1 md:col-span-1 lg:col-span-2 h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {timeFrameOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="เลือกประเภทกราฟ" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {chartTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1">
          {chartType === "bar" ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart
                data={rechartsData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `฿${Number(value).toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="amount" name="จำนวนเงิน" fill={colors[0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <RechartsLineChart
                data={rechartsData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `฿${Number(value).toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="จำนวนเงิน"
                  stroke={colors[0]}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </ChartWrapper>
  );
};

export default ExpenseTrendsChart;
export { SimpleLineChart };

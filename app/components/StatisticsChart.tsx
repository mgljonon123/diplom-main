'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface CareerStats {
  title: string;
  matchScore: number;
  salaryRange: {
    entry: number;
    mid: number;
    senior: number;
  };
  skills: string[];
}

interface StatisticsChartProps {
  careers: CareerStats[];
}

interface ChartData {
  matchScores: {
    labels: string[];
    data: number[];
  };
  salaryTrends: {
    labels: string[];
    entry: number[];
    mid: number[];
    senior: number[];
  };
  skillDistribution: Record<string, number>;
}

export default function StatisticsChart({ careers }: StatisticsChartProps) {
  const [chartData, setChartData] = useState<ChartData>({
    matchScores: {
      labels: [],
      data: [],
    },
    salaryTrends: {
      labels: [],
      entry: [],
      mid: [],
      senior: [],
    },
    skillDistribution: {},
  });

  useEffect(() => {
    if (careers.length > 0) {
      // Process data for charts
      const processedData = careers.reduce<ChartData>(
        (acc, career) => {
          // Match scores data
          acc.matchScores.labels.push(career.title);
          acc.matchScores.data.push(career.matchScore);

          // Salary trends data
          acc.salaryTrends.labels.push(career.title);
          acc.salaryTrends.entry.push(career.salaryRange.entry);
          acc.salaryTrends.mid.push(career.salaryRange.mid);
          acc.salaryTrends.senior.push(career.salaryRange.senior);

          // Skill distribution
          career.skills.forEach((skill) => {
            acc.skillDistribution[skill] = (acc.skillDistribution[skill] || 0) + 1;
          });

          return acc;
        },
        {
          matchScores: { labels: [], data: [] },
          salaryTrends: { labels: [], entry: [], mid: [], senior: [] },
          skillDistribution: {},
        }
      );

      setChartData(processedData);
    }
  }, [careers]);

  const matchScoreChartData = {
    labels: chartData.matchScores.labels,
    datasets: [
      {
        label: 'Match Score',
        data: chartData.matchScores.data,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const salaryTrendChartData = {
    labels: chartData.salaryTrends.labels,
    datasets: [
      {
        label: 'Entry Level',
        data: chartData.salaryTrends.entry,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
      {
        label: 'Mid Career',
        data: chartData.salaryTrends.mid,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Senior Level',
        data: chartData.salaryTrends.senior,
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
    ],
  };

  const skillDistributionChartData = {
    labels: Object.keys(chartData.skillDistribution),
    datasets: [
      {
        data: Object.values(chartData.skillDistribution),
        backgroundColor: [
          'rgba(99, 102, 241, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(59, 130, 246, 0.5)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Career Match Analysis',
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Career Match Scores</h3>
        <Bar data={matchScoreChartData} options={chartOptions} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Salary Trends</h3>
        <Line data={salaryTrendChartData} options={chartOptions} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Required Skills Distribution</h3>
        <div className="max-w-md mx-auto">
          <Pie data={skillDistributionChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 
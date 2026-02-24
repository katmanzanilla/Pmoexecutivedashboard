import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Task, getDateOffset } from '../data/mockData';

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  // Calculate min and max dates for scaling
  const minOffset = Math.min(...tasks.map(t => getDateOffset(t.startDate)));
  const maxOffset = Math.max(...tasks.map(t => getDateOffset(t.endDate)));
  const totalDays = maxOffset - minOffset;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#059669]';
      case 'On Track':
        return 'bg-[#1E3A8A]';
      case 'At Risk':
        return 'bg-[#F59E0B]';
      case 'Delayed':
        return 'bg-[#DC2626]';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const minDate = new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime())));
  const maxDate = new Date(Math.max(...tasks.map(t => new Date(t.endDate).getTime())));

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <Card className="mb-6 shadow-[0px_8px_24px_rgba(0,0,0,0.05)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Timeline (Gantt View)</span>
          <span className="text-sm font-normal text-[#6B7280]">
            {formatDateRange(minDate, maxDate)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const startOffset = getDateOffset(task.startDate) - minOffset;
            const leftPercent = (startOffset / totalDays) * 100;
            const widthPercent = (task.duration / totalDays) * 100;

            return (
              <div key={task.id} className="relative">
                <div className="flex items-center mb-1">
                  <div className="w-64 text-sm font-medium text-[#111827] truncate">
                    {task.name}
                  </div>
                  <div className="flex-1 ml-4 h-10 bg-gray-100 rounded relative">
                    <div
                      className={`absolute h-full rounded flex items-center px-3 ${getStatusColor(task.status)} transition-all`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`
                      }}
                    >
                      <div className="flex items-center justify-between w-full text-white text-xs font-medium">
                        <span className="truncate">{task.project}</span>
                        <span className="ml-2 whitespace-nowrap">{task.completion}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-32 ml-4 text-xs text-[#6B7280] text-right">
                    {formatDate(task.startDate)} - {formatDate(task.endDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#059669] rounded"></div>
            <span className="text-sm text-[#6B7280]">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1E3A8A] rounded"></div>
            <span className="text-sm text-[#6B7280]">On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F59E0B] rounded"></div>
            <span className="text-sm text-[#6B7280]">At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#DC2626] rounded"></div>
            <span className="text-sm text-[#6B7280]">Delayed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Task, getDateOffset } from '../data/mockData';

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  const groupedProjects = Object.values(
    tasks.reduce<Record<string, {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      completionWeighted: number;
      totalDuration: number;
      statuses: Task['status'][];
    }>>((acc, task) => {
      if (!acc[task.project]) {
        acc[task.project] = {
          id: task.id,
          name: task.project,
          startDate: task.startDate,
          endDate: task.endDate,
          completionWeighted: task.completion * task.duration,
          totalDuration: task.duration,
          statuses: [task.status]
        };
        return acc;
      }

      const existing = acc[task.project];
      if (new Date(task.startDate) < new Date(existing.startDate)) {
        existing.startDate = task.startDate;
      }
      if (new Date(task.endDate) > new Date(existing.endDate)) {
        existing.endDate = task.endDate;
      }

      existing.completionWeighted += task.completion * task.duration;
      existing.totalDuration += task.duration;
      existing.statuses.push(task.status);

      return acc;
    }, {})
  ).map((project) => {
    const completion = Math.round(project.completionWeighted / project.totalDuration);
    const status: Task['status'] = project.statuses.includes('Delayed')
      ? 'Delayed'
      : project.statuses.includes('At Risk')
        ? 'At Risk'
        : project.statuses.every((s) => s === 'Completed')
          ? 'Completed'
          : 'On Track';

    return {
      ...project,
      completion,
      status,
      duration: Math.max(1, Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    };
  });

  // Calculate min and max dates for scaling
  const minOffset = Math.min(...tasks.map(t => getDateOffset(t.startDate)));
  const maxOffset = Math.max(...tasks.map(t => getDateOffset(t.endDate)));
  const minOffset = Math.min(...groupedProjects.map(p => getDateOffset(p.startDate)));
  const maxOffset = Math.max(...groupedProjects.map(p => getDateOffset(p.endDate)));
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
  const minDate = new Date(Math.min(...groupedProjects.map(p => new Date(p.startDate).getTime())));
  const maxDate = new Date(Math.max(...groupedProjects.map(p => new Date(p.endDate).getTime())));

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
          {groupedProjects.map((project) => {
            const startOffset = getDateOffset(project.startDate) - minOffset;
            const leftPercent = totalDays > 0 ? (startOffset / totalDays) * 100 : 0;
            const widthPercent = totalDays > 0 ? (project.duration / totalDays) * 100 : 100;

            return (
              <div key={task.id} className="relative">
              <div key={project.name} className="relative">
                <div className="flex items-center mb-1">
                  <div className="w-64 text-sm font-medium text-[#111827] truncate">
                    {task.name}
                    {project.name}
                  </div>
                  <div className="flex-1 ml-4 h-10 bg-gray-100 rounded relative">
                    <div
                      className={`absolute h-full rounded flex items-center px-3 ${getStatusColor(task.status)} transition-all`}
                      className={`absolute h-full rounded flex items-center px-3 ${getStatusColor(project.status)} transition-all`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`
                      }}
                    >
                      <div className="flex items-center justify-between w-full text-white text-xs font-medium">
                        <span className="truncate">{task.project}</span>
                        <span className="ml-2 whitespace-nowrap">{task.completion}%</span>
                        <span className="truncate">{project.name}</span>
                        <span className="ml-2 whitespace-nowrap">{project.completion}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-32 ml-4 text-xs text-[#6B7280] text-right">
                    {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
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

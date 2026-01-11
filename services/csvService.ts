
import { ScheduleEntry } from "../types";

export const downloadCSV = (entries: ScheduleEntry[]) => {
  const headers = "Title,Date,StartTime,EndTime,Duration,Priority\n";
  const rows = entries.map(e => `${e.title},${e.date},${e.startTime},${e.endTime},${e.estimatedDuration},${e.priority}`).join("\n");
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "my_schedule.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): Partial<ScheduleEntry>[] => {
  const lines = csvText.split('\n');
  const results: Partial<ScheduleEntry>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length >= 6) {
      results.push({
        title: cols[0],
        date: cols[1],
        startTime: cols[2],
        endTime: cols[3],
        estimatedDuration: parseInt(cols[4]),
        priority: cols[5] as any
      });
    }
  }
  return results;
};

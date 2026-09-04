export interface TaskDetail {
  _id: string;
  taskId: string;
  taskName: string;
  subject: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  date: string;
  notes?: string;
  description?: string;
  whatLearned?: string;
  problemsFaced?: string;
  timeSpent?: string;
  isCustom?: boolean;
}

export type Task = TaskDetail;

export interface TemplateTask {
  taskId: string;
  taskName: string;
  subject: string;
  startTime: string;
  endTime: string;
}

export interface TemplateDay {
  _id: string;
  day: string;
  tasks: TemplateTask[];
}

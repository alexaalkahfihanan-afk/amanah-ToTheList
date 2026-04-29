export type Priority = "rendah" | "sedang" | "tinggi";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
}

export const INITIAL_CATEGORIES = ["kerja", "pribadi", "belanja", "kesehatan", "lainnya"];
export const PRIORITIES: Priority[] = ["rendah", "sedang", "tinggi"];

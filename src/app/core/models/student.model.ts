export interface Student {
  id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  class_id?: number | null;
  user_id?: number | null;
  class_name?: string | null;
  created_at?: string;
}

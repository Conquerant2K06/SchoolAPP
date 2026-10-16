export interface ReportCard {
  id?: number;
  student_id: number;
  class_id?: number | null;
  trimester: number;
  school_year: string;
  general_average?: string;
  rank?: number;
  appreciation?: string;
  generated_at?: string;
  student_first_name?: string;
  student_last_name?: string;
  class_name?: string;
}

export interface ReportCardGenerationResult {
  report_card: ReportCard;
  subject_averages: {
    subject_id: number;
    subject_name: string;
    subject_coef: number;
    avg: string;
  }[];
}

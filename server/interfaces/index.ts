/* -------------------------------
   🧑‍🏫 Teacher/Admin Interface
--------------------------------*/
export interface IAdmin extends Document {
  _id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  address?: string;
  designation?: string; // পদবী
  join_date?: Date;
  is_active: boolean;
  role: "admin" | "super_admin";
  is_blocked?: boolean;
  blockedAt?: Date;

  refresh?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpireDate?: Date | null;

  matchPassword: (pass: string) => Promise<boolean>;
  generateResetPasswordToken: (expMinutes?: number) => string;
}

/* -------------------------------
   🏫 Class Interface
--------------------------------*/
export interface IClass extends Document {
  name: string;
  teacher?: string; // উক্ত জামাতের দায়িত্বরত শিক্ষক
  description?: string;
  opening_date?: Date; // উক্ত জামাত কবে থেকে চালু করা হয়েছে।
}

/* -------------------------------
   👦 Student Interface
--------------------------------*/
export interface IStudent extends Document {
  name: string;
  roll: number;
  monthly_fee: number;
  id_card: string;
  class_id: IClass;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
  admission_date?: Date;
  date_of_birth: Date;
  gender: "male" | "female";
  is_active: boolean;
}

/* -------------------------------
   💰 Payment Interface
--------------------------------*/
export interface IPayment extends Document {
  student_id: IStudent;
  admin_id: IAdmin;
  amount: number;
  month:
    | "january"
    | "february"
    | "march"
    | "april"
    | "may"
    | "june"
    | "july"
    | "august"
    | "september"
    | "october"
    | "november"
    | "december"; // 1–12
  year: number;
  paid_at?: Date; // কখন পেমেন্ট দেওয়া হলো
}

/* -------------------------------
  Pagination Interface
--------------------------------*/
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextPage?: number;
  prevPage?: number;
}

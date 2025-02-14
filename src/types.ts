export type Profile = {
  id: string;
  role: 'admin' | 'university_staff' | 'verifier';
  universite_id?: string;
  created_at: string;
  updated_at: string;
};
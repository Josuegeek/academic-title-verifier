export type Profile = {
  id: string;
  role: 'admin' | 'university_staff' | 'verifier' | 'esu_staff';
  universite_id?: string;
  nom?:string;
  postnom?:string;
  created_at: string;
  updated_at: string;
};
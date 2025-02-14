export type Profile = {
  id: string;
  role: 'admin' | 'university_staff' | 'verifier';
  universite_id?: string;
  nom?:string;
  postnom?:string;
  created_at: string;
  updated_at: string;
};
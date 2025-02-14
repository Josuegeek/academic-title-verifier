import { supabase } from "../lib/supabase";
import { Student, StudentJointPromotion } from "../models/ModelsForUnivesity";

export async function fetchStudentsJointPromotion() {
    return await supabase
        .from('etudiant')
        .select<string, StudentJointPromotion>(
            `
      id,
      nom,
      postnom,
      prenom,
      promotion(
        id,
        libelle_promotion,
        departement(
          id,
          libelle_dept,
          faculte (
            id,
            libelle_fac
          )
        )
      )
      `
        )
        .order('nom', { ascending: true });
}

export async function fetchStudentJoinPromotionById(id: string) {
    return await supabase
        .from('etudiant')
        .select<string, Student>(
            `
      id,
      nom,
      postnom,
      prenom,
      promotion(
        id,
        libelle_promotion,
        departement(
          id,
          libelle_dept,
          faculte (
            id,
            libelle_fac
          )
        )
      )
      `
        )
        .eq('id', id)
        .single();
}

export async function fetchStudentsJointPromotionByFilter(facultyId: string, departmentId: string, promotionId: string) {
    let query = supabase
        .from('etudiant')
        .select<string, Student>(
            `
        id,
        nom,
        postnom,
        prenom,
        promotion(
            id,
            libelle_promotion,
            departement(
            id,
            libelle_dept,
            faculte (
                id,
                libelle_fac
            )
            )
        )
        `
        );

    if (facultyId) {
        query = query.eq('promotion.departement.faculte.id', facultyId);
    }

    if (departmentId) {
        query = query.eq('promotion.departement.id', departmentId);
    }

    if (promotionId) {
        query = query.eq('promotion.id', promotionId);
    }

    return await query.order('nom', { ascending: true });
}

export async function createStudent(student: Student) {
    return await supabase
        .from('etudiant')
        .insert([student]);
}

export async function updateStudent(student: Student) {
    return await supabase
        .from('etudiant')
        .update(student)
        .eq('id', student.id);
}

export async function deleteStudent(id: string) {
    return await supabase
        .from('etudiant')
        .delete()
        .eq('id', id);
}
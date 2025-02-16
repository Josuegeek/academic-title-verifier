import { supabase } from "../lib/supabase";
import { Diploma, DiplomaJointStudent, NewDiploma } from "../models/ModelsForUnivesity";

export async function fetchDiplomasJointStudent() {
    return await supabase
        .from("titre_academique")
        .select<string, DiplomaJointStudent>(
            `
            id,
            libelle_titre,
            fichier_url,
            qr_code,
            date_delivrance,
            lieu,
            etudiant (
                id,
                nom,
                postnom,
                prenom
            ),
            est_authentique
            `
        ).order('created_at', { ascending: false });
}

export async function fetchDiplomaByIdJointStudent(id: string) {
    return await supabase
        .from("titre_academique")
        .select<string, DiplomaJointStudent>(`
            id,
            libelle_titre,
            fichier_url,
            qr_code,
            date_delivrance,
            lieu,
            etudiant (
                id,
                nom,
                postnom,
                prenom
            ),
            est_authentique
        `)
        .eq("id", id)
        .single();
}

export async function addDiploma(diploma: NewDiploma) {
    return await supabase
        .from("titre_academique")
        .insert(

            {
                libelle_titre: diploma.libelle_titre,
                fichier_url: diploma.fichier_url,
                qr_code: diploma.qr_code,
                date_delivrance: diploma.date_delivrance,
                lieu: diploma.lieu,
                etudiant_id: diploma.etudiant_id,
                est_authentique: diploma.est_authentique
            }

        );
}

export async function updateDiploma(id: string, diploma: Partial<Diploma>) {
    return await supabase
        .from("titre_academique")
        .update(diploma)
        .eq("id", id);
}

export async function deleteDiploma(id: string) {
    return await supabase
        .from("titre_academique")
        .delete()
        .eq("id", id);
}
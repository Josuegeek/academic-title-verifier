import { supabase } from "../lib/supabase";
import { Faculty } from "../models/ModelsForUnivesity";

export async function fetchFaculties(){
    return await supabase
        .from("faculte")
        .select<string, Faculty>(
            `
            id,
            libelle_fac
            `
        )
}

export async function fetchFacultyById(id: string) {
    return await supabase
        .from("faculte")
        .select<string, Faculty>(`
            id,
            libelle_fac
        `)
        .eq("id", id)
        .single();
}

export async function addFaculty(faculty: Faculty) {
    return await supabase
        .from("faculte")
        .insert([faculty]);
}

export async function updateFaculty(id: string, faculty: Partial<Faculty>) {
    return await supabase
        .from("faculte")
        .update(faculty)
        .eq("id", id);
}

export async function deleteFaculty(id: string) {
    return await supabase
        .from("faculte")
        .delete()
        .eq("id", id);
}
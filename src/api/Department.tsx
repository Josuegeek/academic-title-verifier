import { supabase } from "../lib/supabase";
import { Department } from "../models/ModelsForUnivesity";

export async function fetchDepartments() {
    return await supabase
        .from("departement")
        .select<string, Department>(
            `
            id,
            libelle_dept,
            faculte_id
            `
        );
}

export async function fetchDepartmentsByFacultyId(facultyId: string) {
    return await supabase
        .from("departement")
        .select<string, Department>(`
            id,
            libelle_dept,
            faculte_id
        `)
        .eq("faculte_id", facultyId).order('libelle_dept', { ascending: true });
}

export async function fetchDepartmentById(id: string) {
    return await supabase
        .from("departement")
        .select<string, Department>(`
            id,
            libelle_dept,
            faculte_id
        `)
        .eq("id", id)
        .single();
}

export async function addDepartment(department: Department) {
    return await supabase
        .from("departement")
        .insert([department]);
}

export async function updateDepartment(id: string, department: Partial<Department>) {
    return await supabase
        .from("departement")
        .update(department)
        .eq("id", id);
}

export async function deleteDepartment(id: string) {
    return await supabase
        .from("departement")
        .delete()
        .eq("id", id);
}

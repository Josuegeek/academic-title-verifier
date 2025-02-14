import { supabase } from "../lib/supabase";
import { Promotion } from "../models/ModelsForUnivesity";

export async function fetchPromotions() {
    return await supabase
        .from("promotion")
        .select<string, Promotion>(
            `
            id,
            libelle_promotion,
            departement_id
            `
        );
}

export async function fetchPromotionById(id: string) {
    return await supabase
        .from("promotion")
        .select<string, Promotion>(`
            id,
            libelle_promotion,
            departement_id
        `)
        .eq("id", id)
        .single();
}

export async function fetchPromotionByDepartmentId(departmentId: string) {
    return await supabase
        .from("promotion")
        .select<string, Promotion>(`
            id,
            libelle_promotion,
            departement_id
        `)
        .eq("departement_id", departmentId);
}

export async function addPromotion(promotion: Promotion) {
    return await supabase
        .from("promotion")
        .insert([promotion]);
}

export async function updatePromotion(id: string, promotion: Partial<Promotion>) {
    return await supabase
        .from("promotion")
        .update(promotion)
        .eq("id", id);
}

export async function deletePromotion(id: string) {
    return await supabase
        .from("promotion")
        .delete()
        .eq("id", id);
}
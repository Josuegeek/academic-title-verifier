import { supabase } from "../lib/supabase";

export interface SignerM {
    id: string;
    nom: string;
    postnom: string;
    prenom: string;
    faculte_id?: string;
    role: 'Doyen de la faculté' | 'Secrétaire générale académique';
    faculte: {
        libelle_fac: string;
    };
    created_at: string;
}


export interface Signer {
    id: string;
    nom: string;
    postnom: string;
    prenom: string;
    faculte_id?: string;
    role: 'Doyen de la faculté' | 'Secrétaire générale académique';
}

export async function fetchSigners() {
    return await supabase
        .from('deliver')
        .select<string, SignerM>(`
      id,
      nom,
      postnom,
      prenom,
      faculte_id,
      role,
      faculte (
        libelle_fac
      )
    `)
        .order('created_at', { ascending: false });
}

export async function fetchSignerById(id: string) {
    return await supabase
        .from('deliver')
        .select(`
      id,
      nom,
      postnom,
      prenom,
      faculte_id,
      role,
      faculte (
        libelle_fac
      )
    `)
        .eq('id', id)
        .single();
}

export async function addSigner(signer: Omit<Signer, 'id'>) {
    if (!signer.faculte_id) {
        delete signer.faculte_id;
    }
    return await supabase
        .from('deliver')
        .insert([signer]);
}

export async function updateSigner(id: string, signer: Partial<Omit<Signer, 'id'>>) {
    return await supabase
        .from('deliver')
        .update(signer)
        .eq('id', id);
}

export async function deleteSigner(id: string) {
    return await supabase
        .from('deliver')
        .delete()
        .eq('id', id);
}

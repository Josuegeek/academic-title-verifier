export interface Faculty {
    id: string;
    libelle_fac: string;
}

export interface Department {
    id: string;
    libelle_dept: string;
}

export interface Promotion {
    id: string;
    libelle_promotion: string;
    departement_id: string;
    option: string;
}

export interface StudentJointPromotion {
    id: string;
    nom: string;
    postnom: string;
    prenom: string;
    date_naissance: Date;
    promotion_id: string;
    promotion: {
        id: string;
        libelle_promotion: string;
        option: string;
        departement: {
            id: string;
            libelle_dept: string;
            faculte: {
                id: string;
                libelle_fac: string;
            };
        };
    };
}

export interface Student {
    id: string;
    nom: string;
    postnom: string;
    prenom: string;
    promotion_id: string;
    date_naissance: Date;
}

export interface NewDiploma {
    libelle_titre: string;
    fichier_url:string;
    qr_code:string;
    date_delivrance:string;
    lieu:string;
    etudiant_id: string;
    est_authentique: boolean;
    annee_academique: string;
    signe_par: string;
}

export interface DiplomaJointStudent {
    id: string;
    libelle_titre: string;
    fichier_url:string;
    qr_code:string;
    date_delivrance:string;
    lieu:string;
    etudiant: {
        id: string
        nom: string;
        postnom: string;
        prenom: string;
    } | null;
    est_authentique: boolean;
    annee_academique: string;
    signe_par: string;
}

export interface Diploma {
    id: string;
    libelle_titre: string;
    fichier_url:string;
    qr_code:string;
    date_delivrance:string;
    lieu:string;
    etudiant_id: string;
}
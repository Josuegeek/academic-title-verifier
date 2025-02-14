/*
  # Ajout de données d'exemple

  1. Données ajoutées
    - Une université
    - Une faculté
    - Un département
    - Une promotion
    - Des étudiants
    - Des titres académiques

  2. Notes
    - Utilisation de gen_random_uuid() pour générer des UUID valides
    - Les données sont liées entre elles via les clés étrangères
*/

DO $$
DECLARE
  v_univ_id uuid;
  v_fac_id uuid;
  v_dept_id uuid;
  v_promo_id uuid;
  v_etudiant1_id uuid;
  v_etudiant2_id uuid;
  v_etudiant3_id uuid;
BEGIN
  -- Ajout d'une université
  v_univ_id := gen_random_uuid();
  INSERT INTO universite (id, libelle_univ)
  VALUES (v_univ_id, 'Université de Kinshasa');

  -- Ajout d'une faculté
  v_fac_id := gen_random_uuid();
  INSERT INTO faculte (id, universite_id, libelle_fac)
  VALUES (v_fac_id, v_univ_id, 'Faculté des Sciences');

  -- Ajout d'un département
  v_dept_id := gen_random_uuid();
  INSERT INTO departement (id, faculte_id, libelle_dept)
  VALUES (v_dept_id, v_fac_id, 'Informatique');

  -- Ajout d'une promotion
  v_promo_id := gen_random_uuid();
  INSERT INTO promotion (id, departement_id, libelle_promotion, option)
  VALUES (v_promo_id, v_dept_id, 'L2', 'Génie Logiciel');

  -- Ajout d'étudiants
  v_etudiant1_id := gen_random_uuid();
  v_etudiant2_id := gen_random_uuid();
  v_etudiant3_id := gen_random_uuid();
  
  INSERT INTO etudiant (id, promotion_id, nom, postnom, prenom, date_naissance) VALUES
  (v_etudiant1_id, v_promo_id, 'Mutombo', 'Kabila', 'Jean', '2000-05-15'),
  (v_etudiant2_id, v_promo_id, 'Lukaku', 'Mbemba', 'Marie', '1999-08-22'),
  (v_etudiant3_id, v_promo_id, 'Tshilombo', 'Mwepu', 'Pierre', '2001-03-10');

  -- Ajout de titres académiques
  INSERT INTO titre_academique (
    id,
    etudiant_id,
    libelle_titre,
    fichier_url,
    qr_code,
    date_delivrance,
    lieu,
    domaine,
    est_authentique
  ) VALUES
  (
    gen_random_uuid(),
    v_etudiant1_id,
    'Licence en Informatique',
    'https://example.com/diplomes/licence-info-2023.pdf',
    'QR-MUTOMBO-2023',
    '2023-07-15',
    'Kinshasa',
    'Sciences Informatiques',
    true
  ),
  (
    gen_random_uuid(),
    v_etudiant2_id,
    'Licence en Informatique',
    'https://example.com/diplomes/licence-info-2023-2.pdf',
    'QR-LUKAKU-2023',
    '2023-07-15',
    'Kinshasa',
    'Sciences Informatiques',
    true
  ),
  (
    gen_random_uuid(),
    v_etudiant3_id,
    'Licence en Informatique',
    'https://example.com/diplomes/licence-info-2023-3.pdf',
    'QR-TSHILOMBO-2023',
    '2023-07-15',
    'Kinshasa',
    'Sciences Informatiques',
    true
  );
END $$;
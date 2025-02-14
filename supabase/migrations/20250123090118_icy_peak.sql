/*
  # Academic Verification System Schema

  1. New Tables
    - `universite`
      - `id` (uuid, primary key)
      - `libelle_univ` (text)
    - `faculte`
      - `id` (uuid, primary key) 
      - `universite_id` (uuid, foreign key)
      - `libelle_fac` (text)
    - `departement`
      - `id` (uuid, primary key)
      - `faculte_id` (uuid, foreign key)
      - `libelle_dept` (text)
    - `promotion`
      - `id` (uuid, primary key)
      - `departement_id` (uuid, foreign key)
      - `libelle_promotion` (text)
      - `option` (text)
    - `etudiant`
      - `id` (uuid, primary key)
      - `promotion_id` (uuid, foreign key)
      - `nom` (text)
      - `postnom` (text)
      - `prenom` (text)
      - `date_naissance` (date)
    - `titre_academique`
      - `id` (uuid, primary key)
      - `etudiant_id` (uuid, foreign key)
      - `libelle_titre` (text)
      - `fichier_url` (text)
      - `qr_code` (text)
      - `date_delivrance` (timestamptz)
      - `lieu` (text)
      - `domaine` (text)
      - `est_authentique` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Add policies for public verification access
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'university_staff', 'verifier');

-- Create profiles table for extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role DEFAULT 'verifier',
  universite_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create universities table
CREATE TABLE IF NOT EXISTS universite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle_univ text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create faculties table
CREATE TABLE IF NOT EXISTS faculte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  universite_id uuid REFERENCES universite(id) ON DELETE CASCADE,
  libelle_fac text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculte_id uuid REFERENCES faculte(id) ON DELETE CASCADE,
  libelle_dept text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departement_id uuid REFERENCES departement(id) ON DELETE CASCADE,
  libelle_promotion text NOT NULL,
  option text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS etudiant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid REFERENCES promotion(id) ON DELETE CASCADE,
  nom text NOT NULL,
  postnom text,
  prenom text NOT NULL,
  date_naissance date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create academic titles table
CREATE TABLE IF NOT EXISTS titre_academique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id uuid REFERENCES etudiant(id) ON DELETE CASCADE,
  libelle_titre text NOT NULL,
  fichier_url text,
  qr_code text UNIQUE,
  date_delivrance timestamptz DEFAULT now(),
  lieu text NOT NULL,
  domaine text NOT NULL,
  est_authentique boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE universite ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculte ENABLE ROW LEVEL SECURITY;
ALTER TABLE departement ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion ENABLE ROW LEVEL SECURITY;
ALTER TABLE etudiant ENABLE ROW LEVEL SECURITY;
ALTER TABLE titre_academique ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for universities
CREATE POLICY "University staff can view their university"
  ON universite FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.universite_id = universite.id
    )
  );

CREATE POLICY "Admins can manage universities"
  ON universite FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policies for academic titles
CREATE POLICY "Anyone can verify academic titles"
  ON titre_academique FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "University staff can manage academic titles"
  ON titre_academique FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN etudiant e ON e.id = titre_academique.etudiant_id
      JOIN promotion pr ON pr.id = e.promotion_id
      JOIN departement d ON d.id = pr.departement_id
      JOIN faculte f ON f.id = d.faculte_id
      WHERE p.id = auth.uid()
      AND p.universite_id = f.universite_id
      AND p.role = 'university_staff'
    )
  );

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (new.id, 'verifier');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universite_updated_at
  BEFORE UPDATE ON universite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculte_updated_at
  BEFORE UPDATE ON faculte
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departement_updated_at
  BEFORE UPDATE ON departement
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_updated_at
  BEFORE UPDATE ON promotion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_etudiant_updated_at
  BEFORE UPDATE ON etudiant
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_titre_academique_updated_at
  BEFORE UPDATE ON titre_academique
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
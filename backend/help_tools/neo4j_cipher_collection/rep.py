MATCH (d:Drug)
WHERE d.cancer_drug = 1
SET d.drug_status = 1

MATCH (d:Drug)
WHERE d.Candidate IS NOT NULL
SET d.drug_status = 2
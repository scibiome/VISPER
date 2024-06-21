# Introduction \nPanCan is the name for a set of data from the [Pan-cancer proteomic map of 949 human cell lines](https://pubmed.ncbi.nlm.nih.gov/35839778/) study by Gonçalves et al.\n In this study, a pan-cancer proteomic map of 949 human cancer cell lines from over 40 cancer types was created to aid in the discovery of cancer biomarkers and targets for the development of new cancer treatments.\nThe predictive power of proteomics and transcriptomics (the study of all RNA molecules expressed in a unit) was found to be comparable and there is evidence that proteomics can provide additional important information not covered by transcriptomics.\nThe analysis yielded a dataset of approximately 8,500 proteins quantified in all cell lines.\n Part of this study also involved applying 625 drugs to the cell lines and recording the drug response data. \nFrom this, drug response data across cell lines in relation to their proteomic data could also be derived.\n Overall, this resulted in a comprehensive and complex dataset that enables proteins to be identified as cancer biomarkers and provides new targets for the development of new cancer treatments.

"""# Introduction
[BioGRID](https://thebiogrid.org/) is a database of protein, genetic and chemical interactions that allows us to find connections between proteins.
| Field | Description | Example |
| --- | --- | --- |
| BioGRID_Interaction_ID | A unique identifier for each interaction in the BioGRID database. | 103 |
| Entrez_Gene_Interactor_A/B | The identifier from the Entrez-Gene database corresponding to Interactor A/B. If no Entrez-Gene ID is available, this is a "-". | 6416 |
| BioGRID_ID_Interactor_A/B | The identifier in the BioGRID database corresponding to Interactor A/B. | 112315 |
| Systematic_Name_Interactor_A/B | A systematic plaintext name, if known for Interactor A. If no name is available, a "-" is displayed. | - |
| Official_Symbol_Interactor_A/B | A common gene name/official symbol for Interactor A. A "-", if no name is available. | MAP2K4 |
| Synonyms_Interactor_A/B | A list of alternative identifiers for Interactor A separated by "|". Will be "-" if no aliases are available. | JNKK\|JNKK1\|MAPKK4\|MEK4\|MKK4\|PRKMK4\|SAPKK-1\|SAPKK1\|SEK1\|SERK1\|SKK1 |
| Experimental_System | One of the many codes supported by BioGRID for experimental evidence. | Two-hybrid |
| Experimental_System_Type | This is either "physical" or "genetic" as a classification of the experimental system name. | physical |
| Author | Surname of the first author of the publication in which the interaction was demonstrated, possibly followed by additional indicators | Marti A (1997) |
| Publication_Source | The publication source in which the interaction was shown | PUBMED:9006895 |
| Organism_ID_Interactor_A/B | This is the NCBI Taxonomy ID for Interactor A. | 9606 |
| Throughput | This is either high throughput, low throughput, or both (separated by "\|"). | Low Throughput |
| Score | This is a positive or negative value recorded in the original publication indicating P-values, confidence scores, SGA scores, etc. A "-" is displayed if no result is reported. | - |
| Modification | In biochemical activity experiments, this field is filled with the associated post-translational modification. A "-" is displayed if no modification is reported. | - |
| Qualifications | If additional plaintext information has been recorded for an interaction, these will be listed with unique qualifiers separated by "\|". If no qualification is present, this field contains a "-". | - |
| Tags | If an interaction has been classified with additional classifications, these will be indicated in this column separated by "\|". If no tag information is available, this field contains a "-". | - |
| Source_Database | This field contains the name of the database where this interaction was provided. | BIOGRID |
| SWISS_PROT_Accessions_Interactor_A/B | This field contains one or more matching Swiss-Prot accessions, separated by "\|". If none are present, this field contains a "-". | P45985 |
| TREMBL_Accessions_Interactor_A/B | This field contains one or more matching Swiss-Prot accessions, separated by "\|". If none are present, this field contains a "-". | - |
| REFSEQ_Accessions_Interactor_A/B | This field contains one or more matching RefSeq accessions, separated by "\|". If none are present, this field contains a "-". | NP_003001\|NP_001268364 |
| Ontology_Term_IDs | If ontology terms are recorded for this interaction, the official ontology term IDs for each assignment are indicated here, separated by "\|". | - |
| Ontology_Term_Names | If ontology terms are recorded for this interaction, the official ontology term name associated with the ontology term ID for each mapping is indicated here, separated by "\|". | |
| Ontology_Term_Categories | If ontology terms are recorded for this interaction, the official ontology term category for each assignment is indicated here, separated by "\|". | |
| Ontology_Term_Qualifier_IDs | If additional qualifying terms are linked to the terms indicated in column 30, the IDs of these qualifying terms are indicated here, separated by "\|". If more than one qualifying term is linked to a single term in column 30, each term is separated by "^". | |
| Ontology_Term_Qualifier_Names | If additional qualifying terms are linked to the terms indicated in column 31, the names of these qualifying terms are indicated here, separated by "\|". If more than one qualifying term is linked to a single term in column 31"""


BioGRID_Interaction_ID& Ein eindeutiger Bezeichner für jede Interaktion in der BioGRID-Datenbank. & 103\\
Entrez_Gene_Interactor_A/B& Der Identifikator aus der Entrez-Gene-Datenbank, der dem Interaktor A/B entspricht. & &6416\\
BioGRID_ID_Interactor_A/B & Die Kennung in der BioGRID-Datenbank, die dem Interaktor A/B entspricht. & 112315\\
Systematic_Name_Interactor_A/B & Ein systematischer Klartextname, falls für Interaktor A bekannt. & -\\
Official_Symbol_Interactor_A/B & Ein allgemeiner Genname/offizielles Symbol für Interaktor A. & MAP2K4\\
Synonyms_Interactor_A/B & Liste alternativer Bezeichner für Interaktor A/B. & JNKK|JNKK1|MAPKK4|MEK4|MKK4|PRKMK4|SAPKK-1|SAPKK1|SEK1|SERK1|SKK1\\
Experimental_System	& Einer der vielen vom BioGRID unterstützten Codes für experimentelle Nachweise. & Two-hybrid\\
Experimental_System_Type & Dies ist entweder "physisch" oder "genetisch" als Klassifizierung des Experimentalsystemnamens.& physical\\
Author & Nachname des Erstautors der Publikation, in der die Wechselwirkung nachgewiesen wurde, gegebenenfalls gefolgt von zusätzlichen Indikatoren & Marti A (1997)\\
Publication_Source & die Publikationsquelle, in der die Interaktion gezeigt wurde & PUBMED:9006895\\
Organism_ID_Interactor_A/B & Dies ist die NCBI Taxonomy ID für Interactor A.& 9606\\
Throughput & Dabei handelt es sich entweder um hohen Durchsatz, niedrigen Durchsatz oder beides. & Low Throughput\\
Score & Dies ist ein positiver oder negativer Wert, der in der Originalveröffentlichung aufgezeichnet wurde und P-Werte, Konfidenzwerte, SGA-Werte usw. angibt. & -\\
Modification & Bei Experimenten zur biochemischen Aktivität wird dieses Feld mit der zugehörigen posttranslationalen Modifikation ausgefüllt. & -\\
Qualifications& Wenn für eine Interaktion zusätzliche Klartextinformationen aufgezeichnet wurden, werden diese aufgeführt & -\\
Tags& Wenn eine Interaktion mit zusätzlichen Klassifizierungen versehen wurden angegeben.  & -\\
Source_Database& Dieses Feld enthält den Namen der Datenbank, in der diese Interaktion bereitgestellt wurde.& BIOGRID\\
SWISS_PROT_Accessions_Interactor_A/B & Dieses Feld enthält eine oder mehrere übereinstimmende swiss-prot-Zugänge.& P45985\\
TREMBL_Accessions_Interactor_A/B & Dieses Feld enthält eine oder mehrere übereinstimmende swiss-prot-Zugänge.& -\\
REFSEQ_Accessions_Interactor_A/B & Dieses Feld enthält eine oder mehrere übereinstimmende refseq-Zugänge.&NP\_003001|NP\_001268364\\
Ontology_Term_IDs & Wenn für diese Interaktion Ontologie-Terme erfasst werden, werden die offiziellen Ontologie-Term-IDs für jede Zuordnung hier angegeben.&- \\
Ontology_Term_Names	& Wenn für diese Interaktion Ontologie-Terms erfasst werden, wird hier für jedes Mapping der offizielle Ontologie-Term-Name angegeben, der mit der Ontologie-Term-ID verbunden ist.& \\
Ontology_Term_Categories & Wenn für diese Interaktion Ontologiebegriffe erfasst werden, wird hier für jede Zuordnung die offizielle Ontologiebegriffskategorie angegeben.& \\
Ontology_Term_Qualifier_IDs	& Wenn zusätzliche qualifizierende Begriffe mit den in Spalte 30 angegebenen Begriffen verknüpft sind, werden die IDs dieser qualifizierenden Begriffe hier angegeben. Es ist möglich, dass mehr als ein qualifizierender Begriff mit einem einzigen Begriff verknüpft ist.& \\
Ontology_Term_Qualifier_Names& Wenn zusätzliche qualifizierende Begriffe mit den angegebenen Begriffen verknüpft sind, werden die Namen dieser qualifizierenden Begriffe hier angegeben & \\
Ontology_Term_Types	& In einigen Fällen können Begriffe, die als Phänotypen klassifiziert sind, einen zusätzlichen Typ enthalten.& \\
Organism_Name_Interactor_A/B	& Dies ist der offizielle Organismusname für die Organismus-ID & Homo sapiens\\



| Field | Description |
| --- | --- |
Cell_Line | Der Name der Zelllinie  |
SIDM  (Sanger IDentifier Model) | Eine von Sanger verwendeten Kernkennung im (Cell Model) Passport steht für einen Probe   |
Project_Identifier | SIDM + Cell_Line  |
Tissue_type | Der Typ des Gewebes, aus dem diese Zelllinie stamm  |
Cancer_type | Der allgemeine Typ des Krebses, der mit dieser Zelllinie in Verbindung steht  |
Cancer_subtype | Eine spezifischere Unterart oder Subtyp des Krebses  |



| Field | Description |
Entry | Eindeutige und stabile Kennung des Eintrags.  |
Entry name | Der UniProtKB/Swiss-Prot-Eintragsname bietet einen mnemonischen Identifikator für einen UniProtKB-Eintrag, der jedoch kein stabiler Identifikator. Jedem überprüften (reviewed) Eintrag wird bei der Integration in UniProtKB/ Swiss-Prot ein eindeutiger Eintragsname zugewiesen. Dieser besteht aus bis zu 11 alphanumerischen Zeichen in Großbuchstaben mit einer Namenskonvention, die als X_Y symbolisiert werden kann: |
Status | Bestimmt, ob einem Eintrag in UniProtKB ein eindeutiger Eintragsname zugewiesen wird  |
Length | Die Anzahl der in einer Proteinsequenz enthaltenen Aminosäurereste  |
Mass | Molekularmasse eines Proteins, gemessen in Dalton  |
Gene names  (primary ) | Angabe von einem oder mehreren Gennamen für das Protein |

| Field | Description |
drug_id/y_Id | Besteht aus drug_code, drug_name und GDSC_version> | 
x_id | Genname des Proteins |
n | Anzahl der berücksichtigten Zelllinien | 
beta | Koeffizient aus linearen Modellen, die alle Kovariaten einschließen | 
lr | Wahrscheinlichkeitsverhältnis  | 
covs | Kovariaten | 
pval | p-Wert aus dem Log-Likelihood-Ratio-Test |
fdr | BH-angepasste p-Wert |
nc_beta | Koeffizient aus linearen Modellen, die keine transkriptomische Kovariate verwenden |
nc_lr | Wahrscheinlichkeitsverhältnis, das keine transkriptomischen Kovariablen enthalten  |
nc_pval | p-Wert aus linearen Modellen, die keine transkriptomischen Kovariaten enthalten |
nc_fdr | FDR aus linearen Modellen, die keine transkriptomischen Kovariablen enthalten | 
r2 | Pearson's r zwischen der tatsächlichen IC50 und der vorhergesagten IC50 aus DeepOmicNet |
target | Designiertes Target des Medikaments aus den kuratierten Informationen von Sanger |
ppi | Abstand zwischen dem Protein und dem Wirkstoffziel im Protein-Protein-Interaktionsnetzwerk |
skew | Schiefe der Verteilung der IC50 eines Arzneimittels. Je kleiner diese ist, desto selektiver ist ein Arzneimittel |

| Field | Description |
drug_id | Ein Medikament kann ein oder mehrere drug_id's besitzen, da z.B. das Medikament an unterschiedlichen Orten untersucht wurde  | 
drug_name | Medikamentenname | 
drug_owner | Besitzer des Medikaments |
webrelease |  |
PUBCHEM | Eine eindeutige Kennung, die einem chemischen Verbindungseintrag in der PubChem-Datenbank zugeordnet ist |
target_pathway | biologischen Signalweg oder Prozess, auf den das Medikament abzielt oder mit dem es interagiert, um seine Wirkung zu entfalten | 
putative_gene_target | Voraussichtliches Gen Ziel des Medikaments |
model_treatment |  |
drug_synonyms | Medikamentensynonyme  |
putative_target | Voraussichtliches Ziel  |
CHEMBL | Eindeutige Kennung, die in der ChEMBL-Datenbank verwendet wird |


| Field                 | Description                                                                                                                           |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Cell_Line             | The name of the cell line                                                                                                             |
| SIDM (Sanger IDentifier Model) | A core identifier used by Sanger in the Cell Model Passport, representing a sample                                                   |
| Project_Identifier    | SIDM + Cell_Line                                                                                                                      |
| Tissue_type           | The type of tissue from which this cell line originates                                                                              |
| Cancer_type           | The general type of cancer associated with this cell line                                                                            |
| Cancer_subtype        | A more specific subtype or subtype of the cancer                                                                                     |

| Field                 | Description                                                                                                                                                                                                                           |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Entry                 | Unique and stable identifier of the entry.                                                                                                                                                                                            |
| Entry name            | The UniProtKB/Swiss-Prot entry name provides a mnemonic identifier for a UniProtKB entry, which is not a stable identifier. Each verified (reviewed) entry is assigned a unique entry name upon integration into UniProtKB/Swiss-Prot. |
| Status                | Determines whether a unique entry name is assigned to an entry in UniProtKB                                                                                                                                                           |
| Length                | The number of amino acid residues contained in a protein sequence                                                                                                                                                                      |
| Mass                  | Molecular mass of a protein, measured in Daltons                                                                                                                                                                                      |
| Gene names (primary)  | Names of one or more genes for the protein                                                                                                                                                                                            |

| Field         | Description                                                                                                                                                        |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| drug_id/y_Id  | Consists of drug_code, drug_name, and GDSC_version>                                                                                                                |
| x_id          | Gene name of the protein                                                                                                                                           |
| n             | Number of cell lines considered                                                                                                                                    |
| beta          | Coefficient from linear models that include all covariates                                                                                                         |
| lr            | Likelihood ratio                                                                                                                                                   |
| covs          | Covariates                                                                                                                                                         |
| pval          | p-value from the log-likelihood ratio test                                                                                                                         |
| fdr           | BH-adjusted p-value                                                                                                                                                |
| nc_beta       | Coefficient from linear models that do not use transcriptomic covariate                                                                                            |
| nc_lr         | Likelihood ratio that does not include transcriptomic covariates                                                                                                   |
| nc_pval       | p-value from linear models that do not include transcriptomic covariates                                                                                            |
| nc_fdr        | FDR from linear models that do not include transcriptomic covariates                                                                                                |
| r2            | Pearson's r between the actual IC50 and the predicted IC50 from DeepOmicNet                                                                                         |
| target        | Designated target of the drug from curated information by Sanger                                                                                                    |
| ppi           | Distance between the protein and the drug target in the protein-protein interaction network                                                                         |
| skew          | Skewness of the distribution of a drug's IC50. The smaller this is, the more selective a drug is                                                                   |

| Field                | Description                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------------------|
| drug_id              | A drug can have one or more drug_id's, as the drug may be studied in different locations                          |
| drug_name            | Drug name                                                                                                         |
| drug_owner           | Owner of the drug                                                                                                 |
| webrelease           |                                                                                                                   |
| PUBCHEM              | A unique identifier assigned to a chemical compound entry in the PubChem database                                 |
| target_pathway       | Biological pathway or process that the drug targets or interacts with to exert its effect                         |
| putative_gene_target | Putative gene target of the drug                                                                                  |
| model_treatment      |                                                                                                                   |
| drug_synonyms        | Drug synonyms                                                                                                     |
| putative_target      | Putative target                                                                                                   |
| CHEMBL               | Unique identifier used in the ChEMBL database                                                                     |

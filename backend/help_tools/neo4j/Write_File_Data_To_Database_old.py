import pandas as pd
import os
import json
import math
from neomodel import config, db
from myapi.models import Drug, Protein, CellLine, Mobem, Anova
from tqdm import tqdm

#################################################
# Write to read data from files to the database #
#################################################

config.ENCRYPTED_CONNECTION = False
config.DATABASE_URL = 'bolt://neo4j:workwork@localhost:7687'
folder_path='/home/work/Downloads/data/'


# 4513 Proteine, 549 Drugs, 103371 Connections
def mmc6(file_path):
    worksheet_name="All Drug-Protein associations"
    df = pd.read_excel(file_path, sheet_name=worksheet_name, skiprows=1)
    
    for i in  tqdm(range(len(df)), desc="All Drug-Protein associations", unit="iteration", ncols=80):
        row = df.iloc[i]

        #y_id
        y_id = row['y_id']
        drug_id, drug_name, GDSC = y_id.split(";",2)
        

        drug = Drug.nodes.first_or_none(drug_id=drug_id)
        if drug == None:
            drug = Drug(drug_id=drug_id, drug_name=drug_name).save()

        #x_id
        protein_id = row['x_id']

        protein = Protein.nodes.first_or_none(protein_id=protein_id)
        if protein == None:
            protein = Protein(protein_id=protein_id).save()

        #connection
        n = row['n']
        beta = row['beta']
        lr = row['lr']
        covs = row['covs']
        pval = row['pval']
        fdr = row['fdr']
        nc_beta = row['nc_beta']
        nc_lr = row['nc_lr']
        nc_pval = row['nc_pval']
        nc_fdr = row['nc_fdr']
        r2 = row['r2']
        if math.isnan(r2):
            r2 = 0
        target = row['target']
        ppi = row['ppi']
        skew = row['skew']

        con = drug.mmc6.connect(protein, {'n': n, 'beta': beta, 'lr': lr, 'covs': covs, 'pval': pval, 'fdr': fdr, 'nc_beta': nc_beta, 'nc_lr': nc_lr, 'nc_pval': nc_pval, 'nc_fdr': nc_fdr, 'r2': r2, 'target': target, 'ppi': ppi, 'skew': skew, 'GDSC': GDSC})


def check_variable(a):
    if a == 'Y':
        return 1
    else:
        return 0

# Old Note: Cell line Details worksheet 1001 CellLine Einträge erstellt. COSMIC tissue classification hat 996 Einträge, die mit Cell Line Details übereinstimmen, und 33 zusätzliche Einträge, die nicht in Cell Line Details vorkommen. 5 fehlende Einträge kammen zu stande aufgrund von anders geschriebender names Bezeichnung z.B.G-292 Clone A141B1
# New Note: Cell line Details: 1001, COSMIC tissue classification 1001 matches und 28 zusätzliche Einträge, die nicht in Cell line Details vorkommen.
def cell_lines_details(file_path):
    worksheet_name="Cell line details"
    df = pd.read_excel(file_path, sheet_name=worksheet_name)
    number_of_cellines = 0
    for i in  tqdm(range(len(df)-1), desc="Processing Cell line details", unit="iteration", ncols=80):
        row = df.iloc[i]
        
        sample_name = str(row['Sample Name'])
        #print(sample_name)
        cosmic_id = row['COSMIC identifier']
        wes = check_variable(row['Whole Exome Sequencing (WES)'])
        cna = check_variable(row['Copy Number Alterations (CNA)'])
        gene_expression = check_variable(row['Gene Expression'])
        methylation = check_variable(row['Methylation'])
        drug_response = check_variable(row['Drug\nResponse'])
        gdsc_tissue_descriptor_1 = row['GDSC\nTissue descriptor 1']
        gdsc_tissue_descriptor_2 = row['GDSC\nTissue\ndescriptor 2']
        cancer_type = row['Cancer Type\n(matching TCGA label)']
        msi = row['Microsatellite \ninstability Status (MSI)']
        screen_medium = row['Screen Medium']
        growth_properties = row['Growth Properties']

        #Cell line details - decode
        cancer_type_name = ""
        if cancer_type == "PAAD":
            cancer_type_name = "Pancreatic adenocarcinoma"
        elif cancer_type == "PRAD":
            cancer_type_name = "Prostate adenocarcinoma"
        elif cancer_type == "SCLC":
            cancer_type_name = "Small Cell Lung Cancer"
        elif cancer_type == "SKCM":
            cancer_type_name = "Skin Cutaneous Melanoma"
        elif cancer_type == "STAD":
            cancer_type_name = "Stomach adenocarcinoma"
        elif cancer_type == "THCA":
            cancer_type_name = "Thyroid carcinoma"
        elif cancer_type == "UCEC":
            cancer_type_name = "Uterine Corpus Endometrial Carcinoma"
        
        msi_data = ""
        if msi == "MSS":
            msi_data = "Microsatillite class stable (0 of 5 markers show instability)"
        elif msi == "MSI-L":
            msi_data = "Microsatillite instability low (1 of 5 markers show instability)"
        elif msi == "MSI-H":
            msi_data = "Microsatillite instability High (>=2 of 5 markers show instability)"

        screen_medium_description = ""
        if screen_medium == "D/F12":
            screen_medium_description = "DMEM/F12: DMEM/F12, 10%% FBS, 1% PenStrep"
        elif screen_medium == "D/F12+10":
            screen_medium_description = "DMEM/F12+additonal 10%%FBS: DMEM/F12, 20%% FBS, 1% PenStrep"
        elif screen_medium == "R":
            screen_medium_description = "RPMI: RPMI, 10%% FBS, % PenStrep, %% Glucose, 1mM Sodium Pyruvate"
        elif screen_medium == "R+10":
            screen_medium_description = "RPMI+additonal 10%%FBS: RPMI, 20%% FBS, %% PenStrep, %% Glucose, 1mM Sodium Pyruvate"
        elif screen_medium == "H":
            screen_medium_description = "Hites: 5ug/ml Insulin, 10nM B-estradiol, 10uM Hydrocortisone"


        cell_line = CellLine.nodes.get_or_none(sample_name=sample_name, cosmic_id=cosmic_id)
        if cell_line == None:
            cell_line = CellLine(sample_name=sample_name, cosmic_id=cosmic_id, wes=wes, cna=cna, gene_expression=gene_expression, methylation=methylation, drug_response=drug_response, gdsc_tissue_descriptor_1=gdsc_tissue_descriptor_1, gdsc_tissue_descriptor_2=gdsc_tissue_descriptor_2, cancer_type=cancer_type, msi=msi, screen_medium=screen_medium, growth_properties=growth_properties, cancer_type_name= cancer_type_name, msi_data=msi_data, screen_medium_description=screen_medium_description)
            cell_line.save()
            number_of_cellines = number_of_cellines + 1
        else:
            cell_line.wes = wes
            cell_line.cna = cna
            cell_line.gene_expression = gene_expression
            cell_line.methylation = methylation
            cell_line.drug_response = drug_response
            cell_line.gdsc_tissue_descriptor_1 = gdsc_tissue_descriptor_1
            cell_line.gdsc_tissue_descriptor_2 = gdsc_tissue_descriptor_2
            cell_line.cancer_type = cancer_type
            cell_line.msi = msi
            cell_line.screen_medium = screen_medium
            cell_line.growth_properties = growth_properties
            cell_line.cancer_type_name = cancer_type_name
            cell_line.msi_data = msi_data
            cell_line.screen_medium_description = screen_medium_description
            cell_line.save()

    print("Number of Cell Lines: "+str(number_of_cellines))
    worksheet_name="COSMIC tissue classification"
    df = pd.read_excel(file_path, sheet_name=worksheet_name)
    number_of_cellines = 0
    number_of_cellines2 = 0
    for i in  tqdm(range(len(df)), desc="Processing COSMIC tissue classification", unit="iteration", ncols=80):
        row = df.iloc[i]
        sample_name = row['Line']
        cosmic_id = row['COSMIC_ID']
        site = row['Site']
        histology = row['Histology']

        cell_line = CellLine.nodes.get_or_none(cosmic_id=cosmic_id)
        if cell_line == None:
            cell_line = CellLine(sample_name=sample_name, cosmic_id=cosmic_id, site=site, histology=histology).save()
            #print("Ausnahme class: "+ str(cosmic_id)+"  "+str(sample_name))
            number_of_cellines2 = number_of_cellines2 +1
        else:
            cell_line.site = site
            cell_line.histology = histology
            cell_line.save()
            number_of_cellines = number_of_cellines + 1
    print("Number of cell lines 2: "+str(number_of_cellines))
    print("Number of cell lines 3: "+str(number_of_cellines2))

### Einzeldateien haben 617 Einträge und GF_PANCAN_nomedia_mobem hat 998 Einträge --> columns in anderen Dateien kommen zum Teil in  GF_PANCAN_nomedia_mobem nicht vor. Ingesamt 1615 nodes.
def mobem(folder_path_mobem):
    for filename in os.listdir(folder_path_mobem):
        file_path = os.path.join(folder_path_mobem, filename)
        df = pd.read_csv(file_path)
        df.rename(columns=lambda x: x.replace(".", "_"), inplace=True)
        #df.rename(columns={"COSMIC_ID": "cosmic_id"}, inplace=True)
        #df.rename(columns={"TISSUE_FACTOR": "tissue_factor"}, inplace=True)
        #df.rename(columns={"MSI_FACTOR": "msi_factor"}, inplace=True)
        value_mobem = filename[filename.find("_")+1:filename.rfind("_mobem.csv")]
        df['cancer_type'] = value_mobem
        
        
        for i in tqdm(range(len(df)), desc="Processing "+filename, unit="iteration", ncols=80):
            row = df.iloc[i] 
            properties_dict = {}
            for col_name, value in row.items():
                properties_dict[col_name] = value
            mobem = Mobem(**properties_dict).save()
            cell_line = CellLine.nodes.get_or_none(cosmic_id=row["cosmic_id"])
            if cell_line == None:
                print("Problem\n\n")
            cell_line.connect_mobem.connect(mobem)

#Schreibfehler von 1549 Sapitinib, deswegen nur drug_id zur identifizierung nutzen 
# 378 von 549 existierenden Drugs gefunden. 243 neu erstellt           
def screened_compounds(file_path):
    df = pd.read_csv(file_path)
    number_of_drugs = 0
    number_of_drugs2 = 0
    for i in tqdm(range(len(df)), desc="Processing screened compounds", unit="iteration", ncols=80):
        row = df.iloc[i]
        drug_id = row['DRUG_ID']
        screening_site = row['SCREENING_SITE']
        drug_name = row['DRUG_NAME']
        synonyms = row['SYNONYMS']
        target = row['TARGET']
        target_pathway = row['TARGET_PATHWAY']

        drug = Drug.nodes.get_or_none(drug_id=drug_id)
        drug2 = Drug.nodes.get_or_none(drug_id=drug_id, drug_name=drug_name)
        if drug != None and drug2 == None:
            print(drug_id, drug_name)

        if drug == None:
            number_of_drugs2 = number_of_drugs2 +1
            drug = Drug(drug_id=drug_id, drug_name=drug_name, screening_site=screening_site, synonyms=synonyms, target=target, target_pathway=target_pathway).save()
        else:
            number_of_drugs = number_of_drugs +1
            drug.screening_site = screening_site
            drug.synonyms = synonyms
            drug.target = target
            drug.target_pathway = target_pathway
            drug.save()
    print(number_of_drugs)
    print(number_of_drugs2)

# log_max_conc_tested column hat keine werte
def anova(folder_anova):
    file_name_list = ["/ANOVA_results_GDSC1_24Jul22.xlsx","/ANOVA_results_GDSC2_24Jul22.xlsx"]
    count1 = 0
    count2 = 0
    count3 = 0
    property_names = Mobem.__all_properties__
    #print(property_names)
    for i in range(len(file_name_list)):
        file_name = file_name_list[i]
        file_path = folder_anova+file_name
        excel_file = pd.ExcelFile(file_path)
        worksheet_names = excel_file.sheet_names

        for j in tqdm(range(len(worksheet_names)), desc="Processing screened compounds", unit="iteration", ncols=80):
            worksheet_name = worksheet_names[j]
            df = pd.read_excel(file_path, sheet_name=worksheet_name)

            for k in range(len(df)):
                row = df.iloc[i]
                if i == 0:
                    gdsc = "GDSC1"
                else:
                    gdsc = "GDSC2"
                drug_id = row['drug_id']
                feature_name = row['feature_name'].replace(".", "_")
                n_feature_pos = row['n_feature_pos']
                n_feature_neg = row['n_feature_neg']
                ic50_effect_size = row['ic50_effect_size']
                log_ic50_mean_pos = row['log_ic50_mean_pos']
                log_ic50_mean_neg = row['log_ic50_mean_neg']
                feature_ic50_t_pval = row['feature_ic50_t_pval']
                feature_delta_mean_ic50 = row['feature_delta_mean_ic50']
                feature_pos_ic50_var = row['feature_pos_ic50_var']
                feature_neg_ic50_var = row['feature_neg_ic50_var']
                feature_pval = row['feature_pval']
                tissue_pval = row['tissue_pval']
                msi_pval = row['msi_pval']
                fdr = row['fdr']
                tissue_type = row['tissue_type']
                dataset_version = row['dataset_version']
                drug = Drug.nodes.get_or_none(drug_id=row['drug_id'])
                
                if drug == None:
                    print("Problem")
                    drug = Drug(drug_id=row['drug_id'], drug_name=row['drug_name'], drug_target=row['drug_target'], target_pathway=row['target_pathway'])
                
                find_feature = False
                for prop_name in property_names:
                    if prop_name[0] == feature_name:
                        find_feature = True
                        break

                anova = Anova(gdsc=gdsc, feature_name = feature_name, n_feature_pos = n_feature_pos, n_feature_neg = n_feature_neg, ic50_effect_size = ic50_effect_size, log_ic50_mean_pos = log_ic50_mean_pos, log_ic50_mean_neg = log_ic50_mean_neg, feature_ic50_t_pval = feature_ic50_t_pval, feature_delta_mean_ic50 = feature_delta_mean_ic50, feature_pos_ic50_var = feature_pos_ic50_var, feature_neg_ic50_var = feature_neg_ic50_var, feature_pval = feature_pval, tissue_pval = tissue_pval, msi_pval = msi_pval, fdr = fdr, tissue_type = tissue_type, dataset_version = dataset_version)
                anova.save()
                count1 = count1 +1
                print(count1)
                anova.anova_drug.connect(drug)
                if find_feature:
                    cypher_query = f"MATCH (m:Mobem) WHERE m.{feature_name} = 1 RETURN m.uid as uid"
                    results, meta = db.cypher_query(cypher_query)
                    for record in results:
                        print(record)
                        mobem_node = Mobem.nodes.get_or_none(uid=record[0])
                        anova.anova_mobem.connect(mobem_node)
                        print("hes")
                        #node_record = record[0]
                        #db.create(relationship(node_record))
                        #anova.anova_mobem.connect(node_record)
                else:
                    print("Problem feature: " + feature_name)

def fitted_dose(folder_path_fitted):
    count1 = 0
    count2 = 0
    count3 = 0
    file_name_list = ["/GDSC1_fitted_dose_response_24Jul22.xlsx","/GDSC2_fitted_dose_response_24Jul22.xlsx"]
    for i in range(len(file_name_list)):
        file_name = file_name_list[i]
        file_path = folder_path_fitted+file_name
        worksheet_name = "Sheet 1"
        df = pd.read_excel(file_path, sheet_name=worksheet_name)

        for j in tqdm(range(len(df)), desc="Processing screened compounds", unit="iteration", ncols=80):
            row = df.iloc[i]
            gdsc = file_name[1:5]
            cosmic_id = row['COSMIC_ID']
            cell_line = row['CELL_LINE_NAME']

            drug_id = row['DRUG_ID']
            drug_name = row['DRUG_NAME']

            dataset = row['DATASET']
            nlme_result = row['NLME_RESULT_ID']
            nlme_curve_id = row['NLME_CURVE_ID']
            sanger_model_id = row['SANGER_MODEL_ID']
            tcga_desc = row['TCGA_DESC']
            putative_target = row['PUTATIVE_TARGET']
            pathway_name = row['PATHWAY_NAME']
            company_id = row['COMPANY_ID']
            webrelease = row['WEBRELEASE']
            min_conc = row['MIN_CONC']
            max_conc = row['MAX_CONC']
            ln_ic50 = row['LN_IC50']
            auc = row['AUC']
            rmse = row['RMSE']
            z_score = row['Z_SCORE']

            drug = Drug.nodes.get_or_none(drug_id=drug_id)
            if drug == None:
                count1 = count1 +1
                #drug = Drug(drug_id=drug_id, drug_name=drug_name)

            c = CellLine.nodes.get_or_none(cosmic_id=cosmic_id)
            if c == None:
                count2 = count2 +1
                #c = CellLine(cosmic_id=cosmic_id, sample_name=cell_line)
            count3 = count3 +1
            #con = drug.fitted_dose_response.connect(c, {'dataset': dataset, 'nlme_result': nlme_result, 'nlme_curve_id': nlme_curve_id, 'sanger_model_id': sanger_model_id, 'tcga_desc': tcga_desc, 'putative_target': putative_target, 'pathway_name': pathway_name, 'company_id': company_id, 'webrelease': webrelease, 'min_conc': min_conc, 'max_conc': max_conc, 'ln_ic50': ln_ic50, 'auc': auc, 'rmse': rmse, 'z_score': z_score})

    print(count1, count2, count3)

def public_raw_data(folder_path_raw):
    count1 = 0
    count2 = 0
    count3 = 0
    file_name_list = ["/GDSC1_public_raw_data_24Jul22.csv/GDSC1_public_raw_data_24Jul22.csv", "/GDSC2_public_raw_data_24Jul22.csv/GDSC2_public_raw_data_24Jul22.csv"]
    for i in range(len(file_name_list)):
        file_name = file_name_list[i]
        file_path = folder_path_raw+file_name
        if i == 0:
            worksheet_name = "GDSC1_public_raw_data_24Jul22"
        else:
            worksheet_name = "GDSC2_public_raw_data_24Jul22"

        for df in pd.read_csv(file_path, dtype={'BARCODE': str}, chunksize=1000):
                
            for j in range(len(df)):
                
                row = df.iloc[i]
                
                if i == 0:
                    gdsc = "GDSC1"
                else:
                    gdsc = "GDSC2"
                
                cosmic_id = row["COSMIC_ID"]
                drug_id = row["DRUG_ID"]

                research_project = row["RESEARCH_PROJECT"]
                barcode = row["BARCODE"]
                scan_id = row["SCAN_ID"]
                date_created = row["DATE_CREATED"]
                scan_date = row["SCAN_DATE"]
                cell_id = row["CELL_ID"]
                master_cell_id = row["MASTER_CELL_ID"]
                cell_line_name = row["CELL_LINE_NAME"]
                sanger_model_id = row["SANGER_MODEL_ID"]
                seeding_density = row["SEEDING_DENSITY"]
                drugset_id = row["DRUGSET_ID"]
                assay = row["ASSAY"]
                duration = row["DURATION"]
                position = row["POSITION"]
                tag = row["TAG"]
                conc = row["CONC"]
                intensity = row["INTENSITY"]
                if math.isnan(drug_id):
                    drug_id = 9999999 #connect with non existend drug
                drug = Drug.nodes.get_or_none(drug_id=drug_id)

                if drug == None:
                    #drug = Drug(drug_id=drug_id)
                    if drug_id != 9999999:
                        count1 = count1 + 1

                c = CellLine.nodes.get_or_none(cosmic_id=cosmic_id)
                if c == None:
                    count2 = count2 + 1
                    #c = CellLine(cosmic_id=cosmic_id, sample_name=cell_line_name)
                #con = drug.raw_data.connect(c, {'gdsc': gdsc, 'research_project': research_project, 'barcode': barcode, 'scan_id': scan_id, 'date_created': date_created, 'date_created': date_created, 'scan_date': scan_date, 'cell_id': cell_id, 'master_cell_id': master_cell_id, 'seeding_density':seeding_density, 'drugset_id': drugset_id,'assay': assay,'duration': duration, 'position': position,'tag': tag,'conc': conc,'intensity': intensity})
                count3 = count3 + 1
                print(count1, count2, count3)

# 949 Einträge + 1 Zeile mmit column names        
def peptide(folder_path_peptide):
    #file_name = "/ProCan-DepMapSanger_peptide_counts_per_protein_per_sample.txt"
    file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
    column_names = True
    column_name_list = []
    value_list = []
    with open(folder_path_peptide+file_name, 'r') as file:
        for line in file:
            if column_names:
                column_names = False
                column_name_list = line.split('\t')
                for i in range(len(column_name_list)):
                    if i != 0:
                        human_protein = column_name_list[i].split(';')
                        column_name_list[i] = human_protein[1].split('_HUMAN')
                        #print(column_name_list[i])
            else:
                value_list = line.split('\t')
                #print(value_list)
                count10 = 0
                for i in range(len(value_list)):
                    if i == 0:
                        project_name = value_list[i].split(';')
                        human_sample = project_name[1].split('_human')# not necessary
                        if human_sample[0] == "K052":
                            human_sample[0] = "KO52"
                        elif human_sample[0] == "DiFi":
                            human_sample[0] = "DIFI"
                        elif human_sample[0] == "PC-3_[JPC-3]":
                            human_sample[0] = "PC-3 [JPC-3]"
                        elif human_sample[0] == "PE-CA-PJ15":
                            human_sample[0] = "PE/CA-PJ15"
                        elif human_sample[0] == "Hep3B2-1-7":
                            human_sample[0] = "Hep 3B2_1-7"
                        elif human_sample[0] == "LS1034":
                            human_sample[0] = "LS-1034"
                        elif human_sample[0] == "HuTu-80":
                            human_sample[0] = "HUTU-80"
                        elif human_sample[0] == "G-292-Clone-A141B1":
                            human_sample[0] = "G-292 Clone A141B1"
                        elif human_sample[0] == "CAPAN-2":
                            human_sample[0] = "Capan-2"
                        elif human_sample[0] == "B-CPAP":
                            human_sample[0] = "BCPAP"
                        elif human_sample[0] == "SNU-5":
                            human_sample[0] = "NCI-SNU-5"
                        elif human_sample[0] == "SNU-16":
                            human_sample[0] = "NCI-SNU-16"                        
                        elif human_sample[0] == "SNU-1":
                            human_sample[0] = "NCI-SNU-1"
                        elif human_sample[0] == "T24":
                            human_sample[0] = "T-24"
                        elif human_sample[0] == "NTERA-2-cl-D1":
                            human_sample[0] = "NTERA-2 cl.D1"
                        elif human_sample[0] == "MMAc-SF":
                            human_sample[0] = "MMAC-SF"
                        elif human_sample[0] in ["NCI-H2731", "NCI-H2722", "NCI-H2595", "NCI-H2591", "NCI-H2461", "NCI-H2373", "NCI-H2369", "NCI-H513", "NCI-H2795", "NCI-H2803", "NCI-H2804", "NCI-H2810", "NCI-H3118", "NCI-H290", "NCI-H2869", "NCI-H2818"]:
                            human_sample[0] = human_sample[0][4:]
                        elif human_sample[0] == "NB4":
                            human_sample[0] = "NB-4"
                        elif human_sample[0] in ["Hs-940-T", "Hs-939-T", "Hs-766T", "Hs-746T", "Hs-683", "Hs-633T"]:
                            human_sample[0] = "Hs"+human_sample[0][3:]
                        
                        c = CellLine.nodes.get_or_none(sample_name=human_sample[0])

                    else:
                        if value_list[i] != "" and value_list[i] != "\n":
                            float_value = float(value_list[i])
                            find_protein = Protein.nodes.get_or_none(protein_id=column_name_list[i][0])
                            if find_protein == None:
                                h = 0
                                find_protein = Protein(protein_id=column_name_list[i])
                                find_protein.save()

                            con = c.connect_cellline_protein.connect(find_protein, {"average": float_value})


#mmc6(folder_path+'Supplementary Table 5/mmc6.xlsx')                                #done #done2
#cell_lines_details(folder_path+'bulk download/Cell_Lines_Details.xlsx')            #done #done2
#mobem(folder_path+'bulk download/GDSCtools_mobems')                                 #done
#screened_compounds(folder_path+'bulk download/screened_compounds_rel_8.4.csv')     #done
anova(folder_path+'bulk download')#muss integriert werden --> wierd?
#fitted_dose(folder_path+'bulk download') --> Drug - Cell Line connection
#public_raw_data(folder_path+'bulk download') --> Drug - Cell Line connection
#peptide(folder_path+"dropbox/19345397")

from neo4j import GraphDatabase

#########################################################################
# Add note to all drugs that are drug repurposing candidates for cancer #
#########################################################################

# DrugBank ID from Drugs that are drug repurposing candidates for cancer
all_drugs_neo4j = ['DB17039', 'DB13240', 'DB01254', 'DB01229', 'DB11743', 'DB01248', 'DB11663', 'DB12267', 'DB16828', 'DB12191', 'DB05482', 'DB12731', 'DB12146', 'DB12218', 'DB11893', 'DB04690', 'DB07794', 'DB17062', 'DB11648', 'DB07232', 'DB00188', 'DB12048', 'DB11805', 'DB12307', 'DB17059', 'DB08911', 'DB11740', 'DB00619', 'DB00958', 'DB08828', 'DB00563', 'DB12015', 'DB05524', 'DB11778', 'DB12183', 'DB11899', 'DB06999', 'DB04849', 'DB00987', 'DB13978', 'DB09073', 'DB17023', 'DB11791', 'DB00544', 'DB12064', 'DB12332', 'DB00290', 'DB00445', 'DB11760', 'DB00441', 'DB00570', 'DB03044', 'DB11423', 'DB09074', 'DB05483', 'DB12561', 'DB00762', 'DB06195', 'DB00305', 'DB04868', 'DB02546', 'DB12340', 'DB17046', 'DB00317', 'DB08865', 'DB12001', 'DB08877', 'DB15133', 'DB06616', 'DB00530', 'DB14980', 'DB07101', 'DB11841', 'DB12242', 'DB12874', 'DB12108', 'DB00307', 'DB05134', 'DB08916', 'DB12601', 'DB00914', 'DB06075', 'DB00515', 'DB13930', 'DB08875', 'DB09063', 'DB05220', 'DB00853', 'DB05575', 'DB00361', 'DB00970', 'DB00877', 'DB12686', 'DB06080', 'DB14795', 'DB12062', 'DB00947', 'DB11666', 'DB17058', 'DB06626', 'DB12703', 'DB06309', 'DB11689', 'DB11752', 'DB16239', 'DB01259', 'DB04769', 'DB11581', 'DB12745', 'DB06743', 'DB11730', 'DB04960', 'DB06188', 'DB12978', 'DB12008', 'DB06287', 'DB11526', 'DB12302', 'DB11759', 'DB12085', 'DB06589', 'DB11651', 'DB01128', 'DB12000', 'DB08912', 'DB12114', 'DB00773', 'DB17021', 'DB12904', 'DB06595', 'DB01268', 'DB04570', 'DB07430', 'DB11907', 'DB17030', 'DB16250', 'DB11836', 'DB09330', 'DB12387', 'DB12381', 'DB08142', 'DB15399', 'DB12253', 'DB01051', 'DB11986', 'DB06314', 'DB12174', 'DB00997', 'DB16228', 'DB12742', 'DB17197', 'DB12027', 'DB11925', 'DB00480', 'DB11969', 'DB03010', 'DB11800', 'DB00205', 'DB01590', 'DB09054', 'DB01217', 'DB11684', 'DB14935', 'DB08901', 'DB12021', 'DB06486', 'DB01700', 'DB06629', 'DB12707', 'DB12690', 'DB12774', 'DB16107', 'DB00398', 'DB17034', 'DB05015', 'DB11775', 'DB00675', 'DB07594', 'DB00526', 'DB11747', 'DB14943', 'DB08073', 'DB13048', 'DB12500', 'DB05470', 'DB17055', 'DB12121', 'DB06836', 'DB15281', 'DB05076', 'DB11363', 'DB12591', 'DB00002', 'DB12429', 'DB13164', 'DB05719', 'DB04858', 'DB08896', 'DB09053', 'DB01030', 'DB11794', 'DB14845', 'DB16108', 'DB07080', 'DB05913', 'DB15189', 'DB15232', 'DB11793', 'DB01067', 'DB01097', 'DB01069', 'DB11942', 'DB02342', 'DB11662', 'DB11911']


uri = "bolt://localhost:7687" 
username = "neo4j"             
password = "workwork"         
def extract_drugbank_values(tx, file_path):
    chembl_ids_query = """
    MATCH (d:Drug)
    RETURN d.uid AS uid, d.name AS name
    """
    count = 0
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [[record["uid"],record["name"]]  for record in chembl_ids_result]
    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip() 
            if len(line) > 1:
                parts = line.split('(')
                name1 = parts[0].strip()
                name2 = parts[1].strip().rstrip(')') if len(parts) > 1 else None
                for c in chembl_ids:
                    if (c[1] == name1) or (c[1] == name2 and name2 != None):
                        count = count + 1
                        chembl_ids_query2 = """
                        MATCH (d:Drug)
                        WHERE d.uid = $uid
                        SET d.cancer_drug = 1
                        """
                        tx.run(chembl_ids_query2, uid=c[0])
                        print(count)
                        break



def update_database_with_drugbank():   
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(extract_drugbank_values, file_path='allCancerDrugNames.txt')


update_database_with_drugbank()
#file_path = 'info.txt'
#drugbank_values = extract_drugbank_values(file_path)
#print(drugbank_values)

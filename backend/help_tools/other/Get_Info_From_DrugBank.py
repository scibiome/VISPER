from lxml import etree
##########################
# Get data from drugbank #
##########################

def inspect_xml_structure(xml_file, element_name, namespace, max_inspect=5):
    tree = etree.parse(xml_file)
    elements = tree.xpath(f'//db:{element_name}', namespaces=namespace)
    inspected = 0
    for elem in elements:
        print(etree.tostring(elem, pretty_print=True).decode())
        inspected += 1
        if inspected >= max_inspect:
            break

# Replace with the path to your DrugBank XML file
drugbank_xml_file =   'C:/Users/pc/Desktop/Masterarbeit/code-masterarbeit/backend/helper/drugbank/full_database.xml'
namespace = {'db': 'http://www.drugbank.ca'}

# Inspect the structure for SMILES
inspect_xml_structure(drugbank_xml_file, 'property', namespace)

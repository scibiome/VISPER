import React, { useEffect, useState } from 'react';
import Turnstone from 'turnstone';
import neo4j from 'neo4j-driver';
import {PushpinOutlined, PlusOutlined } from '@ant-design/icons';
const maxItems = 10;

const styles = {
  input: 'w-full border py-2 px-4 text-lg outline-none rounded-md',
  listbox: 'bg-neutral-900 w-full text-slate-50 rounded-md',
  highlightedItem: 'bg-neutral-800',
  query: 'text-oldsilver-800 placeholder:text-slate-600',
  typeahead: 'text-slate-500',
  clearButton:
    'absolute inset-y-0 text-lg right-0 w-10 inline-flex items-center justify-center bg-netural-700 hover:text-red-500',
  noItems: 'cursor-default text-center my-20',
  match: 'font-semibold',
  groupHeading: 'px-5 py-3 text-pink-500',
}
const nameToArray = (result) => {
  var resultsArray = [];
  result.records.forEach((record) => {
    resultsArray.push({
      name: record.get('name'),
      ntype: record.get('ntype'),
      uid: record.get('uid'),
      drug_id:  record.get('drug_id')
    });
  });
  return resultsArray;
}

/**
 * Set Avatar to search bar results and configure result field
 * @param {*} param0 
 * @returns 
 */
const Item = ({ item, isGraph  }) => {
 var avatar = "";
  switch(item.ntype){
    case "Protein":
      avatar = './protein.png';
      break;
    case "Drug":
      avatar = './drug.png';
      break;
    case "Cell_Line":
      avatar = './cellline.png';
      break;
    default:
      avatar = './unknown.png';
      break;
  }
  
  return (
    <div className='flex items-center cursor-pointer px-1 py-1'>
    <img
      width={35}
      height={35}
      src={avatar}
      alt={item.name}
      className='rounded-full object-cover mr-3'
    />
    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{item.name} {item.drug_id}</p>

        {isGraph ? (
        <p style={{ fontSize: '16px', lineHeight: '1.5',marginRight: "10px" }}><PushpinOutlined style={{ marginBottom: "10px"}}/>|<PlusOutlined style={{marginBottom: "10px", marginLeft: "-1px"}}/></p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Creates the saerch bar in the navigation bar
 * @param {*} param0 
 * @returns 
 */
const SearchBar = ({setShowMain, setUidValue, projectName, isGraph}) => {
    const [project_id_cipher, setproject_id_cipher] = useState("");
    const [turnstoneKey, setTurnstoneKey] = useState(282282828);

    /**
     * Get projects that should be searched
     */
    useEffect(() => {
      var get_project_id_cipher = "";
      for(const pro of projectName){
        if(pro.checked){
          if(get_project_id_cipher.length > 0){
            get_project_id_cipher = get_project_id_cipher + "OR ";
          }
          get_project_id_cipher = get_project_id_cipher + "n."+pro.project_id + " IS NOT NULL ";
        }
      }
      setproject_id_cipher(get_project_id_cipher);  
    }, [projectName]);

    /**
     * Get suitable results from neo4j and create a list of suggestions
     */
    const listbox = {
      data: async (query) => {
        query = query.toString(); 
      const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
      const session = driver.session();
      try {
        var drug_name2 = query;
        if(query.startsWith("drug")){
          drug_name2 = query.slice(4);
        }
        const  result_drugid_names = await session.run(
            "MATCH (n:Drug) WHERE n.drug_id = $drug_name2 RETURN n.name AS name, head(labels(n)) AS ntype, n.uid AS uid, n.drug_id AS drug_id LIMIT 20",
            { drug_name2}
          );
        const result_node_names = await session.run(
          "MATCH (n) WHERE toLower(n.name) STARTS WITH toLower($query) AND ("+project_id_cipher+ ") RETURN n.name AS name, head(labels(n)) AS ntype, n.uid AS uid, n.drug_id AS drug_id LIMIT 20",
          { query}
        );
        const result_synonyms_name = await session.run(
          "MATCH (n)-[r:HAS_SYNONYM]->(s) WHERE toLower(s.name) STARTS WITH toLower($query) AND ("+project_id_cipher+ ") RETURN s.name AS name, head(labels(n)) AS ntype, n.uid AS uid, n.drug_id AS drug_id LIMIT 20",
          { query}
        );
        const result_swiss_name = await session.run(
          "MATCH (n:Protein) WHERE toLower(n.swiss) STARTS WITH toLower($query) and ("+project_id_cipher+ ") RETURN n.swiss AS name, head(labels(n)) AS ntype, n.uid AS uid, n.drug_id AS drug_id LIMIT 20",
          { query}
        );
        let lowerCaseString = query.toLowerCase();
        var coss_string = query
        if (lowerCaseString.startsWith("coss") && lowerCaseString.length > 4) {
          coss_string = lowerCaseString.slice(4);
        } 
        const result_coss_name = await session.run(
          "MATCH (n:Cell_Line) WHERE toString(n.COSMIC_ID) STARTS WITH $coss_string and ("+project_id_cipher+ ") RETURN 'COSS'+n.COSMIC_ID AS name, head(labels(n)) AS ntype, n.uid AS uid,  n.drug_id AS drug_id LIMIT 20",
          { coss_string}
        );
        const result_chembl_name = await session.run(
          "MATCH (n:Drug) WHERE toLower(n.CHEMBL) STARTS WITH toLower($query) AND ("+project_id_cipher+ ") RETURN n.CHEMBL AS name, head(labels(n)) AS ntype, n.uid AS uid,  n.drug_id AS drug_id LIMIT 20",
          { query}
        );

        var node_names_list = nameToArray(result_node_names);
        var synonyms_names_list = nameToArray(result_synonyms_name);
        var swiss_name_list = nameToArray(result_swiss_name);
        var coss_list = nameToArray(result_coss_name);
        var chembl_list = nameToArray(result_chembl_name);
        var drug_id_list = nameToArray(result_drugid_names);
        const combinedList = [...node_names_list, ...synonyms_names_list, ...swiss_name_list, ...coss_list, ...chembl_list, ...drug_id_list];        
        const uniqueUids = new Set();
        const filteredList = combinedList.filter((element) => {
          if (!uniqueUids.has(element.uid)) {
            uniqueUids.add(element.uid);
            return true;
          }
          return false;
        });
        filteredList.sort((a, b) => a.name.length - b.name.length);
        const resultList = filteredList.slice(0, 8);
        console.log("resultList", filteredList);
        return resultList
      } catch (error) {
        console.error("Error executing the Cypher query:", error);
        return [];
      } finally {
        session.close();
        driver.close();
      }
    }
  }
  /**
   * Handle when a item is selected from the suggestions list
   * @param {*} item 
   */
  const handleItemSelect = (item) => {
    if (item) {
      if(!isGraph){
        setShowMain(1); 
      }
      setUidValue("change");
      setTimeout(() => {
        setUidValue(item.uid);
        setTurnstoneKey(prevKey => prevKey + 1);
      }, 1);
    }

  };
  return (
      <Turnstone
        key={turnstoneKey}
        id='search'
        name='search'
        autoFocus={true}
        typeahead={false}
        clearButton={true}
        debounceWait={250}
        listboxIsImmutable={true}
        maxItems={10}
        noItemsMessage="We couldn't find any data that matches your search"
        placeholder='Find proteins, drugs or cell lines'
        listbox={listbox}
        styles={styles}
        Item={(props) => <Item {...props} isGraph={isGraph} />}
        onSelect={handleItemSelect}
        className='custom-turnstone'
      />    
  )
}
export default SearchBar

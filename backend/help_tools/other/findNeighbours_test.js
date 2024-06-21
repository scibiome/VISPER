const neo4j = require('neo4j-driver');

// Create a driver instance to connect to your Neo4j server
//const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'workwork'));
const nodeType = "Drug";
const searchNodes = ['TW 37'];

const selectedEdgeTypes = ["dataset_1"];

//Find the neighbours for all given nodes and give back a json
const findNeighbours = async(searchNodes,nodeType) => {
    
    //Connect to Neo4j Server
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    const searchNodesString = "[" + searchNodes.map(item => `'${item}'`).join(', ') + "]";
    
    //Query to get for a list of nodes all there target nodes and relationships
    var source = "MATCH (n:"+nodeType+")\nWHERE n.name IN "+searchNodesString + "\nWITH COLLECT(n) AS source\nUNWIND source as node";
    var edge = `\nMATCH (node)-[r${selectedEdgeTypes.length > 0 ? ":" + selectedEdgeTypes.join("|") : ""}]-(connectedNode)\nWITH COLLECT(DISTINCT node) + COLLECT(DISTINCT connectedNode) AS nodes, COLLECT(r) as relationships`;
    var apoc = "\nCALL apoc.export.json.data(nodes, relationships, null, {stream: true})\nYIELD data\nRETURN data"
    var query = source + edge+apoc;
    console.log(query)
    
    // get query
    const result = await session.run(query);

    //close session and connection
    session.close();
    driver.close();
    const jsonData = result.records[0].get("data");
    const jsonObjects = jsonData.split('\n').map(JSON.parse);

    
    const graphData = {
        nodes: [],
        edges: []
      };
    const nodeData = [];
    const edgeData = []; 
    for (const jsonElement of jsonObjects){
        if(jsonElement.type == 'node'){
            console.log(jsonElement)
            const dataObject = {
                data: {
                  id: jsonElement.id,
                  label: jsonElement.labels
                }
              };
            nodeData.push(dataObject);
        }else{
            //console.log(jsonElement);
            const dataObject = {
                data: {
                  id: jsonElement.id,
                  label: jsonElement.labels,
                  source: jsonElement.start.id,
                  target: jsonElement.end.id

                }
              };
              edgeData.push(dataObject);
        }        
    }

    for (const data of nodeData) {
        graphData.nodes.push({ data });
      }

      for (const data of edgeData) {
        graphData.edges.push({ data });
      }
    //console.log(JSON.stringify(graphData, null, 2));

}

const networkSearch = async(searchNodes) => {
    findNeighbours();
    var query ="MATCH (n"+nodeType+""
}; 
findNeighbours(["TW 37"], "Drug")
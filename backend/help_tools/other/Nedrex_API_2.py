import json
import requests
###################
# Nedrex API Test #
###################
query = "MATCH (n:Protein) WHERE n.displayName = 'PITH1_HUMAN' RETURN n LIMIT 25"
query = """MATCH (p:Protein {displayName: 'PITH1_HUMAN'})-[r]-()
RETURN DISTINCT type(r) AS RelationshipType, p, r
LIMIT 25
"""
url = "http://api.nedrex.net/neo4j/query"
response = requests.get(url, params={"query":query}, stream=True)
for line in response.iter_lines():
    print(json.loads(line.decode()))
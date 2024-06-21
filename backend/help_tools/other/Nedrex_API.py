import json
import requests
query = "MATCH (n) RETURN n LIMIT 25"
url = "http://nedrex-api.zbh.uni-hamburg.de/neo4j/query"
response = requests.get(url, params={"query":query}, stream=True)
for line in response.iter_lines():
    print(json.loads(line.decode()))
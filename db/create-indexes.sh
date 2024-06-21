#!/bin/bash

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.name);'
do
  echo "0"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.name);'
do
  echo "1"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.name);'
do
  echo "2"
  sleep 10
done


until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.uid);'
do
  echo "3"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.uid);'
do
  echo "4"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.uid);'
do
  echo "5"
  sleep 10
done


until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.drug_id);'
do
  echo "6"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.CHEMBL);'
do
  echo "7"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.COSMIC_ID);'
do
  echo "8"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.swiss);'
do
  echo "9"
  sleep 10
done

until cypher-shell -u neo4j -p workwork 'CALL gds.graph.project("graph", "Protein", {PPI: {orientation: "UNDIRECTED"}})'
do
  echo "10"
  sleep 10
done
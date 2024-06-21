# Use the official Neo4j image as the base
FROM neo4j:5.12.0-community

# Copy your data into the image
COPY ./data /data

# Copy your plugins into the image
COPY ./plugins /plugins

# Copy your log configuration into the image
COPY ./logs /logs


COPY ./conf /conf
# Ensure the correct ownership and permissions
RUN chown -R neo4j:neo4j /data /plugins /logs /conf
RUN ln -sf /conf /var/lib/neo4j/conf
# Set the environment variables to point to the correct directories
ENV NEO4J_dbms_directories_data=/data
ENV NEO4J_dbms_directories_plugins=/plugins
ENV NEO4J_dbms_directories_logs=/logs

# Set the entrypoint to start Neo4j
CMD ["neo4j"]

#RUN apt-get update && apt-get install -y procps

#COPY create-indexes.sh create-indexes.sh
#COPY wrapper.sh wrapper.sh
#VOLUME /cyphers
#ENTRYPOINT ["./wrapper.sh"]
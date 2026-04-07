import os
import duckdb
import pandas as pd
import networkx as nx
import community as community_louvain
import json


DB_PATH = "../Data/posts.duckdb"
OUTPUT_DIR = "../Data"

def build_author_network():
    print("Connecting to DuckDB to build the Author Network...")
    conn = duckdb.connect(DB_PATH)
    
    query = """
        SELECT author, domain, score, created_utc 
        FROM posts 
        WHERE author IS NOT NULL AND domain IS NOT NULL AND domain != ''
    """
    df = conn.execute(query).fetchdf()
    conn.close()

    print("Constructing graph edges based on shared domains...")
    G = nx.Graph()

    for author, group in df.groupby("author"):
        if str(author) != "nan" and str(author) != "[deleted]":
            G.add_node(
                author,
                post_count=len(group),
                avg_score=float(group["score"].mean()),
                top_domain=str(group["domain"].mode()[0]) if not group["domain"].empty else ""
            )

    df["week"] = pd.to_datetime(df["created_utc"], unit="s").dt.to_period("W")
    domain_week_groups = df.groupby(["domain", "week"])["author"].apply(list)

    for _, authors in domain_week_groups.items():
        unique_authors = list(set([a for a in authors if str(a) not in ("nan", "[deleted]")]))
        for i, a1 in enumerate(unique_authors):
            for a2 in unique_authors[i+1:]:
                if G.has_edge(a1, a2):
                    G[a1][a2]["weight"] += 1
                else:
                    G.add_edge(a1, a2, weight=1)

    edges_to_remove = [(u, v) for u, v, d in G.edges(data=True) if d["weight"] < 2]
    G.remove_edges_from(edges_to_remove)
    
    G.remove_nodes_from(list(nx.isolates(G)))

    print(f"Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")

    print("Calculating Centrality and Communities...")
    pagerank = nx.pagerank(G, alpha=0.85)
    communities = community_louvain.best_partition(G)

    nodes_data = []
    for n in G.nodes():
        nodes_data.append({
            "id": n,
            "post_count": G.nodes[n].get("post_count", 0),
            "top_domain": G.nodes[n].get("top_domain", ""),
            "pagerank": pagerank.get(n, 0),
            "community": communities.get(n, 0)
        })

    edges_data = [{"source": u, "target": v, "weight": d["weight"]} for u, v, d in G.edges(data=True)]

    graph_payload = {"nodes": nodes_data, "edges": edges_data}
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, "network_graph.json")
    
    with open(out_path, "w") as f:
        json.dump(graph_payload, f)
        
    print(f"Network Graph successfully saved to {out_path}!")

if __name__ == "__main__":
    build_author_network()
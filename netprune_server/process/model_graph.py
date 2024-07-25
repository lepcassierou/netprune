class ModelGraph():
    def __init__(self, node_list, detailed_nodes, edges_dict):
        self._node_list = node_list
        self._detailed_nodes = detailed_nodes
        self._edges_dict = edges_dict


    def get_parent(self, x):
        if x not in self._node_list:
            raise ValueError("The specified node does not exist in the graph")
        
        for edge in self._edges_dict:
            if x == edge['target']:
                return edge['source']
        return None

    
    def get_children(self, x):
        if x not in self._node_list:
            print(x, self._node_list)
            raise ValueError("The specified node does not exist in the graph")

        children = []
        for edge in self._edges_dict:
            if x == edge['source']:
                children.append(edge['target'])
        return children

    
    def get_type(self, x):
        for node in self._detailed_nodes:
            if node['_id'] == x:
                return node['type']
        return None


    def get_real_name(self, x):
        for node in self._detailed_nodes:
            if node['_id'] == x:
                return node['name']
        return None

    
    def remove_activation_layers_from_model_graph(self):
        nodes_list = []
        edges_dict = []
        activation_parent_map = {}

        for node in self._node_list:
            for d_node in self._detailed_nodes:
                if d_node['_id'] == node:
                    if d_node['type'] == "Activation":
                        activation_parent_map[node] = self.get_parent(node)
                    else:
                        nodes_list.append(node)

        for edge in self._edges_dict:
            s = edge['source']
            t = edge['target']
            if s in activation_parent_map:
                edges_dict.append({
                    "source": activation_parent_map[s],
                    "target": t,
                })
            elif t not in activation_parent_map:
                edges_dict.append(edge)

        self._node_list = nodes_list
        self._edges_dict = edges_dict
        return nodes_list, edges_dict
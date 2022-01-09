class DataObject:
    def __init__(self):
        self.data = None        # type: np.array or None
        self.coords = None      # type: np.array or None
        self.clustering = None  # type: np.array or None


def compute_tree(data:List[DataObject], depth, max_depth, perplexities, distance_threshold):
    """
    Recursively computes the t-SNEs and clusterings for all values and updates the data objects in the list
    :param data: All datapoints to compute in a list
    :param depth: The current depth
    :param max_depth: The maximal depth to compute
    :param perplexities: A list of perplexity values for different depths
    :param distance_threshold: A list of distance thresholds for different depths
    """

    # Compute the t-SNE
    t = TSNE(
        perplexity=perplexities[depth],
        metric="cosine",
        early_exaggeration=25,
        n_jobs=8,
        random_state=42,
    )
    data.coords  = t.fit(data.features)

    # Compute the clustering
    data.clustering = AgglomerativeClustering(
        linkage="ward",
        n_clusters=None,
        distance_threshold=distance_threshold[depth]).fit(data.coords)

    # Recursion
    if depth < max_depth:
        for lbl in set(data.clustering):
            compute_tree(
                data=[data[i] for i in np.where(data.clustering == lbl)],
                depth=depth + 1,
                max_depth=max_depth,
                perplexities=perplexities,
                distance_threshold=distance_threshold)



using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EdgeController : MonoBehaviour
{
    private LineRenderer lineRenderer;

    public Transform source;
    public Transform target;

    public Dictionary<string, object> attributes = new Dictionary<string, object>();

    private void Awake()
    {
        source = null;
        target = null;
        lineRenderer = GetComponent<LineRenderer>();
    }

    // Start is called before the first frame update
    void Start()
    {
        
    }

    public void UpdateEdge()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (source == null || target == null) return;

        if ((lineRenderer.GetPosition(0) - source.position - source.transform.up * source.localScale.y).magnitude < 0.01f) return;

        lineRenderer.SetPositions(new Vector3[] { source.position - source.transform.up * source.localScale.y, target.position - target.transform.up * target.localScale.y });
    }
}

using System.Collections;
using System.Collections.Generic;
using UnityEngine;



public class NodeController : MonoBehaviour
{
    public Vector3 destination;

    private int screenWidth = 0;
    private int screenHeight = 0;

    private float panX = 0.0f;
    private float panY = 0.0f;
    private float panK = 1.0f;

    private readonly float speed = 2.5f;

    public Transform screen;

    float offset = 0.0f;
    float height = 0.1f;

    private MeshRenderer meshRenderer;

    Vector3 normDestination;

    public Dictionary<string, object> attributes = new Dictionary<string , object>();

    private void Awake()
    {
        meshRenderer = GetComponent<MeshRenderer>();

        if (meshRenderer == null)
        {
            Debug.Log("HELP!");
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        //screen = null;
        //destination = transform.position;
        //offset = Random.Range(0.0f, 1.0f);
        offset = 0.0f;
        normDestination = transform.position;
    }

    public void UpdateScreenPosition(int width, int height)
    {
        screenWidth = width;
        screenHeight = height;

        UpdatePosition();
    }

    public void UpdatePan(float x, float y, float k)
    {
        panX = x;
        panY = y;
        panK = k;

        UpdatePosition();
    }

    public void SetOffset(float newOffset)
    {
        Debug.Log(newOffset);
        offset = newOffset;

        UpdatePosition();
    }

    public void SetHeight(float newHeight)
    {
        Debug.Log(newHeight);
        if (height < 0.0f || height > 1.0f)
        {
            Debug.Log($"Invalid height {newHeight}");

            return;
        }

        height = newHeight;

        UpdatePosition();
    }

    public void SetColour(Color newColor)
    {
        meshRenderer.material.color = new Color(newColor.r, newColor.g, newColor.b, meshRenderer.material.color.a);
    }

    public void SetTransparency(float transparency)
    {
        meshRenderer.material.color = new Color(meshRenderer.material.color.r, meshRenderer.material.color.g, meshRenderer.material.color.b, transparency);
    }

    private void UpdatePosition()
    {
        transform.rotation = screen.rotation;
        transform.Rotate(90, 0, 0);

        var x = (destination.x * panK + panX) / screenWidth;
        var y = -(destination.y * panK + panY) / screenHeight;

        /*(if (x <= 0.0f || x >= 1.0f || y >= 0.0f || y <= -1.0f)
        {
            meshRenderer.enabled = false;

            return;
        }

        meshRenderer.enabled = true;*/

        Debug.Log($"Setting height to {height}, offset to {offset}");
        transform.localScale = new Vector3(0.01f * panK, 0.1f + height, 0.01f * panK);

        normDestination = new Vector3(screen.transform.localPosition.x - 0.5f * screen.localScale.x + x * screen.localScale.x,
            screen.localPosition.y + screen.localScale.y * 0.5f + y * screen.localScale.y,
            screen.localPosition.z - transform.localScale.y - offset);

    }

    // Update is called once per frame
    void Update()
    {
        if (screenWidth == 0 || screenHeight == 0 || screen == null) return;

        if ((transform.localPosition - normDestination).magnitude < 0.001f) return;

        transform.localPosition = Vector3.MoveTowards(transform.localPosition, normDestination, Time.deltaTime * speed);
    }
}

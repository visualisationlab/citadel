using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using NativeWebSocket;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Linq;
public enum NodeMappingType
{
    Offset,
    Height,
    Color,
    Transparency
}

public enum EdgeMappingType
{
    Width,
    Color,
    Transparency
}

public class User
{
    public string username;
    public string userID;
    public int headsetCount;
    public int width;
    public int height;
    public float panX;
    public float panY;
    public float panK;
}

[System.Serializable]
public class SessionData
{
    public string url;
    public string sessionURL;
    public int graphIndex;
    public int graphIndexCount;
    public User[] users;
    public string expirationDate;
}

[System.Serializable]
public class SessionStateMessage : OutMessage
{
    public string userID;
    public SessionData data;
}

public class Position
{
    public float x;
    public float y;
}

public class Node
{
    public Dictionary<string, object> data;
    public Position position;
}

public class Edge
{
    public Dictionary<string, object> data;
}

[System.Serializable]
public class GraphData
{
    public Node[] nodes;
    public Edge[] edges;
}

[System.Serializable]
public class DataStateMessage : OutMessage
{
    public string userID;
    public GraphData data;
}

[System.Serializable]
public class OutMessage
{
    public string sessionID;
    public string sessionState;
    public string type;
}

[System.Serializable]
public class PanData
{
    public float x;
    public float y;
    public float k;
}

[System.Serializable]
public class PanStateMessage : OutMessage
{
    public PanData data;
}

public enum ObjectType
{
    Node,
    Edge
}

public class VisualisationParameters
{
    public ObjectType objectType;
    public NodeMappingType nodeMappingType;
    public EdgeMappingType edgeMappingType;
    public string objectAttribute;
}

public class MappingParameters
{
    public string attribute;
    public AttributeType attributeType;
    public double minDouble;
    public double maxDouble;
    public System.DateTime minDate;
    public System.DateTime maxDate;
}

public enum AttributeType
{
    Unknown,
    Double,
    Int,
    Date,
    String
}

public class SessionManager : MonoBehaviour
{
    public delegate void UpdateSessionState(SessionData sessionData);
    public event UpdateSessionState updateSessionState;

    public delegate void UpdateVisualisation(VisualisationParameters visualisationParameters);
    public event UpdateVisualisation updateVisualisation;

    public delegate void UpdateNodeAttributes(string[] nodeAttributes);
    public event UpdateNodeAttributes updateNodeAttributes;

    private HashSet<NodeMappingType> nodeMappings = new HashSet<NodeMappingType>();
    private HashSet<EdgeMappingType> edgeMappings = new HashSet<EdgeMappingType>();

    private Dictionary<NodeMappingType, MappingParameters> nodeMappingParameters = new Dictionary<NodeMappingType, MappingParameters>();
    private Dictionary<EdgeMappingType, MappingParameters> edgeMappingParameters = new Dictionary<EdgeMappingType, MappingParameters>();

    [SerializeField]
    private WindowManager windowManager;

    [SerializeField]
    private GameObject handMenu;

    [SerializeField]
    private GameObject qrCodesManager;

    [SerializeField]
    private GameObject nodeParent;

    [SerializeField]
    private GameObject edgeParent;

    [SerializeField]
    private GameObject nodePrefab;

    [SerializeField]
    private GameObject edgePrefab;

    [SerializeField]
    private GameObject screen;

    [SerializeField]
    private TMPro.TextMeshPro errorText;

    private MeshRenderer screenRenderer;

    WebSocket websocket;

    private Stack<GameObject> nodePool;
    private Dictionary<string, GameObject> nodeDictionary;

    private Stack<GameObject> edgePool;
    private Stack<GameObject> edgeStack;

    private string connectedUserID = null;

    private int width = 0;
    private int height = 0;

    private float panX = 0.0f;
    private float panY = 0.0f;
    private float panK = 1.0f;

    // Start is called before the first frame update
    void Start()
    {
        websocket = null;

        width = 0;
        height = 0;

        screenRenderer = screen.GetComponent<MeshRenderer>();
    }
    async Task<DataStateMessage> ParseDataMessage(string messageString)
    {
        DataStateMessage message = null;

        await Task.Run(() =>
        {
            message = JsonConvert.DeserializeObject<DataStateMessage>(messageString);
        });

        return message;
    }

    private void UpdateErrorText(string message)
    {
        errorText.text = errorText.text + "\n" + message;
    }

    private AttributeType GetAttributeType(object attribute)
    {
        Debug.Log(attribute.ToString());
        if (System.DateTime.TryParse(attribute as string, out _))
        {
            return AttributeType.Date;
        }

        if (double.TryParse(attribute.ToString(), out double _))
        {
            return AttributeType.Double;
        }

        return AttributeType.String;
    }

    private MappingParameters GetMappingParameters(ObjectType objectType, string attribute)
    {
        AttributeType attributeType = AttributeType.Unknown;
        double minDouble = double.MaxValue;
        double maxDouble = double.MinValue;

        System.DateTime minDate = System.DateTime.MaxValue;
        System.DateTime maxDate = System.DateTime.MinValue;

        object[] values = { };

        switch (objectType)
        {
            case ObjectType.Node:
                values = (from value in nodeDictionary.Values select value.GetComponent<NodeController>().attributes[attribute]).ToArray();
                break;
            case ObjectType.Edge:
                values = (from value in nodeDictionary.Values select value.GetComponent<EdgeController>().attributes[attribute]).ToArray();
                break;
        }

        var mappingParameters = new MappingParameters
        {
            attributeType = attributeType,
            attribute = attribute
        };

        foreach (object value in values)
        {
            if (value == null) continue;
            
            if (attributeType == AttributeType.Unknown)
            {
                attributeType = GetAttributeType(value);
            }



            switch (attributeType)
            {
                case AttributeType.String:
                    continue;
                /*case AttributeType.Int:
                    if (int.TryParse((string)value, out int intResult))
                    {
                        if (intResult < (int)minValue)
                        {
                            minValue = intResult;
                            break;
                        }

                        if (intResult > (int)maxValue)
                        {
                            maxValue = intResult;
                            break;
                        }
                    }
                    break;*/
                case AttributeType.Double:
                    if (double.TryParse(value.ToString(), out double doubleResult))
                    {
                        if (doubleResult < minDouble)
                        {
                            mappingParameters.minDouble = doubleResult;
                            break;
                        }

                        if (doubleResult > maxDouble)
                        {
                            mappingParameters.maxDouble = doubleResult;
                            break;
                        }
                    }
                    break;
                case AttributeType.Date:
                    if (System.DateTime.TryParse(value.ToString(), out System.DateTime dateResult))
                    {
                        if (dateResult < minDate)
                        {
                            mappingParameters.minDate = dateResult;
                            break;
                        }

                        if (dateResult > maxDate)
                        {
                            mappingParameters.maxDate = dateResult;
                            break;
                        }
                    }
                    break;
            }
        }

        return mappingParameters;
    }

    private void UpdateNodeMappings(MappingParameters mappingParameters, VisualisationParameters visualisationParameters)
    {
        foreach (var node in nodeDictionary.Values)
        {
            var nodeController = node.GetComponent<NodeController>();

            var value = nodeController.attributes[mappingParameters.attribute];

            double finalVal = 0.0f;

            switch (mappingParameters.attributeType)
            {
                case AttributeType.String:
                    break;
                case AttributeType.Double:
                    if (double.TryParse(value.ToString(), out double doubleResult))
                    {
                        finalVal = (mappingParameters.maxDouble - doubleResult) / (mappingParameters.maxDouble - mappingParameters.minDouble);
                    }
                    break;
                case AttributeType.Date:
                    if (System.DateTime.TryParse(value.ToString(), out System.DateTime result))
                    {
                        finalVal = (result.Ticks - mappingParameters.minDate.Ticks) / (mappingParameters.maxDate.Ticks - mappingParameters.minDate.Ticks);
                    }
                    
                    break;
            }

            switch (visualisationParameters.nodeMappingType)
            {
                case NodeMappingType.Transparency:
                    nodeController.SetTransparency((float)finalVal);
                    break;
                case NodeMappingType.Height:
                    nodeController.SetHeight((float)finalVal);
                    break;
                case NodeMappingType.Color:
                    nodeController.SetColour(new Color((float)finalVal, 0.0f, 0.0f));
                    break;
                case NodeMappingType.Offset:
                    nodeController.SetOffset((float)finalVal);
                    break;
            }
        }
    }

    private void UpdateEdgeMappings()
    {

    }

    public void SetVisualisationMapping(VisualisationParameters visualisationParameters)
    {
        switch (visualisationParameters.objectType)
        {
            case ObjectType.Node:
                if (!nodeMappings.Contains(visualisationParameters.nodeMappingType)) {
                    nodeMappings.Add(visualisationParameters.nodeMappingType);
                }

                Debug.Log($"Setting {visualisationParameters.objectAttribute}");
                nodeMappingParameters[visualisationParameters.nodeMappingType] = GetMappingParameters(visualisationParameters.objectType, visualisationParameters.objectAttribute);

                UpdateNodeMappings(nodeMappingParameters[visualisationParameters.nodeMappingType], visualisationParameters);

                break;
            case ObjectType.Edge:
                if (!edgeMappings.Contains(visualisationParameters.edgeMappingType)) {
                    edgeMappings.Add(visualisationParameters.edgeMappingType);
                }

                edgeMappingParameters[visualisationParameters.edgeMappingType] = GetMappingParameters(visualisationParameters.objectType, visualisationParameters.objectAttribute);

                UpdateEdgeMappings();

                break;
        }

        updateVisualisation(visualisationParameters);
    }

    public async void Connect(string URL, string port, string sid, string headsetKey, string userID, Transform qrCode)
    {
        UpdateErrorText("Connecting");
        websocket = new WebSocket($"ws://{URL}:{port}?sid={sid}&headsetKey={headsetKey}&userID={userID}");

        websocket.OnOpen += () =>
        {
            connectedUserID = userID;

            nodePool = new Stack<GameObject>();
            nodeDictionary = new Dictionary<string, GameObject>();

            edgePool = new Stack<GameObject>();
            edgeStack = new Stack<GameObject>();

            transform.localRotation = qrCode.rotation;

            screen.transform.localScale = qrCode.localScale;

            transform.localPosition = new Vector3(qrCode.position.x, qrCode.position.y, qrCode.position.z);

            for (int i = 0; i < 1000; i++)
            {
                var newNode = Instantiate(nodePrefab, nodeParent.transform);

                newNode.GetComponent<NodeController>().screen = screen.transform;
                nodePool.Push(newNode);

                newNode.SetActive(false);
            }

            for (int i = 0; i < 1000; i++)
            {
                var newEdge = Instantiate(edgePrefab, edgeParent.transform);

                edgePool.Push(newEdge);
                newEdge.SetActive(false);
            }

            qrCodesManager.SetActive(false);
            handMenu.SetActive(true);
        };

        websocket.OnClose += (e) =>
        {
            foreach (Transform transform in edgeParent.transform)
            {
                Destroy(transform.gameObject);
            }

            edgePool.Clear();
            edgeStack.Clear();

            foreach (Transform transform in nodeParent.transform)
            {
                Destroy(transform.gameObject);
            }

            nodeDictionary.Clear();
            nodePool.Clear();

            width = 0;
            height = 0;

            screen.transform.localPosition = Vector3.zero;
            screen.transform.position= Vector3.zero;
            transform.position = Vector3.zero;
            transform.localPosition = Vector3.zero;
            transform.localRotation = Quaternion.identity;
            transform.rotation = Quaternion.identity;
            screen.transform.rotation = Quaternion.identity;
            screen.transform.localRotation = Quaternion.identity;
            screen.transform.localScale = Vector3.one;

            qrCodesManager.SetActive(true);
            handMenu.SetActive(false);
        };

        websocket.OnMessage += async (bytes) =>
        {
            var messageString = System.Text.Encoding.UTF8.GetString(bytes);

            var message = JsonUtility.FromJson<OutMessage>(messageString);

            switch (message.type)
            {
                case "pan":
                    var panMessage = JsonConvert.DeserializeObject<PanStateMessage>(messageString);

                    panX = panMessage.data.x;
                    panY = panMessage.data.y;
                    panK = panMessage.data.k;

                    foreach (var node in nodeDictionary.Values)
                    {
                        var nodeController = node.GetComponent<NodeController>();

                        nodeController.screen = screen.transform;
                        nodeController.UpdateScreenPosition(width, height);
                        nodeController.UpdatePan(panX, panY, panK);
                    }

                    break;

                case "session":
                    var sessionMessage = JsonConvert.DeserializeObject<SessionStateMessage>(messageString);
                    UpdateErrorText($"{sessionMessage.data.url}");

                    foreach (var user in sessionMessage.data.users)
                    {
                        if (user.userID == connectedUserID)
                        {
                            if (width == 0 || height == 0)
                            {
                                screen.transform.localScale = new Vector3(screen.transform.localScale.x * (user.width / 400f), screen.transform.localScale.y * (user.height / 400f), 1f);
                                screen.transform.localPosition += new Vector3(-qrCode.transform.localScale.x * 0.5f + screen.transform.localScale.x * 0.5f, 
                                    qrCode.transform.localScale.y * 0.5f - screen.transform.localScale.y * 0.5f, 0f);

                                screen.transform.localPosition += new Vector3(-(screen.transform.localScale.x / user.width) * 10.0f,
                                    (screen.transform.localScale.y / user.height) * 10.0f, 0.0f);
                            }

                            width = user.width;
                            height = user.height;

                            panX = user.panX;
                            panY = user.panY;
                            panK = user.panK;
                        }
                    }

                    foreach (var node in nodeDictionary.Values)
                    {
                        node.GetComponent<NodeController>().UpdateScreenPosition(width, height);
                        node.GetComponent<NodeController>().UpdatePan(panX, panY, panK);
                    }

                    updateSessionState.Invoke(sessionMessage.data);

                    break;

                case "data":
                    var graphStateMessage = await ParseDataMessage(messageString);

                    foreach (var node in nodeDictionary.Values)
                    {
                        nodePool.Push(node);
                        node.SetActive(false);
                    }

                    nodeDictionary.Clear();

                    foreach (var edge in edgeStack)
                    {
                        edge.SetActive(false);
                        edgePool.Push(edge);
                    }

                    edgeStack.Clear();

                    if (graphStateMessage.data.nodes.Length > 0)
                    {
                        updateNodeAttributes(graphStateMessage.data.nodes[0].data.Keys.ToArray());
                    }

                    foreach (var node in graphStateMessage.data.nodes)
                    {
                        if (nodePool.Count == 0)
                        {
                            for (int i = 0; i < 1000; i++)
                            {
                                var newNode = Instantiate(nodePrefab, nodeParent.transform);

                                newNode.GetComponent<NodeController>().screen = screen.transform;
                                nodePool.Push(newNode);

                                newNode.SetActive(false);
                            }
                        }

                        var nodeObject = nodePool.Pop();

                        var nodeController = nodeObject.GetComponent<NodeController>();

                        nodeController.attributes.Clear();
                        
                        nodeController.attributes = new Dictionary<string, object>(node.data);

                        nodeController.screen = screen.transform;

                        nodeController.UpdateScreenPosition(width, height);
                        nodeController.UpdatePan(panX, panY, panK);

                        nodeController.destination = new Vector3(node.position.x, node.position.y, 0);
                        nodeObject.SetActive(true);

                        nodeDictionary[node.data["id"] as string] = nodeObject;
                    }

                    foreach (var edge in graphStateMessage.data.edges)
                    {
                        if (edgePool.Count == 0)
                        {
                            for (int i = 0; i < 1000; i++)
                            {
                                var newEdge = Instantiate(edgePrefab, edgeParent.transform);

                                edgePool.Push(newEdge);
                                newEdge.SetActive(false);
                            }
                        }

                        var edgeObject = edgePool.Pop();

                        var edgeController = edgeObject.GetComponent<EdgeController>();

                        edgeController.attributes.Clear();
                        edgeController.attributes = edge.data;
                        edgeController.source = nodeDictionary[edge.data["source"] as string].transform;
                        edgeController.target = nodeDictionary[edge.data["target"] as string].transform;
                        edgeObject.SetActive(true);
                        edgeController.UpdateEdge();
                    }

                    break;
                default:
                    Debug.Log("Default");
                    break;
            }
        };

        await websocket.Connect();
    }

    public async void Disconnect()
    {
        windowManager.CloseAllWindows();
        await websocket.Close();
    }

    void Update()
    {
        if (websocket == null) return;

#if !UNITY_WEBGL || UNITY_EDITOR
        websocket.DispatchMessageQueue();
#endif
    }
}

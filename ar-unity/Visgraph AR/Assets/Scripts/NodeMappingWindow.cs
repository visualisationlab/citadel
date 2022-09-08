using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Microsoft.MixedReality.Toolkit.Utilities;
using Microsoft.MixedReality.Toolkit.UI;
using TMPro;

public class NodeMappingWindow : MonoBehaviour
{
    [SerializeField]
    private GridObjectCollection mappingCollection;

    [SerializeField]
    private ScrollingObjectCollection scrollingObjectCollection;

    private Dictionary<NodeMappingType, string> mappingDescriptions = new Dictionary<NodeMappingType, string>();

    public NodeMappingType value;

    [SerializeField]
    private GameObject buttonPrefab;

    [SerializeField]
    private TextMeshPro titleComponent;

    [SerializeField]
    private TextMeshPro descriptionComponent;

    [SerializeField]
    private SessionManager sessionManager;

    [SerializeField]
    private TextMeshPro configureButtonLabel;

    [SerializeField]
    private WindowManager windowManager;

    private Dictionary<NodeMappingType, string> mappings = new Dictionary<NodeMappingType, string>();

    private void Awake()
    {
        mappingDescriptions[NodeMappingType.Color] = "Sets the node colours based on an integer or float attribute";
        mappingDescriptions[NodeMappingType.Height] = "Sets the node height based on an integer or float attribute";
        mappingDescriptions[NodeMappingType.Offset] = "Sets the node offset from the screen based on an integer or float attribute";
        mappingDescriptions[NodeMappingType.Transparency] = "Sets the node transparency/opacity based on an integer or float attribute";
        
        sessionManager.updateVisualisation += UpdateGUI;
    }

    private void OnDestroy()
    {
        sessionManager.updateVisualisation -= UpdateGUI;
    }

    void OnEnable()
    {

        foreach (var mapping in System.Enum.GetNames(typeof(NodeMappingType)))
        {
            var mappingButton = Instantiate(buttonPrefab, mappingCollection.transform);

            mappingButton.GetComponent<ButtonConfigHelper>().MainLabelText = mapping;
            mappingButton.GetComponent<ListButton>().buttonText = mapping;
            mappingButton.GetComponent<ListButton>().clickAction += OnClick;
        }

        mappingCollection.UpdateCollection();
        scrollingObjectCollection.AddContent(scrollingObjectCollection.gameObject);
    }

    private void OnClick(string nodeMappingString)
    {
        if (System.Enum.TryParse(nodeMappingString, out NodeMappingType result))
        {
            titleComponent.text = nodeMappingString;

            descriptionComponent.text = mappingDescriptions[value];

            if (mappings[result] == null)
            {
                configureButtonLabel.text = "None";

                return;
            }

            configureButtonLabel.text = mappings[result];
        }
    }

    public void OnClickConfigure()
    {
        windowManager.PushWindow(WindowID.ConfigureNodeMapping);
    }

    private void UpdateGUI(VisualisationParameters visualisationParameters)
    {
        if (visualisationParameters.objectType == ObjectType.Edge) return;

        mappings[visualisationParameters.nodeMappingType] = visualisationParameters.objectAttribute;

        if (value == visualisationParameters.nodeMappingType)
        {
            configureButtonLabel.text = visualisationParameters.objectAttribute;
        }
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}

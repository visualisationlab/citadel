using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Microsoft.MixedReality.Toolkit.Utilities;
using Microsoft.MixedReality.Toolkit.UI;
using TMPro;
public class ConfigureNodeMapping : MonoBehaviour
{
    [SerializeField]
    private GridObjectCollection mappingCollection;

    [SerializeField]
    private ScrollingObjectCollection scrollingObjectCollection;

    [SerializeField]
    private GameObject buttonPrefab;

    [SerializeField]
    private SessionManager sessionManager;

    [SerializeField]
    private WindowManager windowManager;

    [SerializeField]
    private NodeMappingWindow mappingWindow;

    [SerializeField]
    private Window window;

    private string[] nodeAttributes;

    private void Awake()
    {
        sessionManager.updateNodeAttributes += UpdateNodeAttributes;
    }

    private void OnDestroy()
    {
        sessionManager.updateNodeAttributes -= UpdateNodeAttributes;
    }

    private void UpdateNodeAttributes(string[] attributes)
    {
        Debug.Log(attributes);
        nodeAttributes = attributes;

        foreach (var attribute in nodeAttributes)
        {
            var mappingButton = Instantiate(buttonPrefab, mappingCollection.transform);

            mappingButton.GetComponent<ButtonConfigHelper>().MainLabelText = attribute;
            mappingButton.GetComponent<ListButton>().buttonText = attribute;
            mappingButton.GetComponent<ListButton>().clickAction += OnClick;
        }

        mappingCollection.UpdateCollection();
        scrollingObjectCollection.AddContent(scrollingObjectCollection.gameObject);
    }

    void OnEnable()
    {
        
    }

    private void OnClick(string buttonText)
    {
        VisualisationParameters visualisationParameters = new VisualisationParameters();

        visualisationParameters.objectType = ObjectType.Node;
        visualisationParameters.nodeMappingType = mappingWindow.value;
        visualisationParameters.objectAttribute = buttonText;

        sessionManager.SetVisualisationMapping(visualisationParameters);

        window.Close();
    }
}

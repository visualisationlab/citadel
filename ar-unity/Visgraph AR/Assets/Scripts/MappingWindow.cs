using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Microsoft.MixedReality.Toolkit.Utilities;
using Microsoft.MixedReality.Toolkit.UI;
using TMPro;
public class MappingWindow : MonoBehaviour
{
    [SerializeField]
    private GridObjectCollection mappingCollection;

    [SerializeField]
    private ScrollingObjectCollection scrollingObjectCollection;

    private string[] mappings = { "Colour", "Height", "Z-Position", "Transparency"};

    [SerializeField]
    private GameObject buttonPrefab;

    [SerializeField]
    private TextMeshPro titleComponent;

    [SerializeField]
    private TextMeshPro descriptionComponent;

    // Start is called before the first frame update
    void OnEnable()
    {
        //mappingCollection = gameObject.transform.Find("GridObjectCollection").transform.GetComponent<GridObjectCollection>();

        foreach (var mapping in mappings)
        {
            var mappingButton = Instantiate(buttonPrefab, mappingCollection.transform);

            mappingButton.GetComponent<ButtonConfigHelper>().MainLabelText = mapping;
            mappingButton.GetComponent<ListButton>().buttonText = mapping;
            mappingButton.GetComponent<ListButton>().clickAction += OnClick;
        }

        mappingCollection.UpdateCollection();
        scrollingObjectCollection.AddContent(scrollingObjectCollection.gameObject);
    }

    private void OnClick(string buttonText)
    {
        titleComponent.text = buttonText;

        descriptionComponent.text = $"Description for {buttonText}";
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}

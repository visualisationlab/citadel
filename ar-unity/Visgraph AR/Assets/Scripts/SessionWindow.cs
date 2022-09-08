using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Microsoft.MixedReality.Toolkit.Utilities;
using Microsoft.MixedReality.Toolkit.UI;
using TMPro;
using Newtonsoft.Json;



public class SessionWindow : MonoBehaviour
{
    [SerializeField]
    private GameObject buttonPrefab;

    [SerializeField]
    private TextMeshPro sessionURL;

    [SerializeField]
    private TextMeshPro timelineState;

    [SerializeField]
    private TextMeshPro sessionState;

    [SerializeField]
    private TextMeshPro expirationState;

    [SerializeField]
    private SessionManager sessionManager;

    private void OnEnable()
    {
        Debug.Log("Here Session");
        sessionManager.updateSessionState += UpdateValues;
    }

    void UpdateValues(SessionData sessionData)
    {
        sessionURL.text = $"Session URL: {sessionData.sessionURL}";
        timelineState.text = $"Timeline: {sessionData.graphIndex + 1} / {sessionData.graphIndexCount}";
        //sessionState.text = $"Session state: {sessionData.sessionState}";
        
        expirationState.text = $"Expires in: {sessionData.expirationDate}";
    }

    private void OnDisable()
    {
        sessionManager.updateSessionState -= UpdateValues;
    }


    // Update is called once per frame
    void Update()
    {
    }
}

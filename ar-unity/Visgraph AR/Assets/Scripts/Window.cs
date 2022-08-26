using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum WindowID
{
    NodeMapping,
    EdgeMapping,
    Session
}

public class Window : MonoBehaviour
{
    public delegate void CloseWindow();
    public event CloseWindow closeWindow;

    [SerializeField]
    public WindowID windowID;

    [SerializeField]
    private string WindowTitle;

    private void Start()
    {
        gameObject.transform.Find("Title").gameObject.GetComponent<TMPro.TextMeshPro>().text = WindowTitle;
    }

    public void Close()
    {
        closeWindow();
        gameObject.SetActive(false);
    }
}

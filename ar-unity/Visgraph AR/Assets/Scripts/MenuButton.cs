using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MenuButton : MonoBehaviour
{
    [SerializeField]
    private WindowID window;

    [SerializeField]
    private WindowManager windowManager;

    public void Start()
    {
        if (windowManager == null)
        {
            Debug.LogError($"Menu button for {window} missing windowmanager");
        }
    }
    public void OpenWindow()
    {
        windowManager.PushWindow(window);
    }
}

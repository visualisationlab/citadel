using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WindowManager : MonoBehaviour
{
    private Stack<Window> windows = new Stack<Window>();

    [SerializeField]
    private GameObject windowParent;

    private void PopWindow()
    {
        Debug.Log("Popping window");

        var prevWindow = windows.Pop();

        prevWindow.closeWindow -= PopWindow;

        foreach (Transform child in prevWindow.transform)
        {
            child.gameObject.SetActive(false);
        }

        if (windows.Count > 0)
        {
            windows.Peek().closeWindow += PopWindow;

            foreach (Transform child in windows.Peek().transform)
            {
                child.gameObject.SetActive(true);
            }
        }

        
    }

    public void CloseAllWindows()
    {
        while (windows.Count > 0)
        {
            windows.Peek().Close();
        }
    }

    public void PushWindow(WindowID windowID)
    {
        Debug.Log("Pushing window");
        foreach (Transform window in windowParent.transform)
        {
            var windowScript = window.GetComponent<Window>();

            if (windowScript.windowID == windowID)
            {
                if (windowScript.windowID == WindowID.NodeMapping || windowScript.windowID == WindowID.EdgeMapping || windowScript.windowID == WindowID.Session)
                {
                    CloseAllWindows();
                }

                if (windows.Count > 0)
                {
                    windows.Peek().closeWindow -= PopWindow;
                }

                windows.Push(windowScript);

                windowScript.closeWindow += PopWindow;

                foreach (Transform child in window.transform)
                {
                    child.gameObject.SetActive(true);
                }

                return;
            }
            else
            {
                foreach (Transform child in window.transform)
                {
                    child.gameObject.SetActive(false);
                }
            }
        }
    }
}

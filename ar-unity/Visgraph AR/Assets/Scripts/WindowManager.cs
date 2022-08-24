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

        if (windows.Count > 0)
        {
            windows.Peek().gameObject.SetActive(true);
        }
    }

    private void CloseAllWindows()
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
                if (windowScript.windowID == WindowID.NodeMapping || windowScript.windowID == WindowID.EdgeMapping)
                {
                    CloseAllWindows();
                }

                windows.Push(windowScript);

                windowScript.closeWindow += PopWindow;

                window.gameObject.SetActive(true);

                return;
            }
        }
    }
}

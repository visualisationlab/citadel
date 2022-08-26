using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using NativeWebSocket;

public struct User
{
    public string username;
    public string userID;
    public int headsetCount;
}
public struct SessionData
{
    public string URL;
    public string sessionURL;
    public int graphIndex;
    public int graphIndexCount;
    public string expirationDate;
    public string sessionState;
}

public class SessionManager : MonoBehaviour
{
    public delegate void UpdateSessionState(SessionData sessionData);
    public event UpdateSessionState updateSessionState;

    [SerializeField]
    WindowManager windowManager;

    [SerializeField]
    GameObject handMenu;

    WebSocket websocket;

    // Start is called before the first frame update
    void Start()
    {
        websocket = null;        
    }

    public async void Connect(string URL, string port, string sid, string headsetKey, string userID)
    {
        websocket = new WebSocket($"ws://{URL}:{port}?sid={sid}&headsetKey={headsetKey}&userID={userID}");

        websocket.OnOpen += () =>
        {
            handMenu.SetActive(true);
        };

        websocket.OnClose += (e) =>
        {
            handMenu.SetActive(false);
        };

        websocket.OnMessage += (bytes) =>
        {
            var message = System.Text.Encoding.UTF8.GetString(bytes);

            Debug.Log(message);
        };

        await websocket.Connect();
    }

    public async void Disconnect()
    {
        Debug.Log("Disconnecting");
        windowManager.CloseAllWindows();
        await websocket.Close();

    }

    // Update is called once per frame
    void Update()
    {
        
    }
}

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Microsoft.MixedReality.Toolkit.UI;
using UnityEngine.Events;

public class ListButton : MonoBehaviour
{
    public UnityAction<string> clickAction;
    public string buttonText;

    public void OnClick()
    {
        clickAction(buttonText);
        //return transform.GetComponent<ButtonConfigHelper>().MainLabelText;
    }
}

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/**
 * http://json2csharp.com/
 * 
**/

[Serializable]
public class LeaderBoardResponse
{
    public string STATUS;
    public string MESSAGE;
    public string CODE;
    public List<LeaderBoardItem> PAYLOAD;
}

[Serializable]
public class LeaderBoardItem
{
    public string username;
    public string score;
    public string save_date;
}

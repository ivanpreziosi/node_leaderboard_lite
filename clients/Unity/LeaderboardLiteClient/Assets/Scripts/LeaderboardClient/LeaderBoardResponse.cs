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
    public string status;
    public string message;
    public string code;
    public List<LeaderBoardItem> payload;
}

[Serializable]
public class LeaderBoardItem
{
    public string username;
    public string score;
    public string save_date;
}

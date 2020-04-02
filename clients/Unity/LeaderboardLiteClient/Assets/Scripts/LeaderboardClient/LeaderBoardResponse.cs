using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


[Serializable]
public class LeaderBoardResponse
{
    public string status;
    public string message;
    public string code;
    public LeaderBoardItem[] payload;
}

[Serializable]
public class LeaderBoardItem
{
    public string username;
    public int score;
    public string save_date;
}

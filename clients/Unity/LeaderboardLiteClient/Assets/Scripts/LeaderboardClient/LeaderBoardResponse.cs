using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RadFic.LeaderboardClient
{
    [Serializable]
    public class LeaderBoardResponse
    {
        public string status;
        public string message;
        public string code;
        public LeaderBoardItem[] payload;
        public UserData userData;
    }

    [Serializable]
    public class LeaderBoardItem
    {
        public string username;
        public int score;
        public string save_date;
    }

    [Serializable]
    public class UserData
    {
        public string username;
        public string token;
    }
}
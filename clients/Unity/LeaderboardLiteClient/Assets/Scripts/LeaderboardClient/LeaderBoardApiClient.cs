using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class LeaderBoardApiClient : MonoBehaviour
{
    public static LeaderBoardApiClient instance;

    public const string API_URL = "http://localhost:1312/ldb/";

    void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else if (instance != this)
        {
            Destroy(gameObject);
        }

        DontDestroyOnLoad(gameObject);
    }

    public void UploadScore(ILeaderBoardCaller caller, string username = "unknown", string score = "666")
    {
        StartCoroutine(DoUploadScore(caller,username,score));
    }


    IEnumerator DoUploadScore(ILeaderBoardCaller caller, string username = "unknown", string score = "666")
    {
        WWWForm form = new WWWForm();
        form.AddField("username", username);
        form.AddField("score", score);

        UnityWebRequest download = UnityWebRequest.Post(API_URL + "save", form);

        yield return download.SendWebRequest();



        if (download.isNetworkError)
        {
            Debug.LogError("Error posting: " + download.error);

            LeaderBoardResponse apiResponse = new LeaderBoardResponse();
            apiResponse.status = "KO";
            apiResponse.code = "UPLOAD-HTTP-ERROR";
            apiResponse.message = download.error;
            caller.ReturnLeaderboardCallback(apiResponse);
        }
        else
        {
            LeaderBoardResponse apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(download.downloadHandler.text);
            caller.ReturnLeaderboardCallback(apiResponse);
        }
    }


    public void RetrieveList(ILeaderBoardCaller caller, string limit = "50", string offset = "0", string order = "DESC")
    {
        if (limit == "")
            limit = "50";

        if (offset == "")
            offset = "0";

        if (order == "")
            order = "DESC";

        StartCoroutine(DoRetrieveList(caller, limit, offset, order));
    }

    IEnumerator DoRetrieveList(ILeaderBoardCaller caller, string limit = "50", string offset = "0", string order = "DESC")
    {
        string queryString = "?limit="+limit+"&offset="+offset+"&order="+order;

        Debug.Log(API_URL + queryString);

        var webRequest = UnityWebRequest.Get(API_URL + queryString);

        yield return webRequest.SendWebRequest();
        LeaderBoardResponse apiResponse = new LeaderBoardResponse();

        if (webRequest.isNetworkError)
        {            
            apiResponse.status = "KO";
            apiResponse.code = "RETRIEVE-NETWORK-ERROR";
            apiResponse.message = webRequest.error;
        }
        else
        {
            string jsonData = webRequest.downloadHandler.text;
            apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(jsonData);
            
        }
        caller.ReturnLeaderboardCallback(apiResponse);
    }
}

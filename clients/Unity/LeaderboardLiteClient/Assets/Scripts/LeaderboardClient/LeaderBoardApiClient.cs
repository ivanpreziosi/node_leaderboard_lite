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



        if (download.isNetworkError || download.isHttpError)
        {
            Debug.LogError("Error posting: " + download.error);

            LeaderBoardResponse apiResponse = new LeaderBoardResponse();
            apiResponse.STATUS = "KO";
            apiResponse.CODE = "UPLOAD-HTTP-ERROR";
            apiResponse.MESSAGE = download.error;
            caller.ReturnLeaderboardCallback(apiResponse);
        }
        else
        {
            LeaderBoardResponse apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(download.downloadHandler.text);
            caller.ReturnLeaderboardCallback(apiResponse);
        }
    }


    public void RetrieveList(ILeaderBoardCaller caller)
    {
        StartCoroutine(DoRetrieveList(caller));
    }

    IEnumerator DoRetrieveList(ILeaderBoardCaller caller)
    {
        var webRequest = UnityWebRequest.Get(API_URL);

        yield return webRequest.SendWebRequest();        

        if (webRequest.isNetworkError || webRequest.isHttpError)
        {
            LeaderBoardResponse apiResponse = new LeaderBoardResponse();
            Debug.LogError("Error downloading: " + webRequest.error);
            apiResponse.STATUS = "KO";
            apiResponse.CODE = "RETRIEVE-HTTP-ERROR";
            apiResponse.MESSAGE = webRequest.error;
            caller.ReturnLeaderboardCallback(apiResponse);
        }
        else
        {
            string jsonData = webRequest.downloadHandler.text;
            LeaderBoardResponse apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(jsonData);
            caller.ReturnLeaderboardCallback(apiResponse);
        }
    }
}

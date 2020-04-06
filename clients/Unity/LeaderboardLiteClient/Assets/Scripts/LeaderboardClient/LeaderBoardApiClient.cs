using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class LeaderBoardApiClient : MonoBehaviour
{
    public static LeaderBoardApiClient instance;

    public UserData loggedUser;

    public const string API_URL = "http://localhost:1312/";

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

    public void LogoutUser()
    {
        loggedUser = null;
    }

    /**
     * LOGIN USER
    **/
    public void LoginUser(ILeaderBoardCaller caller, string username = "", string password = "")
    {
        StartCoroutine(DoLoginUser(caller,username,password));
    }

    IEnumerator DoLoginUser(ILeaderBoardCaller caller, string username = "", string password = "")
    {
        WWWForm form = new WWWForm();
        form.AddField("username", username);
        form.AddField("password", password);

        UnityWebRequest webRequest = UnityWebRequest.Post(API_URL + "usr/login", form);
        yield return webRequest.SendWebRequest();

        if (webRequest.isNetworkError)
        {
            Debug.LogError("Error posting: " + webRequest.error);

            LeaderBoardResponse apiResponse = new LeaderBoardResponse();
            apiResponse.status = "KO";
            apiResponse.code = "UPLOAD-HTTP-ERROR";
            apiResponse.message = webRequest.error;
            caller.ReturnLeaderboardCallback(apiResponse);
        }
        else
        {
            LeaderBoardResponse apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(webRequest.downloadHandler.text);
            if(apiResponse.status == "OK")
            {
                loggedUser = apiResponse.userData;
            }
            else
            {
                loggedUser = null;
            }
            caller.ReturnLeaderboardCallback(apiResponse);
        }
    }


    /**
     * REGISTER USER
    **/
    public void RegisterUser(ILeaderBoardCaller caller, string username = "", string password = "", string passwordRepeat = "", string email = "", string emailRepeat = "")
    {
        StartCoroutine(DoRegisterUser(caller, username, password, passwordRepeat, email, emailRepeat));
    }

    IEnumerator DoRegisterUser(ILeaderBoardCaller caller, string username = "", string password = "", string passwordRepeat = "", string email = "", string emailRepeat = "")
    {
        WWWForm form = new WWWForm();
        form.AddField("username", username);
        form.AddField("password", password);
        form.AddField("password_repeat", passwordRepeat);
        form.AddField("email", email);
        form.AddField("email_repeat", emailRepeat);

        UnityWebRequest webRequest = UnityWebRequest.Post(API_URL + "usr/save", form);
        yield return webRequest.SendWebRequest();

        if (webRequest.isNetworkError)
        {
            Debug.LogError("Error posting: " + webRequest.error);

            LeaderBoardResponse apiResponse = new LeaderBoardResponse();
            apiResponse.status = "KO";
            apiResponse.code = "UPLOAD-HTTP-ERROR";
            apiResponse.message = webRequest.error;
            caller.ReturnLeaderboardCallback(apiResponse);
        }
        else
        {
            LeaderBoardResponse apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(webRequest.downloadHandler.text);
            caller.ReturnLeaderboardCallback(apiResponse);
        }
    }


    /**
     * UPLOAD SCORE
    **/
    public void UploadScore(ILeaderBoardCaller caller, string score = "666")
    {
        StartCoroutine(DoUploadScore(caller,score));
    }

    IEnumerator DoUploadScore(ILeaderBoardCaller caller, string score = "666")
    {
        WWWForm form = new WWWForm();
        form.AddField("score", score);

        UnityWebRequest webRequest = UnityWebRequest.Post(API_URL + "ldb/save", form);
        webRequest.SetRequestHeader("username", loggedUser.username);
        webRequest.SetRequestHeader("x-ldb-token", loggedUser.token);
        yield return webRequest.SendWebRequest();
        
        if (webRequest.isNetworkError)
        {
            Debug.LogError("Error posting: " + webRequest.error);

            LeaderBoardResponse apiResponse = new LeaderBoardResponse();
            apiResponse.status = "KO";
            apiResponse.code = "UPLOAD-HTTP-ERROR";
            apiResponse.message = webRequest.error;
            caller.ReturnLeaderboardCallback(apiResponse);
        }
        else
        {
            LeaderBoardResponse apiResponse = JsonUtility.FromJson<LeaderBoardResponse>(webRequest.downloadHandler.text);
            caller.ReturnLeaderboardCallback(apiResponse);
        }
    }

    /**
     * RETRIEVE LEADERBOARD
    **/
    public void RetrieveList(ILeaderBoardCaller caller, string limit = "50", string offset = "0", string order = "DESC")
    {
        StartCoroutine(DoRetrieveList(caller, limit, offset, order));
    }

    IEnumerator DoRetrieveList(ILeaderBoardCaller caller, string limit = "50", string offset = "0", string order = "DESC")
    {
        string queryString = "?limit="+limit+"&offset="+offset+"&order="+order;

        Debug.Log("url requested: "+API_URL + "ldb" + queryString);
        UnityWebRequest webRequest = UnityWebRequest.Get(API_URL + "ldb" + queryString);
        webRequest.SetRequestHeader("username", loggedUser.username);
        webRequest.SetRequestHeader("x-ldb-token", loggedUser.token);
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

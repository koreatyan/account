document.getElementById("getToken").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      // localStorageからトークンを取得
      const token = localStorage.getItem("token");
      if (token) {
        return token.replace(/"/g, ''); // クォートを除去
      }

      // IndexedDBからトークンを取得（新しいDiscordクライアントの場合）
      return new Promise((resolve) => {
        const request = indexedDB.open("discord");
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction("api", "readonly");
          const store = transaction.objectStore("tokens");
          const getRequest = store.get("token");

          getRequest.onsuccess = () => {
            resolve(getRequest.result?.value || "Token not found.");
          };
        };
        request.onerror = () => resolve("Failed to access IndexedDB.");
      });
    },
  }, (results) => {
    if (results[0].result) {
      document.getElementById("token").textContent = results[0].result;
    } else {
      document.getElementById("token").textContent = "Token not found or Discord is not logged in.";
    }
  });
});

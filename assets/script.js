const BASE_API_URL = 'http://dev-admin.63-ok.com/api'
const BASIC_TOKEN = 'c2ltcGxlX3Rva2Vu'
const ODD_RESULT = 1
const EVEN_RESULT = 2

let endBetTime = null;
let bettingTime = null;
let startBetTime = null;
let isShowTimer = false
let timmer = null

const CARD_TYPE = [
    '/images/statistic/clover.png',
    '/images/statistic/dia.png',
    '/images/statistic/heart.png',
    '/images/statistic/spade.png',
]

const DOTS = [
    '/images/statistic/dot-even-blank.png',
    '/images/statistic/dot-odd-blank.png',
]

const BACKGROUND_RESULT = [
    '/images/statistic/game-result-even.png',
    '/images/statistic/game-result-odd.png',
]
const HIDDEN_GBG = '/images/statistic/hidden-bg.png'
const SHOW_GBG = '/images/statistic/show-bg.png'

function start(){
    onGetInfo()
    // setInterval(update, 100)
}

function update(){
    if (isShowTimer) {
        const now = Date.now()
        if (now < endBetTime) {
            let remainingTime = Math.round((endBetTime - now) / 1000)
            console.log(remainingTime)
        } else {
            // PopupController.inst.showNotice('Stop betting time')
            isShowTimer = false
            // Helper.waitForSeconds(1)
            onGetInfo()
        }

    }
}

const onGetInfo = async() => {
    isShowTimer = false
    const step1Data= await onGetFirstCard()
    startBetTime = step1Data.startTime
    bettingTime = step1Data.bettingTime
    endBetTime = step1Data.bettingTime * 1000 + step1Data.startTime
    updateSummnery(step1Data)
    isShowTimer = true
}

const onGetFirstCard = () => {
  const roomId = getvalue(window.location.search, "room_id");
  console.log({ roomId });
  return new Promise(async (resolve, reject) => {
    fetch(BASE_API_URL + "/round-info/1", {
      method: "GET", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
        "basic-token": BASIC_TOKEN,
      },
      // body: JSON.stringify({
      //     "basic-token" : BASIC_TOKEN
      // }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("response:", response);
        if (response.status !== 200) {
          reject(new Error("Have error when trying to get data!"));
        }
        const { data } = response;

        const firstCard = data.first_card_master;
        resolve({
          firstCard,
          trashCard: [
            data.first_trash_card_master,
            data.second_trash_card_master,
            data.third_trash_card_master,
          ], //3 card
          turnNumber: data.turn_number,
          startTime: data.timestamp_start * 1000,
          bettingTime: data.betting_time,
          remainCard: data.remain_card,
          statistic: data.statics,
          chinaboard: data.chinaboard,
          history: data.results_detail,
        });
      })
      .catch((error) => {
        reject(new Error("Have error when trying to get data!"));
        console.error("Error:", error);
      });
  });
};

const getvalue = (str, name) => {
    if (str.indexOf(name) != -1) {
        var pos_start = str.indexOf(name) + name.length + 1;
        var pos_end = str.indexOf("&", pos_start);
        if (pos_end == -1) {
            return str.substring(pos_start);
        }
        else {
            return str.substring(pos_start, pos_end)
        }
    }
    else {
        return "";
    }
}




function updateSummnery(data) {
    updateResult(data.history)
   
}

function updateResult(data) {
    const bodyTable = document.querySelector('#tbl-result tbody')
    let bodyStr = ''
    for (let i = 0; i < 8; i++) {
        const resultItem = data[i]
        const result = parseInt(resultItem.first_card.cardValue) + parseInt(resultItem.second_card.cardValue)
        const resultClass = result % 2 === 0 ? 'even' : 'odd'
        const resultText = result % 2 === 0 ? '짝' : '홀'
        bodyStr += `<tr>
            <td>${resultItem.turn_number}회차</td>
            <td>
                <div class="open">
                    <span class="card-type ${resultItem.first_card.cardSuit}"></span>
                    <span class="card-value">${resultItem.first_card.cardValue}</span>
                </div></td>
            <td>
                <div class="hide">
                    <span class="card-type ${resultItem.first_card.cardSuit}"></span>
                    <span class="card-value">${resultItem.second_card.cardValue}</span>
                </div></td>
            <td><div class="result ${resultClass}">
                <span class="value">${result}</span>
                <span class="type">${resultText}</span>
            </div></td>
        </tr>`
    }

            // if (!resultItem || resultItem === undefined) return
            // const leftCard = new Card(Helper.getCardSuit(resultItem.first_card.cardSuit), parseInt(resultItem.first_card.cardValue))
            // const rightCard = new Card(Helper.getCardSuit(resultItem.second_card.cardSuit), parseInt(resultItem.second_card.cardValue))
    bodyTable.innerHTML = bodyStr
}



function getCardSuit(suit) {
    if (suit == "spade") {
        return CARD_TYPE[3];
    }
    else if (suit == "diamond") {
        return CARD_TYPE[1];
    }
    else if (suit == "heart") {
        return CARD_TYPE[2];
    }
    else if (suit == "club") {
        return CARD_TYPE[0];
    }
}
import json
import urllib.request
from datetime import date
from urllib.request import urlopen

from bs4 import BeautifulSoup
from utils import write_data


def get_past_data():
    with open("./data/koreaTotalCumulativeData.js", "r", encoding="UTF-8-sig") as f:
        data = f.read()
        obj = (
            data[data.find("["): data.rfind("]") + 1]
            .replace("\n", "")
            .replace("\t", "")
        )
    return json.loads(obj)


def get_today_data(url, data):
    today = date.today()
    day = today.strftime(f"{today.month}/{today.day}")
    source = urlopen(url).read()
    soup = BeautifulSoup(source, "html.parser")
    tables = soup.find("div", class_="data_table mgt16").find_all("td")
    num = [int(element.get_text().replace(",", "")) for element in tables]
    total, release, _, death = num

    if data[-1][0] != day:
        before_tot = data[-1][1]
        diff = today_tot - before_tot
        data.append([day, total, diff, death, release])

    else:
        if total != data[-1][1]:
            before_tot = data[-2][1]
            diff = today_tot - before_tot
            data[-1] = [day, total, diff, death, release]

    return data


def run():
    url = "http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=11&ncvContSeq=&contSeq=&board_id=&gubun="

    past_data = get_past_data()
    data = get_today_data(url, past_data)

    save_dir = "./data/koreaTotalCumulativeData.js"
    crawler_name = "crawlKoreaTotalCumulativeData.py"
    var_name = "koreaRegionalCumulativeData"

    write_data(data, save_dir, crawler_name, var_name)


print("#####################################")
print("############ 한국 누적 데이터 #############")
print("######## crawlTotalCumulativeData.py #########")

run()

print("############### 완료!! ###############")
print("#####################################")

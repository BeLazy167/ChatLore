import requests
import json
from datetime import datetime, timedelta
import sys

BASE_URL = "http://localhost:8000"

def print_response(name: str, response: requests.Response):
    """Pretty print the response"""
    print(f"\n=== {name} ===")
    print(f"Status Code: {response.status_code}")
    try:
        if response.status_code == 200:
            print("Response:", json.dumps(response.json(), indent=2))
        else:
            print("Response:", response.text)
    except requests.exceptions.JSONDecodeError:
        print("No JSON response received")
    print("=" * 50)

def test_upload_chat():
    """Test chat upload endpoint"""
   
    with open('./test_chat.txt', 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/chat/upload", files=files, timeout=10)
            print_response("Upload Chat", response)
            return response.status_code == 200


def test_semantic_search():
    """Test semantic search endpoint"""
    try:
        params = {
            'query': 'happy new year',
            'min_similarity': 0.3,
            'limit': 10,
            'with_explanation': True
        }
        response = requests.get(f"{BASE_URL}/api/search/semantic", params=params)
        print_response("Semantic Search", response)
        return response.status_code == 200
    except Exception as e:
        print(f"\nError in semantic search: {e}")
        return False

def test_conversation_insights():
    """Test conversation insights endpoint"""
    try:
        params = {
            'start_date': (datetime.now() - timedelta(days=7)).isoformat(),
            'end_date': datetime.now().isoformat()
        }
        response = requests.get(f"{BASE_URL}/api/search/insights", params=params)
        print_response("Conversation Insights", response)
        return response.status_code == 200
    except Exception as e:
        print(f"\nError getting conversation insights: {e}")
        return False

def test_topic_clusters():
    """Test topic clusters endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/search/topics")
        print_response("Topic Clusters", response)
        return response.status_code == 200
    except Exception as e:
        print(f"\nError getting topic clusters: {e}")
        return False

def test_message_filtering():
    """Test message filtering endpoint"""
    try:
        params = {
            'message_type': 'text',
            'contains': 'hello'
        }
        response = requests.get(f"{BASE_URL}/api/search/filter", params=params)
        print_response("Message Filtering", response)
        return response.status_code == 200
    except Exception as e:
        print(f"\nError filtering messages: {e}")
        return False

def test_security():
    """Test security endpoint"""
    response = requests.get(f"{BASE_URL}/api/security")
    print_response("Security", response)
    return response.status_code == 200

def create_sample_chat():
    """Create a sample chat file for testing"""
    sample_content = '''[10/09/2023, 1:04:31 PM] Meet Bhanushali: ‎Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[10/09/2023, 1:04:31 PM] Meet Bhanushali: 6 for?
[10/09/2023, 2:12:54 PM] Dhruv Khara: My bad sorry bud
[10/09/2023, 2:27:47 PM] Meet Bhanushali: no worries bhai
‎[01/11/2023, 3:52:16 PM] Meet Bhanushali: ‎image omitted
[01/11/2023, 3:52:37 PM] Dhruv Khara: Waa
[01/11/2023, 3:52:39 PM] Dhruv Khara: Sahi
[01/11/2023, 5:13:52 PM] Dhruv Khara: Sikh jaa mast coffee banti
‎[01/11/2023, 5:14:00 PM] Meet Bhanushali: ‎image omitted
[01/11/2023, 5:14:03 PM] Meet Bhanushali: banaya me
[01/11/2023, 5:14:17 PM] Dhruv Khara: Dudh to daal
[01/11/2023, 5:14:23 PM] Meet Bhanushali: dala tha badme
[01/11/2023, 5:14:42 PM] Meet Bhanushali: doodh ke  sath photo nai hai
[01/11/2023, 5:15:04 PM] Dhruv Khara: Sahi
[01/11/2023, 5:15:17 PM] Meet Bhanushali: mere pas ground coffee ka ek hi packet tha
[01/11/2023, 5:15:22 PM] Meet Bhanushali: hotel se liya tha
[01/11/2023, 5:15:31 PM] Dhruv Khara: Ha starbucks ka lele 8 ka
[01/11/2023, 5:15:35 PM] Meet Bhanushali: abhi aur leke aunga
[01/11/2023, 5:15:42 PM] Dhruv Khara: Waa
[01/11/2023, 5:15:57 PM] Dhruv Khara: Motel ka ref rahega to muje batana dost 😅😅
[01/11/2023, 5:16:05 PM] Meet Bhanushali: ha bhai
[01/11/2023, 5:16:17 PM] Dhruv Khara: Aur s23+ ka bhi
[01/11/2023, 5:16:16 PM] Meet Bhanushali: ek jagah hai kaam but bahot dur hai
[01/11/2023, 5:16:21 PM] Dhruv Khara: Kaha
[01/11/2023, 5:16:20 PM] Meet Bhanushali: Elmwood me
[01/11/2023, 5:16:26 PM] Dhruv Khara: Bc
[01/11/2023, 5:16:31 PM] Dhruv Khara: Kaha aaya
[01/11/2023, 5:16:30 PM] Meet Bhanushali: ha bhai
[01/11/2023, 5:16:40 PM] Meet Bhanushali: dalke dekh maps me
[01/11/2023, 5:16:52 PM] Meet Bhanushali: manager bola tha merko you can stay karke in motel
[01/11/2023, 5:17:38 PM] Meet Bhanushali: https://maps.app.goo.gl/uQ1v3KkRCRNUgxdD8?g_st=iw
[01/11/2023, 5:18:39 PM] Dhruv Khara: Oh
[01/11/2023, 5:19:04 PM] Dhruv Khara: Bc bohot dur hai
[01/11/2023, 5:19:09 PM] Meet Bhanushali: ha bhai
[01/11/2023, 5:19:18 PM] Meet Bhanushali: me mana kiya yaha
[01/11/2023, 5:19:31 PM] Meet Bhanushali: fir merko luckily nasdeek me mil gaya
[01/11/2023, 5:21:46 PM] Dhruv Khara: Naseeb
[01/11/2023, 5:21:52 PM] Dhruv Khara: Ye kitna jyada dur hai
[01/11/2023, 5:22:15 PM] Meet Bhanushali: ha but merko kaam aagaya tha hotel ka toh ek nai toh dusri jagah mil hi jayga
[01/11/2023, 5:22:47 PM] Meet Bhanushali: abhi jidhar laga merko unko vohi chahiaa tha jisko ata hai frontdesk ka kaam
[01/11/2023, 5:22:53 PM] Dhruv Khara: Experience
[01/11/2023, 5:23:01 PM] Dhruv Khara: Yup
[01/11/2023, 5:23:04 PM] Dhruv Khara: Sahi
[01/11/2023, 5:23:06 PM] Dhruv Khara: Bc
[01/11/2023, 5:23:24 PM] Meet Bhanushali: baki merko ata hai kuch call toh me karta refer
[01/11/2023, 5:23:49 PM] Dhruv Khara: Yup
[01/11/2023, 5:24:03 PM] Dhruv Khara: Thanks alot buddy 🫡🫡
[01/11/2023, 5:24:15 PM] Meet Bhanushali: Anytime 🙌🏻
[22/12/2023, 9:22:03 PM] Meet Bhanushali: ‎Voice call, ‎1 min
[31/01/2024, 11:45:50 PM] Dhruv Khara: Oi
[31/01/2024, 11:46:00 PM] Dhruv Khara: Planet fitness ka membership le liya
[31/01/2024, 11:46:08 PM] Dhruv Khara: 1 guest allowed hai
[31/01/2024, 11:46:11 PM] Meet Bhanushali: ohh bhai
[31/01/2024, 11:46:17 PM] Dhruv Khara: Konsa bhi
[31/01/2024, 11:46:23 PM] Dhruv Khara: Planet fitness
[31/01/2024, 11:46:37 PM] Meet Bhanushali: sabse badhiya wsla membership liya hai🌚
[31/01/2024, 11:47:16 PM] Meet Bhanushali: Bhai blink toh kachre ke bhav me contract based membership bech raha
[31/01/2024, 11:47:41 PM] Dhruv Khara: Le liya kabhi hoboken jaana ho to isliye
[31/01/2024, 11:47:51 PM] Meet Bhanushali: Ny me bhi hai
[31/01/2024, 11:48:05 PM] Meet Bhanushali: Apne uni se zyada dur bhi nai
[31/01/2024, 11:48:26 PM] Meet Bhanushali: Tu kab jata hai gym bata dena bhai
[31/01/2024, 11:49:45 PM] Dhruv Khara: Tera college konse din pe hai
[31/01/2024, 11:49:55 PM] Meet Bhanushali: Mon Tue Thur
[31/01/2024, 11:50:07 PM] Dhruv Khara: Tuesday timing?
[31/01/2024, 11:50:14 PM] Meet Bhanushali: Sab 6-9
[31/01/2024, 11:50:25 PM] Dhruv Khara: Tuesday ka set karte kuch
[31/01/2024, 11:50:42 PM] Meet Bhanushali: Tu baki koi din nai jata gym
[01/02/2024, 12:03:37 AM] Dhruv Khara: Saturday
[01/02/2024, 12:04:07 AM] Dhruv Khara: 3 din se starrt karna hai
[01/02/2024, 12:28:15 AM] Meet Bhanushali: Sahi bhai
[01/02/2024, 12:28:24 AM] Meet Bhanushali: Fir Saturday jaate
[06/02/2024, 12:36:28 PM] Dhruv Khara: Come be my free PF Black Card® Guest. At Planet Fitness! https://www.planetfitness.com/blackcardguest?pfxUserId=pfx%3Ausers%3A69a4c4b9-6975-11ee-9fac-19ac10ad441b
‎[06/02/2024, 12:42:15 PM] Meet Bhanushali: ‎image omitted
[06/02/2024, 12:42:50 PM] Dhruv Khara: Pre leke aara hu
[06/02/2024, 12:42:55 PM] Dhruv Khara: Muje 1:15 hoga
[06/02/2024, 12:43:05 PM] Meet Bhanushali: Ok bro
‎[06/02/2024, 12:43:57 PM] Meet Bhanushali: ‎image omitted
[06/02/2024, 12:44:15 PM] Dhruv Khara: Ruk
‎[06/02/2024, 12:45:00 PM] Dhruv Khara: ‎image omitted
[06/02/2024, 12:45:18 PM] Dhruv Khara: Option nahi hai aisa mere app me
[06/02/2024, 12:45:29 PM] Meet Bhanushali: Acha fir udhar hi hoga shayad
[06/02/2024, 12:45:33 PM] Dhruv Khara: Kiya
[06/02/2024, 12:45:35 PM] Dhruv Khara: Dekh
[06/02/2024, 12:45:52 PM] Meet Bhanushali: Hua
‎[06/02/2024, 12:45:52 PM] Dhruv Khara: ‎image omitted
[06/02/2024, 12:46:11 PM] Dhruv Khara: Tere dost ko free wala karne bolde
[06/02/2024, 12:46:17 PM] Meet Bhanushali: Ha
[06/02/2024, 8:25:47 PM] Meet Bhanushali: Kal aara hai blink?
[06/02/2024, 9:51:45 PM] Meet Bhanushali: Tera email de
[06/02/2024, 9:57:19 PM] Dhruv Khara: Dhruvkhara@gmail.com
[06/02/2024, 9:58:37 PM] Meet Bhanushali: Bhai dekh terko mail aya hoga
[24/02/2024, 6:10:06 PM] Dhruv Khara: ‎Video call, ‎No answer
‎[24/02/2024, 6:10:39 PM] Dhruv Khara: ‎video omitted
[24/02/2024, 6:31:07 PM] Meet Bhanushali: ‎Voice call, ‎1 min
[24/02/2024, 6:31:03 PM] Meet Bhanushali: Oh bhai
[10/03/2024, 9:40:24 PM] Dhruv Khara: https://music.youtube.com/playlist?list=PLLV3rBEzV4b-1mT9hUh44gxBNIHJ_u9xA&si=QLTHkS0wIo5el9RB
[12/08/2024, 4:49:46 PM] Meet Bhanushali: Bhai kitna dena hai muje kal kav
[12/08/2024, 4:49:47 PM] Meet Bhanushali: ?
[12/08/2024, 4:50:01 PM] Dhruv Khara: 15
[12/08/2024, 4:50:23 PM] Meet Bhanushali: Abe vo beach pe khana wagera ka kya?
[12/08/2024, 4:50:28 PM] Dhruv Khara: Ha
[12/08/2024, 4:50:28 PM] Meet Bhanushali: 15 thodi hua hoga😂
[12/08/2024, 4:50:37 PM] Dhruv Khara: 75/6
[12/08/2024, 4:50:44 PM] Meet Bhanushali: Oh
‎[13/08/2024, 9:56:35 AM] Meet Bhanushali: ‎video omitted
[14/08/2024, 11:22:59 PM] Dhruv Khara: Sun oi
[14/08/2024, 11:23:26 PM] Dhruv Khara: Tuje shared album me daala hai photos videos daal de sab
[14/08/2024, 11:23:53 PM] Meet Bhanushali: Shared album?
[14/08/2024, 11:23:55 PM] Meet Bhanushali: Icloud me?
[14/08/2024, 11:24:07 PM] Dhruv Khara: Ha
[14/08/2024, 11:24:13 PM] Dhruv Khara: Photos me
[14/08/2024, 11:24:21 PM] Meet Bhanushali: Ok dekhta
[14/08/2024, 11:24:54 PM] Dhruv Khara: Aur agar nahi aaya to mailid bol apple ka
[14/08/2024, 11:25:11 PM] Meet Bhanushali: Ha nai aya
[14/08/2024, 11:25:26 PM] Meet Bhanushali: meetbhanushali2001@gmail.com
[14/08/2024, 11:27:52 PM] Dhruv Khara: Dekh abb
[14/08/2024, 11:31:33 PM] Meet Bhanushali: nai aya
[14/08/2024, 11:31:36 PM] Meet Bhanushali: tera bhej
[14/08/2024, 11:31:39 PM] Meet Bhanushali: me karta
[14/08/2024, 11:31:41 PM] Meet Bhanushali: try
[14/08/2024, 11:32:05 PM] Meet Bhanushali: haaaya
[14/08/2024, 11:32:09 PM] Meet Bhanushali: kiya accept
[14/08/2024, 11:35:23 PM] Dhruv Khara: Daal de sab
[14/08/2024, 11:40:29 PM] Meet Bhanushali: ha
[15/08/2024, 12:01:17 AM] Meet Bhanushali: paid
[15/08/2024, 12:01:23 AM] Meet Bhanushali: settle mardiya
[15/08/2024, 12:04:49 AM] Dhruv Khara: Aree
[15/08/2024, 12:05:00 AM] Dhruv Khara: Thik hai bhai
[15/08/2024, 12:05:11 AM] Dhruv Khara: Aaram se karte aur ghumne jaate wagera
[15/08/2024, 12:05:11 AM] Meet Bhanushali: kya hua
[15/08/2024, 12:05:23 AM] Meet Bhanushali: thike na bhai
[15/08/2024, 12:05:51 AM] Meet Bhanushali: nxt time ka zyada dena padta ek sath🤣
‎[15/08/2024, 12:33:26 AM] Dhruv Khara: ‎sticker omitted
[21/08/2024, 7:20:41 PM] Meet Bhanushali: bhai me ata kal
[21/08/2024, 7:52:23 PM] Dhruv Khara: Cool
[21/08/2024, 7:52:26 PM] Dhruv Khara: Back hair
[21/08/2024, 7:52:28 PM] Dhruv Khara: Hai
‎[21/08/2024, 7:52:31 PM] Dhruv Khara: ‎sticker omitted
[21/08/2024, 7:52:54 PM] Meet Bhanushali: shoulder hai, kickout na karde planet fitness wale weighted dips karne pe
[21/08/2024, 7:52:58 PM] Meet Bhanushali: 😂😂
[21/08/2024, 7:53:08 PM] Meet Bhanushali: +36kgs
[21/08/2024, 7:53:12 PM] Dhruv Khara: Nahi karenge
[21/08/2024, 7:53:24 PM] Meet Bhanushali: fir sahi hai
[21/08/2024, 7:53:30 PM] Meet Bhanushali: kal pre leke ana
[21/08/2024, 7:53:43 PM] Dhruv Khara: Direct gym aayega ?
[21/08/2024, 7:53:43 PM] Meet Bhanushali: 1/3rd scoop hi lunga
[21/08/2024, 7:53:48 PM] Dhruv Khara: Ghar nahi?
[21/08/2024, 7:53:55 PM] Meet Bhanushali: tu bata...kuch bhi chalega
[21/08/2024, 7:54:14 PM] Dhruv Khara: Ghar se gym 20 min hai walk 🚶
[21/08/2024, 7:54:23 PM] Dhruv Khara: To gym aaja via me
[21/08/2024, 7:54:26 PM] Dhruv Khara: Return walk
[21/08/2024, 7:54:35 PM] Dhruv Khara: Phir ghar pe chill karte
[21/08/2024, 7:54:38 PM] Dhruv Khara: Thoda det
[21/08/2024, 7:54:39 PM] Meet Bhanushali: chhalo\
[21/08/2024, 7:54:39 PM] Meet Bhanushali: \
[21/08/2024, 7:54:47 PM] Meet Bhanushali: vedant ko bhi puch
[21/08/2024, 7:54:49 PM] Meet Bhanushali: ayga kya
[21/08/2024, 7:55:09 PM] Dhruv Khara: Kal tu kab aara
[21/08/2024, 7:55:15 PM] Meet Bhanushali: tu 2 baje bola na
[21/08/2024, 7:55:28 PM] Dhruv Khara: 2baje to part time se niklunga
[21/08/2024, 7:55:32 PM] Meet Bhanushali: acha
[21/08/2024, 7:55:38 PM] Dhruv Khara: 315 tak
[21/08/2024, 7:55:42 PM] Meet Bhanushali: thike
[21/08/2024, 7:55:48 PM] Meet Bhanushali: 3:15 tak  ata
[22/08/2024, 3:20:30 PM] Meet Bhanushali: ‎Voice call, ‎57 sec
[22/08/2024, 3:26:36 PM] Meet Bhanushali: pickup in 15min hai
[22/08/2024, 3:26:42 PM] Meet Bhanushali: 4 bje pochunga nostly
[22/08/2024, 3:26:45 PM] Meet Bhanushali: mostly
[22/08/2024, 3:47:48 PM] Meet Bhanushali: 4 bje pochunga
[22/08/2024, 3:48:07 PM] Dhruv Khara: Cool
[22/08/2024, 3:48:11 PM] Dhruv Khara: I’ll bring pre
[22/08/2024, 3:48:15 PM] Meet Bhanushali: ha bhai
[22/08/2024, 3:48:19 PM] Meet Bhanushali: neend ara
[22/08/2024, 3:48:32 PM] Dhruv Khara: 2 hai
[22/08/2024, 3:48:38 PM] Dhruv Khara: Ek indian ek yaha ka
[22/08/2024, 3:48:43 PM] Dhruv Khara: Jo lena ho
[22/08/2024, 3:48:50 PM] Meet Bhanushali: koi bhi chalega
[22/08/2024, 3:53:04 PM] Dhruv Khara: ‎Voice call, ‎11 sec
[22/08/2024, 5:46:12 PM] Meet Bhanushali: ‎Voice call, ‎1 sec
[26/08/2024, 3:27:02 PM] Dhruv Khara: https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/210527899
[27/08/2024, 5:11:38 PM] Dhruv Khara: https://lu.ma/agsebg83?tk=pKFXJh
[27/08/2024, 6:09:26 PM] Meet Bhanushali: Jana hai?
[27/08/2024, 6:16:39 PM] Dhruv Khara: Register kar milega to jaate
[31/08/2024, 11:55:30 PM] Meet Bhanushali: Bhai last time vo beer ka kisse lena hai payment?
[01/09/2024, 8:04:23 AM] Dhruv Khara: Vedant
‎[05/10/2024, 8:39:12 PM] Meet Bhanushali: ‎image omitted
[05/10/2024, 8:40:24 PM] Dhruv Khara: Wrong grp nigga
[05/10/2024, 8:41:00 PM] Meet Bhanushali: 🙂‍↔️
[08/10/2024, 11:11:05 AM] Dhruv Khara: https://newyork.theaisummit.com/features-2024/ai-hackathon
[08/10/2024, 11:11:12 AM] Dhruv Khara: karna hia participate
[09/10/2024, 8:11:29 PM] Meet Bhanushali: Pizza sorted
‎[03/12/2024, 6:44:17 PM] Meet Bhanushali: ‎image omitted
‎[03/12/2024, 6:44:30 PM] Meet Bhanushali: ‎image omitted
[03/12/2024, 6:44:45 PM] Dhruv Khara: W
[03/12/2024, 6:44:51 PM] Meet Bhanushali: Black friday
[03/12/2024, 6:44:53 PM] Meet Bhanushali: Me liya
[03/12/2024, 6:44:57 PM] Dhruv Khara: Ghost leta
[03/12/2024, 6:45:05 PM] Dhruv Khara: Mere pass 4 hai
[03/12/2024, 6:45:16 PM] Meet Bhanushali: Are muje coach ke liye lena tha
‎[03/12/2024, 6:45:21 PM] Meet Bhanushali: ‎image omitted
[03/12/2024, 6:45:25 PM] Dhruv Khara: Hatt bc
[03/12/2024, 6:45:41 PM] Dhruv Khara: Khud ke liye leta
‎[03/12/2024, 6:45:45 PM] Dhruv Khara: ‎sticker omitted
[03/12/2024, 6:45:49 PM] Meet Bhanushali: Are
[03/12/2024, 6:45:50 PM] Meet Bhanushali: Pre
[03/12/2024, 6:45:53 PM] Meet Bhanushali: Mere liye hai
[03/12/2024, 6:45:59 PM] Meet Bhanushali: Ye do chiz uska hai
[03/12/2024, 6:46:13 PM] Meet Bhanushali: Bc kuch minimum order pe free delivery tha isliye pre le liya me
[03/12/2024, 6:46:22 PM] Meet Bhanushali: Nai toh vo bhi nai leta😂
[03/12/2024, 6:46:27 PM] Meet Bhanushali: Kitna caffein?
[03/12/2024, 6:47:20 PM] Dhruv Khara: 250 hai
[03/12/2024, 6:47:31 PM] Meet Bhanushali: 🌚
[03/12/2024, 6:47:45 PM] Dhruv Khara: 1 scoop me
[03/12/2024, 6:48:04 PM] Meet Bhanushali: World is pushing me to start using pre workouts
[03/12/2024, 6:48:06 PM] Meet Bhanushali: 😢
[03/12/2024, 6:48:40 PM] Dhruv Khara: Start
[03/12/2024, 6:48:42 PM] Dhruv Khara: Kar
[03/12/2024, 6:48:43 PM] Dhruv Khara: Bc
[03/12/2024, 6:48:54 PM] Meet Bhanushali: Ha ab lunga kabhi kabhi
[03/12/2024, 6:48:57 PM] Meet Bhanushali: Week me 1-2 bar
‎[03/12/2024, 7:00:58 PM] Dhruv Khara: ‎sticker omitted
‎[03/12/2024, 7:01:16 PM] Meet Bhanushali: ‎sticker omitted
[04/12/2024, 10:28:17 AM] Dhruv Khara: https://reg.theaisummit.com/e/f2?LP=771
[04/12/2024, 10:33:25 AM] Meet Bhanushali: Open nai hora
[04/12/2024, 6:42:14 PM] Dhruv Khara: f
[04/12/2024, 6:42:25 PM] Meet Bhanushali: 🥲
[06/12/2024, 8:34:33 AM] Dhruv Khara: https://www.youtube.com/watch?v=hVD3TCIIdUQ
[06/12/2024, 8:41:17 AM] Meet Bhanushali: “Ignorance is scary but delusion is even worse” 
— Zeke (AOT)
[06/12/2024, 8:41:32 AM] Meet Bhanushali: Delusion of alpha males
[06/12/2024, 8:41:59 AM] Dhruv Khara: ROIDS
[06/12/2024, 8:42:34 AM] Meet Bhanushali: Foreign Rajat dalals
[06/12/2024, 8:43:45 AM] Dhruv Khara: ye amrika hai
[06/12/2024, 8:43:50 AM] Dhruv Khara: case hogaya laude pe
[06/12/2024, 8:44:03 AM] Meet Bhanushali: Ye amrika hai
[06/12/2024, 8:44:16 AM] Meet Bhanushali: United Health ke CEO ko manhattan me goli mardiya
[06/12/2024, 8:44:30 AM] Dhruv Khara: amrika me akele nai ghumne ka
[06/12/2024, 8:44:57 AM] Meet Bhanushali: Amrika pe paise chapo aur india jao
[06/12/2024, 8:45:00 AM] Meet Bhanushali: Best
‎[07/12/2024, 3:04:49 AM] Dhruv Khara: ‎sticker omitted
[18/12/2024, 3:31:50 AM] Meet Bhanushali: https://www.instagram.com/reel/DDtdySkz28H/?igsh=d2Zjbzg0Z2lvZWpx
[18/12/2024, 11:19:12 AM] Dhruv Khara: Mai nai khata raw
[28/12/2024, 8:49:28 PM] Dhruv Khara: Yo
[28/12/2024, 8:49:55 PM] Dhruv Khara: Protien pe deal wagera ka pata hai kya
[28/12/2024, 8:52:47 PM] Meet Bhanushali: Black friday me 2 dabbe le liya bhai me
[28/12/2024, 8:52:56 PM] Meet Bhanushali: Abhi ig myprotein pe check kar
[28/12/2024, 8:53:06 PM] Dhruv Khara: Costco me hai
[28/12/2024, 8:53:14 PM] Dhruv Khara: Par membership F
[28/12/2024, 8:53:16 PM] Dhruv Khara: Dekhta
‎[28/12/2024, 8:53:28 PM] Meet Bhanushali: ‎image omitted
[28/12/2024, 8:53:43 PM] Meet Bhanushali: 71 ka ek dabba ata
[28/12/2024, 8:53:50 PM] Meet Bhanushali: 56 me pada black friday me
[28/12/2024, 8:56:23 PM] Dhruv Khara: Dymatize ke iso hydro wala 3 mil raha 190
[28/12/2024, 8:56:31 PM] Dhruv Khara: 213 servings total
[28/12/2024, 8:56:36 PM] Meet Bhanushali: Dymatize overpriced af
[28/12/2024, 8:56:55 PM] Meet Bhanushali: Costco me
[28/12/2024, 8:56:57 PM] Meet Bhanushali: ?
[28/12/2024, 8:57:02 PM] Dhruv Khara: Amazon
[28/12/2024, 8:57:22 PM] Dhruv Khara: Iso hai vo bhi hydrolyzed
[28/12/2024, 8:57:32 PM] Meet Bhanushali: Flavor konsa
[28/12/2024, 8:57:34 PM] Meet Bhanushali: 190
[28/12/2024, 8:57:36 PM] Meet Bhanushali: Not bad
[28/12/2024, 8:57:38 PM] Dhruv Khara: Choco
[28/12/2024, 8:57:54 PM] Meet Bhanushali: But ingredients wise muje pasand nai aya dymatize
[28/12/2024, 8:57:54 PM] Dhruv Khara: Fast fast absorb
‎[28/12/2024, 8:58:15 PM] Meet Bhanushali: ‎image omitted
‎[28/12/2024, 8:58:21 PM] Dhruv Khara: ‎image omitted
[28/12/2024, 8:58:51 PM] Meet Bhanushali: Soy lecithin use krte
[28/12/2024, 8:59:01 PM] Meet Bhanushali: But acha hi hai bhai
[28/12/2024, 8:59:33 PM] Dhruv Khara: Wait karta aur koi dis dikha to
[28/12/2024, 8:59:39 PM] Meet Bhanushali: 190 acha hai
[28/12/2024, 8:59:44 PM] Meet Bhanushali: 3 dabbe ke hisab se
[28/12/2024, 8:59:58 PM] Dhruv Khara: Per serving 1.1 aara
[28/12/2024, 9:00:00 PM] Dhruv Khara: Cost
[28/12/2024, 9:00:24 PM] Dhruv Khara: Nai
[28/12/2024, 9:00:24 PM] Meet Bhanushali: Kaise
[28/12/2024, 9:00:27 PM] Dhruv Khara: 0.89
[28/12/2024, 9:00:30 PM] Meet Bhanushali: Ha
[28/12/2024, 9:00:32 PM] Meet Bhanushali: Vohi
[28/12/2024, 9:00:37 PM] Meet Bhanushali: 213 servings hai
[28/12/2024, 9:00:39 PM] Meet Bhanushali: Total
[28/12/2024, 9:00:48 PM] Dhruv Khara: 71 each
[28/12/2024, 9:01:15 PM] Meet Bhanushali: Iska ek serving me 30g protein
[28/12/2024, 9:01:30 PM] Meet Bhanushali: 120 servings
[28/12/2024, 9:01:48 PM] Meet Bhanushali: 112$ me  pada
[28/12/2024, 9:01:58 PM] Dhruv Khara: On ka 80 serving wala 45 me mil raha
[28/12/2024, 9:02:04 PM] Dhruv Khara: Costco
[28/12/2024, 9:02:09 PM] Dhruv Khara: 💀💀
[28/12/2024, 9:02:17 PM] Dhruv Khara: Membership bhi lu to sasta hai
[28/12/2024, 9:02:17 PM] Meet Bhanushali: Ingredients chutiya hai ON ka bhi
[28/12/2024, 9:02:23 PM] Meet Bhanushali: Taste ke hisab se acha hai
[28/12/2024, 9:02:39 PM] Dhruv Khara: Ha
[28/12/2024, 9:03:00 PM] Meet Bhanushali: Agar taste nai chahiaa tuje
[28/12/2024, 9:03:07 PM] Meet Bhanushali: But puresest protein chahiaa
[28/12/2024, 9:03:10 PM] Meet Bhanushali: NOW ka dekg
[28/12/2024, 9:03:12 PM] Meet Bhanushali: Dekh
[28/12/2024, 9:03:30 PM] Dhruv Khara: Taste chaiye bhai
[28/12/2024, 9:03:34 PM] Dhruv Khara: Pure ka kya karu
[28/12/2024, 9:03:38 PM] Meet Bhanushali: 😂😂
[28/12/2024, 9:03:40 PM] Dhruv Khara: Mai konsa stage pe haara
[28/12/2024, 9:03:42 PM] Dhruv Khara: Jaara
[28/12/2024, 9:03:45 PM] Meet Bhanushali: Me leke regret kiya tha bhai
[28/12/2024, 9:03:51 PM] Meet Bhanushali: 😂
[28/12/2024, 9:03:53 PM] Dhruv Khara: F
[28/12/2024, 9:04:17 PM] Meet Bhanushali: 190 ka lele dymatize
[28/12/2024, 9:04:21 PM] Meet Bhanushali: Acha hi deal hai
[28/12/2024, 9:04:59 PM] Dhruv Khara: Ya on
[28/12/2024, 9:05:17 PM] Meet Bhanushali: Myprotein sasta bhi padega aur taste bhi acha ata uska
[28/12/2024, 9:05:30 PM] Meet Bhanushali: Ingredients bhi similar hai iske
[28/12/2024, 9:07:10 PM] Dhruv Khara: 11lb me kitne scoop hot hai
[28/12/2024, 9:07:15 PM] Dhruv Khara: 100?
[28/12/2024, 9:07:18 PM] Dhruv Khara: 200?
[28/12/2024, 9:07:26 PM] Meet Bhanushali: Abhi vo log ne changes kiya hai
[28/12/2024, 9:07:44 PM] Meet Bhanushali: Phle ek scoop me myprotein 20g protein hi deta tha flavored wale me
[28/12/2024, 9:07:52 PM] Meet Bhanushali: Unflavoured me 22g protein
[28/12/2024, 9:08:11 PM] Dhruv Khara: Ye pehle se hi tha
[28/12/2024, 9:08:19 PM] Dhruv Khara: Brownie me 18 hai
[28/12/2024, 9:08:24 PM] Dhruv Khara: Cookie me 20
[28/12/2024, 9:08:31 PM] Dhruv Khara: Mango me sabse jyada
[28/12/2024, 9:09:46 PM] Meet Bhanushali: Abhi ek scoop 29g ka hai
[28/12/2024, 9:09:55 PM] Meet Bhanushali: 5.5lb ke hisab se dekhna padega
[28/12/2024, 9:13:04 PM] Dhruv Khara: 200 ke ass pass hoga
[28/12/2024, 9:13:07 PM] Dhruv Khara: 11lb
[28/12/2024, 9:13:09 PM] Dhruv Khara: Me
[28/12/2024, 9:13:16 PM] Dhruv Khara: 166-180
‎[28/12/2024, 9:13:19 PM] Meet Bhanushali: ‎image omitted
[28/12/2024, 9:13:34 PM] Dhruv Khara: Yehi dekhra
[28/12/2024, 9:13:57 PM] Meet Bhanushali: Agar 11lb 130$ ke aaspass milra toh lele
[28/12/2024, 9:14:11 PM] Dhruv Khara: 147
[28/12/2024, 9:14:17 PM] Meet Bhanushali: Nah
[28/12/2024, 9:14:22 PM] Dhruv Khara: Isolate
[28/12/2024, 9:14:40 PM] Meet Bhanushali: Baki ke compare me acha hi lricing hai
[28/12/2024, 9:15:21 PM] Dhruv Khara: Whey lu to 104
[28/12/2024, 9:15:32 PM] Meet Bhanushali: Isolate only
[28/12/2024, 9:17:48 PM] Dhruv Khara: Flavor
[28/12/2024, 9:17:58 PM] Dhruv Khara: Salted caramel ya cookie
[28/12/2024, 9:18:02 PM] Meet Bhanushali: Chocolate brownie best hai
[28/12/2024, 9:18:08 PM] Dhruv Khara: Bhai
[28/12/2024, 9:18:13 PM] Dhruv Khara: Usme protien kam hai
[28/12/2024, 9:18:25 PM] Meet Bhanushali: NOW ka lele fir😂
[28/12/2024, 9:18:44 PM] Meet Bhanushali: Iska nai pata bhai honestly
[28/12/2024, 9:19:06 PM] Meet Bhanushali: Yt wagera pe dekhna padega
[28/12/2024, 9:19:16 PM] Meet Bhanushali: Ya phle 2lb manga ke dekh
‎[28/12/2024, 9:19:34 PM] Dhruv Khara: ‎image omitted
[28/12/2024, 9:20:13 PM] Dhruv Khara: Choco smoo
[28/12/2024, 9:20:15 PM] Dhruv Khara: It is
[28/12/2024, 9:23:13 PM] Meet Bhanushali: Haa
[28/12/2024, 9:23:49 PM] Meet Bhanushali: Jisme bhi sucralose and acesulfame potassium hoga vo lele
[28/12/2024, 9:23:51 PM] Meet Bhanushali: Sweet hoga
[28/12/2024, 9:23:54 PM] Meet Bhanushali: 🙂‍↔️
[28/12/2024, 9:23:59 PM] Dhruv Khara: 155 hora
[28/12/2024, 9:24:14 PM] Dhruv Khara: Applepay use kiya ro
[28/12/2024, 9:24:22 PM] Meet Bhanushali: Bc
[28/12/2024, 9:24:28 PM] Meet Bhanushali: 155 zyada hai
[28/12/2024, 9:26:35 PM] Dhruv Khara: Kardiya abb
‎[28/12/2024, 9:27:43 PM] Meet Bhanushali: ‎GIF omitted
‎[28/12/2024, 9:39:42 PM] Dhruv Khara: ‎sticker omitted
[29/12/2024, 7:59:09 PM] Meet Bhanushali: Bhai 31st ka kya plan hai
[29/12/2024, 7:59:23 PM] Meet Bhanushali: Time swuare jana hai
[29/12/2024, 8:03:20 PM] Dhruv Khara: No plan nigga
[29/12/2024, 8:03:35 PM] Meet Bhanushali: .
[29/12/2024, 8:03:45 PM] Dhruv Khara: Bruh
[29/12/2024, 8:03:57 PM] Dhruv Khara: Khade rehne ki jaga nai hoti waha
[29/12/2024, 8:04:19 PM] Meet Bhanushali: Isliye terko puch ra hu
[29/12/2024, 8:04:23 PM] Meet Bhanushali: Lamba hai na bhai
[29/12/2024, 8:04:34 PM] Dhruv Khara: Atlantic
[29/12/2024, 8:04:36 PM] Dhruv Khara: Coty
[29/12/2024, 8:04:48 PM] Meet Bhanushali: Kya?
[29/12/2024, 8:04:53 PM] Dhruv Khara: Nvm
[29/12/2024, 8:04:57 PM] Dhruv Khara: Ignore
[01/01/2025, 8:09:49 PM] Dhruv Khara: bruh iska taste ekdum buttersctoch jaisa hai
[01/01/2025, 8:09:55 PM] Dhruv Khara: melted wala
[01/01/2025, 8:09:59 PM] Dhruv Khara: same to same
[01/01/2025, 8:10:00 PM] Dhruv Khara: mkc
[01/01/2025, 8:40:57 PM] Meet Bhanushali: Choco smooth ka?
[01/01/2025, 8:55:42 PM] Dhruv Khara: Salted caramel
[01/01/2025, 8:56:02 PM] Meet Bhanushali: Me aunga toh karta taste
‎[01/01/2025, 8:56:27 PM] Dhruv Khara: ‎sticker omitted
[01/01/2025, 8:56:29 PM] Meet Bhanushali: Myprotein?
[01/01/2025, 8:56:34 PM] Dhruv Khara: Yes set
[01/01/2025, 8:56:39 PM] Meet Bhanushali: Eknumber
[01/01/2025, 8:56:47 PM] Dhruv Khara: Same to same amul butterscotch cone
[01/01/2025, 8:56:49 PM] Dhruv Khara: Meted
[01/01/2025, 8:56:53 PM] Dhruv Khara: Melted
[01/01/2025, 8:57:03 PM] Dhruv Khara: Milk ke sath liya to***
[01/01/2025, 8:57:02 PM] Meet Bhanushali: Me bhi lunga fir nxt time acha lga toh
[01/01/2025, 8:57:07 PM] Dhruv Khara: F
[01/01/2025, 8:57:09 PM] Meet Bhanushali: Pani ke sath?
[01/01/2025, 8:57:14 PM] Dhruv Khara: Not tried
[01/01/2025, 8:57:20 PM] Dhruv Khara: Karta hu
[01/01/2025, 8:57:21 PM] Dhruv Khara: Kal
[01/01/2025, 8:57:24 PM] Meet Bhanushali: Haa
[05/01/2025, 11:03:34 PM] Meet Bhanushali: Bhai fitness factory jane ka soch raha ek din
[05/01/2025, 11:03:36 PM] Meet Bhanushali: Ayga
[05/01/2025, 11:03:37 PM] Meet Bhanushali: ?
[06/01/2025, 1:43:34 AM] Dhruv Khara: Kab aur kaha hain ye
[06/01/2025, 1:47:18 AM] Meet Bhanushali: Ek hoboken me hai
[06/01/2025, 1:47:19 AM] Meet Bhanushali: Aur ek
[06/01/2025, 1:47:21 AM] Meet Bhanushali: Newport
[06/01/2025, 1:47:36 AM] Meet Bhanushali: Free trail me jana hai muje, acah laga toh join kar lunga
[06/01/2025, 1:51:54 AM] Dhruv Khara: Newport mall wala
[06/01/2025, 1:52:04 AM] Meet Bhanushali: Vo base fitness hai
[06/01/2025, 1:52:25 AM] Dhruv Khara: Oh
[06/01/2025, 1:52:40 AM] Dhruv Khara: Chal
Bata mai abhi so daha dimag kaam nahi kar rha
[06/01/2025, 1:52:54 AM] Meet Bhanushali: Tuesday dekh
[06/01/2025, 1:52:59 AM] Meet Bhanushali: Asakta hai ki nai
[06/01/2025, 1:54:53 AM] Dhruv Khara: Off hoga to
[06/01/2025, 1:54:58 AM] Dhruv Khara: Warna nahi
[06/01/2025, 1:55:03 AM] Meet Bhanushali: Acha
[06/01/2025, 1:55:07 AM] Meet Bhanushali: Bata fir kab off hoga
[06/01/2025, 1:55:09 AM] Meet Bhanushali: Tab jate
[07/01/2025, 9:04:39 PM] Dhruv Khara: https://lu.ma/8xz3yyu8?tk=6XtH1x
[09/01/2025, 4:24:29 PM] Meet Bhanushali: Ye hacking pe hai
[09/01/2025, 5:07:28 PM] Dhruv Khara: Nope
[09/01/2025, 5:07:44 PM] Meet Bhanushali: Likha hai
[09/01/2025, 5:08:04 PM] Dhruv Khara: Nai
[09/01/2025, 5:08:31 PM] Dhruv Khara: 7:30 ​Hacking & Building
[09/01/2025, 5:08:46 PM] Dhruv Khara: Hacking matlab app building hota
[09/01/2025, 5:08:51 PM] Meet Bhanushali: Evnt ka hi naam hai
[09/01/2025, 5:08:57 PM] Meet Bhanushali: AI hack night
[09/01/2025, 5:09:19 PM] Meet Bhanushali: Hein?
[09/01/2025, 5:10:43 PM] Meet Bhanushali: Me krta register
[09/01/2025, 5:10:47 PM] Meet Bhanushali: Jaa sakte maja ayga
[09/01/2025, 5:11:05 PM] Meet Bhanushali: Ghumna bhi ho jayga
[09/01/2025, 5:12:02 PM] Meet Bhanushali: Title me kya dala
[09/01/2025, 5:26:21 PM] Dhruv Khara: Cool
[13/01/2025, 1:24:27 PM] Meet Bhanushali: Ye databricks ka certification book kiya hi 16 ko
[13/01/2025, 1:24:32 PM] Meet Bhanushali: Uska padhai baki hai
[13/01/2025, 1:48:33 PM] Dhruv Khara: Ok no worries
[13/01/2025, 1:48:38 PM] Dhruv Khara: All the best
[13/01/2025, 2:20:49 PM] Meet Bhanushali: Thank you bhai
[28/01/2025, 9:45:04 AM] Dhruv Khara: Nyu hack hai
[28/01/2025, 9:45:10 AM] Dhruv Khara: 8-9 feb
[28/01/2025, 9:45:57 AM] Meet Bhanushali: Saturday aur Sunday 🥹
[28/01/2025, 9:46:01 AM] Meet Bhanushali: Link hai?
[28/01/2025, 9:55:33 AM] Meet Bhanushali: ‎Silenced voice call, ‎Focus mode
[29/01/2025, 10:42:09 AM] Meet Bhanushali: Bhai me nai aapaunga, mera internship ka bhi projects chalu ho gaya hai
[29/01/2025, 12:03:01 PM] Dhruv Khara: coo
[29/01/2025, 12:03:04 PM] Dhruv Khara: no wories
[29/01/2025, 12:03:20 PM] Meet Bhanushali: Jeetke ana bhai
[29/01/2025, 12:03:22 PM] Meet Bhanushali: 😈
[02/02/2025, 10:06:54 PM] Meet Bhanushali: https://www.nvidia.com/gtc/?nvid=nv-int-bnr-550763
[20/02/2025, 7:40:14 PM] Dhruv Khara: Oi
[20/02/2025, 7:40:39 PM] Dhruv Khara: Sat sun next week henhacks karke hackathon hai
[20/02/2025, 7:40:44 PM] Dhruv Khara: University of delaware me
[20/02/2025, 7:41:37 PM] Meet Bhanushali: Chlo
[20/02/2025, 7:43:03 PM] Dhruv Khara: https://www.henhackshackathon.com/
‎[20/02/2025, 10:20:14 PM] Meet Bhanushali: ‎image omitted
[20/02/2025, 10:21:22 PM] Meet Bhanushali: ‎Voice call, ‎4 min
[20/02/2025, 10:57:57 PM] Meet Bhanushali: Bhai ye newport wala gym me aaja kabhi ana ho toh
[20/02/2025, 10:58:15 PM] Meet Bhanushali: Mere sath ayga toh 10$ lagega day pas ka
[20/02/2025, 11:05:44 PM] Dhruv Khara: Planet fitness op
[24/02/2025, 9:29:21 PM] Dhruv Khara: ‎Voice call, ‎3 min
‎[26/02/2025, 2:41:07 AM] Meet Bhanushali: ‎image omitted
[26/02/2025, 10:57:48 AM] Dhruv Khara: Ye kya hua
[26/02/2025, 11:05:20 AM] Meet Bhanushali: Baaicalli log ab US m jobs create nai kr payenge ya companies me invest nai kr payenge
[26/02/2025, 11:05:27 AM] Meet Bhanushali: Ab greencard ke liye
[26/02/2025, 11:05:33 AM] Meet Bhanushali: Seedha gov ko paisa dena padega
[26/02/2025, 11:05:48 AM] Dhruv Khara: Ha dekha miame
[26/02/2025, 11:05:50 AM] Dhruv Khara: 5 milli
[26/02/2025, 11:06:05 AM] Meet Bhanushali: Boom baam ho gya
[27/02/2025, 4:09:37 PM] Dhruv Khara: hey everyone! my name is Aaftab. i'm a third year student at Penn State studying Computer Science interning at a bank for the summer. I have a background in Python/Java and have experience with data science and ML techniques.

It's currently just me and another third-year student with 5+ hackathon wins who is interning at Amazon for the summer and is experienced on the front-end side w/ Next.js, React, and tailwindcss. They are working on full stack for this project.

We are currently looking for 1-2 team members that can help out with backend development + ML experience is a plus. We are currently thinking of an idea in education technology and our full stack is currently looking like: Next.js/tailwindcss/flask.
[27/02/2025, 4:09:43 PM] Dhruv Khara: ‎Voice call, ‎2 min
[27/02/2025, 4:14:08 PM] Meet Bhanushali: https://www.linkedin.com/in/bhanushalimeet?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app
[27/02/2025, 4:14:22 PM] Dhruv Khara: https://my.hackprinceton.com/
‎[27/02/2025, 4:15:17 PM] Meet Bhanushali: Resume_Meet_Bhanushali_v3.pdf • ‎1 page ‎document omitted
[27/02/2025, 4:16:52 PM] Meet Bhanushali: applications are closed this semester bata raha hai
[27/02/2025, 4:17:04 PM] Dhruv Khara: F
[28/02/2025, 1:45:56 AM] Meet Bhanushali: Iska aya kuch response?
[28/02/2025, 12:11:07 PM] Meet Bhanushali: Kal ka kya scene? Kitne bje nikalna hai?
[28/02/2025, 1:34:06 PM] Dhruv Khara: Sham ko message kardo
[28/02/2025, 8:49:06 PM] Meet Bhanushali: Address bhejde
[28/02/2025, 8:54:40 PM] Dhruv Khara: 74 pollock ave
[28/02/2025, 8:59:36 PM] Meet Bhanushali: 30$
[28/02/2025, 9:00:06 PM] Dhruv Khara: Thik hi hai tera bhej
[28/02/2025, 9:01:30 PM] Meet Bhanushali: 389 Summit Avenue, Jersey City
[28/02/2025, 9:02:49 PM] Meet Bhanushali: ‎Voice call, ‎3 min
‎[28/02/2025, 9:10:15 PM] Meet Bhanushali: ‎image omitted
[28/02/2025, 9:45:48 PM] Dhruv Khara: Ha
‎[28/02/2025, 10:42:09 PM] Dhruv Khara: ‎image omitted
[28/02/2025, 10:42:13 PM] Dhruv Khara: Ye address
[28/02/2025, 10:42:19 PM] Dhruv Khara: Enterprise ka
[28/02/2025, 10:42:29 PM] Dhruv Khara: 132 carson road
[01/03/2025, 4:54:55 AM] Meet Bhanushali: 5:10 tak nikal ta hu
[01/03/2025, 4:54:57 AM] Meet Bhanushali: Thoda khake
[01/03/2025, 5:00:54 AM] Dhruv Khara: Book karne ke pegle txt
[01/03/2025, 5:01:49 AM] Dhruv Khara: Energy drink ka scene ho sakta ?
[01/03/2025, 5:02:12 AM] Meet Bhanushali: Ha hai
[01/03/2025, 5:02:19 AM] Meet Bhanushali: Tu pi lena
[01/03/2025, 5:02:29 AM] Dhruv Khara: Sahi
[01/03/2025, 5:02:29 AM] Meet Bhanushali: White monster 😈
[01/03/2025, 5:02:34 AM] Dhruv Khara: Cool
‎[01/03/2025, 5:15:35 AM] Meet Bhanushali: ‎image omitted
[01/03/2025, 5:15:47 AM] Dhruv Khara: Ha
[01/03/2025, 5:16:37 AM] Meet Bhanushali: 10 min me pickup bata raha hai
[01/03/2025, 5:16:56 AM] Dhruv Khara: Kar
[01/03/2025, 5:18:26 AM] Meet Bhanushali: 4 min me pickup
[01/03/2025, 5:20:15 AM] Meet Bhanushali: ‎Missed voice call, ‎Tap to call back
[01/03/2025, 5:24:09 AM] Dhruv Khara: Aaya
[01/03/2025, 5:24:15 AM] Dhruv Khara: ‎Voice call, ‎No answer
[01/03/2025, 5:24:27 AM] Dhruv Khara: Muje 4 min me lega ?
[01/03/2025, 5:25:30 AM] Meet Bhanushali: Ha chalega
[01/03/2025, 5:25:35 AM] Meet Bhanushali: Abhi raste me hi hu
[01/03/2025, 5:25:56 AM] Meet Bhanushali: 5 min lagega muje bhi
[01/03/2025, 5:26:33 AM] Dhruv Khara: Aree aisa nahi tu lyft me hoga tab bataa
[01/03/2025, 5:26:51 AM] Meet Bhanushali: Ha lyft me hi hu
[01/03/2025, 5:27:05 AM] Meet Bhanushali: ‎Voice call, ‎9 sec
[01/03/2025, 5:29:49 AM] Meet Bhanushali: ‎Location: https://maps.google.com/?q=40.719036,-74.082939
[01/03/2025, 11:06:33 AM] Dhruv Khara: **Generative AI**

Generative AI is HenHacks beginner hack for 2025! Consider how generative AI can be used to tackle tasks or solve problems previously difficult to accomplish. What new possibilities or improvements can emerge from applying generative AI that would expand the boundaries of what we can do or understand?

**Productivity & Organization**

Sponsored by LabWare! Think about a platform or application you use regularly in your daily life. What improvements or new features would you propose to make it more efficient, user-friendly, or impactful?

**Best Use of AI powered by Reach Capital**

AI has upended what we can accomplish with technology. Reach Capital invests in the next generation of founders and technical talent, and they want you to use AI to transform the future of learning, health, and work. Build a project that impacts one (or all!) of these areas for a chance to win a Logitech webcam for each member of your team and the exclusive opportunity to discuss your creation with Reach Capital's team of expert investors. The winning team will also be considered for a grand prize — if chosen you'll be flown out to San Francisco to meet with the Reach Capital team in person!

**Best Use of Midnight**

Midnight is a data protection blockchain that offers programmable data protection capabilities powered by zero-knowledge technology to address the delicate balance between data protection, ownership, and utilization. This ensures that developers can leverage blockchain technology without exposing confidential information or losing control over their data. To build on Midnight, all you need is familiarity with TypeScript or a similar JavaScript based library. The service is free to use and their developer documentation has all the information you need to get started. Build a DApp using Midnight this weekend for a chance to win wireless headphones for you and each of your team mates!

**Best Use of Gemini API**

It's time to push the boundaries of what's possible with AI using Google Gemini. Check out the Gemini API to build AI-powered apps that make your friends say WHOA. So, what can Gemini do for your hackathon project? Understand language like a human and build a chatbot that gives personalized advice Analyze info like a supercomputer and create an app that summarizes complex research papers Generate creative content like code, scripts, music, and more Think of the possibilities… what will you build with the Google Gemini API this weekend?

**Best Domain Name from GoDaddy Registry**

GoDaddy Registry is giving you everything you need to be the best hacker no matter where you are. Register your domain name with GoDaddy Registry for a chance to win some amazing prizes!

**LabWare Additional Mini Category**

*No in-person judging*

The Smalltalk Mini Category will award $1,000 in Visa gift cards to one winning team. To help with judging, teams submitting to this category must include a README file at the top level of their GitHub submission. This README should briefly describe how Smalltalk was used in the project and indicate where any Smalltalk-related files can be found in the repository. This will ensure reviewers can easily understand and evaluate your implementation.
- 
- 
- 
-
[01/03/2025, 11:22:39 AM] Dhruv Khara: coThis is a great idea! Let's develop an app concept that helps users manage and extract value from their chat histories.

**Chat Memory: Your Digital Conversation Assistant**

**Core Concept:**
An application that indexes, analyzes, and makes searchable all your chat conversations across platforms, helping you recall information, track commitments, and understand communication patterns.

**Key Features:**

1. **Contextual Reminders**
   - Set up reminders based on conversation content ("Remind me about this project discussion in 2 weeks")
   - Smart detection of commitments or promises made in conversations
   - Calendar integration for time-based context retrieval

2. **Universal Search & Recall**
   - Natural language search across all your chat platforms 
   - "What did Alex say about the project timeline last month?"
   - "Find that restaurant recommendation Sarah gave me"

3. **Conversation Summarization**
   - Generate concise summaries of lengthy chat threads
   - Extract key points, decisions, and action items
   - Create meeting notes from chat-based discussions

4. **Relationship Insights**
   - Track communication frequency and patterns with contacts
   - Highlight important relationships that may need attention
   - Suggest follow-ups for conversations that didn't receive replies

5. **Knowledge Base Creation**
   - Automatically categorize information shared in chats
   - Create personal wikis from knowledge shared in conversations
   - Extract links, files, and resources shared in chats into organized collections

6. **Privacy-Focused Design**
   - All processing happens locally on the user's device
   - End-to-end encryption for any cloud synchronization
   - Granular controls for which conversations are indexed

**Technology Implementation:**

For the HenHacks categories:

1. **Generative AI (Beginner Hack)**
   - Use AI to summarize conversations, extract key points, and generate contextual reminders
   - Create knowledge graphs from conversation content

2. **Best Use of AI (Reach Capital)**
   - Focus on how this improves work productivity by reducing information loss
   - Show how it helps with learning by preserving important information

You could also integrate:

- **Midnight blockchain** for secure, privacy-preserving storage of sensitive conversation data
- **Gemini API** for the natural language understanding components and contextual analysis

**Potential Extensions:**

1. **Communication Style Analysis**
   - Help users understand their communication patterns and suggest improvements
   - Identify miscommunications or potential misunderstandings

2. **Cross-Platform Integration**
   - Support for WhatsApp, Telegram, Slack, Discord, SMS, etc.
   - Browser extensions for web-based chat platforms

3. **Voice Conversation Support**
   - Transcribe and index voice messages or calls
   - Allow searching through spoken conversations

Would you like me to expand on any particular aspect of this concept? I could develop the user interface design, data architecture, or specific implementation details for the hackathon.
[01/03/2025, 11:47:41 AM] Dhruv Khara: sk-d5ca2d24ba0447c49ca2d2766da82930
'''
    
    try:
        with open('test_chat.txt', 'w') as f:
            f.write(sample_content)
        print("\nCreated sample chat file: test_chat.txt")
        return True
    except Exception as e:
        print(f"\nError creating sample chat file: {e}")
        return False

if __name__ == "__main__":
    print("\nTesting ChatLore API...")
    
    # Create sample chat file if it doesn't exist
    if not create_sample_chat():
        sys.exit(1)
    
    # Run tests
    tests = [
        ("Upload Chat", test_upload_chat),
        ("Semantic Search", test_semantic_search),
        # ("Conversation Insights", test_conversation_insights),
        # ("Topic Clusters", test_topic_clusters),
        ("Message Filtering", test_message_filtering),
        ("Security", test_security)
    ]
    
    failed_tests = []
    for test_name, test_func in tests:
        print(f"\nRunning test: {test_name}")
        if not test_func():
            failed_tests.append(test_name)
    
    # Print summary
    print("\n=== Test Summary ===")
    if failed_tests:
        print(f"Failed tests: {', '.join(failed_tests)}")
        sys.exit(1)
    else:
        print("All tests passed successfully!") 
import requests, json, sys
from getpass import getpass
from pathlib import Path

creds = Path('creds.json')

def writeCreds(rbody):
    creds.write_text(json.dumps(rbody))

def getToken() :
    username = input("What's you're username ? ")
    password = getpass("What's you're password ? ")
    payload = {
            'username' : username,
            'password' : password
            }
    response = requests.post('http://localhost:8080/api/auth/login', payload)
    if response.status_code == 200:
        print("Login Successefull")
        print(response.json())
        writeCreds(response.json())
    else:
        print(response.status_code)
        print(response.json())

def refreshToken(headers):
    print('Refrshing Token')
    refresh = json.loads(creds.read_text())['refresh']
    body = {
            'refresh' : refresh
            }
    response = requests.post(f'http://localhost:8080/api/auth/refresh', headers=headers, data=body)
    if response.status_code != 200 :
        print(response.status_code)
        print(response.text)
        print('Refreshing Fail')
        creds.unlink()
    else :
        print('Refrshing Success')
        writeCreds(response.json())


def getUserProfile(userPk):
    if creds.exists() :
        access = json.loads(creds.read_text())['access']
        headers = {
                'Authorization' : f'Bearer {access}'
                }
        refresh = json.loads(creds.read_text())['refresh']
        body = {
                'refresh' : refresh
                }
        response = requests.get(f'http://localhost:8080/api/auth/val', headers=headers)
        # response = requests.patch(f'http://localhost:8080/api/auth/update/{userPk}', headers=headers, data=body)
        # response = requests.delete(f'http://localhost:8080/api/auth/delete/{userPk}', headers=headers)
        # response = requests.post(f'http://localhost:8080/api/auth/logout', headers=headers, data=body)
        if response.status_code == 401 :
            print(response.status_code)
            print(response.text)
            refreshToken(headers)
            getUserProfile(userPk)
        else :
            print(response.status_code)
            print(response.text)

    else :
        getToken()
        getUserProfile(userPk)


if __name__ == "__main__":
    getUserProfile(sys.argv[1])

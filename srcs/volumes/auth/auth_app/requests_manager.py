import requests
from .serializers import createServiceToken
from .models import Service

def send_request(url:str, method:str, body={}, headers={}) -> int:
    req_methods = {
            'post':requests.post,
            'delete':requests.delete,
            'update':requests.put,
            'patch':requests.patch,
            }

    token = createServiceToken(Service.objects.get(serviceName='auth'))
    headers.update({'Authorization': f'Bearer {token}'})
    response = req_methods[method](url,json=body ,headers=headers)
    return response.status_code

def send_requests(urls:list, method:str, body={}, headers={}) -> int:
    status_list = []
    for url in urls:
        print(f'Sending a request to {url}')
        ret = send_request(url=url, method=method, body=body, headers=headers)
        status_list.append(ret)
    print(status_list)
    return status_list

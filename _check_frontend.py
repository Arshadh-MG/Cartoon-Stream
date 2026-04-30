import urllib.request
urls = ['http://127.0.0.1:8000/', 'http://127.0.0.1:8000/static/app.js']
for url in urls:
    try:
        data = urllib.request.urlopen(url).read().decode('utf-8')
        print(url, 'OK', len(data))
        if url.endswith('app.js'):
            print('contains AdminPanel:', 'function AdminPanel' in data)
    except Exception as e:
        print(url, 'ERROR', e)

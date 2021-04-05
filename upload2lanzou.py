import sys
import os
import requests
import time
import json
from urllib import parse
from lanzou.api import LanZouCloud
lzy = LanZouCloud()

cookie = json.loads(os.getenv('LANZOU_COOKIE'))
server_key = os.getenv('SERVER_KEY')

if lzy.login_by_cookie(cookie) != LanZouCloud.SUCCESS:
    url = 'https://sc.ftqq.com/' + server_key + \
        '.send?text=' + parse.quote('蓝奏云Cookie失效') + '&desp=' + \
        time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    print(url)
    res = requests.get(url)
    print(res.text)
    sys.exit()

def show_progress(file_name, total_size, now_size):
    """显示进度的回调函数"""
    percent = now_size / total_size
    bar_len = 40  # 进度条长总度
    bar_str = '>' * round(bar_len * percent) + '=' * round(bar_len * (1 - percent))
    print('\r{:.2f}%\t[{}] {:.1f}/{:.1f}MB | {} '.format(percent * 100,
                                                     bar_str, now_size / 1048576, total_size / 1048576, file_name), end='')
    if total_size == now_size:
        print('')

def handler(fid, is_file):
    if is_file:
        lzy.set_desc(fid, '公主连结Re:Dive 中文输入法词库', is_file=True)


code = lzy.upload_file(os.path.abspath(r'.\pcr-dict.zip'), 3247264, callback=show_progress, uploaded_handler=handler)
if code == LanZouCloud.SUCCESS:
    print('Upload to lanzou cloud successfully!')
else:
    print('Upload to lanzou cloud failed!')

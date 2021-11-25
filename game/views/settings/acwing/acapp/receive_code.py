from django.http import JsonResponse
from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint

def receive_code(request):
    data = request.GET

    if 'errcode' in data:
        return JsonResponse({
            'result': 'apply failed',
            'errcode': data.get('errcode'),
            'errmsg': data.get('errmsg'),
            })

    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return JsonResponse({
            'result': 'state not exist'
            })

    cache.delete(state)

    # 通过code申请token
    appid = '440'
    secret = '28a130094464429db598503e985c6da5'

    apply_access_token_url = 'https://www.acwing.com/third_party/api/oauth2/access_token/' 
    params = {
            'appid':appid,
            'secret':secret,
            'code':code
            }

    access_token_res = requests.get(apply_access_token_url, params=params).json()

    # 通过token获取用户信息
    get_userinfo_url = 'https://www.acwing.com/third_party/api/meta/identity/getinfo/'

    openid = access_token_res['openid']
    access_token = access_token_res['access_token']


    players = Player.objects.filter(openid=openid)
    if players.exists(): # 如果该用户已存在，则直接登录
        player = players[0]

        return JsonResponse({
            'result': 'success',
            'username': player.user.username,
            'photo': player.photo
            })

    params = {
        'access_token': access_token,
        'openid': openid
    }

    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))


    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    return JsonResponse({
        'result': 'success',
        'username': player.user.username,
        'photo': player.photo
        })


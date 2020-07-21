
import xlwt
import time
import datetime
import requests
from pyquery import PyQuery as pq

a = ['20180101']

def get_diff(start, end):
	if not start or not end: 
		return 0
	if start == '-' or end == '_':
		return 0	
	start = datetime.datetime.strptime(start.strip(), '%Y-%m-%d %H:%M:%S').date()
	end = datetime.datetime.strptime(end.strip(), '%Y-%m-%d %H:%M:%S').date()

	return (end - start).days

def get_workdays(start, end):

	a = start.split(' ')[0].replace('-', '')
	b = end.split(' ')[0].replace('-', '')
	print(a, b)
	start = int(a)
	end = int(b)

	if end <= start:
		return end - start
	time.sleep(0.5)
	url = 'http://tool.bitefu.net/jiari/?d=' + ','.join([str(i) for i in range(start, end+1)])
	try:
		a = requests.get(url, timeout=30)
		print(a.text)
		b = a.json()
		count = 0
		for i,v in b.items():
			if v == 0 or i == '0':
				count += 1
		return count
	except Exception as e:
		print('获取节假日报错: %s' % str(e))
		print(url)
		return 0

	


def c(name, url, cookie, page):

	headers = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
		'Cookie': cookie
		}

	'''https://p.etcp.cn/inThePark/intheparkRecord?page=2'''

	a = xlwt.Workbook(encoding='utf-8')
	b = a.add_sheet(name)
	b.write(0,0, '提现单编号')
	b.write(0,1, '申请时间')
	b.write(0,2, '申请金额(元)')
	b.write(0,3, '申请人')
	b.write(0,4, '进度')
	b.write(0,5, '完成时间')
	b.write(0,6, '操作')
	for i in range(1, page+1):
		print('第%s页-----' % i)
		url_ = url if i == 1 else url + '?page=%s'%i

		resp = requests.get(url_, headers=headers)

		p = pq(resp.text)

		trs = p.find('.billing_table tbody tr')

		for j, tr in enumerate(trs):
			print(tr)
			if j == 0:
				continue
			tr = p(tr).find('td')

			start, end = '', ''

			for z,td in enumerate(tr):
				b.write((i-1)*10 + j, z, p(td).text())
				if z == 1:
					start = p(td).text()
				if z == 5:
					end = p(td).text()
			diff = get_diff(start, end)
			b.write((i-1)*10 + j, z+1, get_diff(start, end))
			
			if diff > 1:
				print('%s天'%diff)
				workdays = get_workdays(start, end)
				print('工作日: %s天'%workdays)
				b.write((i-1)*10 + j, z+2, workdays-1 if workdays!=diff else diff)
	 
		# time.sleep(0.5)

	a.save('%s.xls'%name)


if __name__ == '__main__':

	'''登录后拿到一个cookie'''
	cookie = 'gr_user_id=e3c7f671-e6f7-4185-8406-bc51c7451417; SSESSID=3dk8isc2mkno2347ng92ep5n54'
	
	url = 'https://p.etcp.cn/inThePark/intheparkRecord' # 提现记录页面url
	
	page = 19 # 总共要导出多少页

	c('尚街', url, cookie, page)








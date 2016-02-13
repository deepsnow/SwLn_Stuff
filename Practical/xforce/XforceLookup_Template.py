import unittest
from unittest.mock import patch
from unittest.mock import Mock
from unittest.mock import MagicMock
import urllib.request
import urllib.parse
import json
import ipaddress
import base64
import http.client ## For testing only.

class XforceLookup:

    def __init__(self, key, pswd):
        self.apikey = key
        self.apipswd = pswd
        self.ip_report_url_prefix = 'https://api.xforce.ibmcloud.com/ipr/'

    def _IsPublic(self, ipaddr):
        return not ipaddress.ip_address(ipaddr).is_private ## See http://stackoverflow.com/questions/691045/how-do-you-determine-if-an-ip-address-is-private-in-python.

    def _PrepareRequest(self, ipaddr):
        url = self.ip_report_url_prefix + ipaddr
        auth = str(base64.b64encode(bytes(self.apikey + ':' + self.apipswd, 'UTF-8')), 'UTF-8') ## Following HTTP Basic Auth guidance from: https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side.
        self.headers = {
                'Authorization' : 'Basic ' + auth,
            }
        self.urlRequest = urllib.request.Request(url, None, self.headers)

    def _LookUpIpAddr(self):
        res_handle = urllib.request.urlopen(self.urlRequest)
        res_data = res_handle.read()
        return json.loads(str(res_data, 'UTF-8'))

    def _FormatOutput(self, json_dict):
        self._ParseIpr(json_dict)

    def _ParseIpr(self, json_dict):
        self._ParseIp(json_dict, False)
        for item in json_dict['subnets']:
            self._ParseIp(item)

    def _ParseIp(self, json_dict, child=True):
        if 'ip' in json_dict:
            self._PrintWithIndent('IP Addr: ' + json_dict['ip'], child)
        if ('created' in json_dict):
            self._PrintWithIndent('Subnet created: ' + json_dict['created'], child)
        if ('geo' in json_dict and 'country' in json_dict['geo']):
            self._PrintWithIndent('Country: ' + json_dict['geo']['country'], child)
        if ('score' in json_dict):
            self._PrintWithIndent('Score: ' + str(json_dict['score']), child)
        if ('reason' in json_dict) and not child:
            self._PrintWithIndent('Reason: ' + str(json_dict['reason']), child)
        if ('reasonDescription' in json_dict) and not child:
            self._PrintWithIndent('Reason Description: ' + str(json_dict['reasonDescription']), child)
        if ('subnet' in json_dict):
            self._PrintWithIndent('Subnet: ' + json_dict['subnet'], child)
        if ('cats' in json_dict):
            if ('Anonymisation Services' in json_dict['cats']):
                self._PrintWithIndent('Anonymisation Services: ' + str(json_dict['cats']['Anonymisation Services']), child)
            if ('Malware' in json_dict['cats']):
                self._PrintWithIndent('Malware: ' + str(json_dict['cats']['Malware']), child)
            if ('Botnet Command and Control Server' in json_dict['cats']):
                self._PrintWithIndent('Botnet Command and Control Server: ' + str(json_dict['cats']['Botnet Command and Control Server']), child)

    def _PrintWithIndent(self, str_to_print, tab=True):
        if tab:
            print('\t' + str_to_print)
        else:
            print(str_to_print)
        
    def LookUpIpAddr(self, ipaddr):
        if self._IsPublic(ipaddr):
            self._PrepareRequest(ipaddr)
            json_result = self._LookUpIpAddr()
            self._FormatOutput(json_result)

## Unit tests are very important to me. They are a great aid in developing code, and an utter necessity in maintaining code over time.
class XforceLookupTest(unittest.TestCase):

    def setUp(self):
        key = '5af8c2a8-097a-4cb2-be98-3db852ccd480'
        pswd = '768e7094-8cd1-4b25-b8e6-31f3fd03cdbf'
        self.xl = XforceLookup(key, pswd)

    def test__IsPublic_CorrectDeterminationMade(self):
        assert self.xl._IsPublic('127.0.0.1') == False
        assert self.xl._IsPublic('198.60.22.4') == True
        ## there are other use cases to test here but I'll save that for another day

    def test__PrepareRequest_UrlAndHeaderAreWellFormed(self):
        with patch.object(urllib.request, 'Request', return_value=None) as mock_method:
            self.xl._PrepareRequest('198.60.22.4')
        mock_method.assert_called_once_with('https://api.xforce.ibmcloud.com/ipr/198.60.22.4', None, self.xl.headers)
        assert self.xl.headers['Authorization'] == 'Basic NWFmOGMyYTgtMDk3YS00Y2IyLWJlOTgtM2RiODUyY2NkNDgwOjc2OGU3MDk0LThjZDEtNGIyNS1iOGU2LTMxZjNmZDAzY2RiZg=='

    def test__LookUpIpAddr_OneUrlReqMade(self):
        ip_data = { 'ip': '198.60.22.4', 'geo': { 'countrycode': 'US', 'country': 'United States' } }
        json_data = json.dumps(ip_data)
        resp = bytes(json_data, 'UTF-8')
        resp_mock = MagicMock(spec=http.client.HTTPResponse)
        resp_mock.read = MagicMock(return_value=resp)
        with patch.object(urllib.request, 'urlopen', return_value=resp_mock) as open_mock:
            self.xl._PrepareRequest('198.60.22.4')
            output = self.xl._LookUpIpAddr()
        open_mock.assert_called_once_with(self.xl.urlRequest)
        resp_mock.read.assert_called_once()
        assert output == ip_data ## This will not work if ip_data has non-string keys. See https://docs.python.org/3/library/json.html, section 19.2.1, in the spec for json.dumps(...).       

def main():
    ##addr = '198.60.22.4' ## This is www.xmission.com, benign or so I would assume.
    ip_addr = '176.96.242.209' ## Malicious addr from Ukraine according to XForce.
    ##addr = '162.158.102.101' ## Malicious addr from US according to XForce.
    ##addr = '94.136.40.103' ## Malicious addr from UK according to XForce.
    api_key = 'XXX'
    api_pswd = 'XXX'
    xl = XforceLookup(api_key, api_pswd)
    xl.LookUpIpAddr(ip_addr)

if __name__ == '__main__':
    main()

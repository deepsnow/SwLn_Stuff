import unittest
from unittest.mock import patch
from unittest.mock import Mock
from unittest.mock import MagicMock
from unittest.mock import call
import urllib.request
import urllib.parse
import json
import ipaddress
import base64
import http.client ## For testing only.

## The following class fetches an IP Report from IBM's XForce threat intel repo and prints that report to the console window.
## The API key and password are the inputs required for the constructor, and the IP Address of interest is the input required for this class's lone public method (as it were) called LookUpIpAndPrintReport().

class XforceLookup:

    def __init__(self, key, pswd):
        self.apikey = key
        self.apipswd = pswd
        self.ip_report_url_prefix = 'https://api.xforce.ibmcloud.com/ipr/'

    def _IsPublic(self, ipaddr):
        return not ipaddress.ip_address(ipaddr).is_private ## See http://stackoverflow.com/questions/691045/how-do-you-determine-if-an-ip-address-is-private-in-python.

    def _PrepareRequest(self, ipaddr):
        url = self.ip_report_url_prefix + ipaddr ## Complete the URL of the RESTful API endpoint for fetching an IP Report.
        auth = str(base64.b64encode(bytes(self.apikey + ':' + self.apipswd, 'UTF-8')), 'UTF-8') ## Following HTTP Basic Auth guidance from: https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side.
        self.headers = {
                'Authorization' : 'Basic ' + auth,
            }
        self.urlRequest = urllib.request.Request(url, None, self.headers) ## Construct the HTTP request object by passing in the URL and request headers.

    def _LookUpIpAddr(self):
        res_handle = urllib.request.urlopen(self.urlRequest) ## Make the API call (the HTTP request).
        res_data = res_handle.read() ## Read the reply into memory.
        return json.loads(str(res_data, 'UTF-8')) ## Convert the reply into a Python dict object for parsing.

    def _FormatOutput(self, json_dict):
        self._ParseIpr(json_dict)

    def _ParseIpr(self, json_dict):
        self._ParseIprNode(json_dict, False) ## Parse the root node info (for the IP Address itself).
        for item in json_dict['subnets']:
            self._ParseIprNode(item) ## Parse each leaf node info that may be present describing subnets associated with the IP Address.

    def _ParseIprNode(self, json_dict, child=True): ## The Python dict parsing that I'm doing in this method is defensive, and that's good. But, I wonder if it's not as succinct or elegant as it could be.
        print()
        if child:
            print('Subnet Info:')
        if 'ip' in json_dict:
            self._PrintForReport('IP Addr: ' + json_dict['ip'], child)
        if ('created' in json_dict):
            self._PrintForReport('Subnet created: ' + json_dict['created'], child)
        if ('geo' in json_dict and 'country' in json_dict['geo']):
            self._PrintForReport('Country: ' + json_dict['geo']['country'], child)
        if ('score' in json_dict):
            self._PrintForReport('Score: ' + str(json_dict['score']), child)
        if ('reason' in json_dict) and not child:
            self._PrintForReport('Reason: ' + str(json_dict['reason']), child)
        if ('reasonDescription' in json_dict) and not child:
            self._PrintForReport('Reason Description: ' + str(json_dict['reasonDescription']), child)
        if ('subnet' in json_dict):
            self._PrintForReport('Subnet: ' + json_dict['subnet'], child)
        if ('cats' in json_dict):
            if ('Anonymisation Services' in json_dict['cats']):
                self._PrintForReport('Anonymisation Services: ' + str(json_dict['cats']['Anonymisation Services']), child)
            if ('Malware' in json_dict['cats']):
                self._PrintForReport('Malware: ' + str(json_dict['cats']['Malware']), child)
            if ('Botnet Command and Control Server' in json_dict['cats']):
                self._PrintForReport('Botnet Command and Control Server: ' + str(json_dict['cats']['Botnet Command and Control Server']), child)

    def _PrintForReport(self, str_to_print, tab=True):
        if tab:
            print('\t' + str_to_print)
        else:
            print(str_to_print)
        
    def LookUpIpAndPrintReport(self, ipaddr):
        if self._IsPublic(ipaddr):              ## Don't attempt to fetch a report if the IP Address is not public.
            self._PrepareRequest(ipaddr)        ## Prepare the request header.
            json_result = self._LookUpIpAddr()  ## Make the API call to request the IP Addr's report.
            self._FormatOutput(json_result)     ## Print the report to the console window in a form that's more readable than the raw JSON.



## The following class is the unit test suite for class XForceLookup defined above.
## Unit tests are a great aid in developing code, and an utter necessity in maintaining code over time.
## Unit tests help to mitigate the two greatest costs in any software development effort, which are:
    ## 1) The cost of maintaining existing code, which occupies more than 60% of each software team's total efforts.
    ## 2) The cost of delayed defect detection, which increases exponentially over time.
## I'll provide a small amount of additional explanation when we talk by phone, and, if desired, bibliographic sources substantiating my claims about these two costs.
## Note that the following tests use a combination of state-based tests (does 'key:password' get properly base64 encoded?) and interaction tests (does the call to urllib.request.Open happen when it should?)...

class XforceLookupTest(unittest.TestCase):

    def setUp(self):
        key = '5af8c2a8-097a-4cb2-be98-3db852ccd480'
        pswd = '768e7094-8cd1-4b25-b8e6-31f3fd03cdbf'
        self.xl = XforceLookup(key, pswd)
        ## The following JSON snippet was taken from the XForce docs for the API's IPR endpoint.
        self.sample_json = """
{
  "ip": "1.2.3.4",
  "subnets": [
    {
      "geo": {
        "country": "Australia",
        "countrycode": "AU"
      },
      "ip": "1.2.3.0",
      "reason": "Regional Internet Registry",
      "created": "2012-03-22T07:26:00.000Z",
      "score": 1,
      "cats": {},
      "subnet": "1.2.3.0/24"
    },
    {
      "ip": "1.2.3.4",
      "cats": {
        "Anonymisation Services": 43,
        "Malware": 71,
        "Botnet Command and Control Server": 71
      },
      "reason": "Content found on multihoster",
      "created": "2015-06-16T09:48:00.000Z",
      "score": 7.1,
      "subnet": "1.2.3.4/32"
    }
  ],
  "cats": {
    "Anonymisation Services": 43,
    "Malware": 71,
    "Botnet Command and Control Server": 71
  },
  "geo": {
    "country": "Australia",
    "countrycode": "AU"
  },
  "score": 7.1
}"""
        self.json_dict = json.loads(self.sample_json)

    def test__IsPublic_CorrectDeterminationMade(self):
        assert self.xl._IsPublic('127.0.0.1') == False
        assert self.xl._IsPublic('198.60.22.4') == True
        ## There are other use cases to test here but I'll save those for another day.

    def test__PrepareRequest_UrlAndHeaderAreWellFormed(self):
        with patch.object(urllib.request, 'Request', return_value=None) as mock_method: ## I'm using an interaction-test approach. This could, however, be converted to a state-based test because the construction of the request header happens in RAM and doesn't talk to disk, DB, or network.
            self.xl._PrepareRequest('198.60.22.4')
        mock_method.assert_called_once_with('https://api.xforce.ibmcloud.com/ipr/198.60.22.4', None, self.xl.headers) ## Ensure that HTTP request object is constructed when it should be with proper args.
        assert self.xl.headers['Authorization'] == 'Basic NWFmOGMyYTgtMDk3YS00Y2IyLWJlOTgtM2RiODUyY2NkNDgwOjc2OGU3MDk0LThjZDEtNGIyNS1iOGU2LTMxZjNmZDAzY2RiZg==' ## Ensure that auth data is properly encoded.

    def test__LookUpIpAddr_OneUrlReqMade(self):
        ip_data = { 'ip': '198.60.22.4', 'geo': { 'countrycode': 'US', 'country': 'United States' } }
        json_data = json.dumps(ip_data) ## Construct a small amount of JSON.
        resp = bytes(json_data, 'UTF-8') ## Turn the JSON into raw bytes, just like those that will come in an HTTP reply.
        resp_mock = MagicMock(spec=http.client.HTTPResponse) ## Create an object to substitute for a genuine HTTP response object.
        resp_mock.read = MagicMock(return_value=resp) ## Anticipate a call to read() on that response object.
        with patch.object(urllib.request, 'urlopen', return_value=resp_mock) as open_mock:
            self.xl._PrepareRequest('198.60.22.4')
            output = self.xl._LookUpIpAddr()
        open_mock.assert_called_once_with(self.xl.urlRequest) ## Ensure that the HTTP request is made.
        resp_mock.read.assert_called_once() ## Ensure that read() is called on the response object.
        assert output == ip_data ## Ensure that the HTTP response body is properly decoded into a string, and that its initial parsing from JSON to a Python dict object succeeds.
        ## This last test will not work if ip_data has non-string keys. See https://docs.python.org/3/library/json.html, section 19.2.1, in the spec for json.dumps(...).

    ## These next two tests do a pretty good job of covering my JSON parsing and printing. But, they don't provide complete coverage.
    ## To make the coverage more complete I'd need to add additional JSON samples and ensure that all expected print() calls were made for each.

    def test__ParseIprNode_RootNode_AllExpectedCallsToPrintAreMade(self):
        with patch('builtins.print') as print_mock:
            self.xl._ParseIprNode(self.json_dict, False)
        expected = [call(), call('IP Addr: 1.2.3.4'), call('Country: Australia'), call('Score: 7.1'), call('Anonymisation Services: 43'), call('Malware: 71'), call('Botnet Command and Control Server: 71')]
        assert print_mock.call_args_list == expected

    def test__ParseIprNode_LeafNodes_AllExpectedCallsToPrintAreMade(self):
        with patch('builtins.print') as print_mock:
            self.xl._ParseIprNode(self.json_dict['subnets'][0])
        expected = [call(), call('Subnet Info:'), call('\tIP Addr: 1.2.3.0'), call('\tSubnet created: 2012-03-22T07:26:00.000Z'), call('\tCountry: Australia'), call('\tScore: 1'), call('\tSubnet: 1.2.3.0/24')]
        assert print_mock.call_args_list == expected

def main():
    ##addr = '198.60.22.4' ## This is www.xmission.com, benign or so I would assume. It seems that XForce agrees.
    ip_addr = '176.96.242.209' ## Malicious addr from Ukraine according to XForce.
    ##addr = '162.158.102.101' ## Malicious addr from US according to XForce.
    ##addr = '94.136.40.103' ## Malicious addr from UK according to XForce.
    api_key = 'XXX'
    api_pswd = 'XXX'
    xl = XforceLookup(api_key, api_pswd)
    xl.LookUpIpAndPrintReport(ip_addr)

if __name__ == '__main__':
    main()

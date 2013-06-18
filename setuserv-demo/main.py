#
#  	Date May 15, 2013
#	Author : Biswanath
#

import webapp2
import json

from google.appengine.ext import ndb

class ProblemDomain(ndb.Model):
	name = ndb.TextProperty()
	url = ndb.TextProperty()
	id = ndb.ComputedProperty(lambda self: self.key.id())

class Field(ndb.Model):
	name = ndb.TextProperty()
	id = ndb.ComputedProperty(lambda self: self.key.id())	
		
class Datum(ndb.Model):
	data = ndb.JsonProperty()
	id = ndb.ComputedProperty(lambda self: self.key.id())	

class UrlHandler(webapp2.RequestHandler):

	def get(self,url):		
		matchingProblemDomain =	next(problemDoamin for problemDoamin in ProblemDomain.query() if url in problemDoamin.url)
		self.response.out.write(matchingProblemDomain.id)		
	
class ProblemDomainsHanlder(webapp2.RequestHandler):

	def get(self):
		self.response.headers['Content-Type'] = 'application/json'		
		self.response.out.write(json.dumps([problemDomain.to_dict() for problemDomain in ProblemDomain.query()]))		

class ProblemDomainHandler(webapp2.RequestHandler):
    
	def get(self,problemdomain_id):
		self.response.headers['Content-Type'] = 'application/json'
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))		
		self.response.out.write(json.dumps(problemdomain_key.get().to_dict()))
		
	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		newproblemdomain = json.loads(self.request.body)
		problemdomain = ProblemDomain()
		problemdomain.name = newproblemdomain["name"]
		problemdomain.url = newproblemdomain["url"]
		problemdomain_key = problemdomain.put()
		self.response.out.write(problemdomain_key.get().toJson())
		
class FieldHandler(webapp2.RequestHandler):

	def get(self,problemdomain_id,field_id):
		self.response.headers['Content-Type'] = 'application/json'
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))
		field_key = ndb.Key('Field',int(field_id))
		field = Field.get_by_id(field_key.id(),parent=problemdomain_key)
		self.response.out.write(json.dumps(field.to_dict()))
		
	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		newfield = json.loads(self.request.body)
		problemdomain_key = ndb.Key('ProblemDomain',int(newfield["problemdomain_id"]))
		field = Field(parent=problemdomain_key)
		field.name = newfield["name"]
		field_key = field.put()
		self.response.out.write(json.dumps(field_key.get()))

class MainHandler(webapp2.RequestHandler):

    def get(self):
        self.response.write('Hello world!')
		
class PluginHandler(webapp2.RequestHandler):

	def get(self,problemdomain_id):
		self.response.headers['Content-Type'] = 'application/json'
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))
		query = Field.query(ancestor=problemdomain_key)		
		self.response.out.write(json.dumps([field.to_dict() for field in query]))		
			
class DataHandler(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		newData = json.loads(self.request.body)
		problemdomain_key = ndb.Key('ProblemDomain',int(newData["problemdomain_id"]))
		datum = Datum(parent=problemdomain_key);
		datum.data = newData
		datum_key = datum.put()
		self.response.out.write("success")
	
	def get(self,problemdomain_id):
		self.response.headers['Content-Type'] = 'application/json'
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))		
		self.response.out.write(
			json.dumps(
				[datum.to_dict() for datum in Datum.query(ancestor=problemdomain_key)]))	
		
		
app = webapp2.WSGIApplication([
    webapp2.Route(r'/', MainHandler,name='home'),
	webapp2.Route(r'/problemdomains',ProblemDomainsHanlder,name='problemdomains'),
	webapp2.Route(r'/plugin/<problemdomain_id:\d+>',PluginHandler,name='plugin'),
	webapp2.Route(r'/problemdomain/<problemdomain_id:\d+>',ProblemDomainHandler,name='problemdomain'),
	webapp2.Route(r'/url/<url>',UrlHandler,name='url'),
	webapp2.Route(r'/problemdomain/save',ProblemDomainHandler,name='problemdomain'),
	webapp2.Route(r'/problemdomain/field/save',FieldHandler,name='field'),
	webapp2.Route(r'/problemdomain/<problemdomain_id:\d+>/field/<field_id:\d+>',FieldHandler,name='field'),
	webapp2.Route(r'/data/save',DataHandler,name='data'),
	webapp2.Route(r'/data/<problemdomain_id:\d+>',DataHandler,name='data')
], debug=True)

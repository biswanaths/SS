#
#  	Date May 15, 2013
#	Author : Biswanath
#

import webapp2
import json

from google.appengine.ext import ndb
from webapp2_extras import jinja2

class ProblemDomain(ndb.Model):
	name = ndb.TextProperty()
	url = ndb.TextProperty()
	id = ndb.ComputedProperty(lambda self: self.key.id() if hasattr(self.key,"id") else 0)

class Field(ndb.Model):
	name = ndb.TextProperty()
	id = ndb.ComputedProperty(lambda self: self.key.id() if hasattr(self.key,"id") else 0)
		
class Datum(ndb.Model):
	data = ndb.JsonProperty()
	id = ndb.ComputedProperty(lambda self: self.key.id() if hasattr(self.key,"id") else 0)

class UrlHandler(webapp2.RequestHandler):

	def get(self,url):		
		matchingProblemDomain =	next(problemDoamin for problemDoamin in ProblemDomain.query() if url in problemDoamin.url)
		self.response.out.write(matchingProblemDomain.id)		
		
class HtmlHandler(webapp2.RequestHandler):

	@webapp2.cached_property
	def jinja2(self):
		# Returns a Jinja2 renderer cached in the app registry.
		return jinja2.get_jinja2(app=self.app)
	
	def render_response(self, _template, **context):
		# Renders a template and writes the result to the response.
		rv = self.jinja2.render_template(_template, **context)
		self.response.write(rv)

class ProblemDomainsViewHandler(HtmlHandler):

	def get(self):
		self.render_response('ProblemDomains.html',problemDomains = ProblemDomain.query())

		
class ProblemDomainViewHandler(HtmlHandler):
	
	def get(self,problemdomain_id):
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))		
		query = Field.query(ancestor=problemdomain_key)		
		self.render_response('ProblemDomain.html', problemDomain = problemdomain_key.get() , fields = Field.query(ancestor=problemdomain_key))
		
class NewProblemDomainHandler(HtmlHandler):
	
	def get(self):
		self.render_response('AddProblemDomain.html')
		
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
		problemdomain = ProblemDomain()
		problemdomain.name = self.request.get('problemdomainname')
		problemdomain.url = self.request.get('url')
		problemdomain_key = problemdomain.put()
		return webapp2.redirect('/problemdomainsview')
		
class NewFieldHandler(HtmlHandler):
	
	def get(self,problemdomain_id):
		self.render_response('AddField.html',problemdomain_id = problemdomain_id)
		
class FieldHandler(webapp2.RequestHandler):

	def get(self,problemdomain_id,field_id):
		self.response.headers['Content-Type'] = 'application/json'
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))
		field_key = ndb.Key('Field',int(field_id))
		field = Field.get_by_id(field_key.id(),parent=problemdomain_key)
		self.response.out.write(json.dumps(field.to_dict()))
		
	def post(self,problemdomain_id):
		problemdomain_key = ndb.Key('ProblemDomain',int(problemdomain_id))
		field = Field(parent=problemdomain_key)
		field.name = self.request.get("fieldname")
		field_key = field.put()
		return webapp2.redirect('/problemdomainview/' + problemdomain_id)

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

class DataViewHandler(HtmlHandler):
	
	def get(self,problemdomain_id):
		problemdomain_key = ndb.Key('ProblemDomain', int(problemdomain_id))		
		data   = [datum.data for datum in Datum.query(ancestor=problemdomain_key)]
		self.render_response('ProblemDomainData.html',fields = Field.query(ancestor=problemdomain_key), data = data )
		
		
app = webapp2.WSGIApplication([
    webapp2.Route(r'/', MainHandler,name='home'),
	webapp2.Route(r'/problemdomains',ProblemDomainsHanlder,name='problemdomains'),
	webapp2.Route(r'/problemdomainsview',ProblemDomainsViewHandler,name='problemdomainsview'),
	webapp2.Route(r'/problemdomainview/<problemdomain_id:\d+>',ProblemDomainViewHandler,name='problemdomainview'),
	webapp2.Route(r'/plugin/<problemdomain_id:\d+>',PluginHandler,name='plugin'),
	webapp2.Route(r'/problemdomain/<problemdomain_id:\d+>',ProblemDomainHandler,name='problemdomain'),
	webapp2.Route(r'/url/<url>',UrlHandler,name='url'),
	webapp2.Route(r'/problemdomain/save',ProblemDomainHandler,name='problemdomain'),
	webapp2.Route(r'/problemdomain/new',NewProblemDomainHandler,name='newproblemdomain'),
	webapp2.Route(r'/problemdomain/field/save/<problemdomain_id:\d+>',FieldHandler,name='field'),
	webapp2.Route(r'/problemdomain/field/new/<problemdomain_id:\d+>',NewFieldHandler,name='newfield'),
	webapp2.Route(r'/problemdomain/<problemdomain_id:\d+>/field/<field_id:\d+>',FieldHandler,name='field'),
	webapp2.Route(r'/data/save',DataHandler,name='data'),
	webapp2.Route(r'/data/<problemdomain_id:\d+>',DataHandler,name='data'),
	webapp2.Route(r'/dataview/<problemdomain_id:\d+>',DataViewHandler,name='dataview')
], debug=True)

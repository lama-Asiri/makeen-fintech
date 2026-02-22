from datetime import datetime

class Query:
  def __init__(self, queryText):
   self.queryText = queryText
   self._queryDate = datetime.now() # auto creation timestamp

  @property
  def queryText(self):
    return self._queryText
  
  @property
  def queryDate(self):
    return self._queryDate
  
  @queryText.setter
  def queryText(self, new_queryText):
    if not isinstance(new_queryText, str):
        raise TypeError("Query's Text must be a string")
    self._queryText = new_queryText
  
  def __str__(self):
    return f"queryText: {self.queryText} queryDate: {self.queryDate}"

class Query:
  def __init__(self, queryText):
   self.queryText = queryText

  @property
  def queryText(self):
    return self._queryText
  
  @queryText.setter
  def queryText(self, new_queryText):
    if not isinstance(new_queryText, str):
        raise TypeError("Query's Text must be a string")
    self._queryText = new_queryText
  
  def parse():
    pass

  def resopnd():
    pass

  def __str__(self):
    return f"queryText: {self.queryText} queryDate: {self.queryDate}"
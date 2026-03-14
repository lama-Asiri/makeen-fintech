from PythonClasses.Rating import Rating

class Response:
  def __init__(self, answer, explanation):
    self._answer = answer
    self._explanation = explanation
    self._rating = None   # initialize

  @property
  def answer(self):
    return self._answer
  
  @property
  def explanation(self):
    return self._explanation
  
  @property
  def rating(self):
    return self._rating
  
  @rating.setter
  def rating(self, new_rating):
    if not isinstance(new_rating, Rating):
        raise TypeError("Rating must be of Rating type")
    self._rating =  new_rating
  
  def addRating(self,new_rating):
    self.rating = new_rating

  def viewRating(self):
    pass

  def __str__(self):
    return f"answer: {self.answer} explanationplanation: {self.explanation} rating: {self.rating}"
  
  
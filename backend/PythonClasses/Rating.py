class Rating:
  def __init__(self, ratingScore, comment):
    self.ratingScore = ratingScore
    self.comment = comment

  @property
  def ratingScore(self):
    return self._ratingScore
  
  @property
  def comment(self):
    return self._comment

  @ratingScore.setter
  def ratingScore(self, new_ratingScore):
    if not isinstance(new_ratingScore, (int, float)):
      raise TypeError("Rating Score must be a number")
    self._ratingScore = new_ratingScore

  @comment.setter
  def comment(self, new_comment):
    if not isinstance(new_comment, str):
        raise TypeError("Comment must be a string")
    self._comment = new_comment

  def __str__(self):
    return f"ratingScore: {self.ratingScore} comment: {self.comment}"

  #maybe move them somewhare else: addRating and viewRating inside Rating don’t make sense, because a single rating object cannot hold multiple ratings.


  


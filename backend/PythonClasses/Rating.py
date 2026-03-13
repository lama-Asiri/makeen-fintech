class Rating:
  def __init__(self, score, comment, category):
    self.score = score
    self.comment = comment
    self.category = category

  @property
  def score(self):
    return self._score
  
  @property
  def comment(self):
    return self._comment

  @score.setter
  def score(self, new_score):
    if not isinstance(new_score, (int, float)):
      raise TypeError("Rating Score must be a number")
    self._score = new_score

  @comment.setter
  def comment(self, new_comment):
    if not isinstance(new_comment, str):
        raise TypeError("Comment must be a string")
    self._comment = new_comment

  @property
  def category(self):
    return self._category

  @category.setter
  def category(self, new_category):
    if not isinstance(new_category, str):
        raise TypeError("category must be a string")
    self._category = new_category

  def __str__(self):
    return f"score: {self.score} comment: {self.comment} category:{self.catrgory}"




  


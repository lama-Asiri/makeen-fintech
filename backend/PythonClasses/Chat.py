from File import File
from Query import Query

class Chat:
    def __init__(self, file, queries):
        self.file = file
        self.queries = queries

    @property
    def file(self):
      return self._file

    @file.setter
    def file(self, new_file):
        if not isinstance(new_file, File):
            raise TypeError("file must be a File object")
        self._file = new_file

    @property
    def queries(self):
        return self._queries.copy()  # return copy to prevent external modification
    
    @queries.setter
    def queries(self, new_queries):
      if not isinstance(new_queries, list):
        raise TypeError("queries must be a list of Query objects")
      if len(new_queries) == 0:
        raise ValueError("There must be at least one Query")
      if not all(isinstance(q, Query) for q in new_queries):
        raise TypeError("All items in queries must be Query objects")
      self._queries = new_queries

    def startChat():
      pass

    def receiveUserQuery():
      pass

    def answerQuery(file,nlq):
      pass

    def add_query(self, query):
        """Add a Query object"""
        if not isinstance(query, Query):
            raise TypeError("query must be a Query object")
        self._queries.append(query)

    def __str__(self):
        return f"Chat: {self.file}, {len(self._queries)} queries"
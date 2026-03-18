import os

class File:
    def __init__(self, name, fileType, path):
      self.name = name                  # validated via setter
      self._fileType = fileType       # validated manually
      self._path = path                 # validated manually

        # Optional: check that file is CSV oe xlsx
      if self._fileType.lower() not in ["csv", "xlsx"]:
        raise ValueError("File type must be 'csv' or 'xlsx'")

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name):
       if not isinstance(new_name, str):
         raise TypeError("name must be a string")
       self._name = new_name

    @property
    def fileType(self):
      return self._fileType

    @property
    def path(self):
      return self._path
    
    def preprocess():
      pass
    
    def validateFile():
      pass

    def __str__(self):
      return f"{self.name} ({self.fileType}) uploaded at {self.upload_date}"

from datetime import datetime
import os

class File:
    def __init__(self, name, file_type, path):
      self.name = name                  # validated via setter
      self._file_type = file_type       # validated manually
      self._path = path                 # validated manually
      self._upload_date = datetime.now()  # auto timestamp

        # Optional: check that file exists and is CSV
      if not os.path.isfile(self._path):
         raise FileNotFoundError(f"No file found at {self._path}")
      if not self._file_type.lower() == "csv":
         raise ValueError("File type must be 'csv'")

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name):
       if not isinstance(new_name, str):
         raise TypeError("name must be a string")
       self._name = new_name

    @property
    def file_type(self):
      return self._file_type

    @property
    def path(self):
      return self._path

    @property
    def upload_date(self):
      return self._upload_date
    
    def preprocess():
      pass
    
    def validateFile():
      pass

    def __str__(self):
      return f"{self.name} ({self.file_type}) uploaded at {self.upload_date}"

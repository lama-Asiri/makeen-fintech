import re  # for email validation
from PythonClasses.Chat import Chat  
from core.supabase_client import supabase
import os

class Account:
  def __init__(self, email, password, username):
    self.email = email
    self.password = password
    self.username = username
    self._userStatus = "Active"
    self._chats = []
    
  @property
  def chats(self):
    return self._chats.copy()  # return a copy to prevent external modification


  @property
  def email(self):
      return self._email

  @email.setter
  def email(self, value):
      if not isinstance(value, str):
          raise TypeError("Email must be a string")
        # basic email pattern check
      if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
          raise ValueError("Invalid email format")
      self._email = value  

  @property
  def password(self):
      return self._password

  @password.setter
  def password(self, value):
      if not isinstance(value, str):
          raise TypeError("Password must be a string")
      if len(value) < 6:
          raise ValueError("Password must be at least 6 characters")
      self._password = value

  @property
  def username(self):
      return self._username

  @username.setter
  def username(self, value): 
      if not isinstance(value, str):
          raise TypeError("Username must be a string")
      if len(value.strip()) == 0:
          raise ValueError("Username cannot be empty")
      self._username = value.strip()

  @property
  def user_status(self):
    return self._user_status  # read-only, cannot set externally
  
  def add_chat(self, chat: Chat):
      """Add a Chat object to the account"""
      if not isinstance(chat, Chat):
          raise TypeError("chat must be a Chat object")
      self._chats.append(chat)

  def delete_chat(self, chat: Chat) -> bool:
      """Delete a Chat object if it exists; return True if removed, False otherwise"""
      if chat in self._chats:
        self._chats.remove(chat)
        return True
      return False

  def viewHistory():
    pass
  
  def updatePassword(oldPassword):
    pass
  
  def uploadFile(self, file):
    filename = os.path.basename(file.name)
    if not filename.lower().endswith(".csv"):
        return False, "Only CSV files are allowed."
    path = f"{self.username}/{filename}"
    try:
        response = supabase.storage.from_("user-files").upload(path, file)
        return True, response
    except Exception as e:
        return False, str(e)


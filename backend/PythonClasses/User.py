from Account import Account
import uuid

class User:
  def __init__(self, account):
    if not isinstance(account, Account):
       raise TypeError("account must be an Account object")
    self._account = account
    self._USER_ID = uuid.uuid4()  # unique ID

    @property
    def account(self):
      return self._account   # read-only (no setter)

    @property
    def USER_ID(self):
      return self._USER_ID   # read-only (no setter)
    
    def register(email, password):
      pass

    def login(email,password):
      pass

    def logout():
      pass

    def deleteAccount(): # returns boolean
      pass

    def uploadFile(file):  # returns boolean
      pass

    def exportReport():
      pass

    def __str__(self):
      return f"account: {self.account}, user_id= {self.USER_ID}"
    

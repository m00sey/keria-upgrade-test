# Keria upgrade test

This repository contians a reproduction for an issue encountered when trying to upgrade a keria instance from 0.1.2 to 0.2.0-dev2.

In short,

- ./scripts-setup contains a scripts that creates a two agents with a group AID using the main branch of signify-ts.
- ./scripts-connect contains a script that connects to the keria instance using the signify-ts branch of https://github.com/WebOfTrust/signify-ts/pull/267

They are divided into separate workspace packages to enable us to install two versions of signify-ts in the same repo.


The run-test.sh file contains the reproduction script that:

- Start a keria instance with version 0.1.2
- Runs the script from scripts-setup
- Stops the keria instance
- Runs keripy database migrations
- Starts a keria intance with version 0.2.0-dev2
- Runs the script from scripts-connect


# Results

The script fails to connect to the keria instance. Keria responds with Internal Server Error and produces this log message:

```
keria-1  | /keripy/src/keri/core/serdering.py:120: SyntaxWarning: invalid escape sequence '\A'
keria-1  |   """Design Notes:
keria-1  | The Agency is loaded and waiting for requests...
keria-1  | 2024-06-26 13:13:13 [FALCON] [ERROR] GET /agent/EEFCS78eJySGGx9Nl7r-eHRSDZ4xbisWwkqrwEWft-bG => Traceback (most recent call last):
keria-1  |   File "falcon/app.py", line 365, in falcon.app.App.__call__
keria-1  |   File "/usr/local/var/keria/src/keria/app/aiding.py", line 110, in on_get
keria-1  |     agent = self.agency.get(caid)
keria-1  |             ^^^^^^^^^^^^^^^^^^^^^
keria-1  |   File "/usr/local/var/keria/src/keria/app/agenting.py", line 246, in get
keria-1  |     agentHby = habbing.Habery(name=caid, base=self.base, bran=self.bran, ks=ks, temp=self.temp)
keria-1  |                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
keria-1  |   File "/keripy/src/keri/app/habbing.py", line 241, in __init__
keria-1  |     self.setup(**self._inits)  # finish setup later
keria-1  |     ^^^^^^^^^^^^^^^^^^^^^^^^^
keria-1  |   File "/keripy/src/keri/app/habbing.py", line 316, in setup
keria-1  |     self.loadHabs()
keria-1  |   File "/keripy/src/keri/app/habbing.py", line 345, in loadHabs
keria-1  |     hab = SignifyGroupHab(ks=self.ks, db=self.db, cf=self.cf, mgr=self.mgr,
keria-1  |           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
keria-1  | TypeError: SignifyGroupHab.__init__() missing 1 required positional argument: 'smids'
keria-1  |
```


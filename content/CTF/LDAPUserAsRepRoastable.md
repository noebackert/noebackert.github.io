---
title: "Windows - LDAP User As_RepRoastable"
ctf_platform: "Root-Me"
date: 2026-02-20T19:00:00+01:00
description: "During the investigation, you obtain a backup of the company LDAP directory generated with ldap2json. Use the information contained in this dump to identify the ASRepRoastable user."
tags: ["Forensics", "AD", "Kerberos"]
link: "https://www.root-me.org/"
author: "Noé Backert"
---

[Root-Me Challenge Link](https://www.root-me.org/)

# Solution

This challenge focuses on **Active Directory offline analysis** using an LDAP dump.  
The objective is to identify a **Kerberos AS-REP roastable user** by analyzing LDAP attributes without interacting with a live domain controller.

The provided data was generated using `ldap2json`, which exports Active Directory objects and attributes into a JSON structure.

---

## Installation / Tools

The following tools are required:

- **jq** (JSON processor)
- **ldap2json output file** (`ch32.json` in this case)

No Active Directory access or credentials are required, as the challenge is purely offline.

---

## Background – AS-REP Roasting

AS-REP Roasting is a Kerberos attack technique [T1558.004](https://attack.mitre.org/techniques/T1558/004/) that targets accounts with the **"Do not require Kerberos preauthentication"** option enabled.

From a technical perspective:

- The setting corresponds to the flag `DONT_REQUIRE_PREAUTH`
- This flag is stored in the `userAccountControl` attribute
- Its numeric value is **4194304 (0x00400000)**

If this flag is set:
- The KDC will return an AS-REP without validating pre-authentication
- An attacker can retrieve a Kerberos response encrypted with the user’s password hash
- This response can be cracked offline

---

## Identifying AS-REP Roastable Users in LDAP

### Relevant LDAP Attributes

From the `ldap2json` dump, the following attributes are relevant:

- `objectClass` → to identify user objects
- `sAMAccountName` → username
- `userAccountControl` → account flags
- `mail` / `userPrincipalName` → identification and context

---

## Analysis Strategy

1. Parse the LDAP JSON structure
2. Filter objects of type `user`
3. Extract `userAccountControl`
4. Check if the **DONT_REQUIRE_PREAUTH** flag is set

To remain portable and reliable, a **mathematical check** is used instead of a bitwise AND.


Since:

```math
DONT_REQUIRE_PREAUTH = 4194304 = 2^22
```
As we want to test the value of the 22th bit, we can test the flag using :
```math
(uac / 4194304) % 2 == 1
```



---

## Detection Command

```shell
-[~/RootMe/AS_REP_Roasting]$ jq '
..
| objects
| select(
    has("objectClass")
    and (.objectClass | index("user"))
    and has("userAccountControl")
    and (
        ((.userAccountControl | tonumber) / 4194304 | floor) % 2 == 1
    )
)
| {
    user: .sAMAccountName,
    email: .mail,
    upn: .userPrincipalName,
    uac: .userAccountControl
}
' ch32.json
```
The result of the commad is containing the answer email:

```json
{
  "user": "flandry",
  "email": "fitzgerald.landry@rootme.local",
  "upn": null,
  "uac": 4260352
}
```
---
title: "LDAP User Kerberoastable"
ctf_platform: "Root-Me"
date: 2026-02-20T12:00:00+01:00
description: "During your investigation, you recover an LDAP directory backup exported using ldap2json. Use the information contained in this dump to identify the Kerberoastable user."
tags: ["Forensics", "AD", "Kerberos"]
link: "https://www.root-me.org/"
author: "Noé Backert"
---

[Root-Me Challenge Link](https://www.root-me.org/fr/Challenges/Forensic/Windows-LDAP-User-KerbeRoastable/)

# Solution

## Context and Objective

The challenge provides an **LDAP dump** of an Active Directory environment, exported in JSON format using `ldap2json`.  
The goal is to identify a **Kerberoastable user account**, meaning:

> A user account that owns a **Service Principal Name (SPN)**, allowing an attacker to request a **Ticket Granting Service (TGS)** and perform a **Kerberoasting attack**.

The analysis is **fully static**: no interaction with the Domain Controller is required.

---

## Kerberoasting – Theory Reminder

Kerberoasting is a post-exploitation technique [T1558.003](https://attack.mitre.org/techniques/T1558/003/) in Active Directory where an attacker abuses normal Kerberos behavior to obtain crackable material.

In Kerberos:

- A **SPN** (Service Principal Name) identifies a service account
- Any authenticated domain user can request a **TGS** for that SPN
- The returned TGS is encrypted with the target service account key (derived from its password)
- If this service account is a **regular user account** with a weak password, the ticket can be cracked **offline** to recover the plaintext password

Typical Kerberoasting flow:

1. Enumerate accounts that have `servicePrincipalName`
2. Request TGS tickets for those SPNs
3. Export the ticket material
4. Crack it offline (wordlist/rules)
5. Reuse recovered credentials for lateral movement/privilege escalation

Because the attack is mostly offline after ticket retrieval, it can be stealthy and does not require continuous interaction with the domain controller.

A user is **Kerberoastable** if:
- it is of type `user`
- it has a `servicePrincipalName`
- the account is enabled
- it is **neither a machine account nor `krbtgt`**

---

## Installation / Tools

Tools used:

- `jq` – JSON parsing and filtering
- LDAP dump generated with `ldap2json`

No offensive tooling (Rubeus, Impacket, etc.) is required.

---

## LDAP Dump Structure Analysis

The JSON file is **not a flat list**, but a **full LDAP tree**:

- Domain
- Containers (`CN=Users`, `OU=...`)
- User, group and computer objects

A **recursive traversal** of the JSON structure is therefore required.

---

## Extracting Accounts with SPNs

First step: identify **all objects containing a `servicePrincipalName`**.

```shell
-[~/DEV/OSIR/share/cases/Kerberoastable]$ jq '
..
| objects
| select(has("servicePrincipalName"))
| { user: .sAMAccountName, spn: .servicePrincipalName }
' ch31.json
```
This is the result :
```json
{
  "user": "krbtgt",
  "spn": [
    "kadmin/changepw"
  ]
}
{
  "user": "a.newton",
  "spn": [
    "HTTP/SRV-RDS.rootme.local"
  ]
}
{
  "user": "DC01$",
  "spn": [
    "Dfsr-12F9A27C-BF97-4787-9364-D31B6C55EB04/DC01.ROOTME.local",
    "ldap/DC01.ROOTME.local/ForestDnsZones.ROOTME.local",
    "ldap/DC01.ROOTME.local/DomainDnsZones.ROOTME.local",
    "DNS/DC01.ROOTME.local",
    "GC/DC01.ROOTME.local/ROOTME.local",
    "RestrictedKrbHost/DC01.ROOTME.local",
    "RestrictedKrbHost/DC01",
    "RPC/55de6b37-27e0-4d8e-84f1-b54018a48b62._msdcs.ROOTME.local",
    "HOST/DC01/ROOTME",
    "HOST/DC01.ROOTME.local/ROOTME",
    "HOST/DC01",
    "HOST/DC01.ROOTME.local",
    "HOST/DC01.ROOTME.local/ROOTME.local",
    "E3514235-4B06-11D1-AB04-00C04FC2DCD2/55de6b37-27e0-4d8e-84f1-b54018a48b62/ROOTME.local",
    "ldap/DC01/ROOTME",
    "ldap/55de6b37-27e0-4d8e-84f1-b54018a48b62._msdcs.ROOTME.local",
    "ldap/DC01.ROOTME.local/ROOTME",
    "ldap/DC01",
    "ldap/DC01.ROOTME.local",
    "ldap/DC01.ROOTME.local/ROOTME.local"
  ]
}
```
We can directly see that the only user account is `a.newton`, because `krbtgt`is the Kerberos system account, and `DC01$` is the machine account and passwords are automatically managed.

We can then confirm that this account works, and display his email using the following `jq` command:
```shell
jq '
..
| objects
| select(
    has("objectClass")
    and (.objectClass | index("user"))
    and has("servicePrincipalName")
    and (.servicePrincipalName | length > 0)
    and (.sAMAccountName != "krbtgt")
    and (
        ((.userAccountControl // 0) | tonumber) == 512
        or
        ((.userAccountControl // 0) | tonumber) == 66048
    )
)
| {
    dn: .distinguishedName,
    user: .sAMAccountName,
    spn: .servicePrincipalName,
    email: .mail,
    uac: .userAccountControl
}
' ch31.json
```

It gives us the following result :
```json
{
  "dn": "CN=Alexandria,CN=Users,DC=ROOTME,DC=local",
  "user": "a.newton",
  "spn": [
    "HTTP/SRV-RDS.rootme.local"
  ],
  "email": "alexandria.newton@rootme.local",
  "uac": 66048
}
```
# CONCLUSION 

The conditions for a user to be Kerberoastable are :

**UAC** (UserAccountControl)

- 512 → standard enabled user account

- 66048 → enabled user account with non-expiring password

These values exclude:

- disabled accounts
- machine accounts
- system accounts


The email of the Kerberoastable account is then `alexandria.newton@rootme.local`.

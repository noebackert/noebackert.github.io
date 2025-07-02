---
title: "Driver's Shadow"
ctf_platform: "HTB"
date: 2025-05-25T15:00:00+02:00
description: "A critical Linux server began behaving erratically under suspected Volnaya interference, so a full memory snapshot was captured for analysis. Stealthy components embedded in the dump are altering system behavior and hiding their tracks; your task is to sift through the snapshot to uncover these concealed elements and extract any hidden payloads."
tags: ["Forensics", "Memory", "HTB", "RAM", "Linux", "CTF", "Volatility3"]
link: "https://github.com/hackthebox/business-ctf-2025/tree/master/forensics/Driver's%20Shadow"
author: "Noé Backert"
---

[HTB Link - github.com/hackthebox/business-ctf-2025](https://github.com/hackthebox/business-ctf-2025/tree/master/forensics/Driver's%20Shadow)

# Solution
## Installation / tools 
We are given a .elf file ~2Go, it says it's a memory capture. We'll then try to analyse it using volatility3. 

`python3 vol.py -f mem.elf banners`

It returns something like :
`0x10399cd0      Linux version 6.1.0-34-amd64 (debian-kernel@lists.debian.org) (gcc-12 (Debian 12.2.0-14+deb12u1) 12.2.0, GNU ld (GNU Binutils for Debian) 2.40) #1 SMP PREEMPT_DYNAMIC Debian 6.1.135-1 (2025-04-25)`

To be able to analyse this kernel (6.1.0-34-amd64), we have to find the exact matching banner symbol table. 
A lot of them are available on :
https://github.com/Abyss-W4tcher/volatility3-symbols/tree/master

Convert the beginning of the banner in base64 to 
`Linux version 6.1.0-34-amd64 (debian-kernel@lists.debian.org) (gcc-12 (Debian 12.2.0-14+deb12u1) 12.2.0, GNU ld (GNU Binutils for Debian) 2.40) #1 SMP PREEMPT_DYNAMIC Debian 6.1.135-1` 
-> 
`TGludXggdmVyc2lvbiA2LjEuMC0zNC1hbWQ2NCAoZGViaWFuLWtlcm5lbEBsaXN0cy5kZWJpYW4ub3JnKSAoZ2NjLTEyIChEZWJpYW4gMTIuMi4wLTE0K2RlYjEydTEpIDEyLjIuMCwgR05VIGxkIChHTlUgQmludXRpbHMgZm9yIERlYmlhbikgMi40MCkgIzEgU01QIFBSRUVNUFRfRFlOQU1JQyBEZWJpYW4gNi4xLjEzNS0x`
![Profile](/img/ctf/driverShadow/profile.png)

Find a match from banners.json, download it using the link and extract the .gz to the `volatility3/volatility3/symbols` folder.

We're now able to use linux plugins with the RAM dump! 

### Flag 1/10 - What is the name of the backdoor udev Rule (ex:10-name.rules)
Using the linux.pagecache.Files plugin, we can search for rules using regex : `\b\d{2}-[a-zA-Z0-9_-]+\.rules\b`

We then find a line with a weird rule name : **99-volnaya.rules**
`0x9a097453c800	/	8:1	652915	0x9a0974b66798	REG	1	1	-rw-r--r--	2025-05-12 19:19:55.919384 UTC	2025-05-12 19:20:29.372000 UTC	2025-05-12 19:20:29.372000 UTC	/etc/udev/rules.d/99-volnaya.rules	77`

### Flag 2/10 - What is the name of the kernel module ?
A simple volatility3 request using linux.hidden_modules :
`0xffffc09804c0	volnaya_xb127	0x4000	OOT_MODULE,UNSIGNED_MODULE		N/A`
We find **volnaya_xb127** as the module name


### Flag 3/10 - What is the resolved IP of the attacker ?

Using linux.sockstat plugin:
```
4026531840	bash	2957	2957	0	0x9a094804a400	AF_INET	STREAM	TCP	10.0.2.15	55522	16.171.55.6	4421	ESTABLISHED	-
```
We find the remote IP address: `16.171.55.6`

### Flag 4/10 - What is the address of __x64_sys_kill, __x64_sys_getdents64 (ex: kill:getdents64)

Using linux.kallsyms plugin:

```
0xffffb88b6bf0	T	176	True	core	kernel	__x64_sys_kill	Symbol is in the text (code) section

0xffffb8b7c770	T	288	True	core	kernel	__x64_sys_getdents64	Symbol is in the text (code) section
```
Flag: `0xffffb88b6bf0:0xffffb8b7c770` 

### Flag 5/10 - What `__SYSCALLS__` are hooked with ftrace, sorted via SYSCALL number (ex: read:write:open)
Using linux.tracing.ftrace.CheckFtrace plugin:
```
0xffffc09803a0	-	0xffffc097e200	filldir64	volnaya_xb127	0xffffc097e000
0xffffc09802c8	-	0xffffc097e200	filldir	volnaya_xb127	0xffffc097e000
0xffffc09801f0	-	0xffffc097e200	fillonedir	volnaya_xb127	0xffffc097e000
0xffffc0980118	-	0xffffc097e200	__x64_sys_kill	volnaya_xb127	0xffffc097e000
0xffffc0980040	-	0xffffc097e200	__x64_sys_getdents64	volnaya_xb127	0xffffc097e000
```
Only __x64_sys_kill and __x64_sys_getdents64 are syscall

Flag: `kill:getdents64`

### Flag 6/10 There is one bash process that is hidden in `__USERSPACE__`, what is its PID

What is the resolved IP of the attacke
In the `__USER_SPACE__` (UID 1000, GID 1000 for the standard user), there's a lot of bash processes
`0x9a0946310000	2957	2957	1750	bash	0	0	0	0	2025-05-12 19:23:34.894489 UTC	Disabled`

Using linux.pslist, we can see that only 1 bash script runs  with UID:0 & GID 0:
`2957	1750	bash	SUDO_COMMAND	/usr/bin/volnaya_usr rsh`

We enter PID 2957, flag : `2957`

### Flag 7/10 - What is the XOR key used (ex: 0011aabb)
In the linux.envars, we can see the line :
`2957	1750	bash	SUDO_COMMAND	/usr/bin/volnaya_usr rsh`
We try to recover this binary file to analyse it further using `linux.pagecache.RecoverFs` plugin:

Using `readelf -a volnaya_usr` on the recovered binary, we can inspect what it contains: 
In the .symtab section, we see interesting entries :
```
51: 00000000000040e0    28 OBJECT  GLOBAL DEFAULT   25 hostname
52: 000000000006a7e0     0 NOTYPE  GLOBAL DEFAULT   26 __bss_start
53: 0000000000001755   261 FUNC    GLOBAL DEFAULT   15 main
54: 0000000000004100    16 OBJECT  GLOBAL DEFAULT   25 xor_key

```

We find that `hostname` is stored at the virtual address `00000000000040e0` and `xor_key` at the address `0000000000004100`

We search for the data's offset :
```
-[~/HTBCTF]$ readelf -S volnaya_usr | grep '\.data'
  [25] .data             PROGBITS         00000000000040c0  000030c0
```

So we can calculate the real addresses of hostname (28 bytes) and xor_key (16 bytes)

The address is calculated with :
VirtualAddress - Address Data (0x00000000000040c0) + offset (0x000030c0)

| Name     | Virtual Address  | Offset   | Address          |
| -------- | ---------------- | -------- | ---------------- |
| xor_key  | 0000000000004100 | 000030c0 | 0000000000003100 |
| hostname | 00000000000040e0 | 000030c0 | 00000000000030e0 |
We retrieve 16 bytes starting at 0x3100, we find the xor_key :
```sh
-[~/HTBCTF]$ xxd -s 0x3100 -l 16 volnaya_usr   # xor_key
00003100: 881b a50d 42a4 3079 1ca2 d9ce 0630 f5c9  ....B.0y.....0..
```
Flag : `881ba50d42a430791ca2d9ce0630f5c9`
### Flag 8/10 - What is the hostname the rootkit connects to
We make the same process than the previous flag :
```sh
-[~/HTBCTF]$ xxd -s 0x30e0 -l 28 volnaya_usr
000030e0: eb7a c961 20c5 5312 32c1 b7ad 3408 c4f8  .z.a .S.2...4...
000030f0: a66d ca61 2cc5 4918 32ca adac            .m.a,.I.2...
```
We see that the data is not in clear text, we try to xor it using the previous found key, we have :
![domainXOR](/img/ctf/driverShadow/domainXOR.png)

We find a good value :
`callback.cnc2811.volnaya.htb`
### Flag 9/10 - What owner UID and GID membership will make the file hidden (UID:GID)

1. Extract the hidden kernel module using the linux.module_extract plugin :
`python vol.py -f mem.elf linux.module_extract --base 0xffffc09804c0`
The base address is found using hidden_module plugin.

2. Analyse it using ghidra or `readelf kernel_module.volnaya_xb127.0xffffc09804c0.elf -a`

We find interesting 4 bytes variables :
```
22: 0000000000000454     4 OBJECT  GLOBAL DEFAULT   12 GROUP_HIDE
34: 0000000000000458     4 OBJECT  GLOBAL DEFAULT   12 USER_HIDE
```

Exploring `toggle_hide_proc` function in ghidra, we find out, that the function's goal is to check if the PID is already in the "hide" list.
- If so, it **removes** it from the list — i.e., un-hides it.
- If not, it **adds** it to the list — i.e., hides it.

| Element                | Purpose                        |
| ---------------------- | ------------------------------ |
| `toggle_hide_proc`     | Toggle PID in hide/unhide list |
| `DAT_ffffffffc0a80460` | Head of the hidden PID list    |
| List structure         | Doubly linked list (prev/next) |
| Hidden if present      | In the list                    |
| Unhidden if removed    | From the list                  |
By exploring further, we see inside the function patched_getdents64 :
```c
void patched_getdents64(long param_1,int param_2,undefined4 param_3)

{
  long lVar1;
  int iVar2;
  undefined8 *puVar3;
  int iVar4;
  long lVar5;
  long lVar6;
  long lVar7;
  ulong uVar8;
  ulong uVar9;
  long in_GS_OFFSET;
  int local_4c;
  long local_48;
  int local_3c;
  long local_38;
  
  uVar9 = (ulong)param_2;
  local_38 = *(long *)(in_GS_OFFSET + 0x28);
  lVar5 = func_0xffffffffb8bb4230(_DAT_ffffffffb9d29210,0xdc0,0x98);
  lVar6 = func_0xffffffffb8bb4d80(uVar9,0xdc0);
  if (lVar6 != 0) {
    if (0x7fffffff < uVar9) {
LAB_ffffffffc0a7ed2a:
      do {
        invalidInstructionException();
      } while( true );
    }
    func_0xffffffffb8c57980(lVar6,uVar9,0);
    iVar4 = func_0xffffffffb8e345a0(lVar6,param_1,uVar9);
    if (iVar4 == 0) {
      lookup_name(0xffffffffc097f0f0);
      if (uVar9 != 0) {
        local_48 = 0;
        uVar8 = 0;
        local_4c = param_2;
        do {
          lVar1 = lVar6 + uVar8;
          iVar4 = func_0xffffffffb9701580(param_3,param_1 + 0x13 + uVar8,lVar5,0);
          if (iVar4 != 0) goto LAB_ffffffffc0a7ecd0;
          iVar4 = *(int *)(lVar5 + 0x30);
          iVar2 = *(int *)(lVar5 + 0x34); 
          lVar7 = func_0xffffffffb92daba0(lVar1 + 0x13,DAT_ffffffffc0a80480);
          if (lVar7 == 0) {
            local_3c = 0;
            func_0xffffffffb8e36d90(lVar1 + 0x13,10,&local_3c);
            for (puVar3 = DAT_ffffffffc0a80460; puVar3 != (undefined8 *)0xffffffffc0980460;
                puVar3 = (undefined8 *)*puVar3) {
              if (*(int *)(puVar3 + -1) == local_3c) goto LAB_ffffffffc0a7ebb8;
            }
            if ((DAT_ffffffffc0a80478 == iVar4) || (lVar7 = lVar1, DAT_ffffffffc0a80474 == iVar2))
            goto LAB_ffffffffc0a7ebb8;
LAB_ffffffffc0a7ebcf:
            local_48 = lVar7;
            uVar8 = uVar8 + *(ushort *)(lVar1 + 0x10);
          }
          else {
LAB_ffffffffc0a7ebb8:
            if (lVar1 != lVar6) {
              *(short *)(local_48 + 0x10) = *(short *)(local_48 + 0x10) + *(short *)(lVar1 + 0x10);
              lVar7 = local_48;
              goto LAB_ffffffffc0a7ebcf;
            }
            local_4c = local_4c - (uint)*(ushort *)(lVar6 + 0x10);
            uVar9 = (ulong)local_4c;
            func_0xffffffffb92e7dc0(lVar6,(ulong)*(ushort *)(lVar6 + 0x10) + lVar6,uVar9);
          }
        } while (uVar8 < uVar9);
        if (0x7fffffff < uVar9) goto LAB_ffffffffc0a7ed2a;
      }
      func_0xffffffffb8c57980(lVar6,uVar9,1);
      func_0xffffffffb8e344a0(param_1,lVar6,uVar9);
    }
LAB_ffffffffc0a7ecd0:
    func_0xffffffffb8bb4680(lVar5);
    func_0xffffffffb8bb4680(lVar6);
  }
  if (local_38 == *(long *)(in_GS_OFFSET + 0x28)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  func_0xffffffffb9336610();
  return;
}
```

We can see the followings :
```c
iVar4 = *(int *)(lVar5 + 0x30);  // UID of the entry
iVar2 = *(int *)(lVar5 + 0x34);  // GID of the entry
```
So, it's reading the UID and GID of the file or process entry returned by `getdents64`.
Then, they compare them to the values stored at :
```c
if ((DAT_ffffffffc0a80478 == iVar4) || (lVar7 = lVar1, DAT_ffffffffc0a80474 == iVar2))
    goto LAB_ffffffffc0a7ebb8;

```

- `DAT_ffffffffc0a80478` → UID to hide
- `DAT_ffffffffc0a80474` → GID to hide 
If either matches the current entry’s UID or GID:
- It **skips showing that entry** by jumping to a block (`LAB_ffffffffc0a7ebb8`) that merges/skips it.

![xor.png](/img/ctf/driverShadow/xor.png)

By looking at thoses values, we find :
GID -> DAT_ffffffffc0a80474 -> 000007C8h -> 1992
UID -> DAT_ffffffffc0a80478 -> 0000071Dh -> 1821

Flag: `1821:1992`

### Flag 10/10 - What string must be contained in a file in order to be hidden


![string2.png](/img/ctf/driverShadow/string2.png)

I don't really now how to link it with the program as I found it by chance..
![string.png](/img/ctf/driverShadow/string.png)
Flag: `volnaya`

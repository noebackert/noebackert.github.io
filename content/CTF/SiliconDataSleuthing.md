---
title: "Silicon Data Sleuthing"
ctf_platform: "HTB"
date: 2026-01-24T13:50:00+02:00
description: "In the dust and sand surrounding the vault, you unearth a rusty PCB... You try to read the etched print, it says Open...W...RT, a router! You hand it over to the hardware gurus and to their surprise the ROM Chip is intact! They manage to read the data off the tarnished silicon and they give you back a firmware image. It's now your job to examine the firmware and maybe recover some useful information that will be important for unlocking and bypassing some of the vault's countermeasures!"
tags: ["Forensics", "ROM", "Firmware"]
author: "Noé Backert"
---

## Challenge Overview
**Challenge:** Silicon Data Sleuthing  
**Category:** Forensics  
**Difficulty:** Easy  
**Points:** 975  
**Solves:** 8  

In this challenge, we analyze a recovered OpenWrt router firmware image to extract sensitive configuration data. The challenge demonstrates the importance of understanding firmware extraction techniques and the security implications of overlay filesystems in embedded Linux devices.

## Challenge Description
> In the dust and sand surrounding the vault, you unearth a rusty PCB... You try to read the etched print, it says Open...W...RT, a router! You hand it over to the hardware gurus and to their surprise the ROM Chip is intact! They manage to read the data off the tarnished silicon and they give you back a firmware image. It's now your job to examine the firmware and maybe recover some useful information that will be important for unlocking and bypassing some of the vault's countermeasures!

## Questions to Answer
1. What version of OpenWRT runs on the router?
2. What is the Linux kernel version?
3. What's the hash of the root account's password?
4. What is the PPPoE username?
5. What is the PPPoE password?
6. What is the WiFi SSID?
7. What is the WiFi Password?
8. What are the 3 WAN ports that redirect traffic from WAN → LAN?

## Preliminary inspection
We first want to know the file we have: 
```shell
-[~/HTB]$ file chal_router_dump.bin
chal_router_dump.bin: data
```

```shell
-[~/HTB]$ binwalk chal_router_dump.bin

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
16293         0x3FA5          JBOOT STAG header, image id: 5, timestamp 0x6804112C, image size: 405046424 bytes, image JBOOT checksum: 0xBC00, header JBOOT checksum: 0xC8F
26293         0x66B5          JBOOT STAG header, image id: 2, timestamp 0x3E004310, image size: 135544832 bytes, image JBOOT checksum: 0x9900, header JBOOT checksum: 0x408F
30141         0x75BD          JBOOT STAG header, image id: 4, timestamp 0xFF0411F3, image size: 3475395327 bytes, image JBOOT checksum: 0x40FF, header JBOOT checksum: 0x1016
53719         0xD1D7          JBOOT SCH2 kernel header, compression type: none, Entry Point: 0x84000C16, image size: 10127 bytes, data CRC: 0x99033010, Data Address: 0x6500048F, rootfs offset: 0x200228E, rootfs size: 2734686244 bytes, rootfs CRC: 0x62000390, header CRC: 0x99001014, header size: 5007 bytes, cmd line length: 0 bytes
64069         0xFA45          JBOOT STAG header, image id: 4, timestamp 0x24100000, image size: 50365208 bytes, image JBOOT checksum: 0x8000, header JBOOT checksum: 0x554
74645         0x12395         JBOOT STAG header, image id: 6, timestamp 0xE200C910, image size: 2148811007 bytes, image JBOOT checksum: 0x610, header JBOOT checksum: 0x2100
97696         0x17DA0         U-Boot version string, "U-Boot 1.1.3 (Aug 18 2020 - 11:10:29)"
98248         0x17FC8         CRC32 polynomial table, little endian
99521         0x184C1         DER SHA1 hash
99600         0x18510         AES S-Box
100380        0x1881C         AES Inverse S-Box
458752        0x70000         gzip compressed data, maximum compression, from Unix, last modified: 2021-09-17 15:32:23
1572864       0x180000        uImage header, header size: 64 bytes, header CRC: 0x95E11ADB, created: 2023-10-09 21:45:35, image size: 2802312 bytes, Data Address: 0x80001000, Entry Point: 0x80001000, data CRC: 0x8055BE8E, OS: Linux, CPU: MIPS, image type: OS Kernel Image, compression type: none, image name: "MIPS OpenWrt Linux-5.15.134"
1578428       0x1815BC        Copyright string: "Copyright (C) 2011 Gabor Juhos <juhosg@openwrt.org>"
1578636       0x18168C        LZMA compressed data, properties: 0x6D, dictionary size: 8388608 bytes, uncompressed size: 9229911 bytes
4375240       0x42C2C8        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 3687796 bytes, 1328 inodes, blocksize: 262144 bytes, created: 2023-10-09 21:45:35
8126464       0x7C0000        JFFS2 filesystem, little endian
```

### Filesystems Identified (why they matter)
- **SquashFS:** A compressed, read-only filesystem designed for embedded systems. It minimizes storage footprint (here, xz-compressed) and holds factory-default files under `/rom`. Because it is immutable, it cannot be changed at runtime.
- **JFFS2 (Journaling Flash File System v2):** A writable filesystem for raw flash (NOR/NAND) with wear-leveling and journaling. On OpenWrt, JFFS2 is mounted as the overlay (`/overlay`) and merged over `/rom` to form the live root (`/`). User changes (passwords, network configs, firewall rules) persist here across reboots.

In practice, OpenWrt combines both via overlayfs: the immutable SquashFS provides the base system, while JFFS2 stores all runtime modifications. This is why sensitive data (e.g., the real `root` password hash and custom firewall DNAT redirects) are found in the JFFS2 overlay rather than the SquashFS.

### Carving SquashFS by signature ("hsqs")
To locate the SquashFS superblock inside the raw dump, we search for its magic string:

```shell
grep -oba "hsqs" chal_router_dump.bin
```

- `-a`: Treat binary as text for matching.
- `-b`: Print the byte offset of each match.
- `-o`: Print only the matching part (here, `hsqs`).

SquashFS uses the ASCII magic `hsqs` at the start of its superblock (little-endian representation of the filesystem signature). The output `4375240:hsqs` tells us the superblock begins at byte offset `4,375,240`.

We then carve the filesystem starting at that offset to the end of the file:

```shell
dd if=chal_router_dump.bin of=squashfs.img bs=1 skip=4375240
```

- `if`: input file (the full chip dump).
- `of`: output file (the carved SquashFS image).
- `bs=1`: Use a 1-byte block size so `skip` is in exact bytes.
- `skip=4375240`: Skip precisely to the SquashFS superblock.

Tip: Using `bs=1` avoids off-by-block errors (default dd blocks are 512 bytes). After carving, verify with `file squashfs.img` (should report a SquashFS v4 image), then extract with `unsquashfs`.

## Solution

### Step 1: Firmware Analysis & Extraction

Initial analysis reveals the firmware image contains multiple filesystems:
```shell
-[~/HTB]$ binwalk squashfs.img
DECIMAL       HEXADECIMAL     DESCRIPTION
0             0x0             Squashfs filesystem...
3751224       0x393D38        JFFS2 filesystem...
```

Extract the firmware:
```shell
-[~/HTB]$ binwalk -e squashfs.img
```

This creates two key components:
- **SquashFS** (`0.squashfs`): Read-only root filesystem  
- **JFFS2** (`393D38.jffs2`): Writable overlay partition

### Step 2: Understanding the Filesystem Hierarchy

OpenWrt uses an overlay filesystem architecture:
- `/rom` → SquashFS (read-only, factory defaults)
- `/` → JFFS2 (read-write, user modifications)

This allows configuration changes to persist across reboots without modifying the immutable ROM.

### Step 3: Extract JFFS2 Overlay

Use `jefferson` to unpack the JFFS2 partition:
```shell
-[~/HTB]$ jefferson 393D38.jffs2 -d jffs2-root
```

The JFFS2 partition contains:
- `upper/`: Overlay filesystem (modified files)
- `work/`: JFFS2 working directory

### Step 4: Extract Sysupgrade Archive

Within the overlay, find `sysupgrade.tgz` - the backup containing all configuration:
```shell
-[~/HTB]$ cd _squashfs.img.extracted/jffs2-root/upper
-[~/HTB/_squashfs.img.extracted/jffs2-root/upper]$  tar -xzf sysupgrade.tgz
```

This exposes the `etc/` directory with all configuration files.

### Answering the Questions

#### 1. OpenWrt Version
```shell
-[~/HTB/_squashfs.img.extracted/squashfs-root]$ cat etc/os-release
VERSION="23.05.0"
```
**Answer:** `23.05.0`

#### 2. Linux Kernel Version
```shell
-[~/HTB/_squashfs.img.extracted/squashfs-root]$ ls ./lib/modules
5.15.134
```
**Answer:** `5.15.134`

#### 3. Root Password Hash
This is the key insight: the SquashFS shadow file is empty (`root:::...`), but the overlay contains the actual hash:
```shell
-[~/HTB]$ cat _squashfs.img.extracted/jffs2-root/upper/etc/shadow
root:$1$YfuRJudo$cXCiIJXn9fWLIt8WY2Okp1:19804:0:99999:7:::
```
**Answer:** `root:$1$YfuRJudo$cXCiIJXn9fWLIt8WY2Okp1:19804:0:99999:7:::`

**Why this matters:** The root filesystem is immutable; password changes are stored in the JFFS2 overlay. This is how users can modify passwords without corrupting the factory image.

#### 4 & 5. PPPoE Credentials
Located in UCI (Unified Configuration Interface) config:
```shell
$ cat etc/config/network | grep -A 5 pppoe
config interface 'wan'
    option proto 'pppoe'
    option username 'yohZ5ah'
    option password 'ae-h+i$i^Ngohroorie!bieng6kee7oh'
```
**Answers:**
- Username: `yohZ5ah`
- Password: `ae-h+i$i^Ngohroorie!bieng6kee7oh`

#### 6 & 7. WiFi SSID and Password
Located in wireless configuration:
```shell
$ cat etc/config/wireless | grep -E "ssid|key"
option ssid 'VLT-AP01'
option key 'french-halves-vehicular-favorable'
option wpa_disable_eapol_key_retries '1'
option ssid 'VLT-AP01'
option key 'french-halves-vehicular-favorable'
option wpa_disable_eapol_key_retries '1'
```
**Answers:**
- SSID: `VLT-AP01`
- Password: `french-halves-vehicular-favorable`

#### 8. WAN Redirect Ports
The firewall configuration contains DNAT rules mapping WAN ports to internal LAN services:
```shell
$ cat etc/config/firewall | grep -A 5 "redirect"

config redirect
        option dest 'lan'
        option target 'DNAT'
        option name 'DB'
        option src 'wan'
        option src_dport '1778'
--
config redirect
        option dest 'lan'
        option target 'DNAT'
        option name 'WEB'
        option src 'wan'
        option src_dport '2289'
--
config redirect
        option dest 'lan'
        option target 'DNAT'
        option name 'NAS'
        option src 'wan'
        option src_dport '8088'
```
**Answer:** `1778,2289,8088` (numerically sorted)

## Key Takeaways

1. **Overlay Filesystems:** Understanding how OpenWrt uses SquashFS + JFFS2 overlays is critical for firmware forensics.

2. **Configuration Persistence:** Mutable data (passwords, network settings) is stored in writable overlays, not the immutable ROM.

3. **Firmware Extraction Tools:**
   - `binwalk`: Identify and extract embedded filesystems
   - `jefferson`: Unpack JFFS2 partitions
   - Standard archiving tools (`tar`, `gunzip`) for config backups

4. **Security Implications:** Router firmware often contains plaintext credentials. Proper access controls and encryption are essential.


## Tools Used
- `binwalk` - Firmware analysis and extraction
- `jefferson` - JFFS2 extraction
- `tar` - Archive extraction
- Standard Unix utilities (`cat`, `grep`, `strings`)

## References
- [OpenWrt Documentation](https://openwrt.org/)
- [JFFS2 Filesystem](https://en.wikipedia.org/wiki/JFFS2)
- [SquashFS](https://www.kernel.org/doc/html/latest/filesystems/squashfs.html)
- [Binwalk - Firmware Analysis Tool](https://github.com/ReFirmLabs/binwalk)
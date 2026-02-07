---
title: "Trouvez le Chat"
ctf_platform: "Root-Me"
date: 2026-02-07T21:00:00+01:00
description: "A forensic challenge involving a FAT filesystem where deleted web artifacts and a document must be recovered using filesystem analysis and file carving techniques to ultimately extract hidden metadata."
tags: ["Forensics", "Filesystem", "FAT", "Carving"]
link: "https://www.root-me.org/"
author: "Noé Backert"
---

[Root-Me Challenge Link](https://www.root-me.org/)

# Solution

## Installation / tools

The challenge provides a raw disk image.  
Given the filesystem type and the context, the following tools are used:

- The Sleuth Kit (`fls`, `icat`, `blkls`)
- Foremost
- ExifTool
- Standard Unix utilities (`fdisk`, `mount`, `file`, `strings`, `unzip`)

All analysis is performed in read-only mode.

---

## Disk layout identification

The first step is to identify the disk structure and partition layout.

```shell
-[~/RootMe/TrouvezLeChat]$ fdisk -l chall9
Disk chall9: 128 MiB, 134217728 bytes, 262144 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xc5ce543f

Device     Boot Start    End Sectors  Size Id Type
chall9p1         2048 262143  260096  127M  b W95 FAT32
```
The output shows a DOS partition table with a single partition:

- **Filesystem**: FAT32
- **Start sector**: 2048
- **Sector size**: 512 bytes

This confirms that the filesystem is embedded inside a raw disk image and must be accessed using an offset.

### Partition offset calculation and mounting

The byte offset of the partition is calculated as follows: `2048 × 512 = 1048576 bytes`

```shell
sudo mount -o loop,ro,offset=1048576 chall9 mnt
```
This allows browsing all files that are still referenced by the filesystem.

Here are the files :
```shell
-[~/RootMe/TrouvezLeChat/mnt]$ tree . -L 2
.
├── Documentations
│   ├── Barbey_Cigognes_BDC.pdf
│   ├── brasserie_jo_dinner_menu.pdf
│   ├── Courba13-01.pdf
│   ├── mangeur-de-cigogne (1).pdf
│   ├── mangeur-de-cigogne.pdf
│   ├── Menu AC.pdf
│   ├── m-flamm.pdf
│   ├── tartes_flambee_a_volonte_francais_2013.pdf
│   └── texte_migration_des_cigognes.pdf
├── Files
│   ├── 421_20080208011.doc
│   ├── Coker.doc
│   ├── Creer_votre_association.doc
│   └── DataSanitizationTutorial.odt
└── WebSites
    ├── Apple - iPhone - iPhone 4 Technical Specifications_files
    ├── Apple - iPhone - iPhone 4 Technical Specifications.html
    ├── L'autonomie de l'Alsace_files
    ├── L'autonomie de l'Alsace.html
    ├── R??publique d'Alsace-Lorraine (1918-1918) - Lorraine Caf??_files
    ├── R??publique d'Alsace-Lorraine (1918-1918) - Lorraine Caf??.html
    ├── sept facons de tuer un chat  Nespolo Matias Lar  9782364740754  Amazon.com  Books_files
    ├── sept facons de tuer un chat  Nespolo Matias Lar  9782364740754  Amazon.com  Books.html
    └── Voyager avec un chat_files
```

Looking at each files and websites, no clues could help us.

### Deleted files enumeration (FAT level)

FAT filesystems often keep metadata for deleted files.
To enumerate them, The Sleuth Kit is used directly on the disk image.

```shell
-[~/RootMe/TrouvezLeChat]$ fls -o 2048 chall9
d/d 5:  Documentations
d/d 7:  Files
d/d 9:  WebSites
v/v 4096995:    $MBR
v/v 4096996:    $FAT1
v/v 4096997:    $FAT2
V/V 4096998:    $OrphanFiles
``` 

Alongside standard directories, several internal filesystem structures appear, including: `$OrphanFiles` 

This virtual directory contains files that are no longer linked to any directory but are still partially recoverable.


### Orphaned files inspection
The orphaned files directory is listed explicitly:

```shell
-[~/RootMe/TrouvezLeChat]$ fls -o 2048 chall9 4096998
-/r * 403941:   _EARCH~1.PNG
-/r * 403943:   _OAD(3).PHP
-/r * 403945:   _EOIPL~1
-/r * 403947:   _OAD(2).PHP
-/r * 403949:   _OAD(6).PHP
-/r * 403952:   _AGNIF~1.PNG
-/r * 406403:   _IKIME~1.PNG
-/r * 406407:   _20PX-~1.JPG
-/r * 406410:   _0PX-C~1.PNG
-/r * 406414:   _6PX-S~1.PNG
-/r * 406418:   _6PX-F~1.PNG
-/r * 407076:   _NDEX.PHP
-/r * 407078:   _OAD(5).PHP
-/r * 407080:   _OAD(1).PHP
```

This reveals multiple deleted files using FAT 8.3 short names, including:

- PHP scripts
- PNG images
- JPG images

These files correspond to deleted web content and are still recoverable through their inode references.

```shell
for i in 403941 403943 403945 403947 403949 403952 406403 406407 406410 406414 406418 407076 407078 407080
do
  icat -o 2048 chall9 $i > recovered/$i.bin
done

-[~/RootMe/TrouvezLeChat/recovered]$ file *bin
403941.bin: PNG image data, 12 x 13, 8-bit grayscale, non-interlaced
403943.bin: JavaScript source, ASCII text, with very long lines (8182)
403945.bin: ASCII text, with no line terminators
403947.bin: HTML document, ASCII text, with very long lines (1151)
403949.bin: JavaScript source, ASCII text, with very long lines (994)
403952.bin: PNG image data, 15 x 11, 8-bit grayscale, non-interlaced
406403.bin: PNG image data, 88 x 31, 8-bit/color RGBA, non-interlaced
406407.bin: JPEG image data, JFIF standard 1.01, resolution (DPI), density 93x92, segment length 16, baseline, precision 8, 220x325, components 1
406410.bin: PNG image data, 30 x 40, 8-bit/color RGBA, non-interlaced
406414.bin: PNG image data, 16 x 16, 8-bit/color RGBA, non-interlaced
406418.bin: PNG image data, 16 x 14, 8-bit/color RGBA, non-interlaced
407076.bin: ASCII text
407078.bin: JavaScript source, ASCII text, with very long lines (9127)
407080.bin: JavaScript source, ASCII text, with very long lines (1008)
```

We can then rename all files so we cann open images:
```shell
-[~/RootMe/TrouvezLeChat/recovered]$ for f in *.bin; do ext=$(file -b "$f" | sed -E 's/.*(PNG image).*/png/; s/.*JPEG image.*/jpg/; s/.*JavaScript.*/js/; s/.*HTML document.*/html/; s/.*ASCII text.*/txt/'); mv "$f" "${f%.bin}.$ext"; done

-[Sat Feb 07-23:39:58]-[kali@DESKTOP-JVKBF17]-
-[~/RootMe/TrouvezLeChat/recovered]$ ls
403941.png  403945.txt   403949.js   406403.png  406410.png  406418.png  407078.js
403943.js   403947.html  403952.png  406407.jpg  406414.png  407076.txt  407080.js
```

We can se that the .jpg shows us a clue and we'll have to find the metadata of a .jpg file:
![Clue Metadata JPG](/img/ctf/trouvezLeChat/clue.png)




### Recovery limits of filesystem metadata

At this stage, no documents are really usable, and no clues are found for the retrieval of the location of the cat.

This indicates that some files are still hidden :

- Have lost their directory entries entirely
- Have broken FAT chains

Such files cannot be recovered through filesystem metadata alone and require file carving.


Using this, we have a lot of results and files:
```shell
-[~/RootMe/TrouvezLeChat]$ ls -la carving/
total 52
drwxr-xr-- 9 kali kali  4096 Feb  7 22:49 .
drwxr-xr-x 4 kali kali  4096 Feb  7 22:49 ..
-rw-r--r-- 1 kali kali 13407 Feb  7 22:49 audit.txt
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 gif
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 htm
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 jpg
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 ole
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 pdf
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 png
drwxr-xr-- 2 kali kali  4096 Feb  7 22:49 zip
```

Using file on zip folder, we see that thiese zip archive are OpenDocument Text files:

```shell
-[~/RootMe/TrouvezLeChat]$ file carving/zip/*
carving/zip/00021506.zip: OpenDocument Text
carving/zip/00028695.zip: OpenDocument Text
```
We can see that the Word Documents is a blackmail showing the missing cat:
![Missing Cat Word Document](/img/ctf/trouvezLeChat/threatCat.png)

By unzipping it we can retrieve all the datas and pictures in this MS Word Document.
```shell
-[~/RootMe/TrouvezLeChat/carving/zip]$ unzip 00021506.odt
Archive:  00021506.odt
 extracting: mimetype
 extracting: Thumbnails/thumbnail.png
  inflating: Pictures/1000000000000CC000000990038D2A62.jpg
  inflating: content.xml
  inflating: styles.xml
  inflating: settings.xml
  inflating: meta.xml
  inflating: manifest.rdf
  inflating: Configurations2/accelerator/current.xml
   creating: Configurations2/toolpanel/
   creating: Configurations2/statusbar/
   creating: Configurations2/progressbar/
   creating: Configurations2/toolbar/
   creating: Configurations2/images/Bitmaps/
   creating: Configurations2/popupmenu/
   creating: Configurations2/floater/
   creating: Configurations2/menubar/
  inflating: META-INF/manifest.xml
```

Finally, using exiftool, we can retrive all data from this image: 

```shell
-[~/RootMe/TrouvezLeChat/carving/zip/Pictures]$ exiftool 1000000000000CC000000990038D2A62.jpg
ExifTool Version Number         : 13.36
File Name                       : 1000000000000CC000000990038D2A62.jpg
Directory                       : .
File Size                       : 2.3 MB
File Modification Date/Time     : 2013:07:22 21:25:22+02:00
File Access Date/Time           : 2013:07:22 21:25:22+02:00
File Inode Change Date/Time     : 2026:02:07 23:15:08+01:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
Exif Byte Order                 : Big-endian (Motorola, MM)
Make                            : Apple
Camera Model Name               : iPhone 4S
Orientation                     : Horizontal (normal)
X Resolution                    : 72
Y Resolution                    : 72
Resolution Unit                 : inches
Software                        : 6.1.2
Modify Date                     : 2013:03:11 11:47:07
Y Cb Cr Positioning             : Centered
Exposure Time                   : 1/20
F Number                        : 2.4
Exposure Program                : Program AE
ISO                             : 160
Exif Version                    : 0221
Date/Time Original              : 2013:03:11 11:47:07
Create Date                     : 2013:03:11 11:47:07
Components Configuration        : Y, Cb, Cr, -
Shutter Speed Value             : 1/20
Aperture Value                  : 2.4
Brightness Value                : 1.477742947
Metering Mode                   : Multi-segment
Flash                           : Off, Did not fire
Focal Length                    : 4.3 mm
Subject Area                    : 1631 1223 881 881
Flashpix Version                : 0100
Color Space                     : sRGB
Exif Image Width                : 3264
Exif Image Height               : 2448
Sensing Method                  : One-chip color area
Exposure Mode                   : Auto
White Balance                   : Auto
Focal Length In 35mm Format     : 35 mm
Scene Capture Type              : Standard
GPS Latitude Ref                : North
GPS Longitude Ref               : East
GPS Altitude Ref                : Above Sea Level
GPS Time Stamp                  : 07:46:50.85
GPS Img Direction Ref           : True North
GPS Img Direction               : 247.3508772
Compression                     : JPEG (old-style)
Thumbnail Offset                : 902
Thumbnail Length                : 8207
Image Width                     : 3264
Image Height                    : 2448
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Aperture                        : 2.4
Image Size                      : 3264x2448
Megapixels                      : 8.0
Scale Factor To 35 mm Equivalent: 8.2
Shutter Speed                   : 1/20
Thumbnail Image                 : (Binary data 8207 bytes, use -b option to extract)
GPS Altitude                    : 16.7 m Above Sea Level
GPS Latitude                    : 47 deg 36' 16.15" N
GPS Longitude                   : 7 deg 24' 52.48" E
Circle Of Confusion             : 0.004 mm
Field Of View                   : 54.4 deg
Focal Length                    : 4.3 mm (35 mm equivalent: 35.0 mm)
GPS Position                    : 47 deg 36' 16.15" N, 7 deg 24' 52.48" E
Hyperfocal Distance             : 2.08 m
Light Value                     : 6.2
```

Finally using the GPS position and Maps, we can find the flag which is the name of the city : 
`47°36'16.2"N 7°24'52.5"E` =>  `JC37+QRW Helfrantzkirch`
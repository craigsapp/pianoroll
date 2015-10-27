#
# Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
# Creation Date: Mon Oct 26 22:30:02 PDT 2015
# Last Modified: Mon Oct 26 22:30:04 PDT 2015
# Filename:      pianoroll/iammp/Makefile
# Syntax:        GNU Makefile
#
# Description:   Extract listing of piano rolls from IAMMP website.
#

.PHONY: midifiles

all:
	@echo "make iammp == download list of all cataloged IAMMP rolls"
	@echo "make midilist == Extract list of all MIDI URLs"
	@echo "make midifiles == Download all MIDI files"

aton: iammp
iammp:
	bin/iammplist > iammp.aton

midilist:
	bin/getmidilist iammp.aton > iammp.midi

midifiles:
	bin/getmidifiles iammp.midi



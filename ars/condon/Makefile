#
# Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
# Creation Date: Sat Oct 24 23:58:25 PDT 2015
# Last Modified: Sat Oct 24 23:58:28 PDT 2015
# Filename:      pianoroll/ars/condon/Makefile
# Syntax:        GNU Makefile
#
# Description:   Extract listing of Searchworks URLs for Condon Roll
#                call numbers.
#

.PHONY: marcxml

all:
	@echo "make condon == download list of all cataloged condon rolls"
	@echo "make marcxml == download all cataloged condon rolls MARC XML entries"
	@echo "make aton == create ATON database of Condon collection"

update: condon markxml aton

condon:
	bin/condonlist > condon.list

marcxml:
	bin/getmarcxml condon.list

aton:
	bin/marcxml2aton condon.list > condon.aton

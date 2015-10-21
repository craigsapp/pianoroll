## main PianoRoll GNU makefile for Linux on Intel computers.
##
## Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
## Creation Date: Wed Oct 21 15:09:28 PDT 2015
## Last Modified: Wed Oct 21 15:09:33 PDT 2015
## Filename:      pianoroll/Makefile
##
## Description: This Makefile can create the PianoRoll library or 
##              programs which use the PianoRoll library using 
##              g++.
##
## To run this makefile, type (without quotes) "make library" (or 
## "gmake library" on FreeBSD computers), then "make programs".
##

# targets which don't actually refer to files
.PHONY : src-programs lib src-library include bin update clean super-clean

###########################################################################
#                                                                         #
#                                                                         #

all: info library examples

info:
	@echo ""
	@echo This makefile will create either the PianoRoll library file
	@echo or will compile the PianoRoll programs.  You may
	@echo have to make the library first if it does not exist.
	@echo Type one of the following:
	@echo "   $(MAKE) library"
	@echo or
	@echo "   $(MAKE) programs"
	@echo ""
	@echo To compile a specific program called xxx, type:
	@echo "   $(MAKE) xxx"
	@echo ""
	@echo Typing \"make\" alone with compile both the library and all programs.
	@echo ""


library: 
	$(MAKE) -f Makefile.library


clean:
	$(MAKE) -f Makefile.library clean
	-rm -rf bin
	-rm -rf lib

examples: programs
programs:
	$(MAKE) -f Makefile.programs

%: 
	-mkdir -p bin
	@echo compiling file $@
	$(MAKE) -f Makefile.programs $@
	

#                                                                         #
#                                                                         #
###########################################################################



